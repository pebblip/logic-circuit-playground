import { useEffect, useRef } from 'react';

interface UseViewModelSubscriptionProps {
  viewModel: any; // UltraModernCircuitViewModel
  onGatesChanged: (gates: any[]) => void;
  onConnectionsChanged: (connections: any[]) => void;
  onSimulationResultsChanged: (results: Map<string, boolean>) => void;
  onSaveCircuit?: (circuit: any) => void;
  onNotification?: (message: string, type: string) => void;
}

export function useViewModelSubscription({
  viewModel,
  onGatesChanged,
  onConnectionsChanged,
  onSimulationResultsChanged,
  onSaveCircuit,
  onNotification
}: UseViewModelSubscriptionProps): void {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const subscriptions = [
      viewModel.on('gatesChanged', (gates: any[]) => {
        if (mountedRef.current) {
          onGatesChanged(gates);
        }
      }),
      viewModel.on('connectionsChanged', (connections: any[]) => {
        if (mountedRef.current) {
          onConnectionsChanged(connections);
        }
      }),
      viewModel.on('simulationResultsChanged', (results: Map<string, boolean>) => {
        if (mountedRef.current) {
          onSimulationResultsChanged(results);
        }
      })
    ];

    if (onSaveCircuit) {
      subscriptions.push(
        viewModel.on('saveCircuit', (circuit: any) => {
          if (mountedRef.current) {
            onSaveCircuit(circuit);
          }
        })
      );
    }

    if (onNotification) {
      subscriptions.push(
        viewModel.on('notification', ({ message, type }: { message: string; type: string }) => {
          if (mountedRef.current) {
            onNotification(message, type);
          }
        })
      );
    }

    return () => {
      mountedRef.current = false;
      subscriptions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [viewModel, onGatesChanged, onConnectionsChanged, onSimulationResultsChanged, onSaveCircuit, onNotification]);
}