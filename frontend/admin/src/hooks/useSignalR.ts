import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5226';

export function useOrderSignalR(
  restaurantId?: number,
  orderId?: number,
  onOrderCreated?: (order: any) => void,
  onOrderStatusUpdated?: (order: any) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let connection: signalR.HubConnection | null = null;

    const startConnection = async () => {
      try {
        // Create connection
        connection = new signalR.HubConnectionBuilder()
          .withUrl(`${HUB_URL}/hubs/orders`)
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: () => 5000, // Retry every 5 seconds
          })
          .configureLogging(signalR.LogLevel.Warning)
          .build();

        connectionRef.current = connection;

        // Setup event listeners before connecting
        if (onOrderCreated) {
          connection.on('OrderCreated', onOrderCreated);
        }

        if (onOrderStatusUpdated) {
          connection.on('OrderStatusUpdated', onOrderStatusUpdated);
        }

        // Handle reconnection
        connection.onreconnected(async () => {
          if (!mountedRef.current || !connection) return;
          console.log('SignalR Reconnected');
          setIsConnected(true);

          try {
            // Rejoin groups after reconnection
            if (restaurantId) {
              await connection.invoke('JoinRestaurantGroup', restaurantId);
            }
            if (orderId) {
              await connection.invoke('JoinOrderGroup', orderId);
            }
          } catch (error) {
            console.error('Error rejoining groups:', error);
          }
        });

        connection.onreconnecting(() => {
          if (!mountedRef.current) return;
          console.log('SignalR Reconnecting...');
          setIsConnected(false);
        });

        connection.onclose(() => {
          if (!mountedRef.current) return;
          console.log('SignalR Disconnected');
          setIsConnected(false);
        });

        // Start the connection
        await connection.start();

        if (!mountedRef.current) {
          // Component unmounted during connection, stop it
          await connection.stop();
          return;
        }

        console.log('SignalR Connected');
        setIsConnected(true);

        // Join groups after successful connection
        try {
          if (restaurantId) {
            await connection.invoke('JoinRestaurantGroup', restaurantId);
            console.log(`Joined restaurant group: ${restaurantId}`);
          }

          if (orderId) {
            await connection.invoke('JoinOrderGroup', orderId);
            console.log(`Joined order group: ${orderId}`);
          }
        } catch (error) {
          console.error('Error joining groups:', error);
        }
      } catch (error) {
        if (!mountedRef.current) return;
        console.error('SignalR Connection Error:', error);
        setIsConnected(false);

        // Retry connection after 5 seconds
        setTimeout(() => {
          if (mountedRef.current && (!connection || connection.state === signalR.HubConnectionState.Disconnected)) {
            startConnection();
          }
        }, 5000);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      mountedRef.current = false;

      if (connection) {
        const currentState = connection.state;

        if (currentState === signalR.HubConnectionState.Connected ||
            currentState === signalR.HubConnectionState.Connecting) {
          connection.stop()
            .then(() => console.log('SignalR connection stopped'))
            .catch((err) => console.error('Error stopping connection:', err));
        }
      }

      connectionRef.current = null;
    };
  }, [restaurantId, orderId]);

  return { isConnected, connection: connectionRef.current };
}
