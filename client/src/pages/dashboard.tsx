import { useState, useEffect } from "react";
import { Atom } from "lucide-react";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activities, setActivities] = useState<string[]>([]);

  // Fetch activity log from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activity-log');
        if (response.ok) {
          const data = await response.json();
          const activityMessages = data.map((activity: any) => {
            const time = new Date(activity.timestamp).toLocaleTimeString();
            return `[${time}] ${activity.description}`;
          });
          setActivities(activityMessages.slice(0, 10)); // Show last 10
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const addActivity = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setActivities(prev => [`[${time}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);
    addActivity(`🔍 Submitted: "${query}"`);

    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: query }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      const result = await response.json();
      addActivity(`✅ Completed: "${query}"`);
      
      setResults(prev => [result, ...prev]);
      setQuery("");
    } catch (error) {
      addActivity(`❌ Failed: "${query}"`);
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Atom className="w-8 h-8 text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold">Physics Research Lab</h1>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a physics question..."
              className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded text-white"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!query.trim() || isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-medium"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Log */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Swarm Activity Log</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-gray-400">No activity yet</p>
              ) : (
                activities.map((activity, index) => (
                  <div key={index} className="text-sm text-gray-300 font-mono">
                    {activity}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Results</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-400">No results yet</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="border border-gray-700 rounded p-3">
                    <h3 className="font-medium mb-2">{result.content}</h3>
                    <div className="text-sm text-gray-300 max-h-32 overflow-y-auto">
                      {result.finalResponse || "Processing..."}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 