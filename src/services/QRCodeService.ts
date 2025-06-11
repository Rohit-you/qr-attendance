
import { QRData } from "@/types";

export const generateQRCode = (qrData: QRData): string => {
  // Create a JSON string with the QR data
  const qrPayload = {
    id: qrData.id,
    subject: qrData.subject,
    subjectId: qrData.subjectId,
    date: qrData.date,
    time: qrData.time,
    facultyId: qrData.facultyId,
    expiresAt: qrData.expiresAt
  };
  
  return JSON.stringify(qrPayload);
};

export const parseQRCode = (qrString: string): QRData | null => {
  try {
    const parsed = JSON.parse(qrString);
    
    // Validate that all required fields are present
    if (!parsed.id || !parsed.subject || !parsed.subjectId || !parsed.date || 
        !parsed.time || !parsed.facultyId || !parsed.expiresAt) {
      throw new Error("Invalid QR code format");
    }
    
    // Check if QR code has expired
    const expirationTime = new Date(parsed.expiresAt);
    if (expirationTime < new Date()) {
      throw new Error("QR code has expired");
    }
    
    return parsed as QRData;
  } catch (error) {
    console.error("Error parsing QR code:", error);
    return null;
  }
};
