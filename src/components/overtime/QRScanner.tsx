import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef(false);

  useEffect(() => {
    const startScanner = async () => {
      if (isScanning.current) return;
      
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          () => {
            // Ignore errors while scanning
          }
        );
        
        isScanning.current = true;
      } catch (err) {
        console.error('Error starting scanner:', err);
        toast.error('Tidak dapat mengakses kamera');
      }
    };

    const stopScanner = () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          isScanning.current = false;
        }).catch((err) => {
          console.error('Error stopping scanner:', err);
        });
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  const handleClose = () => {
    if (scannerRef.current && isScanning.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        isScanning.current = false;
        onClose();
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Scan QR Code</h3>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div 
        id="qr-reader" 
        className="border-2 border-primary rounded-lg overflow-hidden"
      />
      <p className="text-sm text-muted-foreground text-center">
        Arahkan kamera ke QR code NIK Anda
      </p>
    </div>
  );
};

export default QRScanner;
