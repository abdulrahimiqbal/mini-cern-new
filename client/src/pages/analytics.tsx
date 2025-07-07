import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Activity, Clock, Zap, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import Navigation from "@/components/navigation";
import type { Agent, SystemMetrics } from "@shared/schema";

export default function AnalyticsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);

  const { data: initialAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const { data: initialMetrics } = useQuery({
    queryKey: ['/api/system-metrics'],
    refetchInterval: 3000, // Poll every 3 seconds
  });

  useEffect(() => {
    if (initialAgents && Array.isArray(initialAgents)) {
      setAgents(initialAgents);
    }
  }, [initialAgents]);

  useEffect(() => {
    if (initialMetrics && typeof initialMetrics === 'object' && initialMetrics !== null) {
      setSystemMetrics(initialMetrics as SystemMetrics);
    }
  }, [initialMetrics]);

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const specialistAgents = agents.filter(agent => agent.type === 'specialist');
  const generalistAgents = agents.filter(agent => agent.type === 'generalist');
  
  const averageCpuUsage = agents.length > 0 
    ? agents.reduce((sum, agent) => sum + (agent.cpuUsage || 0), 0) / agents.length 
    : 0;
    
  const averageProgress = agents.length > 0 
    ? agents.reduce((sum, agent) => sum + (agent.progress || 0), 0) / agents.length 
    : 0;

  const completedTasks = agents.filter(agent => (agent.progress || 0) >= 100).length;
  const activeTasks = agents.filter(agent => agent.currentTask && (agent.progress || 0) < 100).length;

  if (agentsLoading) {
    return (
      <div className="min-h-screen bg-[var(--deep-space)] flex items-center justify-center">
        <div className="text-[var(--clean-white)]">Loading analytics...</div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--clean-white)]">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">Performance metrics and system insights</p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">System Efficiency</p>
                  <p className="text-2xl font-mono font-bold text-[var(--science-green)] mt-1">
                    {Math.round(averageProgress)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--science-green)]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[var(--science-green)]" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={averageProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Agents</p>
                  <p className="text-2xl font-mono font-bold text-[var(--electric-purple)] mt-1">
                    {activeAgents.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--electric-purple)]/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[var(--electric-purple)]" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--science-green)] rounded-full animate-pulse"></div>
                <span className="text-sm text-[var(--science-green)]">
                  {Math.round((activeAgents.length / Math.max(agents.length, 1)) * 100)}% Utilization
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg CPU Usage</p>
                  <p className="text-2xl font-mono font-bold text-[var(--warning-amber)] mt-1">
                    {Math.round(averageCpuUsage)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--warning-amber)]/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[var(--warning-amber)]" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={averageCpuUsage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Task Completion</p>
                  <p className="text-2xl font-mono font-bold text-[var(--clean-white)] mt-1">
                    {completedTasks}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--science-green)]/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[var(--science-green)]" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--warning-amber)] rounded-full"></div>
                <span className="text-sm text-[var(--warning-amber)]">
                  {activeTasks} Active Tasks
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Performance */}
          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--clean-white)]">Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.slice(0, 8).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'active' ? 'bg-[var(--science-green)]' :
                        agent.status === 'standby' ? 'bg-[var(--warning-amber)]' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-[var(--clean-white)] font-medium">
                        {agent.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Progress</div>
                        <div className="text-sm font-mono text-[var(--clean-white)]">
                          {agent.progress || 0}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">CPU</div>
                        <div className="text-sm font-mono text-[var(--clean-white)]">
                          {agent.cpuUsage || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Resources */}
          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--clean-white)]">System Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {systemMetrics ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">CPU Usage</span>
                      <span className="text-sm font-mono text-[var(--clean-white)]">
                        {Math.round(systemMetrics.cpuUsage)}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.cpuUsage} className="h-3" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Memory Usage</span>
                      <span className="text-sm font-mono text-[var(--clean-white)]">
                        {Math.round(systemMetrics.memoryUsage)}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.memoryUsage} className="h-3" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Network I/O</span>
                      <span className="text-sm font-mono text-[var(--clean-white)]">
                        {systemMetrics.networkIO} MB/s
                      </span>
                    </div>
                    <Progress value={Math.min(100, systemMetrics.networkIO)} className="h-3" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Storage</span>
                      <span className="text-sm font-mono text-[var(--clean-white)]">
                        {((systemMetrics.storageUsed / systemMetrics.storageTotal) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(systemMetrics.storageUsed / systemMetrics.storageTotal) * 100} 
                      className="h-3" 
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{(systemMetrics.storageUsed / 1000).toFixed(1)} TB</span>
                      <span>{(systemMetrics.storageTotal / 1000).toFixed(1)} TB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Loading system metrics...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Distribution */}
          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--clean-white)]">Agent Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-[var(--electric-purple)] rounded"></div>
                    <span className="text-sm text-[var(--clean-white)]">Specialist Agents</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-[var(--clean-white)]">
                      {specialistAgents.length}
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round((specialistAgents.length / Math.max(agents.length, 1)) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span className="text-sm text-[var(--clean-white)]">Generalist Agents</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-[var(--clean-white)]">
                      {generalistAgents.length}
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round((generalistAgents.length / Math.max(agents.length, 1)) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Agents</span>
                    <span className="text-[var(--clean-white)] font-mono font-bold">
                      {agents.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--clean-white)]">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Activity className="w-4 h-4 text-[var(--science-green)]" />
                  <div>
                    <div className="text-sm font-medium text-[var(--clean-white)]">
                      High Efficiency Detected
                    </div>
                    <div className="text-xs text-gray-400">
                      Agent swarm operating at {Math.round(averageProgress)}% efficiency
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-[var(--warning-amber)]" />
                  <div>
                    <div className="text-sm font-medium text-[var(--clean-white)]">
                      Resource Optimization
                    </div>
                    <div className="text-xs text-gray-400">
                      CPU usage balanced across {activeAgents.length} active agents
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-4 h-4 text-[var(--electric-purple)]" />
                  <div>
                    <div className="text-sm font-medium text-[var(--clean-white)]">
                      Task Completion Rate
                    </div>
                    <div className="text-xs text-gray-400">
                      {completedTasks} tasks completed, {activeTasks} in progress
                    </div>
                  </div>
                </div>

                {averageCpuUsage > 75 && (
                  <div className="flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-red-400" />
                    <div>
                      <div className="text-sm font-medium text-red-400">
                        High CPU Usage Alert
                      </div>
                      <div className="text-xs text-gray-400">
                        Consider adding more generalist agents to distribute load
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}