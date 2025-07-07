import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Database, Activity as ActivityIcon, FlaskConical, Atom } from "lucide-react";
import ActivityFeed from "@/components/activity-feed";
import ChatInterface from "@/components/chat-interface";
import CompactAgentStatus from "@/components/compact-agent-status";
import ResearchResults from "@/components/research-results";
import type { Agent, Query, SystemMetrics } from "@shared/schema";

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  const { data: initialAgents } = useQuery({
    queryKey: ['/api/agents'],
    refetchInterval: 5000,
  });

  const { data: initialQueries } = useQuery({
    queryKey: ['/api/queries'],
    refetchInterval: 5000,
  });

  const { data: initialMetrics } = useQuery({
    queryKey: ['/api/system-metrics'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (initialAgents && Array.isArray(initialAgents)) {
      setAgents(initialAgents);
    }
  }, [initialAgents]);

  useEffect(() => {
    if (initialQueries && Array.isArray(initialQueries)) {
      setQueries(initialQueries);
    }
  }, [initialQueries]);

  useEffect(() => {
    if (initialMetrics && typeof initialMetrics === 'object' && initialMetrics !== null) {
      setMetrics(initialMetrics as SystemMetrics);
    }
  }, [initialMetrics]);

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const completedQueries = queries.filter(query => query.status === 'completed');
  const processingQueries = queries.filter(query => query.status === 'processing');

  return (
    <div className="min-h-screen bg-[var(--deep-space)] p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--electric-purple)] to-[var(--science-green)] rounded-lg flex items-center justify-center">
            <Atom className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[var(--clean-white)]">
              Main Swarm
            </h1>
            <p className="text-gray-400">
              Unified research intelligence interface
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[var(--science-green)] rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Swarm Active</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {activeAgents.length} agents online
          </Badge>
        </div>
      </div>

      {/* System Status Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[var(--dark-slate)] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-[var(--warning-amber)]" />
              <div>
                <div className="text-lg font-bold text-[var(--clean-white)]">
                  {processingQueries.length}
                </div>
                <div className="text-xs text-gray-400">Processing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-slate)] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FlaskConical className="h-5 w-5 text-[var(--science-green)]" />
              <div>
                <div className="text-lg font-bold text-[var(--clean-white)]">
                  {completedQueries.length}
                </div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-slate)] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-[var(--electric-purple)]" />
              <div>
                <div className="text-lg font-bold text-[var(--clean-white)]">
                  {metrics?.memoryUsage || 0}%
                </div>
                <div className="text-xs text-gray-400">Memory</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-slate)] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ActivityIcon className="h-5 w-5 text-[var(--warning-amber)]" />
              <div>
                <div className="text-lg font-bold text-[var(--clean-white)]">
                  {metrics?.cpuUsage || 0}%
                </div>
                <div className="text-xs text-gray-400">CPU</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface - Top Left (30%) */}
        <div className="lg:col-span-1">
          <ChatInterface />
        </div>

        {/* Activity Feed - Top Right (40%) */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>

      {/* Middle Section - Agent Status */}
      <div className="grid grid-cols-1 gap-6">
        <CompactAgentStatus />
      </div>

      {/* Bottom Section - Research Results (30%) */}
      <div className="grid grid-cols-1 gap-6">
        <ResearchResults />
      </div>
    </div>
  );
}
