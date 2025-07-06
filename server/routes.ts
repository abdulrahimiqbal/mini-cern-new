import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { queryOrchestrator } from "./queryOrchestrator";
import { insertAgentSchema, insertChatMessageSchema, insertActivityLogSchema, insertQuerySchema } from "@shared/schema";
import { z } from "zod";

interface ExtendedWebSocket extends WebSocket {
  id?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // REST API Routes
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const agentData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(agentData);
      
      // Log activity
      await storage.createActivityLog({
        agentId: agent.id,
        action: "agent_created",
        description: `New ${agent.type} agent "${agent.name}" created`
      });

      // Broadcast to all connected clients
      broadcastToAll(JSON.stringify({
        type: "agent_created",
        data: agent
      }));

      res.json(agent);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent data" });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgent(id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      const deleted = await storage.deleteAgent(id);
      
      if (deleted) {
        // Log activity
        await storage.createActivityLog({
          agentId: id,
          action: "agent_deleted",
          description: `Agent "${agent.name}" was deleted`
        });

        // Broadcast to all connected clients
        broadcastToAll(JSON.stringify({
          type: "agent_deleted",
          data: { id }
        }));

        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete agent" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  app.get("/api/activity-log", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLog(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity log" });
    }
  });

  app.get("/api/chat-messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChatMessages(limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat-messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      
      // Broadcast to all connected clients
      broadcastToAll(JSON.stringify({
        type: "chat_message",
        data: message
      }));

      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.get("/api/system-metrics", async (req, res) => {
    try {
      const metrics = await storage.getLatestSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  app.get("/api/research-data", async (req, res) => {
    try {
      const researchData = await storage.getResearchData();
      res.json(researchData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch research data" });
    }
  });

  // Query processing routes
  app.post("/api/queries", async (req, res) => {
    try {
      const { content, userId } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Query content is required" });
      }

      const query = await queryOrchestrator.processQuery(content, userId || 'user');
      
      // Log activity
      await storage.createActivityLog({
        agentId: null,
        action: "query_submitted",
        description: `New research query submitted: "${content.substring(0, 50)}..."`
      });

      // Broadcast query started
      broadcastToAll(JSON.stringify({
        type: "query_started",
        data: query
      }));

      res.json(query);
    } catch (error) {
      console.error('Query processing error:', error);
      res.status(500).json({ message: "Failed to process query" });
    }
  });

  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch queries" });
    }
  });

  app.get("/api/queries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const queryWithTasks = await queryOrchestrator.getQueryWithTasks(id);
      
      if (!queryWithTasks) {
        return res.status(404).json({ message: "Query not found" });
      }

      res.json(queryWithTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch query details" });
    }
  });

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<ExtendedWebSocket>();

  function broadcastToAll(message: string) {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.id = Math.random().toString(36).substring(7);
    clients.add(ws);

    console.log(`Client ${ws.id} connected`);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'agent_update':
            if (data.agentId && data.updates) {
              const updatedAgent = await storage.updateAgent(data.agentId, data.updates);
              if (updatedAgent) {
                broadcastToAll(JSON.stringify({
                  type: 'agent_updated',
                  data: updatedAgent
                }));
              }
            }
            break;

          case 'system_metrics':
            if (data.metrics) {
              const metrics = await storage.createSystemMetrics(data.metrics);
              broadcastToAll(JSON.stringify({
                type: 'system_metrics_updated',
                data: metrics
              }));
            }
            break;

          case 'activity_log':
            if (data.log) {
              const log = await storage.createActivityLog(data.log);
              broadcastToAll(JSON.stringify({
                type: 'activity_logged',
                data: log
              }));
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`Client ${ws.id} disconnected`);
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${ws.id}:`, error);
      clients.delete(ws);
    });
  });

  // Simulate agent updates and system metrics
  setInterval(async () => {
    const agents = await storage.getAgents();
    const activeAgents = agents.filter(agent => agent.status === 'active');
    
    // Update random active agent
    if (activeAgents.length > 0) {
      const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
      const progressIncrement = Math.floor(Math.random() * 10) + 1;
      const newProgress = Math.min(100, (randomAgent.progress || 0) + progressIncrement);
      
      await storage.updateAgent(randomAgent.id, { progress: newProgress });
      
      // Log activity if task completed
      if (newProgress >= 100 && randomAgent.progress! < 100) {
        await storage.createActivityLog({
          agentId: randomAgent.id,
          action: 'task_completed',
          description: `Completed ${randomAgent.currentTask}`
        });
      }
    }

    // Update system metrics
    const currentMetrics = await storage.getLatestSystemMetrics();
    if (currentMetrics) {
      const newMetrics = {
        cpuUsage: Math.max(10, Math.min(90, currentMetrics.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(95, currentMetrics.memoryUsage + (Math.random() - 0.5) * 5)),
        networkIO: Math.max(0, Math.min(100, currentMetrics.networkIO + (Math.random() - 0.5) * 20)),
        storageUsed: currentMetrics.storageUsed,
        storageTotal: currentMetrics.storageTotal
      };
      
      await storage.createSystemMetrics(newMetrics);
      
      broadcastToAll(JSON.stringify({
        type: 'system_metrics_updated',
        data: newMetrics
      }));
    }
  }, 5000);

  return httpServer;
}
