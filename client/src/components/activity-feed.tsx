import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { ActivityLog } from "@shared/schema";

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const { data: initialActivities } = useQuery({
    queryKey: ['/api/activity-log'],
    refetchInterval: 3000, // Poll every 3 seconds for faster updates
  });

  useEffect(() => {
    if (initialActivities && Array.isArray(initialActivities)) {
      setActivities(initialActivities.slice(0, 20)); // Show latest 20 activities
    }
  }, [initialActivities]);

  const getActivityBadgeColor = (action: string) => {
    switch (action) {
      case 'query_submitted':
        return 'bg-[var(--electric-purple)]/20 text-[var(--electric-purple)]';
      case 'query_completed':
        return 'bg-[var(--science-green)]/20 text-[var(--science-green)]';
      case 'task_started':
        return 'bg-[var(--warning-amber)]/20 text-[var(--warning-amber)]';
      case 'task_completed':
        return 'bg-[var(--science-green)]/20 text-[var(--science-green)]';
      case 'agent_created':
        return 'bg-blue-400/20 text-blue-400';
      case 'agent_deleted':
        return 'bg-red-400/20 text-red-400';
      default:
        return 'bg-gray-400/20 text-gray-400';
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'query_submitted':
        return '🔍';
      case 'query_completed':
        return '✅';
      case 'task_started':
        return '⚡';
      case 'task_completed':
        return '🎯';
      case 'agent_created':
        return '🤖';
      case 'agent_deleted':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[var(--warning-amber)]" />
          <h3 className="text-lg font-semibold text-[var(--clean-white)]">
            Live Activity Feed
          </h3>
          <Badge variant="outline" className="text-xs">
            {activities.length} events
          </Badge>
        </div>
        {activities.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Latest: {formatTimeAgo(activities[0]?.timestamp || new Date())}</span>
          </div>
        )}
      </div>

      <Card className="bg-[var(--dark-slate)] border-gray-700">
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              {activities.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-lg">Swarm is Ready</p>
                  <p className="text-sm text-gray-500 mt-2">Waiting for your research queries...</p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      index === 0 ? 'bg-[var(--electric-purple)]/5 border border-[var(--electric-purple)]/20' : 'hover:bg-[var(--deep-space)]/50'
                    }`}
                  >
                    <div className="text-xl mt-1 flex-shrink-0">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          className={`text-xs px-2 py-1 ${getActivityBadgeColor(activity.action)}`}
                          variant="secondary"
                        >
                          {activity.action.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                                                 <span className="text-xs text-gray-500">
                           {formatTimeAgo(activity.timestamp || new Date())}
                         </span>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs text-[var(--science-green)] border-[var(--science-green)]">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
