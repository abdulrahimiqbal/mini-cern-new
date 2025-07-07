export interface WebSocketMessage {
  type: string;
  data?: any;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private lastDataTimestamp = 0;

  constructor() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.url = `${protocol}//${window.location.host}/ws`;
    this.lastDataTimestamp = Date.now() - 60000; // Start from 1 minute ago
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.stopPolling(); // Stop polling if WebSocket connects
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => listener(message.data));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.log('WebSocket connection failed. Falling back to polling...');
      this.startPolling();
    }
  }

  private startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('Starting polling mode');
    
    this.pollingInterval = setInterval(async () => {
      try {
        // Poll for multiple data types
        await Promise.all([
          this.pollSystemMetrics(),
          this.pollActivityLog(),
          this.pollChatMessages(),
          this.pollAgents()
        ]);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  }

  private async pollSystemMetrics() {
    try {
      const response = await fetch('/api/system-metrics');
      if (response.ok) {
        const metrics = await response.json();
        if (metrics && metrics.timestamp) {
          const timestamp = new Date(metrics.timestamp).getTime();
          if (timestamp > this.lastDataTimestamp) {
            this.handleMessage({ type: 'system_metrics_updated', data: metrics });
          }
        }
      }
    } catch (error) {
      // Silently handle errors for individual polls
    }
  }

  private async pollActivityLog() {
    try {
      const response = await fetch('/api/activity-log?limit=5');
      if (response.ok) {
        const logs = await response.json();
        if (logs && logs.length > 0) {
          // Check if we have new activity
          const latestLog = logs[0];
          if (latestLog && latestLog.timestamp) {
            const timestamp = new Date(latestLog.timestamp).getTime();
            if (timestamp > this.lastDataTimestamp) {
              this.handleMessage({ type: 'activity_logged', data: latestLog });
            }
          }
        }
      }
    } catch (error) {
      // Silently handle errors for individual polls
    }
  }

  private async pollChatMessages() {
    try {
      const response = await fetch('/api/chat-messages?limit=5');
      if (response.ok) {
        const messages = await response.json();
        if (messages && messages.length > 0) {
          // Check if we have new messages
          const latestMessage = messages[messages.length - 1];
          if (latestMessage && latestMessage.timestamp) {
            const timestamp = new Date(latestMessage.timestamp).getTime();
            if (timestamp > this.lastDataTimestamp) {
              this.handleMessage({ type: 'chat_message', data: latestMessage });
            }
          }
        }
      }
    } catch (error) {
      // Silently handle errors for individual polls
    }
  }

  private async pollAgents() {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const agents = await response.json();
        if (agents && agents.length > 0) {
          // For simplicity, we'll just update the timestamp
          this.lastDataTimestamp = Math.max(this.lastDataTimestamp, Date.now());
        }
      }
    } catch (error) {
      // Silently handle errors for individual polls
    }
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  subscribe(type: string, listener: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPolling();
  }
}

export const wsClient = new WebSocketClient();
