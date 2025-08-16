import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { tvboxes } from './tvboxes';

export default function useTvboxSockets() {
  const [byId, setById] = useState({}); 
  const socketsRef = useRef({});       

  useEffect(() => {
    tvboxes.forEach((box) => {
      if (socketsRef.current[box.baseUrl]) return;

      const socket = io(box.baseUrl, {
        transports: ['websocket'], 
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity,
        query: { role: 'admin' },
      });

      socketsRef.current[box.baseUrl] = socket;

      socket.on('connect', () => {
      });

      socket.on('metrics', (payload) => {
        setById((prev) => ({
          ...prev,
          [box.id]: { ...payload, baseUrl: box.baseUrl }, // chave pela TVBox
        }));
      });

      socket.on('disconnect', () => {
        setById((prev) => ({
          ...prev,
          [box.id]: { ...(prev[box.id] || {}), error: true },
        }));
      });
    });

    return () => {
      Object.values(socketsRef.current).forEach((s) => s.close());
      socketsRef.current = {};
    };
  }, []);

  return byId;
}
