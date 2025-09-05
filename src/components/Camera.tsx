import React from 'react';
import { Camera as CameraIcon, CameraOff, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCamera } from '@/hooks/useCamera';

interface CameraProps {
  onCapture?: (imageData: string) => void;
  className?: string;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, className = '' }) => {
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

  const handleCapture = () => {
    const imageData = captureFrame();
    if (imageData && onCapture) {
      onCapture(imageData);
    }
  };

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
                <p className="text-xs text-foreground">
                  Position your hand clearly in view
                </p>
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
          <Button
            onClick={handleCapture}
            disabled={!onCapture}
            className="flex-1"
          >
            <CameraIcon className="h-4 w-4 mr-2" />
            Capture Gesture
          </Button>
          
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