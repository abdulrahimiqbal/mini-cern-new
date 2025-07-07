import { useState } from "react";
import { Atom } from "lucide-react";
import SimpleQueryInput from "@/components/simple-query-input";
import SwarmActivityStream from "@/components/swarm-activity-stream";
import SimpleResults from "@/components/simple-results";

export default function Dashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuerySubmit = async (query: string) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit query');
      }
      
      // Query submitted successfully, activity stream will show updates
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--deep-space)] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Simple Header */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--electric-purple)] to-[var(--science-green)] rounded-lg flex items-center justify-center">
            <Atom className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--clean-white)]">
              Main Swarm
            </h1>
            <p className="text-gray-400">
              Ask questions, watch the swarm work, get results
            </p>
          </div>
        </div>

        {/* Query Input */}
        <SimpleQueryInput 
          onSubmit={handleQuerySubmit}
          isSubmitting={isSubmitting}
        />

        {/* Activity Stream */}
        <SwarmActivityStream />

        {/* Results */}
        <SimpleResults />
      </div>
    </div>
  );
}
