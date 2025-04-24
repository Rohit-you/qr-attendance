
import { QRData } from "@/types";

export const generateQRCode = (qrData: QRData): string => {
  // In a real application, you would encrypt this data
  // For this demo, we're just stringifying and encoding
  const qrString = JSON.stringify(qrData);
  return btoa(qrString);
};

export const parseQRCode = (qrString: string): QRData => {
  // Decode and parse the QR data
  try {
    const decoded = atob(qrString);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to parse QR code:", error);
    throw new Error("Invalid QR code");
  }
};
