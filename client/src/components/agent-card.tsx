import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Zap, HelpCircle, Worm, Users, Bot } from "lucide-react";
import type { Agent } from "@shared/schema";

interface AgentCardProps {
  agent: Agent;
}

const getAgentIcon = (name: string, type: string) => {
  if (type === "generalist") return <Users className="w-5 h-5 text-white" />;
  
  if (name.includes("Physicist")) return <GraduationCap className="w-5 h-5 text-white" />;
  if (name.includes("Tesla")) return <Zap className="w-5 h-5 text-white" />;
  if (name.includes("Curious")) return <HelpCircle className="w-5 h-5 text-white" />;
  if (name.includes("Crawler")) return <Worm className="w-5 h-5 text-white" />;
  
  return <Bot className="w-5 h-5 text-white" />;
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

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "standby":
      return "STANDBY";
    case "offline":
      return "OFFLINE";
    default:
      return "UNKNOWN";
  }
};

export default function AgentCard({ agent }: AgentCardProps) {
  const statusColor = getStatusColor(agent.status);
  const statusText = getStatusText(agent.status);
  const icon = getAgentIcon(agent.name, agent.type);
  const gradient = getAgentGradient(agent.name, agent.type);

  return (
    <div className="agent-card bg-[var(--deep-space)] border-gray-600 hover:border-[var(--electric-purple)]/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-[var(--clean-white)]">{agent.name}</h4>
            <p className="text-sm text-gray-400">
              {agent.type === "generalist" ? "General Purpose Agent" : agent.specialization}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 ${statusColor} rounded-full ${agent.status === 'active' ? 'animate-pulse' : ''}`}></div>
              <span className={`text-xs font-mono ${
                agent.status === 'active' ? 'text-[var(--science-green)]' : 
                agent.status === 'standby' ? 'text-[var(--warning-amber)]' : 
                'text-red-500'
              }`}>
                {statusText}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400 font-mono">
                CPU: {agent.cpuUsage || 0}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-[var(--clean-white)]">
            {agent.currentTask || (agent.type === "generalist" ? "Ready for Assignment" : "Idle")}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Progress: {agent.progress || 0}%
          </div>
          <div className="mt-2">
            <Progress 
              value={agent.progress || 0} 
              className="w-24 h-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
