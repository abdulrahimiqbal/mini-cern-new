import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, FlaskConical, Clock, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { ResearchData } from "@shared/schema";

export default function ResearchResults() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [researchData, setResearchData] = useState<ResearchData[]>([]);
  const [previousCount, setPreviousCount] = useState(0);

  const { data: initialResearchData, error } = useQuery({
    queryKey: ['/api/research-data'],
    refetchInterval: 3000, // Poll every 3 seconds for faster updates
    retry: 3,
  });

  useEffect(() => {
    if (initialResearchData && Array.isArray(initialResearchData)) {
      const newData = initialResearchData.slice(0, 15); // Show latest 15
      setResearchData(newData);
      
      // Show notification for new results
      if (newData.length > previousCount && previousCount > 0) {
        const newResultsCount = newData.length - previousCount;
        toast({
          title: "New research results available!",
          description: `${newResultsCount} new analysis ${newResultsCount === 1 ? 'result' : 'results'} completed`,
        });
      }
      
      setPreviousCount(newData.length);
    }
  }, [initialResearchData, previousCount]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Research results connection issue",
        description: "Unable to fetch latest results",
        variant: "destructive",
      });
    }
  }, [error]);

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
          {error && (
            <Badge variant="outline" className="text-xs text-red-400 border-red-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              ERROR
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {researchData.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Latest: {formatTimeAgo(researchData[0]?.createdAt || new Date())}</span>
            </div>
          )}
        </div>
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
            researchData.map((item, index) => {
              const isExpanded = expandedCards.has(item.id);
              const isNew = index < 3; // Mark first 3 as new
              const timeSinceCreation = new Date().getTime() - new Date(item.createdAt || new Date()).getTime();
              const isVeryNew = timeSinceCreation < 30000; // Less than 30 seconds old
              
              return (
                <Card 
                  key={item.id} 
                  className={`bg-[var(--dark-slate)] border-gray-700 hover:border-[var(--electric-purple)]/30 transition-all duration-300 ${
                    isVeryNew ? 'ring-2 ring-[var(--science-green)]/30 shadow-lg shadow-[var(--science-green)]/10' : ''
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-8 h-8 bg-[var(--science-green)]/20 rounded-lg flex items-center justify-center ${
                          isVeryNew ? 'animate-pulse' : ''
                        }`}>
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
                            {isVeryNew && (
                              <Badge variant="outline" className="text-xs text-[var(--science-green)] border-[var(--science-green)] animate-pulse">
                                <Sparkles className="w-3 h-3 mr-1" />
                                FRESH
                              </Badge>
                            )}
                            {isNew && !isVeryNew && (
                              <Badge variant="outline" className="text-xs text-[var(--warning-amber)] border-[var(--warning-amber)]">
                                NEW
                              </Badge>
                            )}
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