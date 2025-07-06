import { useLocation } from "wouter";
import { Atom, Users, FlaskConical, BarChart3, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = "" }: NavigationProps) {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { path: '/', icon: Gauge, label: 'Dashboard' },
    { path: '/agents', icon: Users, label: 'Agent Management' },
    { path: '/research', icon: FlaskConical, label: 'Research Data' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className={className}>
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
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`w-full justify-start space-x-3 ${
                isActive
                  ? 'bg-[var(--electric-purple)]/20 text-[var(--electric-purple)] border border-[var(--electric-purple)]/30 hover:bg-[var(--electric-purple)]/30'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}