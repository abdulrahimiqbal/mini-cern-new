import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Zap, Bot, GraduationCap, HelpCircle, Worm } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Agent } from "@shared/schema";

const getAgentIcon = (name: string, type: string) => {
  if (type === "generalist") return <Users className="w-4 h-4 text-white" />;
  
  if (name.includes("Physicist")) return <GraduationCap className="w-4 h-4 text-white" />;
  if (name.includes("Tesla")) return <Zap className="w-4 h-4 text-white" />;
  if (name.includes("Curious")) return <HelpCircle className="w-4 h-4 text-white" />;
  if (name.includes("Crawler")) return <Worm className="w-4 h-4 text-white" />;
  
  return <Bot className="w-4 h-4 text-white" />;
};

const getAgentGradient = (name: string, type: string) => {
  if (type === "generalist") return "from-gray-500 to-gray-600";
  
  if (name.includes("Physicist")) return "from-[var(--electric-purple)] to-blue-600";
  if (name.includes("Tesla")) return "from-[var(--warning-amber)] to-orange-600";
  if (name.includes("Curious")) return "from-[var(--science-green)] to-green-600";
  if (name.includes("Crawler")) return "from-red-500 to-red-600";
  
  return "from-gray-500 to-gray-600";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-[var(--science-green)]';
    case 'standby':
      return 'bg-[var(--warning-amber)]';
    case 'offline':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export default function CompactAgentStatus() {
  const [agents, setAgents] = useState<Agent[]>([]);

  const { data: initialAgents } = useQuery({
    queryKey: ['/api/agents'],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  useEffect(() => {
    if (initialAgents && Array.isArray(initialAgents)) {
      setAgents(initialAgents);
    }
  }, [initialAgents]);

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const totalAgents = agents.length;
  const averageProgress = agents.length > 0 
    ? agents.reduce((sum, agent) => sum + (agent.progress || 0), 0) / agents.length 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-[var(--electric-purple)]" />
          <h3 className="text-lg font-semibold text-[var(--clean-white)]">
            Swarm Status
          </h3>
          <Badge variant="outline" className="text-xs">
            {activeAgents.length}/{totalAgents} active
          </Badge>
        </div>
        <div className="text-sm text-gray-400">
          {Math.round(averageProgress)}% avg progress
        </div>
      </div>

      {/* Active Agents Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {agents.slice(0, 8).map((agent) => (
          <Card key={agent.id} className="bg-[var(--dark-slate)] border-gray-700 hover:border-[var(--electric-purple)]/30 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-6 h-6 bg-gradient-to-br ${getAgentGradient(agent.name, agent.type)} rounded flex items-center justify-center`}>
                  {getAgentIcon(agent.name, agent.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[var(--clean-white)] truncate">
                    {agent.name}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-1.5 h-1.5 ${getStatusColor(agent.status)} rounded-full ${agent.status === 'active' ? 'animate-pulse' : ''}`}></div>
                    <span className="text-xs text-gray-400 uppercase">
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-[var(--clean-white)]">{agent.progress || 0}%</span>
                </div>
                <Progress value={agent.progress || 0} className="h-1" />
                
                {agent.currentTask && (
                  <div className="text-xs text-gray-300 truncate mt-1">
                    {agent.currentTask}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-[var(--science-green)]">
            {activeAgents.length}
          </div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-[var(--warning-amber)]">
            {agents.filter(a => a.status === 'standby').length}
          </div>
          <div className="text-xs text-gray-400">Standby</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-[var(--electric-purple)]">
            {Math.round(averageProgress)}%
          </div>
          <div className="text-xs text-gray-400">Progress</div>
        </div>
      </div>
    </div>
  );
} 