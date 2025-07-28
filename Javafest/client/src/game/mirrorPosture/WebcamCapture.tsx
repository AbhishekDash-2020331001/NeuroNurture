import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Camera, CameraOff, Wifi, WifiOff } from 'lucide-react';
import { toast } from './hooks/use-toast';

interface WebcamCaptureProps {
  onExpressionDetected: (expression: string) => void;
  onCameraReady: (ready: boolean) => void;
  isActive: boolean;
  detectedExpression: string | null;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onExpressionDetected,
  onCameraReady,
  isActive,
  detectedExpression,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);

  // API endpoint for posture detection
  const API_ENDPOINT = 'http://localhost:8000/predict';

  
  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
        });
        if (response.ok) {
          setIsConnected(true);
          console.log('API connection successful');
        }
      } catch (error) {
        console.log('API not available, will use demo mode');
        setIsConnected(false);
      }
    };
    
    testConnection();
  }, []);

  // Initialize webcam
  const initializeWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        onCameraReady(true);
        
        toast({
          title: "Camera ready! 📷",
          description: "You can now start the game",
        });
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to play the game",
        variant: "destructive",
      });
      onCameraReady(false);
    }
  }, [onCameraReady]);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
    onCameraReady(false);
  }, [onCameraReady]);

  // Capture frame and send to API
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      setIsProcessing(true);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8);
      });

      if (!blob) return;

      // Create FormData for API request
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      // Send to API backend
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        // Check if prediction exists and confidence is high enough
        if (result.prediction && result.confidence > 0.7) {
          // Map API prediction to game expression
          const expressionMap: { [key: string]: string } = {
            'left': 'looking_left',
            'right': 'looking_right',
            'open mouth': 'mouth_open',
            'showing_teeth': 'showing_teeth',
            'kiss': 'kiss'
          };
          
          const mappedExpression = expressionMap[result.prediction];
          if (mappedExpression) {
            onExpressionDetected(mappedExpression);
            setConfidence(result.confidence);
            console.log(`Detected: ${result.prediction} (confidence: ${result.confidence})`);
          }
        }
        setIsConnected(true);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      // Mock detection for development (remove in production)
      console.log('API not available, using mock detection');
      setIsConnected(false);
      
      // Simulate random detection for testing (fallback when API is not available)
      if (Math.random() < 0.05) { // 5% chance per frame for testing
        const expressions = ['looking_left', 'looking_right', 'mouth_open', 'showing_teeth', 'kiss'];
        const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
        onExpressionDetected(randomExpression);
        console.log('Mock detection:', randomExpression);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [onExpressionDetected, isProcessing]);

  // Start/stop frame capture based on game state
  useEffect(() => {
    if (isActive && isCameraOn) {
      captureIntervalRef.current = setInterval(captureFrame, 200); // 5 FPS
    } else {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isActive, isCameraOn, captureFrame]);

  // Initialize webcam on mount
  useEffect(() => {
    initializeWebcam();
    
    return () => {
      stopWebcam();
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [initializeWebcam, stopWebcam]);

  return (
    <div className="space-y-4">
      {/* Status indicators */}
      <div className="flex justify-center gap-2">
        <Badge variant={isCameraOn ? "default" : "destructive"} className="gap-2">
          {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          {isCameraOn ? "Camera On" : "Camera Off"}
        </Badge>
        
        <Badge variant={isConnected ? "default" : "secondary"} className="gap-2">
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isConnected ? "AI Connected" : "Demo Mode"}
        </Badge>
      </div>

      {/* Video preview */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-bounce">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video-element"
        />
        
        {/* Detection overlay */}
        {detectedExpression && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce-gentle">
            🎯 {detectedExpression.replace('_', ' ')}
          </div>
        )}

        {/* Confidence indicator */}
        {confidence > 0 && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {Math.round(confidence * 100)}% sure
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            Processing...
          </div>
        )}

        {/* Camera controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={isCameraOn ? stopWebcam : initializeWebcam}
            variant={isCameraOn ? "destructive" : "default"}
            size="sm"
          >
            {isCameraOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {isCameraOn ? "Turn Off" : "Turn On"}
          </Button>
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default WebcamCapture;