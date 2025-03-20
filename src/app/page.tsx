"use client";

import { useState } from "react";
import WebSocketComponent from "@/components/WebSocketComponent";
import ConnectionScreen from "@/components/ConnectionScreen";

export default function Home() {
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

  const handleConnect = (url: string, username: string) => {
    setWsUrl(url);
    setUsername(username);
  };

  const handleDisconnect = () => {
    setWsUrl(null);
    setUsername("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {wsUrl ? (
        <WebSocketComponent 
          wsUrl={wsUrl} 
          username={username}
          onDisconnect={handleDisconnect} 
        />
      ) : (
        <ConnectionScreen onConnect={handleConnect} />
      )}
    </div>
  );
}
