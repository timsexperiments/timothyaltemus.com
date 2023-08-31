import { useNavigate } from '@tanstack/react-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { getFromLocalStorage } from '../localstorage';

type SocketContextType = {
  isConnected: boolean;
  socket: WebSocket | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const user = getFromLocalStorage<{ username: string; avatar: string }>('user');
    if (!user) {
      navigate({ to: '/' });
      return () => {};
    }

    const chat = new URL(import.meta.env.VITE_SOCKET_URL);
    chat.searchParams.set('avatar', user.avatar);
    chat.searchParams.set('username', user.username);
    const socketInstance = new WebSocket(chat);
    socketInstance.addEventListener('open', () => {
      setIsConnected(true);
      socketInstance.send('MESSAGE!');
    });

    socketInstance.addEventListener('close', () => {
      setIsConnected(false);
    });

    socketInstance.addEventListener('error', (event) => console.error(event));

    setSocket(socketInstance);

    window.addEventListener(
      'beforeunload',
      (e) => {
        e.preventDefault();
        try {
          socketInstance.close(1000);
        } catch (error) {
          console.error(error);
          socketInstance.close();
          socket?.close();
        }
        return (e.returnValue = '');
      },
      { capture: true },
    );

    return () => {
      socketInstance.close();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
};
