import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SimpleQueryInputProps {
  onSubmit: (query: string) => void;
  isSubmitting?: boolean;
}

export default function SimpleQueryInput({ onSubmit, isSubmitting = false }: SimpleQueryInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSubmitting) {
      onSubmit(query.trim());
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask the swarm a question..."
        className="flex-1 bg-[var(--dark-slate)] border-gray-600 text-[var(--clean-white)] placeholder-gray-400"
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        disabled={!query.trim() || isSubmitting}
        className="bg-[var(--science-green)] hover:bg-[var(--science-green)]/80 text-[var(--deep-space)]"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
} 