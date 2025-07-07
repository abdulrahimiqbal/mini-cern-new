import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, FlaskConical, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { ResearchData } from "@shared/schema";

export default function ResearchResults() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [researchData, setResearchData] = useState<ResearchData[]>([]);

  const { data: initialResearchData } = useQuery({
    queryKey: ['/api/research-data'],
    refetchInterval: 5000, // Poll every 5 seconds for new results
  });

  useEffect(() => {
    if (initialResearchData && Array.isArray(initialResearchData)) {
      setResearchData(initialResearchData.slice(0, 10)); // Show only latest 10
    }
  }, [initialResearchData]);

  const toggleExpanded = (id: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FlaskConical className="w-5 h-5 text-[var(--science-green)]" />
          <h3 className="text-lg font-semibold text-[var(--clean-white)]">
            Research Results
          </h3>
          <Badge variant="outline" className="text-xs">
            {researchData.length} results
          </Badge>
        </div>
        {researchData.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Latest: {formatTimeAgo(researchData[0]?.createdAt || new Date())}</span>
          </div>
        )}
      </div>

      <ScrollArea className="h-80">
        <div className="space-y-3">
          {researchData.length === 0 ? (
            <Card className="bg-[var(--dark-slate)] border-gray-700">
              <CardContent className="p-6 text-center">
                <FlaskConical className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No research results yet</p>
                <p className="text-sm text-gray-500 mt-1">Ask the swarm a question to generate analysis</p>
              </CardContent>
            </Card>
          ) : (
            researchData.map((item) => {
              const isExpanded = expandedCards.has(item.id);
              return (
                <Card key={item.id} className="bg-[var(--dark-slate)] border-gray-700 hover:border-[var(--electric-purple)]/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-[var(--science-green)]/20 rounded-lg flex items-center justify-center">
                          <FlaskConical className="w-4 h-4 text-[var(--science-green)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm text-[var(--clean-white)] leading-tight truncate">
                            {item.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.dataType.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(item.createdAt || new Date())}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                        className="text-gray-400 hover:text-[var(--clean-white)] ml-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <ScrollArea className="h-48">
                        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {item.content}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 