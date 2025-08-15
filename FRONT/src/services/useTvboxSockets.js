import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { tvboxes } from './tvboxes';

export default function useTvboxSockets() {
  const [data, setData] = useState([]); 
  const socketsRef = useRef({});       

  useEffect(() => {
    tvboxes.forEach((box) => {
      if (socketsRef.current[box.baseUrl]) return;

      const socket = io(box.baseUrl, {
        transports: ['websocket'], 
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity,
      });

      socketsRef.current[box.baseUrl] = socket;

      socket.on('connect', () => {
      });

      socket.on('metrics', (payload) => {
        setData((prev) => {
          const others = prev.filter(p => (p.baseUrl || '') !== box.baseUrl);
          return [...others, { ...payload, baseUrl: box.baseUrl }];
        });
      });

      socket.on('disconnect', () => {
        setData((prev) => {
          const others = prev.filter(p => (p.baseUrl || '') !== box.baseUrl);
          return [...others, { boxId: box.id, name: box.name, baseUrl: box.baseUrl, error: true }];
        });
      });
    });

    return () => {
      Object.values(socketsRef.current).forEach((s) => s.close());
      socketsRef.current = {};
    };
  }, []);

  return data;
}
