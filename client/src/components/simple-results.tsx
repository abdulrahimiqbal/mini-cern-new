import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompletedQuery {
  id: number;
  question: string;
  finalResponse: string;
  createdAt: Date;
}

export default function SimpleResults() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: queriesData } = useQuery({
    queryKey: ['/api/queries'],
    refetchInterval: 2000,
  });

  const results = useMemo(() => {
    const completedResults: CompletedQuery[] = [];

    // Get completed queries
    if (queriesData && Array.isArray(queriesData)) {
      queriesData
        .filter((query: any) => query.status === 'completed' && query.finalResponse)
        .forEach((query: any) => {
          completedResults.push({
            id: query.id,
            question: query.content, // Fix: use 'content' instead of 'question'
            finalResponse: query.finalResponse,
            createdAt: new Date(query.createdAt || new Date()),
          });
        });
    }

    // Sort by newest first
    completedResults.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return completedResults;
  }, [queriesData]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Card className="bg-[var(--dark-slate)] border-gray-700">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-[var(--clean-white)] mb-4">
          Completed Research Results
        </h3>
        
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-3xl mb-2">📋</div>
              <p>No completed research yet</p>
              <p className="text-sm mt-1">Submit a query to see results here</p>
            </div>
          ) : (
            results.map((result) => (
              <Card key={result.id} className="bg-[var(--deep-space)] border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-[var(--clean-white)] mb-1">
                        📋 {result.question}
                      </h4>
                      <p className="text-xs text-gray-400">
                        🕐 {formatTimeAgo(result.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                      className="text-gray-400 hover:text-[var(--clean-white)]"
                    >
                      {expandedId === result.id ? (
                        <>
                          Hide <ChevronUp className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          View Full <ChevronDown className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {expandedId === result.id && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <ScrollArea className="h-64">
                        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {result.finalResponse}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 