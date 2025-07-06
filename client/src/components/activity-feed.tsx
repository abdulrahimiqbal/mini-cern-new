import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/hooks/use-websocket";
import type { ActivityLog } from "@shared/schema";

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const { subscribe } = useWebSocket();

  const { data: initialActivities } = useQuery({
    queryKey: ['/api/activity-log'],
    refetchInterval: false,
  });

  useEffect(() => {
    if (initialActivities && Array.isArray(initialActivities)) {
      setActivities(initialActivities);
    }
  }, [initialActivities]);

  useEffect(() => {
    const unsubscribe = subscribe('activity_logged', (newActivity: ActivityLog) => {
      setActivities(prev => [newActivity, ...prev].slice(0, 50));
    });

    return unsubscribe;
  }, [subscribe]);

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'task_completed':
        return 'bg-[var(--science-green)]';
      case 'agent_created':
        return 'bg-[var(--electric-purple)]';
      case 'agent_deleted':
        return 'bg-red-500';
      default:
        return 'bg-[var(--warning-amber)]';
    }
  };

  return (
    <Card className="bg-[var(--dark-slate)] border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-lg font-semibold text-[var(--clean-white)]">
          Real-Time Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No recent activity
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 ${getActivityColor(activity.action)} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-[var(--clean-white)]">
                        {activity.action.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {activity.timestamp 
                          ? new Date(activity.timestamp).toLocaleTimeString()
                          : 'Just now'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{activity.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
