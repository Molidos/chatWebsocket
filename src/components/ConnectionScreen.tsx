import React, { useState } from 'react';
import { FiUser, FiLink } from 'react-icons/fi';
import { BiMessageDetail } from 'react-icons/bi';

interface ConnectionScreenProps {
  onConnect: (url: string, username: string) => void;
}

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({ onConnect }) => {
  const [wsUrl, setWsUrl] = useState('wss://');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wsUrl.startsWith('wss://') && !wsUrl.startsWith('ws://')) {
      setError('O endereço deve começar com "wss://" ou "ws://"');
      return;
    }

    if (!username.trim()) {
      setError('Por favor, digite seu nome de usuário');
      return;
    }

    setError('');
    onConnect(wsUrl, username.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BiMessageDetail className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bem-vindo ao Chat
          </h1>
          <p className="text-gray-600 mt-2">
            Conecte-se para começar a conversar
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Seu Nome
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite seu nome..."
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label htmlFor="wsUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço do WebSocket
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLink className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="wsUrl"
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="wss://seu-servidor.com"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium hover:shadow-lg"
          >
            Conectar ao Chat
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-500">
            Digite seu nome e o endereço do servidor WebSocket para iniciar o chat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionScreen; 