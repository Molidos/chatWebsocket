import React, { useState } from 'react';

interface ConnectionScreenProps {
  onConnect: (url: string) => void;
}

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({ onConnect }) => {
  const [wsUrl, setWsUrl] = useState('wss://');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wsUrl.startsWith('wss://') && !wsUrl.startsWith('ws://')) {
      setError('O endereço deve começar com "wss://" ou "ws://"');
      return;
    }

    setError('');
    onConnect(wsUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Conectar ao Chat
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="wsUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Endereço do WebSocket
            </label>
            <input
              id="wsUrl"
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="wss://seu-servidor.com"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
          >
            Conectar ao Chat
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p className="text-center">
            Digite o endereço do servidor WebSocket para iniciar o chat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionScreen; 