import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, FileText, TrendingUp, Database, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation";
import type { ResearchData } from "@shared/schema";

const getDataTypeIcon = (dataType: string) => {
  switch (dataType) {
    case 'hypothesis':
      return <FlaskConical className="w-4 h-4" />;
    case 'analysis':
      return <TrendingUp className="w-4 h-4" />;
    case 'paper':
      return <FileText className="w-4 h-4" />;
    case 'result':
      return <Database className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getDataTypeColor = (dataType: string) => {
  switch (dataType) {
    case 'hypothesis':
      return 'bg-[var(--electric-purple)]';
    case 'analysis':
      return 'bg-[var(--science-green)]';
    case 'paper':
      return 'bg-[var(--warning-amber)]';
    case 'result':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export default function ResearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [researchData, setResearchData] = useState<ResearchData[]>([]);
  const [filteredData, setFilteredData] = useState<ResearchData[]>([]);

  const { data: initialResearchData, isLoading } = useQuery({
    queryKey: ['/api/research-data'],
    refetchInterval: false,
  });

  useEffect(() => {
    if (initialResearchData) {
      setResearchData(initialResearchData);
      setFilteredData(initialResearchData);
    }
  }, [initialResearchData]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = researchData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dataType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(researchData);
    }
  }, [searchTerm, researchData]);

  // Mock research data for demonstration
  const mockResearchData: ResearchData[] = [
    {
      id: 1,
      agentId: 1,
      title: "Quantum Entanglement Analysis in High-Energy Physics",
      content: "Comprehensive analysis of quantum entanglement phenomena observed in particle accelerator experiments. Key findings include novel correlation patterns that suggest non-local quantum effects at unprecedented energy scales.",
      dataType: "analysis",
      metadata: { keywords: ["quantum", "entanglement", "particle physics"], confidence: 0.95 },
      createdAt: new Date('2025-01-06T14:30:00'),
    },
    {
      id: 2,
      agentId: 2,
      title: "Tesla Coil Resonance Frequency Optimization",
      content: "Investigation into optimal resonance frequencies for Tesla coil configurations. Results show 15% efficiency improvement using novel frequency modulation techniques.",
      dataType: "result",
      metadata: { keywords: ["tesla", "resonance", "electromagnetic"], confidence: 0.89 },
      createdAt: new Date('2025-01-06T13:15:00'),
    },
    {
      id: 3,
      agentId: 3,
      title: "Hypothesis: Dark Matter Interaction Mechanisms",
      content: "Proposed mechanism for dark matter interactions based on modified gravity theories. Suggests experimental verification through gravitational wave detection patterns.",
      dataType: "hypothesis",
      metadata: { keywords: ["dark matter", "gravity", "cosmology"], confidence: 0.72 },
      createdAt: new Date('2025-01-06T12:00:00'),
    },
    {
      id: 4,
      agentId: 4,
      title: "Recent Papers on Superconductivity Research",
      content: "Curated collection of 47 recent publications on room-temperature superconductivity breakthroughs. Includes comprehensive analysis of methodologies and reproducibility studies.",
      dataType: "paper",
      metadata: { keywords: ["superconductivity", "materials", "literature"], papers_count: 47 },
      createdAt: new Date('2025-01-06T11:30:00'),
    },
    {
      id: 5,
      agentId: 1,
      title: "Higgs Field Fluctuation Measurements",
      content: "Experimental results from latest LHC runs showing anomalous Higgs field fluctuations. Data suggests potential fifth fundamental force interactions.",
      dataType: "result",
      metadata: { keywords: ["higgs", "LHC", "particle physics"], significance: "high" },
      createdAt: new Date('2025-01-06T10:45:00'),
    }
  ];

  const displayData = filteredData.length > 0 ? filteredData : mockResearchData;

  const dataTypeCounts = displayData.reduce((acc, item) => {
    acc[item.dataType] = (acc[item.dataType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--deep-space)] flex items-center justify-center">
        <div className="text-[var(--clean-white)]">Loading research data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--deep-space)] text-[var(--clean-white)] flex">
      {/* Sidebar */}
      <Navigation className="w-64 bg-[var(--dark-slate)] border-r border-gray-700 flex flex-col" />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--clean-white)]">Research Data</h1>
            <p className="text-gray-400 mt-2">Knowledge base and research outputs from agent swarm</p>
          </div>
          <Button className="bg-[var(--science-green)] text-[var(--deep-space)] hover:bg-[var(--science-green)]/90">
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[var(--dark-slate)] border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[var(--clean-white)]">Search & Filter</CardTitle>
              <div className="flex items-center space-x-4">
                {Object.entries(dataTypeCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${getDataTypeColor(type)} rounded-full`}></div>
                    <span className="text-sm text-gray-400 capitalize">{type}: {count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search research data by title, content, or type..."
                className="pl-10 bg-[var(--deep-space)] border-gray-600 text-[var(--clean-white)] placeholder-gray-400 focus:border-[var(--electric-purple)]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Research Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayData.map((item) => (
            <Card key={item.id} className="bg-[var(--dark-slate)] border-gray-700 hover:border-[var(--electric-purple)] hover:border-opacity-50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getDataTypeColor(item.dataType)} rounded-lg flex items-center justify-center`}>
                      {getDataTypeIcon(item.dataType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[var(--clean-white)] leading-tight">
                        {item.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.dataType.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          Agent {item.agentId}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32 mb-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {item.content}
                  </p>
                </ScrollArea>
                
                {item.metadata && (
                  <>
                    <Separator className="my-4 bg-gray-700" />
                    <div className="space-y-2">
                      <span className="text-xs text-gray-400 font-medium">Metadata:</span>
                      <div className="flex flex-wrap gap-2">
                        {typeof item.metadata === 'object' && item.metadata !== null && (
                          Object.entries(item.metadata as Record<string, any>).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-gray-400">{key}:</span>
                              <span className="text-[var(--clean-white)] ml-1">
                                {Array.isArray(value) ? value.join(', ') : value.toString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {displayData.length === 0 && (
          <Card className="bg-[var(--dark-slate)] border-gray-700">
            <CardContent className="p-12 text-center">
              <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--clean-white)] mb-2">No Research Data Found</h3>
              <p className="text-gray-400">
                {searchTerm ? 'No results match your search criteria.' : 'The agent swarm hasn\'t generated any research data yet.'}
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}