"use client";

import { useState } from "react";
import WebSocketComponent from "@/components/WebSocketComponent";
import ConnectionScreen from "@/components/ConnectionScreen";

export default function Home() {
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  const handleConnect = (url: string) => {
    setWsUrl(url);
  };

  const handleDisconnect = () => {
    setWsUrl(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {wsUrl ? (
        <WebSocketComponent wsUrl={wsUrl} onDisconnect={handleDisconnect} />
      ) : (
        <ConnectionScreen onConnect={handleConnect} />
      )}
    </div>
  );
}
