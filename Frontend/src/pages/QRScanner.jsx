import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QrCode, CheckCircle, AlertCircle, Camera, Scan, RotateCw, Image, X } from 'lucide-react';
import { getProfilePicUrl, handleAvatarError } from '../utils/avatar';

const QRScanner = () => {
  const [scanner, setScanner] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [testStream, setTestStream] = useState(null);
  const testVideoRef = useRef(null);
  const qrRegionId = "qr-reader";
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalUser, setModalUser] = useState(null);

  useEffect(() => {
    async function fetchCameras() {
      try {
        // First request camera permission explicitly
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCameraId(videoDevices[0].deviceId);
        } else {
          setCameraError('No camera devices found. Please ensure your device has a camera.');
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (err.name === 'NotAllowedError') {
          setCameraError('Camera access denied. Please grant camera permission in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setCameraError('No camera found. Please ensure your device has a working camera.');
        } else if (err.name === 'NotReadableError') {
          setCameraError('Camera may be in use by another application. Please close other apps using the camera.');
        } else if (err.name === 'SecurityError') {
          setCameraError('Camera access blocked. Please use HTTPS or localhost for camera access.');
        } else {
          setCameraError(`Unable to access camera: ${err.message}`);
        }
      }
    }
    fetchCameras();
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
      if (testStream) {
        testStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

    const startScanning = async () => {
    setCameraError('');
    setScanResult(null);
    setIsScanning(true);
    try {
      // Use minimal constraints
      const constraints = { video: true };
      
      const html5QrConfig = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minSize = Math.min(viewfinderWidth, viewfinderHeight);
          const boxSize = Math.floor(minSize * 0.5);
          return {
            width: boxSize,
            height: boxSize
          };
        },
        aspectRatio: window.innerWidth / window.innerHeight
      };
      
      const html5Qr = new Html5Qrcode(qrRegionId);
      await html5Qr.start(
        { facingMode: "environment" },
        html5QrConfig,
        onScanSuccess,
        onScanFailure
      );
      setScanner(html5Qr);
      toast.success('Camera started successfully');
    } catch (err) {
      console.error('Scanner error:', err);
      let errorMessage = 'Failed to start camera. ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please grant camera permission.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'Camera not found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera may be in use by another application.';
      } else if (err.name === 'SecurityError') {
        errorMessage += 'Please use HTTPS for camera access.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Your device does not support the required camera settings. Try using a different camera.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      setCameraError(errorMessage);
      toast.error(errorMessage);
      setIsScanning(false);
    }
  };  const stopScanning = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        await scanner.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      setScanner(null);
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    setLoading(true);
    try {
      const response = await axios.post('https://college-event-pass-1.onrender.com/api/scan', {
        qrCodeData: decodedText,
      });
      setScanResult({ success: true, data: response.data });
      toast.success('Entry verified!');
      stopScanning();
      // Show user modal for 2 seconds
      const user = response.data.registration?.studentId;
      if (user) {
        setModalUser(user);
        setShowUserModal(true);
        setTimeout(() => setShowUserModal(false), 5000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'QR verification failed';
      setScanResult({ success: false, message: errorMessage, data: error.response?.data });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error) => {
    console.log('Scan failure:', error);
  };

  const handleScanImageFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const html5Qr = new Html5Qrcode(qrRegionId);
      const result = await html5Qr.scanFile(file, true);
      await onScanSuccess(result, null);
      await html5Qr.clear();
    } catch (err) {
      toast.error('Image scan failed: ' + (err.message || err));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const testCameraDirect = async () => {
    setCameraError('');
    if (testStream) {
      testStream.getTracks().forEach(track => track.stop());
      setTestStream(null);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined },
      });
      setTestStream(stream);
      if (testVideoRef.current) {
        testVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Direct camera test failed: ' + (err.message || err));
      toast.error('Direct camera test failed.');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <QrCode className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Code Scanner</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Scan student QR passes to verify entry</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          {cameraError && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded mb-4">
              <p className="font-semibold">Camera Error</p>
              <p>{cameraError}</p>
            </div>
          )}

          {cameraDevices.length > 1 && (
            <div className="mb-4">
              <label className="block mb-2 font-medium">Select Camera</label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white"
              >
                {cameraDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || 'Camera'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            id={qrRegionId}
            className="mx-auto border-2 border-blue-300 rounded-xl"
            style={{ width: '100%', maxWidth: 400, height: 300 }}
          ></div>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                <Scan className="w-5 h-5" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              >
                <X className="w-5 h-5" />
                Stop Scanning
              </button>
            )}

            <button
              onClick={triggerFileInput}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              <Image className="w-5 h-5" />
              Scan Image
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleScanImageFile}
              className="hidden"
            />
          </div>
        </div>

        {loading && (
          <div className="mt-6 flex items-center justify-center text-gray-700 dark:text-gray-300">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            Verifying QR code...
          </div>
        )}

        {scanResult && (
          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            {scanResult.success ? (
              <div className="text-green-600 dark:text-green-400">
                <CheckCircle className="w-6 h-6 inline-block mr-2" />
                <span>Entry Verified!</span>
                <div className="mt-4 text-sm text-gray-800 dark:text-gray-200">
                  <p>Name: {scanResult.data.registration.studentId.name}</p>
                  <p>Roll: {scanResult.data.registration.studentId.rollNumber}</p>
                  <p>Email: {scanResult.data.registration.studentId.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6 inline-block mr-2" />
                <span>Verification Failed</span>
                <p className="mt-2">{scanResult.message}</p>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={startScanning}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <RotateCw className="w-4 h-4" />
                Scan Another
              </button>
            </div>
          </div>
        )}

        {/* User Detail Modal after scan */}
        {showUserModal && modalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative flex flex-col items-center">
              <button onClick={() => setShowUserModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">✕</button>
              <img
                src={getProfilePicUrl(modalUser.profilePic)}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover border-4 border-blue-600 dark:border-blue-400 mb-4 shadow-lg"
                onError={handleAvatarError}
              />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{modalUser.name}</h3>
              <p className="text-gray-500 dark:text-gray-300">{modalUser.email}</p>
              {modalUser.rollNumber && (
                <p className="text-gray-500 dark:text-gray-300">Roll No: {modalUser.rollNumber}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={testCameraDirect}
            className="px-4 py-2 rounded bg-blue-200 text-blue-800 hover:bg-blue-300"
          >
            Test Camera Directly
          </button>
          {testStream && (
            <video
              ref={testVideoRef}
              autoPlay
              playsInline
              className="mt-4 rounded border-2 border-blue-400"
              style={{ width: 320, height: 240 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
