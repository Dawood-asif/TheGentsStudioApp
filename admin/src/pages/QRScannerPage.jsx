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
  const [lastCustomer, setLastCustomer] = useState(null);
  const [lastReward, setLastReward] = useState('');

  useEffect(() => () => stopScanner(), []);

  const addStampFromValue = async value => {
    if (!value || !value.trim()) {
      setStatus('Enter or scan a customer code first.');
      return;
    }

    const payload = parseQr(value.trim());

    setStatus('Adding stamp...');
    setLastCustomer(null);
    setLastReward('');

    try {
      const body = {
        ...(payload.customerId ? { customerId: payload.customerId } : {}),
        ...(payload.customerCode ? { customerCode: payload.customerCode } : {}),
        note: 'Admin QR scanner stamp',
      };

      const result = await api.addStamp(body);
      const customer = result.data.customer;

      setLastCustomer(customer);
      setLastReward(result.data.rewardMessage || result.data.streakMilestone?.label || '');
      setStatus(`Stamp added for ${customer.full_name}.`);
      setManualCode('');
      stopScanner();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const startScanner = async () => {
    if (!('BarcodeDetector' in window)) {
      setStatus('This browser does not support BarcodeDetector. Use manual customer code input or Chrome/Android browser.');
      return;
    }

    try {
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
    } catch (error) {
      setStatus(`Camera error: ${error.message}`);
    }
  };

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setScanning(false);
  };

  return (
    <div className="grid">
      <section className="card qr-hero">
        <div>
          <h2>Staff QR Scanner</h2>
          <p className="muted">Scan customer QR or enter TGSS customer code manually to add one loyalty stamp.</p>
        </div>
        <span className="badge">1 stamp per customer per day</span>
      </section>

      <section className="card qr-layout">
        <div>
          <div className="scanner-box">
            <video ref={videoRef} muted playsInline className="scanner-video" />
            {!scanning && <div className="scanner-placeholder">Camera preview will appear here</div>}
          </div>

          <div className="toolbar">
            {!scanning && <button className="btn" onClick={startScanner}>Start Scanner</button>}
            {scanning && <button className="btn secondary" onClick={stopScanner}>Stop Scanner</button>}
          </div>
        </div>

        <div className="qr-manual-panel">
          <h3>Manual Stamp Entry</h3>
          <p className="muted">Use this if camera scan is unavailable. Enter customer code like TGSS-20260618-ABCD.</p>

          <input
            value={manualCode}
            onChange={event => setManualCode(event.target.value)}
            placeholder="TGSS customer code"
          />

          <button className="btn" onClick={() => addStampFromValue(manualCode)}>Add Stamp</button>

          <p className="muted">{status}</p>

          {lastCustomer && (
            <div className="scan-result-card">
              {lastCustomer.profile_image_url ? (
                <img className="customer-photo" src={lastCustomer.profile_image_url} alt={lastCustomer.full_name} />
              ) : (
                <span className="customer-photo placeholder">{(lastCustomer.full_name || '?').slice(0, 1)}</span>
              )}

              <div>
                <strong>{lastCustomer.full_name}</strong>
                <span>{lastCustomer.customer_code}</span>
                <span>{lastCustomer.phone}</span>
                <span>{lastCustomer.stamps} stamps | {lastCustomer.points} points</span>
                {lastReward && <em>{lastReward}</em>}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
