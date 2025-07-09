import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QrCode, CheckCircle, AlertCircle, Camera } from 'lucide-react';

const QRScanner = () => {
  const [scanner, setScanner] = useState(null);
  const qrReaderRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  // Start scanning automatically on mount
  useEffect(() => {
    setIsScanning(true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isScanning && qrReaderRef.current && !scanner) {
      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
          },
          false
        );
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        setScanner(html5QrcodeScanner);
      } catch (err) {
        toast.error('Camera permission denied or not available.');
      }
    }
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
    // eslint-disable-next-line
  }, [isScanning, scanner]);

  const startScanning = () => {
    setIsScanning(true);
  };

  const handleScanImageFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5Qr = new Html5Qrcode('qr-reader');
      const result = await html5Qr.scanFile(file, true);
      await onScanSuccess(result, null);
      html5Qr.clear();
    } catch (err) {
      toast.error('Failed to scan image: ' + (err?.message || err));
    } finally {
      setLoading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/scan', {
        qrCodeData: decodedText
      });

      setScanResult({
        success: true,
        data: response.data
      });
      
      toast.success('Entry verified successfully!');
      stopScanning();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'QR verification failed';
      setScanResult({
        success: false,
        message: errorMessage,
        data: error.response?.data
      });
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error) => {
    // Handle scan failure silently
    console.log('Scan failed:', error);
  };

  const resetScanner = () => {
    setScanResult(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <QrCode className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
          <p className="text-gray-600 mt-2">Scan student QR passes to verify event entry</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            {isScanning ? (
              <div>
                <div ref={qrReaderRef} id="qr-reader" style={{ width: 300, height: 300 }}></div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={stopScanning}
                    className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Stop Scanning
                  </button>
                  <button
                    onClick={triggerFileInput}
                    className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Scan Image File
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleScanImageFile}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Camera className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Camera not active.</p>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-700">Verifying QR code...</span>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Scan Result</h2>
              <button
                onClick={resetScanner}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear Result
              </button>
            </div>

            {scanResult.success ? (
              <div className="border-l-4 border-green-400 bg-green-50 p-4 mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-green-800">Entry Verified!</h3>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                    <p className="text-sm text-gray-600">Name: {scanResult.data.registration.studentId.name}</p>
                    <p className="text-sm text-gray-600">Roll Number: {scanResult.data.registration.studentId.rollNumber}</p>
                    <p className="text-sm text-gray-600">Email: {scanResult.data.registration.studentId.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Event Information</h4>
                    <p className="text-sm text-gray-600">Event: {scanResult.data.registration.eventId.title}</p>
                    <p className="text-sm text-gray-600">Venue: {scanResult.data.registration.eventId.venue}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(scanResult.data.registration.eventId.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-l-4 border-red-400 bg-red-50 p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-lg font-medium text-red-800">Verification Failed</h3>
                </div>
                <p className="text-red-700 mt-2">{scanResult.message}</p>
                
                {scanResult.data?.registration && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Registration Details</h4>
                    <p className="text-sm text-gray-600">Student: {scanResult.data.registration.studentId.name}</p>
                    <p className="text-sm text-gray-600">Event: {scanResult.data.registration.eventId.title}</p>
                    {scanResult.data.scannedAt && (
                      <p className="text-sm text-gray-600">
                        Previously scanned at: {new Date(scanResult.data.scannedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={startScanning}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Scan Another QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;