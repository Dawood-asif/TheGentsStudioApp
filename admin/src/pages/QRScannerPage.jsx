import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

function parseQr(value) {
  try {
    const parsed = JSON.parse(value);
    if (parsed.type === 'GENTS_CUSTOMER') return parsed;
  } catch (_) {
    // Plain customer code fallback
  }
  return { customerCode: value };
}

export default function QRScannerPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Click Start Scanner and allow camera permission.');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => () => stopScanner(), []);

  const addStampFromValue = async value => {
    const payload = parseQr(value);
    setStatus('Adding stamp...');
    try {
      const body = {
        ...(payload.customerId ? { customerId: payload.customerId } : {}),
        ...(payload.customerCode ? { customerCode: payload.customerCode } : {}),
        note: 'Admin QR scanner stamp',
      };
      const result = await api.addStamp(body);
      setStatus(`Stamp added for ${result.data.customer.full_name}. Stamps: ${result.data.customer.stamps}`);
      stopScanner();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const startScanner = async () => {
    if (!('BarcodeDetector' in window)) {
      setStatus('This browser does not support BarcodeDetector. Use manual code input or a modern Chrome/Android browser.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    setScanning(true);
    setStatus('Scanning QR code...');

    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    const tick = async () => {
      if (!streamRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length) {
          const value = codes[0].rawValue;
          await addStampFromValue(value);
          return;
        }
      } catch (error) {
        setStatus(error.message);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setScanning(false);
  };

  return (
    <section className="card">
      <h2>Real QR Scanner</h2>
      <p className="muted">Scan a customer's real QR code to add one loyalty stamp. Anti-cheat still blocks more than one visit stamp per day.</p>
      <div className="scanner-box">
        <video ref={videoRef} muted playsInline className="scanner-video" />
      </div>
      <div className="toolbar">
        {!scanning && <button className="btn" onClick={startScanner}>Start Scanner</button>}
        {scanning && <button className="btn secondary" onClick={stopScanner}>Stop Scanner</button>}
      </div>
      <div className="toolbar">
        <input value={manualCode} onChange={event => setManualCode(event.target.value)} placeholder="Manual customer code fallback" />
        <button className="btn secondary" onClick={() => addStampFromValue(manualCode)}>Add Stamp Manually</button>
      </div>
      <p className="muted">{status}</p>
    </section>
  );
}
