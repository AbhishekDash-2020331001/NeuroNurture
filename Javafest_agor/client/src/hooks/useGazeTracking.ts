import { useState, useEffect, useCallback, useRef } from 'react';

interface GazeData {
    x: number;
    y: number;
    confidence: string;
}

interface GazeStatus {
    isConnected: boolean;
    screenResolution: { width: number; height: number };
    trackingStatus: string;
}

export const useGazeTracking = (pollingInterval: number = 200) => {
    const [gazeData, setGazeData] = useState<GazeData | null>(null);
    const [gazeStatus, setGazeStatus] = useState<GazeStatus>({
        isConnected: false,
        screenResolution: { width: 1920, height: 1080 },
        trackingStatus: 'disconnected'
    });
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Check connection status
    const checkConnection = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/gazeStatus');
            const data = await response.json();
            if (data.status === 'success') {
                setGazeStatus({
                    isConnected: true,
                    screenResolution: data.data.screen_resolution,
                    trackingStatus: data.data.tracking_status
                });
                setError(null);
            } else {
                setGazeStatus(prev => ({ ...prev, isConnected: false }));
                setError('Eye tracker not responding');
            }
        } catch (error) {
            setGazeStatus(prev => ({ ...prev, isConnected: false }));
            setError('Cannot connect to eye tracker');
        }
    }, []);

    // Start polling for gaze data
    const startPolling = useCallback(() => {
        if (!gazeStatus.isConnected) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(async () => {
            try {
                const response = await fetch('http://localhost:8000/getGaze');
                const data = await response.json();
                
                if (data.status === 'success' && data.data) {
                    setGazeData(data.data);
                    setError(null);
                } else if (data.status === 'error') {
                    setError(data.message);
                }
            } catch (error) {
                setError('Failed to get gaze data');
                console.error(error);
            }
        }, pollingInterval);
    }, [gazeStatus.isConnected, pollingInterval]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Initialize connection check
    useEffect(() => {
        checkConnection();
        
        // Check connection every 5 seconds
        const connectionInterval = setInterval(checkConnection, 5000);
        
        return () => {
            if (connectionInterval) clearInterval(connectionInterval);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [checkConnection]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        gazeData,
        gazeStatus,
        error,
        startPolling,
        stopPolling,
        checkConnection
    };
};
