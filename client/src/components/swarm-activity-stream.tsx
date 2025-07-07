import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityItem {
  id: number;
  timestamp: Date;
  type: 'query_submitted' | 'agent_activity' | 'query_completed';
  message: string;
  icon: string;
}

export default function SwarmActivityStream() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Get activity log
  const { data: activityData } = useQuery({
    queryKey: ['/api/activity-log'],
    refetchInterval: 2000, // Single 2-second polling
  });

  // Get queries for status updates
  const { data: queriesData } = useQuery({
    queryKey: ['/api/queries'],
    refetchInterval: 2000,
  });

  useEffect(() => {
    const newActivities: ActivityItem[] = [];

    // Add activity log items
    if (activityData && Array.isArray(activityData)) {
      activityData.forEach((activity: any) => {
        let icon = "📝";
        let type: ActivityItem['type'] = 'agent_activity';
        
        if (activity.action === 'query_submitted') {
          icon = "🔍";
          type = 'query_submitted';
        } else if (activity.action === 'query_completed') {
          icon = "✅";
          type = 'query_completed';
        } else if (activity.action.includes('agent') || activity.action.includes('task')) {
          icon = "🤖";
          type = 'agent_activity';
        }

        newActivities.push({
          id: activity.id,
          timestamp: new Date(activity.timestamp || new Date()),
          type,
          message: activity.description,
          icon,
        });
      });
    }

    // Sort by timestamp (newest first)
    newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setActivities(newActivities.slice(0, 50)); // Keep last 50 activities
  }, [activityData, queriesData]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-[var(--dark-slate)] border-gray-700">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-[var(--clean-white)] mb-4">
          Live Swarm Activity
        </h3>
        
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {activities.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-3xl mb-2">🤖</div>
                <p>Swarm is ready for your questions</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start space-x-3 p-2 rounded hover:bg-[var(--deep-space)]/30"
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {activity.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 font-mono">
                        [{formatTime(activity.timestamp)}]
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      {activity.message}
                    </p>
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