import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Atom, Clock, AlertTriangle, Plus, Users, FlaskConical, BarChart3, Heart, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/hooks/use-websocket";
import AgentCard from "@/components/agent-card";
import ChatInterface from "@/components/chat-interface";
import SystemMonitoring from "@/components/system-monitoring";
import ActivityFeed from "@/components/activity-feed";
import AddAgentModal from "@/components/add-agent-modal";
import type { Agent, SystemMetrics } from "@shared/schema";

export default function Dashboard() {
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [, setLocation] = useLocation();
  const { subscribe } = useWebSocket();

  // Query for initial data
  const { data: initialAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    refetchInterval: false,
  });

  const { data: initialMetrics } = useQuery({
    queryKey: ['/api/system-metrics'],
    refetchInterval: false,
  });

  useEffect(() => {
    if (initialAgents) {
      setAgents(initialAgents);
    }
  }, [initialAgents]);

  useEffect(() => {
    if (initialMetrics) {
      setSystemMetrics(initialMetrics);
    }
  }, [initialMetrics]);

  // Subscribe to WebSocket updates
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

    const unsubscribeSystemMetrics = subscribe('system_metrics_updated', (metrics: SystemMetrics) => {
      setSystemMetrics(metrics);
    });

    return () => {
      unsubscribeAgentUpdated();
      unsubscribeAgentCreated();
      unsubscribeAgentDeleted();
      unsubscribeSystemMetrics();
    };
  }, [subscribe]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const totalTasks = agents.reduce((sum, agent) => sum + (agent.currentTask ? 1 : 0), 0);
  const completedTasks = agents.filter(agent => agent.progress === 100).length;

  if (agentsLoading) {
    return (
      <div className="min-h-screen bg-[var(--deep-space)] flex items-center justify-center">
        <div className="text-[var(--clean-white)]">Loading physics laboratory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--deep-space)] text-[var(--clean-white)] font-sans">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[var(--dark-slate)] border-r border-gray-700 flex flex-col">
          {/* Logo and Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--electric-purple)] to-[var(--science-green)] rounded-lg flex items-center justify-center">
                <Atom className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[var(--clean-white)]">Physics Lab</h1>
                <p className="text-xs text-gray-400 font-mono">Multi-Agent System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start space-x-3 bg-[var(--electric-purple)]/20 text-[var(--electric-purple)] border border-[var(--electric-purple)]/30 hover:bg-[var(--electric-purple)]/30"
            >
              <Gauge className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/agents')}
              className="w-full justify-start space-x-3 text-gray-300 hover:bg-gray-700/50"
            >
              <Users className="w-4 h-4" />
              <span>Agent Management</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/research')}
              className="w-full justify-start space-x-3 text-gray-300 hover:bg-gray-700/50"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Research Data</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/analytics')}
              className="w-full justify-start space-x-3 text-gray-300 hover:bg-gray-700/50"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </Button>
          </nav>

          {/* System Status */}
          <div className="p-4 border-t border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">System Status</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-[var(--science-green)] rounded-full animate-pulse"></div>
                  <span className="text-sm text-[var(--science-green)] font-mono">ONLINE</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Active Agents</span>
                <span className="text-sm text-[var(--clean-white)] font-mono">{activeAgents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">CPU Usage</span>
                <span className="text-sm text-[var(--clean-white)] font-mono">
                  {systemMetrics ? `${Math.round(systemMetrics.cpuUsage)}%` : '--'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="bg-[var(--dark-slate)] border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--clean-white)]">Mission Control Dashboard</h2>
                <p className="text-sm text-gray-400 mt-1">Real-time multi-agent swarm coordination</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Mission Time</div>
                  <div className="text-lg font-mono text-[var(--clean-white)]">
                    {currentTime.toLocaleTimeString()} UTC
                  </div>
                </div>
                <Button 
                  className="bg-[var(--warning-amber)] text-[var(--deep-space)] hover:bg-[var(--warning-amber)]/90"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Emergency Stop
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--electric-purple)] to-[var(--science-green)] rounded-full"></div>
                  <span className="text-sm text-[var(--clean-white)]">Dr. Sarah Chen</span>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 p-6 overflow-auto">
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-[var(--dark-slate)] border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Agents</p>
                      <p className="text-2xl font-mono font-bold text-[var(--clean-white)] mt-1">
                        {agents.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-[var(--electric-purple)]/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-[var(--electric-purple)]" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[var(--science-green)] rounded-full"></div>
                    <span className="text-sm text-[var(--science-green)]">{activeAgents.length} Active</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-slate)] border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Research Tasks</p>
                      <p className="text-2xl font-mono font-bold text-[var(--clean-white)] mt-1">
                        {totalTasks}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-[var(--science-green)]/20 rounded-lg flex items-center justify-center">
                      <FlaskConical className="w-6 h-6 text-[var(--science-green)]" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[var(--warning-amber)] rounded-full"></div>
                    <span className="text-sm text-[var(--warning-amber)]">
                      {totalTasks - completedTasks} Pending
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-slate)] border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Completed Tasks</p>
                      <p className="text-2xl font-mono font-bold text-[var(--clean-white)] mt-1">
                        {completedTasks}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-[var(--warning-amber)]/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-[var(--warning-amber)]" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[var(--science-green)] rounded-full"></div>
                    <span className="text-sm text-[var(--science-green)]">
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% Complete
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-slate)] border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">System Health</p>
                      <p className="text-2xl font-mono font-bold text-[var(--science-green)] mt-1">97%</p>
                    </div>
                    <div className="w-12 h-12 bg-[var(--science-green)]/20 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-[var(--science-green)]" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[var(--science-green)] rounded-full"></div>
                    <span className="text-sm text-[var(--science-green)]">All systems nominal</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent Swarm Panel */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-[var(--dark-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-[var(--clean-white)]">
                        Agent Swarm Status
                      </CardTitle>
                      <Button
                        onClick={() => setIsAddAgentModalOpen(true)}
                        className="bg-[var(--science-green)] text-[var(--deep-space)] hover:bg-[var(--science-green)]/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Agent
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <ActivityFeed />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <ChatInterface />
                <SystemMonitoring metrics={systemMetrics} />
                
                {/* Quick Actions */}
                <Card className="bg-[var(--dark-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <CardTitle className="text-lg font-semibold text-[var(--clean-white)]">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <Button className="w-full justify-start bg-[var(--electric-purple)] text-[var(--clean-white)] hover:bg-[var(--electric-purple)]/90">
                      <FlaskConical className="w-4 h-4 mr-2" />
                      Start New Experiment
                    </Button>
                    <Button className="w-full justify-start bg-[var(--science-green)] text-[var(--deep-space)] hover:bg-[var(--science-green)]/90">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Export Research Data
                    </Button>
                    <Button className="w-full justify-start bg-[var(--warning-amber)] text-[var(--deep-space)] hover:bg-[var(--warning-amber)]/90">
                      <Clock className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AddAgentModal 
        isOpen={isAddAgentModalOpen} 
        onClose={() => setIsAddAgentModalOpen(false)} 
      />
    </div>
  );
}
