
import { useState, useEffect } from "react";

/**
 * A hook to detect if the app is running in a Capacitor (mobile) environment
 */
export function useCapacitorDetection(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in a Capacitor environment (mobile)
    const checkCapacitor = () => {
      return typeof (window as any).Capacitor !== 'undefined';
    };
    setIsMobile(checkCapacitor());
  }, []);

  return isMobile;
}
