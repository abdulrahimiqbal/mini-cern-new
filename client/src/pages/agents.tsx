import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Users, GraduationCap, Zap, HelpCircle, Worm, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AddAgentModal from "@/components/add-agent-modal";
import Navigation from "@/components/navigation";
import type { Agent } from "@shared/schema";

const getAgentIcon = (name: string, type: string) => {
  if (type === "generalist") return <Users className="w-6 h-6 text-white" />;
  
  if (name.includes("Physicist")) return <GraduationCap className="w-6 h-6 text-white" />;
  if (name.includes("Tesla")) return <Zap className="w-6 h-6 text-white" />;
  if (name.includes("Curious")) return <HelpCircle className="w-6 h-6 text-white" />;
  if (name.includes("Crawler")) return <Worm className="w-6 h-6 text-white" />;
  
  return <Bot className="w-6 h-6 text-white" />;
};

const getAgentGradient = (name: string, type: string) => {
  if (type === "generalist") return "from-gray-500 to-gray-600";
  
  if (name.includes("Physicist")) return "from-[var(--electric-purple)] to-purple-600";
  if (name.includes("Tesla")) return "from-[var(--warning-amber)] to-orange-500";
  if (name.includes("Curious")) return "from-[var(--science-green)] to-teal-500";
  if (name.includes("Crawler")) return "from-blue-500 to-cyan-500";
  
  return "from-gray-400 to-gray-500";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-[var(--science-green)]";
    case "standby":
      return "bg-[var(--warning-amber)]";
    case "offline":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function AgentsPage() {
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const { subscribe } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: initialAgents, isLoading } = useQuery({
    queryKey: ['/api/agents'],
    refetchInterval: false,
  });

  useEffect(() => {
    if (initialAgents && Array.isArray(initialAgents)) {
      setAgents(initialAgents);
    }
  }, [initialAgents]);

  useEffect(() => {
    const unsubscribeAgentUpdated = subscribe('agent_updated', (updatedAgent: Agent) => {
      setAgents(prev => prev.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      ));
    });

    const unsubscribeAgentCreated = subscribe('agent_created', (newAgent: Agent) => {
      setAgents(prev => [...prev, newAgent]);
    });

    const unsubscribeAgentDeleted = subscribe('agent_deleted', (data: { id: number }) => {
      setAgents(prev => prev.filter(agent => agent.id !== data.id));
    });

    return () => {
      unsubscribeAgentUpdated();
      unsubscribeAgentCreated();
      unsubscribeAgentDeleted();
    };
  }, [subscribe]);

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      return apiRequest('DELETE', `/api/agents/${agentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Agent Deleted",
        description: "Agent has been removed from the swarm.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAgent = (agentId: number) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      deleteAgentMutation.mutate(agentId);
    }
  };

  const specialistAgents = agents.filter(agent => agent.type === "specialist");
  const generalistAgents = agents.filter(agent => agent.type === "generalist");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--deep-space)] flex items-center justify-center">
        <div className="text-[var(--clean-white)]">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--deep-space)] text-[var(--clean-white)] flex">
      {/* Sidebar */}
      <Navigation className="w-64 bg-[var(--dark-slate)] border-r border-gray-700 flex flex-col" />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--clean-white)]">Agent Management</h1>
            <p className="text-gray-400 mt-2">Manage your physics research agent swarm</p>
          </div>
          <Button
            onClick={() => setIsAddAgentModalOpen(true)}
            className="bg-[var(--science-green)] text-[var(--deep-space)] hover:bg-[var(--science-green)]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Agent
          </Button>
        </div>

        {/* Specialist Agents */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--clean-white)] mb-4">Specialist Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialistAgents.map((agent) => (
              <Card key={agent.id} className="bg-[var(--dark-slate)] border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getAgentGradient(agent.name, agent.type)} rounded-lg flex items-center justify-center`}>
                        {getAgentIcon(agent.name, agent.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[var(--clean-white)]">{agent.name}</CardTitle>
                        <p className="text-sm text-gray-400">{agent.specialization}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${getStatusColor(agent.status)} rounded-full ${agent.status === 'active' ? 'animate-pulse' : ''}`}></div>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">CPU Usage</span>
                      <span className="text-sm font-mono text-[var(--clean-white)]">{agent.cpuUsage}%</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm font-mono text-[var(--clean-white)]">{agent.progress}%</span>
                      </div>
                      <Progress value={agent.progress || 0} className="h-2" />
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-400">Current Task</span>
                      <p className="text-sm text-[var(--clean-white)] mt-1">
                        {agent.currentTask || "Idle"}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-400">Capabilities</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(agent.capabilities) ? agent.capabilities.map((cap, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cap.toString().replace(/_/g, ' ')}
                          </Badge>
                        )) : (
                          <Badge variant="outline" className="text-xs">General</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generalist Agents */}
        <div>
          <h2 className="text-2xl font-semibold text-[var(--clean-white)] mb-4">Generalist Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {generalistAgents.map((agent) => (
              <Card key={agent.id} className="bg-[var(--dark-slate)] border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getAgentGradient(agent.name, agent.type)} rounded-lg flex items-center justify-center`}>
                        {getAgentIcon(agent.name, agent.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base text-[var(--clean-white)]">{agent.name}</CardTitle>
                        <p className="text-xs text-gray-400">General Purpose</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Status</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 ${getStatusColor(agent.status)} rounded-full`}></div>
                        <span className="text-xs font-mono text-[var(--clean-white)]">
                          {agent.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">CPU</span>
                      <span className="text-xs font-mono text-[var(--clean-white)]">{agent.cpuUsage}%</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-mono text-[var(--clean-white)]">{agent.progress}%</span>
                      </div>
                      <Progress value={agent.progress || 0} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </div>
      </div>

      <AddAgentModal 
        isOpen={isAddAgentModalOpen} 
        onClose={() => setIsAddAgentModalOpen(false)} 
      />
    </div>
  );
}