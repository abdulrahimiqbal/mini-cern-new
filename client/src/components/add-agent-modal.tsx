import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAgentModal({ isOpen, onClose }: AddAgentModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"specialist" | "generalist">("specialist");
  const [specialization, setSpecialization] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAgentMutation = useMutation({
    mutationFn: async (agentData: any) => {
      return apiRequest('POST', '/api/agents', agentData);
    },
    onSuccess: () => {
      toast({
        title: "Agent Created",
        description: "New agent has been added to the swarm.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Agent name is required.",
        variant: "destructive",
      });
      return;
    }

    if (type === "specialist" && !specialization.trim()) {
      toast({
        title: "Validation Error",
        description: "Specialization is required for specialist agents.",
        variant: "destructive",
      });
      return;
    }

    createAgentMutation.mutate({
      name: name.trim(),
      type,
      specialization: type === "specialist" ? specialization.trim() : null,
      status: "standby",
      cpuUsage: 0,
      currentTask: null,
      progress: 0,
      capabilities: type === "specialist" ? [specialization.toLowerCase().replace(/\s+/g, '_')] : ["general_analysis"],
    });
  };

  const handleClose = () => {
    setName("");
    setType("specialist");
    setSpecialization("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[var(--dark-slate)] border-gray-700 text-[var(--clean-white)]" aria-describedby="add-agent-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Add New Agent</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-[var(--clean-white)]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p id="add-agent-description" className="text-sm text-gray-400">
            Create a new agent to join your physics research swarm
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="agent-type" className="text-sm font-medium text-gray-300">
              Agent Type
            </Label>
            <Select value={type} onValueChange={(value: "specialist" | "generalist") => setType(value)}>
              <SelectTrigger className="bg-[var(--deep-space)] border-gray-600 text-[var(--clean-white)] focus:border-[var(--electric-purple)]">
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--dark-slate)] border-gray-600">
                <SelectItem value="specialist" className="text-[var(--clean-white)]">
                  Specialist Agent
                </SelectItem>
                <SelectItem value="generalist" className="text-[var(--clean-white)]">
                  Generalist Agent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "specialist" && (
            <div>
              <Label htmlFor="specialization" className="text-sm font-medium text-gray-300">
                Specialization
              </Label>
              <Input
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g., Quantum Computing, Particle Physics"
                className="bg-[var(--deep-space)] border-gray-600 text-[var(--clean-white)] placeholder-gray-400 focus:border-[var(--electric-purple)]"
              />
            </div>
          )}

          <div>
            <Label htmlFor="agent-name" className="text-sm font-medium text-gray-300">
              Agent Name
            </Label>
            <Input
              id="agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
              className="bg-[var(--deep-space)] border-gray-600 text-[var(--clean-white)] placeholder-gray-400 focus:border-[var(--electric-purple)]"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAgentMutation.isPending}
              className="flex-1 bg-[var(--electric-purple)] text-[var(--clean-white)] hover:bg-[var(--electric-purple)]/90"
            >
              {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
