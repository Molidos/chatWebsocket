"use client";

import { useEffect, useState, useRef } from "react";
import ChatMessage from "./ChatMessage";

const WS_URL = "wss://5ce0-34-105-7-71.ngrok-free.app"; // ⚠️ Substitua pela URL do seu ngrok

interface Message {
  text: string;
  isOwnMessage: boolean;
  timestamp: string;
}

const WebSocketComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("🔗 Conectado ao WebSocket");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const newMessage: Message = {
        text: event.data,
        isOwnMessage: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.onerror = (error) => {
      console.error("❌ Erro no WebSocket:", error);
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log("🔴 WebSocket desconectado");
      setIsConnected(false);
    };

    setWs(socket);

    return () => socket.close();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws && input.trim() && isConnected) {
      const newMessage: Message = {
        text: input,
        isOwnMessage: true,
        timestamp: new Date().toLocaleTimeString()
      };
      ws.send(input);
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-[600px] flex flex-col">
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">WebSocket Chat</h2>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-white"
        >
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.text}
              isOwnMessage={msg.isOwnMessage}
              timestamp={msg.timestamp}
            />
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua mensagem..."
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !input.trim()}
              className={`
                px-6 py-2 rounded-full font-medium
                ${isConnected && input.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                transition-colors duration-200
              `}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebSocketComponent;
