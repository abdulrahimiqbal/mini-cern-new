import { 
  agents, 
  researchData, 
  activityLog, 
  chatMessages, 
  systemMetrics,
  type Agent, 
  type InsertAgent,
  type ResearchData,
  type InsertResearchData,
  type ActivityLog,
  type InsertActivityLog,
  type ChatMessage,
  type InsertChatMessage,
  type SystemMetrics,
  type InsertSystemMetrics
} from "@shared/schema";

export interface IStorage {
  // Agent operations
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;
  
  // Research data operations
  getResearchData(): Promise<ResearchData[]>;
  createResearchData(data: InsertResearchData): Promise<ResearchData>;
  
  // Activity log operations
  getActivityLog(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Chat operations
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // System metrics
  getLatestSystemMetrics(): Promise<SystemMetrics | undefined>;
  createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
}

export class MemStorage implements IStorage {
  private agents: Map<number, Agent>;
  private researchData: Map<number, ResearchData>;
  private activityLog: Map<number, ActivityLog>;
  private chatMessages: Map<number, ChatMessage>;
  private systemMetrics: Map<number, SystemMetrics>;
  private currentAgentId: number;
  private currentResearchDataId: number;
  private currentActivityLogId: number;
  private currentChatMessageId: number;
  private currentSystemMetricsId: number;

  constructor() {
    this.agents = new Map();
    this.researchData = new Map();
    this.activityLog = new Map();
    this.chatMessages = new Map();
    this.systemMetrics = new Map();
    this.currentAgentId = 1;
    this.currentResearchDataId = 1;
    this.currentActivityLogId = 1;
    this.currentChatMessageId = 1;
    this.currentSystemMetricsId = 1;
    
    // Initialize with default agents
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default specialist agents
    const defaultAgents: InsertAgent[] = [
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

    // Add generalist agents
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

    defaultAgents.forEach(agent => this.createAgent(agent));

    // Initialize system metrics
    this.createSystemMetrics({
      cpuUsage: 34,
      memoryUsage: 67,
      networkIO: 12,
      storageUsed: 2300,
      storageTotal: 5000
    });
  }

  // Agent operations
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const agent: Agent = {
      ...insertAgent,
      id,
      createdAt: new Date(),
      progress: insertAgent.progress ?? 0,
      cpuUsage: insertAgent.cpuUsage ?? 0,
      currentTask: insertAgent.currentTask ?? null,
      specialization: insertAgent.specialization ?? null,
      capabilities: insertAgent.capabilities ?? null,
      status: insertAgent.status ?? 'standby',
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { ...agent, ...updates };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: number): Promise<boolean> {
    return this.agents.delete(id);
  }

  // Research data operations
  async getResearchData(): Promise<ResearchData[]> {
    return Array.from(this.researchData.values());
  }

  async createResearchData(insertData: InsertResearchData): Promise<ResearchData> {
    const id = this.currentResearchDataId++;
    const data: ResearchData = {
      ...insertData,
      id,
      createdAt: new Date(),
      agentId: insertData.agentId ?? null,
      metadata: insertData.metadata ?? null,
    };
    this.researchData.set(id, data);
    return data;
  }

  // Activity log operations
  async getActivityLog(limit: number = 50): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLog.values())
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
    return logs;
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentActivityLogId++;
    const log: ActivityLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
      agentId: insertLog.agentId ?? null,
    };
    this.activityLog.set(id, log);
    return log;
  }

  // Chat operations
  async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime())
      .slice(-limit);
    return messages;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // System metrics
  async getLatestSystemMetrics(): Promise<SystemMetrics | undefined> {
    const metrics = Array.from(this.systemMetrics.values())
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
    return metrics[0];
  }

  async createSystemMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = this.currentSystemMetricsId++;
    const metrics: SystemMetrics = {
      ...insertMetrics,
      id,
      timestamp: new Date(),
    };
    this.systemMetrics.set(id, metrics);
    return metrics;
  }
}

export const storage = new MemStorage();
