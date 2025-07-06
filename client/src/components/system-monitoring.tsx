import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SystemMetrics } from "@shared/schema";

interface SystemMonitoringProps {
  metrics: SystemMetrics | null;
}

export default function SystemMonitoring({ metrics }: SystemMonitoringProps) {
  if (!metrics) {
    return (
      <Card className="bg-[var(--dark-slate)] border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-lg font-semibold text-[var(--clean-white)]">
            System Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center text-gray-400">Loading system metrics...</div>
        </CardContent>
      </Card>
    );
  }

  const storagePercentage = (metrics.storageUsed / metrics.storageTotal) * 100;

  return (
    <Card className="bg-[var(--dark-slate)] border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-lg font-semibold text-[var(--clean-white)]">
          System Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">CPU Usage</span>
            <span className="text-sm font-mono text-[var(--clean-white)]">
              {Math.round(metrics.cpuUsage)}%
            </span>
          </div>
          <Progress 
            value={metrics.cpuUsage} 
            className="w-full h-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Memory Usage</span>
            <span className="text-sm font-mono text-[var(--clean-white)]">
              {Math.round(metrics.memoryUsage)}%
            </span>
          </div>
          <Progress 
            value={metrics.memoryUsage} 
            className="w-full h-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Network I/O</span>
            <span className="text-sm font-mono text-[var(--clean-white)]">
              {metrics.networkIO} MB/s
            </span>
          </div>
          <Progress 
            value={Math.min(100, metrics.networkIO)} 
            className="w-full h-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Storage</span>
            <span className="text-sm font-mono text-[var(--clean-white)]">
              {(metrics.storageUsed / 1000).toFixed(1)} TB / {(metrics.storageTotal / 1000).toFixed(1)} TB
            </span>
          </div>
          <Progress 
            value={storagePercentage} 
            className="w-full h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
