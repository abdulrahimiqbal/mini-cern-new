# Physics Research Laboratory - Technical Architecture

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query v5 for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket client for live updates
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with Hot Module Replacement (HMR)

### Backend
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Real-time Communication**: WebSocket server (ws library)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Process Management**: tsx for TypeScript execution in development

### Development Tools
- **Type Checking**: TypeScript with strict configuration
- **Database Migrations**: Drizzle Kit for schema management
- **Package Management**: npm with package-lock.json
- **Replit Integration**: Cartographer and error overlay plugins

## Application Architecture

### Multi-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│                 Frontend Layer                  │
├─────────────────────────────────────────────────┤
│  React Components + Tailwind CSS + Radix UI    │
│  - Dashboard, Agents, Research, Analytics       │
│  - Real-time WebSocket integration              │
│  - TanStack Query for state management          │
└─────────────────────────────────────────────────┘
                          │
                    HTTP + WebSocket
                          │
┌─────────────────────────────────────────────────┐
│                 Backend Layer                   │
├─────────────────────────────────────────────────┤
│  Express.js API Server + WebSocket Server      │
│  - RESTful API endpoints                        │
│  - Query Orchestration Engine                  │
│  - Multi-Agent Coordination System             │
│  - Real-time event broadcasting                │
└─────────────────────────────────────────────────┘
                          │
                    SQL Queries
                          │
┌─────────────────────────────────────────────────┐
│                 Data Layer                      │
├─────────────────────────────────────────────────┤
│  PostgreSQL Database (Neon)                    │
│  - Agent management tables                     │
│  - Research data storage                       │
│  - Query processing workflow                   │
│  - Activity logging system                     │
└─────────────────────────────────────────────────┘
```

## Query Processing Workflow

### 1. Query Submission and Analysis
```
User Query → Query Analyzer → Agent Assignment → Task Creation
    │              │                 │               │
    │              │                 │               └─ Create AgentTask records
    │              │                 └─ Assign specialized agents based on domain
    │              └─ Analyze complexity, type, domains, estimated time
    └─ Receive via chat interface or API endpoint
```

### 2. Multi-Agent Orchestration
```
Query Orchestrator
    │
    ├─ Task Distribution
    │   ├─ Physicist Master: Theoretical analysis
    │   ├─ Tesla Principles: Electromagnetic analysis  
    │   ├─ Curious Questioner: Hypothesis generation
    │   ├─ Web Crawler: Literature research
    │   └─ Generalist Agents: Supporting calculations
    │
    ├─ Execution Coordination
    │   ├─ Start tasks (agents transition to 'active')
    │   ├─ Monitor progress (real-time status updates)
    │   ├─ Collect intermediate results
    │   └─ Handle task failures and retries
    │
    └─ Response Synthesis
        ├─ Aggregate agent findings
        ├─ Generate comprehensive analysis
        ├─ Create research data entries
        └─ Broadcast completion events
```

### 3. Real-time Communication Flow
```
WebSocket Events:
    │
    ├─ query_started     → New query initiated
    ├─ agent_updated     → Agent status/progress changes  
    ├─ task_completed    → Individual agent task finished
    ├─ activity_logged   → System activity events
    ├─ chat_message      → Chat interface updates
    └─ system_metrics    → Performance monitoring
```

## Database Schema Design

### Core Entities
```sql
-- Agent Management
agents {
  id: serial PRIMARY KEY
  name: text NOT NULL
  type: text NOT NULL -- 'specialist' | 'generalist'
  specialization: text
  status: text DEFAULT 'standby' -- 'active' | 'standby' | 'offline'
  cpuUsage: integer DEFAULT 0
  currentTask: text
  progress: integer DEFAULT 0
  capabilities: jsonb
  createdAt: timestamp DEFAULT NOW()
}

-- Query Processing Workflow
queries {
  id: serial PRIMARY KEY
  userId: text NOT NULL
  content: text NOT NULL
  status: text DEFAULT 'processing' -- 'processing' | 'completed' | 'failed'
  priority: text DEFAULT 'medium' -- 'low' | 'medium' | 'high' | 'urgent'
  assignedAgents: jsonb
  estimatedCompletion: timestamp
  finalResponse: text
  metadata: jsonb
  createdAt: timestamp DEFAULT NOW()
  completedAt: timestamp
}

-- Agent Task Management
agentTasks {
  id: serial PRIMARY KEY
  queryId: integer REFERENCES queries(id)
  agentId: integer REFERENCES agents(id)
  taskType: text NOT NULL -- 'analysis' | 'research' | 'calculation' | 'synthesis'
  description: text NOT NULL
  status: text DEFAULT 'pending' -- 'pending' | 'in_progress' | 'completed' | 'failed'
  result: text
  startedAt: timestamp
  completedAt: timestamp
  metadata: jsonb
}

-- Research Data Storage
researchData {
  id: serial PRIMARY KEY
  agentId: integer REFERENCES agents(id)
  title: text NOT NULL
  content: text NOT NULL
  dataType: text NOT NULL -- 'hypothesis' | 'analysis' | 'paper' | 'result'
  metadata: jsonb
  createdAt: timestamp DEFAULT NOW()
}
```

## Agent System Architecture

### Agent Types and Responsibilities

#### Specialist Agents
```typescript
interface SpecialistAgent {
  name: string;
  specialization: string;
  capabilities: string[];
  taskTypes: TaskType[];
  domain: PhysicsDomain[];
}

// Examples:
PhysicistMaster: {
  specialization: "Theoretical Physics",
  capabilities: ["quantum_mechanics", "particle_physics", "theoretical_analysis"],
  taskTypes: ["analysis", "synthesis"],
  domains: ["quantum_physics", "particle_physics", "general_physics"]
}

TeslaPrinciples: {
  specialization: "Electromagnetic Theory", 
  capabilities: ["electromagnetic_theory", "energy_systems", "field_analysis"],
  taskTypes: ["analysis", "calculation"],
  domains: ["electromagnetic", "energy_systems"]
}
```

#### Coordination Mechanisms
```typescript
interface QueryOrchestrator {
  analyzeQuery(content: string): QueryAnalysis;
  assignAgents(analysis: QueryAnalysis): AgentAssignment[];
  orchestrateTasks(query: Query): Promise<TaskExecution[]>;
  synthesizeResults(results: TaskResult[]): FinalResponse;
  monitorProgress(): SystemStatus;
}

interface AgentWorkflow {
  startTask(agentId: number, task: AgentTask): Promise<void>;
  updateProgress(agentId: number, progress: number): Promise<void>;
  completeTask(agentId: number, result: string): Promise<void>;
  handleFailure(agentId: number, error: string): Promise<void>;
}
```

## Real-time System Design

### WebSocket Architecture
```typescript
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  source: 'system' | 'agent' | 'user';
}

// Event Types:
- agent_updated: Agent status/progress changes
- query_started: New research query initiated  
- task_assigned: Agent assigned to specific task
- task_completed: Agent completes assigned task
- activity_logged: System activity events
- chat_message: Chat interface communication
- system_metrics_updated: Performance metrics
```

### Client-Server Communication
```
Client ←→ Server Communication Patterns:

1. HTTP REST API:
   GET /api/agents        → Fetch agent list
   POST /api/agents       → Create new agent
   POST /api/queries      → Submit research query
   GET /api/queries/:id   → Get query details + tasks
   
2. WebSocket Events:
   Client → Server: agent_update, system_command
   Server → Client: All real-time updates
   
3. State Synchronization:
   TanStack Query manages server state cache
   WebSocket events trigger cache invalidation
   Optimistic updates for immediate UI response
```

## Performance and Scalability

### Optimization Strategies
- **Frontend**: Code splitting with React.lazy(), memoization with React.memo()
- **Backend**: Connection pooling, query optimization, WebSocket connection management
- **Database**: Indexed queries, efficient pagination, background cleanup jobs
- **Caching**: TanStack Query for client-side caching, in-memory maps for active data

### Monitoring and Observability
- **System Metrics**: CPU, memory, network I/O tracking
- **Agent Performance**: Task completion rates, response times
- **Query Analytics**: Processing times, success rates, complexity distribution
- **Real-time Dashboard**: Live system health monitoring

## Security and Reliability

### Data Protection
- **Input Validation**: Zod schemas for all API endpoints
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **WebSocket Security**: Connection validation and rate limiting
- **Error Handling**: Comprehensive error boundaries and logging

### Fault Tolerance
- **Agent Failure Recovery**: Automatic task reassignment
- **WebSocket Reconnection**: Automatic reconnection with exponential backoff
- **Database Resilience**: Connection pooling and retry logic
- **Graceful Degradation**: Fallback to polling if WebSocket fails

## Deployment Architecture

### Development Environment
- **Frontend**: Vite dev server with HMR on port 5173
- **Backend**: Express server with tsx on port 5000
- **Database**: Neon PostgreSQL with connection pooling
- **WebSocket**: Integrated with HTTP server on same port

### Production Considerations
- **Build Process**: Vite builds static assets, esbuild bundles server
- **Asset Serving**: Express serves both API and static files
- **Database Migrations**: Drizzle migrations via `db:push`
- **Process Management**: Single Node.js process for simplicity

This architecture provides a robust, scalable foundation for the physics research laboratory while maintaining clear separation of concerns and efficient real-time communication between all system components.