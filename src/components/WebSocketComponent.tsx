"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { FiSend, FiLogOut, FiUser } from 'react-icons/fi';
import { BiMessageDetail } from 'react-icons/bi';
import { BsCircleFill } from 'react-icons/bs';
import ChatMessage from "./ChatMessage";

interface WebSocketComponentProps {
  wsUrl: string;
  username: string;
  onDisconnect: () => void;
}

interface Message {
  value: {user:string, message:string};
  isOwnMessage: boolean;
  timestamp: string;
}

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 3000; // 3 segundos

const WebSocketComponent: React.FC<WebSocketComponentProps> = ({ wsUrl, username, onDisconnect }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);


  console.log(messages)

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
        try {
          const data = JSON.parse(event.data);
          const newMessage: Message = {
            value: data,
            isOwnMessage: false,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages((prev) => [...prev, newMessage]);
        } catch (error) {
          console.error("Erro ao processar mensagem recebida:", error);
        }
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
      const messageData = {
        user: username,
        message: input
      };

      const newMessage: Message = {
        value: messageData,
        isOwnMessage: true,
        timestamp: new Date().toLocaleTimeString()
      };

      // Converte o objeto para string antes de enviar
      ws.send(JSON.stringify(messageData));
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[80vh] flex flex-col">
      <div className="bg-white rounded-xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] h-full flex flex-col">
        {/* Header */}
        <div className="rounded-t-xl bg-white  border-b border-gray-100">
          {/* Barra superior com título e status */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BiMessageDetail className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800">WebSocket Chat</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} shadow-sm`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>

          {/* Barra inferior com informações do usuário */}
          <div className="px-6 py-2.5 flex items-center justify-between bg-gradient-to-b from-white to-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gray-100 rounded-full">
                <FiUser className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm text-gray-600">
                Conectado como <span className="font-medium text-gray-900">{username}</span>
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full text-sm font-medium transition-all duration-200"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Connection Error Message */}
        {connectionError && (
          <div className="bg-red-50/50 px-4 py-3 border-l-2 border-red-500">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-1 bg-red-100 rounded-full">
                <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-red-600">{connectionError}</p>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-50/50 to-white"
        >
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.value}
              currentUser={username}
              isOwnMessage={msg.isOwnMessage}
              timestamp={msg.timestamp}
            />
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white rounded-b-xl">
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                placeholder="Digite sua mensagem..."
                disabled={!isConnected}
              />
            </div>
            <button
              type="submit"
              disabled={!isConnected || !input.trim()}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-200
                ${isConnected && input.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <FiSend className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WebSocketComponent;
