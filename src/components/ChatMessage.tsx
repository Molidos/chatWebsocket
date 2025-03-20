import React from 'react';

interface ChatMessageProps {
  message: { message: string, user: string };
  isOwnMessage?: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage = false,
  timestamp = new Date().toLocaleTimeString()
}) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[70%] rounded-lg px-4 py-2
          ${isOwnMessage
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }
        `}
      >
        <div>
          <p className="text-sm">{message.message}</p>
        </div>
        <span className={`text-xs mt-1 block ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage; 