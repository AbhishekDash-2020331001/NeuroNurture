/**
 * Camera utility functions for managing camera streams across the application
 */

/**
 * Stops all active camera streams in the application
 * This function can be called when navigating away from game pages
 * to ensure the camera is properly turned off
 */
export const stopAllCameraStreams = (): void => {
  try {
    // Stop any video elements that might have streams
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
        video.srcObject = null;
      }
    });

    // Also try to enumerate and stop any active media streams
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          console.log('Camera cleanup completed');
        })
        .catch(() => {
          // Ignore errors
        });
    }
  } catch (error) {
    console.error('Error stopping camera streams:', error);
  }
};

/**
 * Checks if any camera streams are currently active
 */
export const hasActiveCameraStreams = (): boolean => {
  const videoElements = document.querySelectorAll('video');
  return Array.from(videoElements).some(video => 
    video.srcObject && (video.srcObject as MediaStream).getTracks().length > 0
  );
};

/**
 * Stops a specific video element's camera stream
 */
export const stopVideoStream = (videoElement: HTMLVideoElement): void => {
  if (videoElement && videoElement.srcObject) {
    const stream = videoElement.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }
}; 