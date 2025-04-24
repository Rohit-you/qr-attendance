
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "app.lovable.a8ca9e8604e143758f907b4861346eb9",
  appName: "campus-qr-attendance",
  webDir: "dist",
  server: {
    url: "https://a8ca9e86-04e1-4375-8f90-7b4861346eb9.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    // Configure plugins here if needed
  }
};

export default config;
