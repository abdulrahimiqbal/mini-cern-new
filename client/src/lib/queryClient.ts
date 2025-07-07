import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Mock data for demo mode
const mockData = {
  agents: [
    {
      id: 1,
      name: "Physicist Master",
      type: "specialist",
      specialization: "Theoretical Physics",
      status: "active",
      cpuUsage: 23,
      currentTask: "Quantum Analysis",
      progress: 67,
      capabilities: ["quantum_mechanics", "particle_physics", "theoretical_analysis"],
      createdAt: new Date()
    },
    {
      id: 2,
      name: "Tesla Principles",
      type: "specialist",
      specialization: "Electromagnetic Theory",
      status: "active",
      cpuUsage: 45,
      currentTask: "Field Calculations",
      progress: 89,
      capabilities: ["electromagnetic_theory", "energy_systems", "field_analysis"],
      createdAt: new Date()
    },
    {
      id: 3,
      name: "Curious Questioner",
      type: "specialist",
      specialization: "Hypothesis Generation",
      status: "active",
      cpuUsage: 12,
      currentTask: "Question Generation",
      progress: 34,
      capabilities: ["hypothesis_generation", "critical_thinking", "research_methodology"],
      createdAt: new Date()
    },
    {
      id: 4,
      name: "Web Crawler",
      type: "specialist",
      specialization: "Data Collection",
      status: "active",
      cpuUsage: 67,
      currentTask: "Paper Mining",
      progress: 78,
      capabilities: ["web_scraping", "data_mining", "paper_analysis"],
      createdAt: new Date()
    },
    {
      id: 5,
      name: "Generalist-A1",
      type: "generalist",
      specialization: null,
      status: "standby",
      cpuUsage: 8,
      currentTask: null,
      progress: 0,
      capabilities: ["general_analysis", "data_processing", "basic_research"],
      createdAt: new Date()
    }
  ],
  systemMetrics: {
    id: 1,
    cpuUsage: 34,
    memoryUsage: 67,
    networkIO: 12,
    storageUsed: 2300,
    storageTotal: 5000,
    timestamp: new Date()
  },
  activityLog: [
    {
      id: 1,
      agentId: 1,
      action: "task_started",
      description: "Started working on quantum mechanics analysis",
      timestamp: new Date()
    },
    {
      id: 2,
      agentId: 2,
      action: "task_completed",
      description: "Completed electromagnetic field calculations",
      timestamp: new Date()
    }
  ],
  chatMessages: [
    {
      id: 1,
      sender: "system",
      content: "Physics Research Laboratory initialized. Multi-agent system ready for queries.",
      timestamp: new Date()
    }
  ],
  researchData: [
    {
      id: 1,
      agentId: 1,
      title: "Quantum Entanglement Analysis in High-Energy Physics",
      content: "Comprehensive analysis of quantum entanglement phenomena observed in particle accelerator experiments. Key findings include novel correlation patterns that suggest non-local quantum effects at unprecedented energy scales.",
      dataType: "analysis",
      metadata: { keywords: ["quantum", "entanglement", "particle physics"], confidence: 0.95 },
      createdAt: new Date()
    }
  ]
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return await res.json();
  } catch (error) {
    // Fallback to mock data in demo mode
    console.warn(`API request failed, using mock data for ${url}:`, error);
    
    // Return mock data based on URL
    if (url.includes('/api/agents')) {
      if (method === 'POST') {
        return { ...(data as object), id: Date.now(), createdAt: new Date() };
      }
      return mockData.agents;
    }
    
    if (url.includes('/api/system-metrics')) {
      return mockData.systemMetrics;
    }
    
    if (url.includes('/api/activity-log')) {
      return mockData.activityLog;
    }
    
    if (url.includes('/api/chat-messages')) {
      return mockData.chatMessages;
    }
    
    if (url.includes('/api/research-data')) {
      return mockData.researchData;
    }
    
    // Default response for unknown endpoints
    return { message: "Demo mode - API not available" };
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Fallback to mock data in demo mode
      console.warn(`Query failed, using mock data for ${queryKey[0]}:`, error);
      
      const url = queryKey[0] as string;
      
      if (url.includes('/api/agents')) {
        return mockData.agents;
      }
      
      if (url.includes('/api/system-metrics')) {
        return mockData.systemMetrics;
      }
      
      if (url.includes('/api/activity-log')) {
        return mockData.activityLog;
      }
      
      if (url.includes('/api/chat-messages')) {
        return mockData.chatMessages;
      }
      
      if (url.includes('/api/research-data')) {
        return mockData.researchData;
      }
      
      return [];
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
