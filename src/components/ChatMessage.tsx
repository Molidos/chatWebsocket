import React from 'react';
import { FaUser, FaClock } from 'react-icons/fa';

interface ChatMessageProps {
  message: { message: string, user: string };
  currentUser: string,
  isOwnMessage?: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUser,
  isOwnMessage = false,
  timestamp = new Date().toLocaleTimeString()
}) => {
  const isCurrentUser = message.user === currentUser;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div
        className={`
          max-w-[70%] rounded-2xl px-4 py-3 shadow-sm
          ${isOwnMessage
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
          }
        `}
      >
        {/* Nome do usuário e timestamp para mensagens de outros */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
              <FaUser className="w-3 h-3" />
              <span>{message.user}</span>
            </div>
          </div>
        )}

        {/* Conteúdo da mensagem */}
        <div className="flex flex-col">
          <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
            {message.message}
          </p>
          
          {/* Timestamp com ícone */}
          <div 
            className={`
              flex items-center gap-1 mt-1
              text-xs opacity-70 transition-opacity
              ${isOwnMessage ? 'text-blue-100 justify-end' : 'text-gray-500'}
            `}
          >
            <FaClock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 