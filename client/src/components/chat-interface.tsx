import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect } from "react";
import type { ChatMessage } from "@shared/schema";

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { subscribe } = useWebSocket();
  const queryClient = useQueryClient();

  const { data: initialMessages } = useQuery({
    queryKey: ['/api/chat-messages'],
    refetchInterval: false,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const unsubscribe = subscribe('chat_message', (newMessage: ChatMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    return unsubscribe;
  }, [subscribe]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', '/api/chat-messages', {
        sender: 'user',
        content,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat-messages'] });
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setMessage("");
    
    await sendMessageMutation.mutateAsync(userMessage);
    
    // Simulate AI response
    setTimeout(async () => {
      await apiRequest('POST', '/api/chat-messages', {
        sender: 'system',
        content: `I've received your message: "${userMessage}". The agent swarm is processing your request and will coordinate the appropriate specialists to handle this task.`,
      });
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="bg-[var(--dark-slate)] border-gray-700 flex flex-col h-96">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-lg font-semibold text-[var(--clean-white)]">
          AI Research Assistant
        </CardTitle>
        <p className="text-sm text-gray-400">Chat with your agent swarm</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.sender === 'system' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--electric-purple)] to-[var(--science-green)] rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`rounded-lg p-3 inline-block max-w-[80%] ${
                      msg.sender === 'user'
                        ? 'bg-[var(--electric-purple)] text-[var(--clean-white)]'
                        : 'bg-[var(--deep-space)] text-[var(--clean-white)]'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--electric-purple)] to-[var(--science-green)] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your research team..."
              className="flex-1 bg-[var(--deep-space)] border-gray-600 text-[var(--clean-white)] placeholder-gray-400 focus:border-[var(--electric-purple)]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-[var(--electric-purple)] text-[var(--clean-white)] hover:bg-[var(--electric-purple)]/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
