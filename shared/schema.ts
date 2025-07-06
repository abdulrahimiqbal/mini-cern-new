import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'specialist' or 'generalist'
  specialization: text("specialization"),
  status: text("status").notNull().default("standby"), // 'active', 'standby', 'offline'
  cpuUsage: integer("cpu_usage").default(0),
  currentTask: text("current_task"),
  progress: integer("progress").default(0),
  capabilities: jsonb("capabilities"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const researchData = pgTable("research_data", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  dataType: text("data_type").notNull(), // 'hypothesis', 'analysis', 'paper', 'result'
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id),
  action: text("action").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(), // 'user' or 'system'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: integer("memory_usage").notNull(),
  networkIO: integer("network_io").notNull(),
  storageUsed: integer("storage_used").notNull(),
  storageTotal: integer("storage_total").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("processing"), // 'processing', 'completed', 'failed'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  assignedAgents: jsonb("assigned_agents"),
  estimatedCompletion: timestamp("estimated_completion"),
  finalResponse: text("final_response"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const agentTasks = pgTable("agent_tasks", {
  id: serial("id").primaryKey(),
  queryId: integer("query_id").references(() => queries.id),
  agentId: integer("agent_id").references(() => agents.id),
  taskType: text("task_type").notNull(), // 'analysis', 'research', 'calculation', 'synthesis'
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'failed'
  result: text("result"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertResearchDataSchema = createInsertSchema(researchData).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  timestamp: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAgentTaskSchema = createInsertSchema(agentTasks).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type ResearchData = typeof researchData.$inferSelect;
export type InsertResearchData = z.infer<typeof insertResearchDataSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;
export type Query = typeof queries.$inferSelect;
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;
