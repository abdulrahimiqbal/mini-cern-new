import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { ActivityLog } from "@shared/schema";

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [pinnedActivities, setPinnedActivities] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);

  const { data: initialActivities, error } = useQuery({
    queryKey: ['/api/activity-log'],
    refetchInterval: 3000, // Poll every 3 seconds for faster updates
    retry: 3,
  });

  // Handle errors separately
  useEffect(() => {
    if (error) {
      const errorMsg = `Failed to fetch activity log: ${error.message}`;
      setErrors(prev => [...prev.slice(-4), errorMsg]); // Keep last 5 errors
      toast({
        title: "Activity feed connection issue",
        description: "Retrying connection...",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (initialActivities && Array.isArray(initialActivities)) {
      const newActivities = initialActivities.slice(0, 30); // Show latest 30 activities
      
      // Keep pinned activities at the top
      const pinned = newActivities.filter(activity => pinnedActivities.has(activity.id));
      const unpinned = newActivities.filter(activity => !pinnedActivities.has(activity.id));
      
      setActivities([...pinned, ...unpinned]);
      
      // Clear old errors when connection is restored
      if (errors.length > 0) {
        setErrors([]);
        toast({
          title: "Activity feed reconnected",
          description: "Connection restored successfully",
        });
      }
    }
  }, [initialActivities, pinnedActivities, errors.length]);

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

  const handleActivityClick = (activity: ActivityLog) => {
    // Toggle pin status
    setPinnedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activity.id)) {
        newSet.delete(activity.id);
        toast({
          title: "Activity unpinned",
          description: "Activity will follow normal order",
        });
      } else {
        newSet.add(activity.id);
        toast({
          title: "Activity pinned",
          description: "Activity will stay at the top",
        });
      }
      return newSet;
    });
  };

  const isImportantActivity = (action: string) => {
    return ['query_completed', 'query_submitted', 'task_completed'].includes(action);
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
          {pinnedActivities.size > 0 && (
            <Badge variant="secondary" className="text-xs bg-[var(--electric-purple)]/20 text-[var(--electric-purple)]">
              {pinnedActivities.size} pinned
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {errors.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.length} errors</span>
            </div>
          )}
          {activities.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Latest: {formatTimeAgo(activities[0]?.timestamp || new Date())}</span>
            </div>
          )}
        </div>
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
                                activities.map((activity, index) => {
                  const isPinned = pinnedActivities.has(activity.id);
                  const isImportant = isImportantActivity(activity.action);
                  
                  return (
                    <div 
                      key={activity.id} 
                      onClick={() => handleActivityClick(activity)}
                      className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                        isPinned 
                          ? 'bg-[var(--electric-purple)]/10 border border-[var(--electric-purple)]/30' 
                          : index === 0 
                            ? 'bg-[var(--electric-purple)]/5 border border-[var(--electric-purple)]/20' 
                            : 'hover:bg-[var(--deep-space)]/50 border border-transparent hover:border-gray-600'
                      } ${isImportant ? 'ring-1 ring-[var(--science-green)]/20' : ''}`}
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
                          {index === 0 && !isPinned && (
                            <Badge variant="outline" className="text-xs text-[var(--science-green)] border-[var(--science-green)]">
                              NEW
                            </Badge>
                          )}
                          {isPinned && (
                            <Badge variant="outline" className="text-xs text-[var(--electric-purple)] border-[var(--electric-purple)]">
                              PINNED
                            </Badge>
                          )}
                          {isImportant && (
                            <Badge variant="outline" className="text-xs text-[var(--warning-amber)] border-[var(--warning-amber)]">
                              IMPORTANT
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                          <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-[var(--clean-white)] p-1 h-6">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {isPinned ? 'Unpin' : 'Pin'} activity
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="bg-red-950/20 border-red-800/30">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Connection Issues</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setErrors([])}
                className="text-xs text-red-400 hover:text-red-300 ml-auto"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-1">
              {errors.slice(-3).map((error, index) => (
                <div key={index} className="text-xs text-red-300 font-mono">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
