// Vercel serverless function entry point
import express from 'express';

// In-memory storage for demo (since we can't use the full server setup)
class MemStorage {
  constructor() {
    this.agents = new Map();
    this.researchData = new Map();
    this.activityLog = new Map();
    this.chatMessages = new Map();
    this.systemMetrics = new Map();
    this.queries = new Map();
    this.agentTasks = new Map();
    this.currentAgentId = 1;
    this.currentResearchDataId = 1;
    this.currentActivityLogId = 1;
    this.currentChatMessageId = 1;
    this.currentSystemMetricsId = 1;
    this.currentQueryId = 1;
    this.currentAgentTaskId = 1;
    
    this.initializeDefaultData();
  }

  initializeDefaultData() {
    const defaultAgents = [
      {
        name: "Physicist Master",
        type: "specialist",
        specialization: "Theoretical Physics",
        status: "active",
        cpuUsage: 23,
        currentTask: "Quantum Analysis",
        progress: 67,
        capabilities: ["quantum_mechanics", "particle_physics", "theoretical_analysis"]
      },
      {
        name: "Tesla Principles",
        type: "specialist",
        specialization: "Electromagnetic Theory",
        status: "active",
        cpuUsage: 45,
        currentTask: "Field Calculations",
        progress: 89,
        capabilities: ["electromagnetic_theory", "energy_systems", "field_analysis"]
      },
      {
        name: "Curious Questioner",
        type: "specialist",
        specialization: "Hypothesis Generation",
        status: "active",
        cpuUsage: 12,
        currentTask: "Question Generation",
        progress: 34,
        capabilities: ["hypothesis_generation", "critical_thinking", "research_methodology"]
      },
      {
        name: "Web Crawler",
        type: "specialist",
        specialization: "Data Collection",
        status: "active",
        cpuUsage: 67,
        currentTask: "Paper Mining",
        progress: 78,
        capabilities: ["web_scraping", "data_mining", "paper_analysis"]
      }
    ];

    for (let i = 1; i <= 5; i++) {
      defaultAgents.push({
        name: `Generalist-A${i}`,
        type: "generalist",
        specialization: null,
        status: "standby",
        cpuUsage: 8,
        currentTask: null,
        progress: 0,
        capabilities: ["general_analysis", "data_processing", "basic_research"]
      });
    }

    defaultAgents.forEach((agent) => this.createAgent(agent));
    
    this.createSystemMetrics({
      cpuUsage: 34,
      memoryUsage: 67,
      networkIO: 12,
      storageUsed: 2300,
      storageTotal: 5000
    });
  }

  async getAgents() {
    return Array.from(this.agents.values());
  }

  async createAgent(insertAgent) {
    const id = this.currentAgentId++;
    const agent = {
      ...insertAgent,
      id,
      createdAt: new Date(),
      progress: insertAgent.progress ?? 0,
      cpuUsage: insertAgent.cpuUsage ?? 0,
      currentTask: insertAgent.currentTask ?? null,
      specialization: insertAgent.specialization ?? null,
      capabilities: insertAgent.capabilities ?? null,
      status: insertAgent.status ?? "standby"
    };
    this.agents.set(id, agent);
    return agent;
  }

  async getAgent(id) {
    return this.agents.get(id);
  }

  async deleteAgent(id) {
    return this.agents.delete(id);
  }

  async updateAgent(id, updates) {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { ...agent, ...updates };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async getActivityLog(limit = 50) {
    const logs = Array.from(this.activityLog.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    return logs;
  }

  async createActivityLog(insertLog) {
    const id = this.currentActivityLogId++;
    const log = {
      ...insertLog,
      id,
      timestamp: new Date(),
      agentId: insertLog.agentId ?? null
    };
    this.activityLog.set(id, log);
    return log;
  }

  async getChatMessages(limit = 50) {
    const messages = Array.from(this.chatMessages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
    return messages;
  }

  async createChatMessage(insertMessage) {
    const id = this.currentChatMessageId++;
    const message = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getLatestSystemMetrics() {
    const metrics = Array.from(this.systemMetrics.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return metrics[0];
  }

  async createSystemMetrics(insertMetrics) {
    const id = this.currentSystemMetricsId++;
    const metrics = {
      ...insertMetrics,
      id,
      timestamp: new Date()
    };
    this.systemMetrics.set(id, metrics);
    return metrics;
  }

  async getResearchData() {
    return Array.from(this.researchData.values());
  }

  async createResearchData(insertData) {
    const id = this.currentResearchDataId++;
    const data = {
      ...insertData,
      id,
      createdAt: new Date(),
      agentId: insertData.agentId ?? null,
      metadata: insertData.metadata ?? null
    };
    this.researchData.set(id, data);
    return data;
  }

  async getQueries() {
    return Array.from(this.queries.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createQuery(insertQuery) {
    const id = this.currentQueryId++;
    const query = {
      ...insertQuery,
      id,
      createdAt: new Date(),
      completedAt: null,
      assignedAgents: insertQuery.assignedAgents ?? null,
      estimatedCompletion: insertQuery.estimatedCompletion ?? null,
      finalResponse: insertQuery.finalResponse ?? null,
      metadata: insertQuery.metadata ?? null,
      status: insertQuery.status ?? 'processing',
      priority: insertQuery.priority ?? 'medium'
    };
    this.queries.set(id, query);
    return query;
  }

  async getQuery(id) {
    return this.queries.get(id);
  }
}

// Initialize storage
const storage = new MemStorage();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await storage.getAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agents" });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const agent = await storage.createAgent(req.body);
    
    // Log activity
    await storage.createActivityLog({
      agentId: agent.id,
      action: "agent_created",
      description: `New ${agent.type} agent "${agent.name}" created`
    });

    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: "Invalid agent data" });
  }
});

app.delete('/api/agents/:id', async (req, res) => {
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

      res.json({ success: true });
    } else {
      res.status(500).json({ message: "Failed to delete agent" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete agent" });
  }
});

app.get('/api/activity-log', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const logs = await storage.getActivityLog(limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity log" });
  }
});

app.get('/api/chat-messages', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const messages = await storage.getChatMessages(limit);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat messages" });
  }
});

app.post('/api/chat-messages', async (req, res) => {
  try {
    const message = await storage.createChatMessage(req.body);
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: "Invalid message data" });
  }
});

app.get('/api/system-metrics', async (req, res) => {
  try {
    const metrics = await storage.getLatestSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch system metrics" });
  }
});

app.get('/api/research-data', async (req, res) => {
  try {
    const researchData = await storage.getResearchData();
    res.json(researchData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch research data" });
  }
});

app.get('/api/queries', async (req, res) => {
  try {
    const queries = await storage.getQueries();
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch queries" });
  }
});

app.post('/api/queries', async (req, res) => {
  try {
    const { content, userId } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Query content is required" });
    }

    const query = await storage.createQuery({
      userId: userId || 'user',
      content,
      priority: 'medium',
      status: 'processing'
    });

    // Log activity
    await storage.createActivityLog({
      agentId: null,
      action: "query_submitted",
      description: `New research query submitted: "${content.substring(0, 50)}..."`
    });

    res.json(query);
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({ message: "Failed to process query" });
  }
});

app.get('/api/queries/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const query = await storage.getQuery(id);
    
    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    res.json({ query });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch query details" });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Export for Vercel (this is the key difference!)
export default app;
