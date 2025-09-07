import React, { useEffect, useRef, useCallback } from 'react';
import { Camera as CameraIcon, CameraOff, RotateCcw, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCamera } from '@/hooks/useCamera';

interface CameraProps {
  onCapture?: (imageData: string) => void;
  className?: string;
  autoCapture?: boolean;
  captureInterval?: number; // in milliseconds
}

export const Camera: React.FC<CameraProps> = ({ 
  onCapture, 
  className = '', 
  autoCapture = false, 
  captureInterval = 3000 
}) => {
  const {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera,
    devices
  } = useCamera();

  const autoCaptureRef = useRef<NodeJS.Timeout | null>(null);

  const handleCapture = useCallback(() => {
    console.log('Camera handleCapture called');
    const imageData = captureFrame();
    if (imageData && onCapture) {
      console.log('Calling onCapture with image data');
      onCapture(imageData);
    } else {
      console.log('No image data or onCapture callback');
    }
  }, [captureFrame, onCapture]);

  // Auto-capture effect
  useEffect(() => {
    console.log('Auto-capture effect:', { autoCapture, isActive, hasOnCapture: !!onCapture });
    if (autoCapture && isActive && onCapture) {
      console.log('Setting up auto-capture interval');
      autoCaptureRef.current = setInterval(() => {
        console.log('Auto-capture triggered');
        handleCapture();
      }, captureInterval);

      return () => {
        if (autoCaptureRef.current) {
          clearInterval(autoCaptureRef.current);
        }
      };
    } else {
      if (autoCaptureRef.current) {
        clearInterval(autoCaptureRef.current);
        autoCaptureRef.current = null;
      }
    }
  }, [autoCapture, isActive, onCapture, captureInterval, handleCapture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCaptureRef.current) {
        clearInterval(autoCaptureRef.current);
      }
    };
  }, []);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Video container */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {isActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Starting camera...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive font-medium mb-2">Camera Error</p>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              <Button onClick={startCamera} size="sm">
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        {/* Inactive state */}
        {!isActive && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <CameraOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Camera is off</p>
              <Button onClick={startCamera}>
                <CameraIcon className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
          </div>
        )}
        
        {/* Gesture guidance overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-background/80 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  {autoCapture && (
                    <Zap className="h-3 w-3 text-primary animate-pulse" />
                  )}
                  <p className="text-xs text-foreground">
                    {autoCapture 
                      ? `Auto-analyzing gesture every ${captureInterval/1000}s`
                      : "Position your hand clearly in view"
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Center guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-primary/50 rounded-lg w-48 h-48 flex items-center justify-center">
                <div className="text-primary/50 text-xs">Hand position guide</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Camera controls */}
      {isActive && (
        <div className="flex gap-2 p-4 bg-background border-t">
          {!autoCapture && (
            <Button
              onClick={handleCapture}
              disabled={!onCapture}
              className="flex-1"
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Capture Gesture
            </Button>
          )}
          
          {autoCapture && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
                <span>Auto-capturing enabled</span>
              </div>
            </div>
          )}
          
          {devices.length > 1 && (
            <Button
              onClick={switchCamera}
              variant="outline"
              size="icon"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            onClick={stopCamera}
            variant="outline"
            size="icon"
          >
            <CameraOff className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};