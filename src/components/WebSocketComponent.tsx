"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ChatMessage from "./ChatMessage";

interface WebSocketComponentProps {
  wsUrl: string;
  onDisconnect: () => void;
}

interface Message {
  text: string;
  isOwnMessage: boolean;
  timestamp: string;
}

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 3000; // 3 segundos

const WebSocketComponent: React.FC<WebSocketComponentProps> = ({ wsUrl, onDisconnect }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const connectWebSocket = useCallback(() => {
    // Limpa qualquer conexão existente
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    clearReconnectTimeout();

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("🔗 Conectado ao WebSocket");
        setIsConnected(true);
        setConnectionError("");
        setReconnectAttempts(0);
        setWs(socket);
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
        if (wsRef.current === socket) {
          setIsConnected(false);
          setConnectionError("Erro na conexão com o servidor");
        }
      };

      socket.onclose = (event) => {
        console.log("🔴 WebSocket desconectado", event.code, event.reason);
        
        if (wsRef.current !== socket) {
          return; // Ignora eventos de conexões antigas
        }

        setIsConnected(false);
        setWs(null);
        
        // Tenta reconectar apenas se não foi um fechamento limpo
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && event.code !== 1000) {
          setConnectionError(`Tentando reconectar... (Tentativa ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, RECONNECT_INTERVAL);
        } else {
          setConnectionError("Não foi possível estabelecer conexão com o servidor");
          onDisconnect();
        }
      };

      return socket;
    } catch (error) {
      console.error("Erro ao criar WebSocket:", error);
      setConnectionError("Erro ao criar conexão com o servidor");
      return null;
    }
  }, [wsUrl, reconnectAttempts, onDisconnect]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      clearReconnectTimeout();
      if (wsRef.current) {
        wsRef.current.close(1000, "Desconexão normal");
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDisconnect = () => {
    clearReconnectTimeout();
    setReconnectAttempts(MAX_RECONNECT_ATTEMPTS); // Impede novas tentativas de reconexão
    if (wsRef.current) {
      wsRef.current.close(1000, "Desconexão manual");
      wsRef.current = null;
    }
    onDisconnect();
  };

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
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">WebSocket Chat</h2>
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Desconectar
            </button>
          </div>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>

        {/* Connection Error Message */}
        {connectionError && (
          <div className="bg-red-50 p-3 text-center">
            <p className="text-sm text-red-600">{connectionError}</p>
          </div>
        )}

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
