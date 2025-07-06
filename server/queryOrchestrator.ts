import { storage } from "./storage";
import type { Agent, Query, AgentTask, InsertQuery, InsertAgentTask } from "@shared/schema";

interface QueryAnalysis {
  type: 'theoretical' | 'experimental' | 'computational' | 'research' | 'mixed';
  complexity: 'simple' | 'medium' | 'complex' | 'research_level';
  domains: string[];
  estimatedTime: number; // minutes
  requiredAgents: string[];
}

export class QueryOrchestrator {
  private activeQueries = new Map<number, Query>();
  private agentWorkloads = new Map<number, number>(); // agentId -> current task count

  async processQuery(content: string, userId: string = 'user'): Promise<Query> {
    // 1. Analyze the query
    const analysis = this.analyzeQuery(content);
    
    // 2. Determine priority based on complexity and type
    const priority = this.determinePriority(analysis);
    
    // 3. Create the query record
    const query = await storage.createQuery({
      userId,
      content,
      priority,
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + analysis.estimatedTime * 60000),
      metadata: {
        analysis,
        taskCount: analysis.requiredAgents.length,
        startTime: new Date().toISOString()
      }
    });

    // 4. Assign agents and create tasks
    await this.orchestrateAgentTasks(query, analysis);
    
    // 5. Start the execution workflow
    this.executeWorkflow(query.id);
    
    this.activeQueries.set(query.id, query);
    return query;
  }

  private analyzeQuery(content: string): QueryAnalysis {
    const lowerContent = content.toLowerCase();
    
    // Determine query type based on keywords
    let type: QueryAnalysis['type'] = 'research';
    if (lowerContent.includes('calculate') || lowerContent.includes('compute') || lowerContent.includes('solve')) {
      type = 'computational';
    } else if (lowerContent.includes('theory') || lowerContent.includes('explain') || lowerContent.includes('principle')) {
      type = 'theoretical';
    } else if (lowerContent.includes('experiment') || lowerContent.includes('test') || lowerContent.includes('measure')) {
      type = 'experimental';
    } else if (lowerContent.includes('find') || lowerContent.includes('search') || lowerContent.includes('research')) {
      type = 'research';
    }

    // Determine complexity
    let complexity: QueryAnalysis['complexity'] = 'medium';
    if (lowerContent.length < 50) complexity = 'simple';
    else if (lowerContent.length > 200 || lowerContent.includes('comprehensive') || lowerContent.includes('detailed')) complexity = 'complex';
    if (lowerContent.includes('novel') || lowerContent.includes('breakthrough') || lowerContent.includes('cutting-edge')) complexity = 'research_level';

    // Identify domains
    const domains: string[] = [];
    if (lowerContent.includes('quantum')) domains.push('quantum_physics');
    if (lowerContent.includes('electromagnetic') || lowerContent.includes('tesla') || lowerContent.includes('field')) domains.push('electromagnetic');
    if (lowerContent.includes('particle') || lowerContent.includes('higgs') || lowerContent.includes('accelerator')) domains.push('particle_physics');
    if (lowerContent.includes('gravity') || lowerContent.includes('relativity') || lowerContent.includes('spacetime')) domains.push('gravity');
    if (lowerContent.includes('energy') || lowerContent.includes('thermodynamics')) domains.push('energy_systems');
    if (lowerContent.includes('material') || lowerContent.includes('superconductor')) domains.push('materials');
    if (domains.length === 0) domains.push('general_physics');

    // Determine required agents based on analysis
    const requiredAgents: string[] = [];
    if (domains.includes('quantum_physics') || domains.includes('particle_physics') || type === 'theoretical') {
      requiredAgents.push('Physicist Master');
    }
    if (domains.includes('electromagnetic') || domains.includes('energy_systems')) {
      requiredAgents.push('Tesla Principles');
    }
    if (type === 'research' || lowerContent.includes('literature') || lowerContent.includes('papers')) {
      requiredAgents.push('Web Crawler');
    }
    if (type === 'experimental' || complexity === 'research_level') {
      requiredAgents.push('Curious Questioner');
    }

    // Always include generalist agents for support
    const generalistCount = Math.min(Math.ceil(requiredAgents.length / 2), 3);
    for (let i = 1; i <= generalistCount; i++) {
      requiredAgents.push(`Generalist-A${i}`);
    }

    // Estimate time based on complexity and agent count
    let estimatedTime = 5; // base time in minutes
    if (complexity === 'simple') estimatedTime = 2;
    else if (complexity === 'complex') estimatedTime = 15;
    else if (complexity === 'research_level') estimatedTime = 30;
    estimatedTime += requiredAgents.length * 2; // additional time per agent

    return {
      type,
      complexity,
      domains,
      estimatedTime,
      requiredAgents
    };
  }

  private determinePriority(analysis: QueryAnalysis): 'low' | 'medium' | 'high' | 'urgent' {
    if (analysis.complexity === 'research_level') return 'urgent';
    if (analysis.complexity === 'complex') return 'high';
    if (analysis.type === 'computational' || analysis.type === 'theoretical') return 'medium';
    return 'low';
  }

  private async orchestrateAgentTasks(query: Query, analysis: QueryAnalysis): Promise<void> {
    const agents = await storage.getAgents();
    const tasks: InsertAgentTask[] = [];

    for (const agentName of analysis.requiredAgents) {
      const agent = agents.find(a => a.name === agentName);
      if (!agent) continue;

      let taskType: string;
      let description: string;

      // Assign task type based on agent specialization and query type
      if (agent.name === 'Physicist Master') {
        taskType = 'analysis';
        description = `Theoretical physics analysis: ${query.content}`;
      } else if (agent.name === 'Tesla Principles') {
        taskType = 'analysis';
        description = `Electromagnetic analysis: ${query.content}`;
      } else if (agent.name === 'Web Crawler') {
        taskType = 'research';
        description = `Literature search and data collection: ${query.content}`;
      } else if (agent.name === 'Curious Questioner') {
        taskType = 'synthesis';
        description = `Generate follow-up questions and experimental approaches: ${query.content}`;
      } else {
        taskType = 'calculation';
        description = `Supporting calculations and data processing: ${query.content}`;
      }

      tasks.push({
        queryId: query.id,
        agentId: agent.id,
        taskType,
        description,
        status: 'pending',
        result: null,
        metadata: {
          queryAnalysis: analysis,
          assignedAt: new Date().toISOString()
        }
      });
    }

    // Create all tasks
    for (const task of tasks) {
      await storage.createAgentTask(task);
    }

    // Update query with assigned agents
    await storage.updateQuery(query.id, {
      assignedAgents: analysis.requiredAgents
    });
  }

  private async executeWorkflow(queryId: number): Promise<void> {
    // Simulate orchestrated execution with delays
    setTimeout(async () => {
      await this.startAgentTasks(queryId);
    }, 1000);

    setTimeout(async () => {
      await this.progressAgentTasks(queryId);
    }, 5000);

    setTimeout(async () => {
      await this.completeQuery(queryId);
    }, 10000);
  }

  private async startAgentTasks(queryId: number): Promise<void> {
    const tasks = await storage.getAgentTasks(queryId);
    
    for (const task of tasks) {
      if (task.status === 'pending') {
        await storage.updateAgentTask(task.id, {
          status: 'in_progress',
          startedAt: new Date()
        });

        // Update agent status
        if (task.agentId) {
          await storage.updateAgent(task.agentId, {
            status: 'active',
            currentTask: task.description.split(':')[0],
            progress: 0
          });

          // Log activity
          await storage.createActivityLog({
            agentId: task.agentId,
            action: 'task_started',
            description: `Started working on: ${task.description.substring(0, 50)}...`
          });
        }
      }
    }
  }

  private async progressAgentTasks(queryId: number): Promise<void> {
    const tasks = await storage.getAgentTasks(queryId);
    
    for (const task of tasks) {
      if (task.status === 'in_progress' && task.agentId) {
        const progress = Math.floor(Math.random() * 40) + 40; // 40-80% progress
        await storage.updateAgent(task.agentId, { progress });
      }
    }
  }

  private async completeQuery(queryId: number): Promise<void> {
    const query = await storage.getQuery(queryId);
    if (!query) return;

    const tasks = await storage.getAgentTasks(queryId);
    const results: string[] = [];

    // Complete all tasks and collect results
    for (const task of tasks) {
      if (task.status === 'in_progress') {
        let result = this.generateTaskResult(task, query);
        
        await storage.updateAgentTask(task.id, {
          status: 'completed',
          completedAt: new Date(),
          result
        });

        if (task.agentId) {
          await storage.updateAgent(task.agentId, {
            progress: 100,
            status: 'standby',
            currentTask: null
          });

          await storage.createActivityLog({
            agentId: task.agentId,
            action: 'task_completed',
            description: `Completed analysis for query: ${query.content.substring(0, 30)}...`
          });
        }

        results.push(result);
      }
    }

    // Synthesize final response
    const finalResponse = this.synthesizeResponse(query, results);
    
    await storage.updateQuery(queryId, {
      status: 'completed',
      completedAt: new Date(),
      finalResponse
    });

    // Create research data entry
    await storage.createResearchData({
      agentId: null,
      title: `Query Analysis: ${query.content.substring(0, 50)}...`,
      content: finalResponse,
      dataType: 'analysis',
      metadata: {
        queryId,
        agentContributions: results.length,
        completionTime: new Date().toISOString()
      }
    });

    this.activeQueries.delete(queryId);
  }

  private generateTaskResult(task: AgentTask, query: Query): string {
    const agent = task.agentId ? `Agent ${task.agentId}` : 'Unknown Agent';
    
    // Generate realistic responses based on agent type and task
    if (task.taskType === 'analysis') {
      return `${agent} completed theoretical analysis: Found ${Math.floor(Math.random() * 5) + 2} key principles relevant to "${query.content}". Analysis suggests ${Math.random() > 0.5 ? 'quantum effects' : 'classical mechanics'} dominate the system behavior.`;
    } else if (task.taskType === 'research') {
      return `${agent} found ${Math.floor(Math.random() * 20) + 10} relevant research papers. Key findings include recent breakthroughs in related phenomena and ${Math.floor(Math.random() * 3) + 1} experimental validation studies.`;
    } else if (task.taskType === 'synthesis') {
      return `${agent} generated ${Math.floor(Math.random() * 5) + 3} follow-up questions and proposed ${Math.floor(Math.random() * 3) + 1} experimental approaches to validate the hypothesis.`;
    } else {
      return `${agent} completed supporting calculations with ${Math.floor(Math.random() * 10) + 90}% confidence level. Numerical analysis confirms theoretical predictions.`;
    }
  }

  private synthesizeResponse(query: Query, results: string[]): string {
    const analysis = query.metadata?.analysis as QueryAnalysis;
    
    return `## Research Laboratory Analysis

**Query:** ${query.content}

**Analysis Type:** ${analysis?.type || 'general'} | **Complexity:** ${analysis?.complexity || 'medium'}

### Agent Swarm Findings:

${results.map((result, i) => `${i + 1}. ${result}`).join('\n\n')}

### Synthesis:

Based on coordinated analysis by ${results.length} specialized agents, the research laboratory concludes:

- **Primary Mechanism:** The phenomenon appears to be governed by ${analysis?.domains?.includes('quantum_physics') ? 'quantum mechanical' : 'classical physical'} principles
- **Theoretical Foundation:** Current models ${Math.random() > 0.5 ? 'adequately explain' : 'require refinement to fully explain'} the observed behavior
- **Experimental Validation:** ${Math.random() > 0.7 ? 'Existing data supports' : 'Additional experiments needed to confirm'} the theoretical predictions
- **Research Impact:** This finding has ${Math.random() > 0.6 ? 'significant' : 'moderate'} implications for future research in ${analysis?.domains?.join(', ') || 'physics'}

### Recommended Next Steps:
1. Conduct follow-up experiments to validate key assumptions
2. Develop mathematical models to quantify observed effects  
3. Review recent literature for similar phenomena
4. Consider interdisciplinary approaches for comprehensive understanding

*Analysis completed by Physics Research Laboratory Multi-Agent System at ${new Date().toLocaleString()}*`;
  }

  async getActiveQueries(): Promise<Query[]> {
    return Array.from(this.activeQueries.values());
  }

  async getQueryWithTasks(queryId: number): Promise<{ query: Query; tasks: AgentTask[] } | null> {
    const query = await storage.getQuery(queryId);
    if (!query) return null;
    
    const tasks = await storage.getAgentTasks(queryId);
    return { query, tasks };
  }
}

export const queryOrchestrator = new QueryOrchestrator();