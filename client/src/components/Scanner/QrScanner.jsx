import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const QrScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const scannerId = 'qr-reader';

  useEffect(() => {
    // Prevent double-init in strict mode
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA,
          Html5QrcodeScanType.SCAN_TYPE_FILE
        ],
        rememberLastUsedCamera: true
      },
      false
    );

    scanner.render(
      (decodedText) => {
        if (onScanSuccess) {
          onScanSuccess(decodedText);
          // Clear and re-render to allow scanning again
          scanner.clear().then(() => {
            scanner.render(
              (text) => onScanSuccess(text),
              (err) => onScanError && onScanError(err)
            );
          }).catch(console.error);
        }
      },
      (errorMessage) => {
        // Suppress continuous "not found" errors
        if (onScanError && !errorMessage?.includes('No MultiFormat Readers')) {
          onScanError(errorMessage);
        }
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="scanner-viewport">
      <div id={scannerId} />
    </div>
  );
};

export default QrScanner;
