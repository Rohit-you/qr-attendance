
import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from "react";

/**
 * A hook to detect if the app is running in a Capacitor (native mobile) environment
 */
export function useCapacitorDetection(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // This will be true only when running on a native iOS or Android device.
    setIsMobile(Capacitor.isNativePlatform());
  }, []);

  return isMobile;
}
