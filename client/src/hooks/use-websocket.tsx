import { useEffect, useRef } from "react";
import { wsClient } from "@/lib/websocket";

export function useWebSocket() {
  const isConnected = useRef(false);

  useEffect(() => {
    if (!isConnected.current) {
      wsClient.connect();
      isConnected.current = true;
    }

    return () => {
      wsClient.disconnect();
      isConnected.current = false;
    };
  }, []);

  return {
    subscribe: wsClient.subscribe.bind(wsClient),
    send: wsClient.send.bind(wsClient),
  };
}
