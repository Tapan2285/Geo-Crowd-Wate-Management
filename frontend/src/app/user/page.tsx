'use client';

import { useState, useRef, useEffect } from 'react';

export default function UserDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Attach the stream to the video element whenever the stream or video element changes
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const fetchComplaints = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : 'u1';
      const res = await fetch(`http://localhost:5001/api/complaints?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    }
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      if (data && data.display_name) {
        // Just take the first 3 parts of the address for a cleaner look
        const parts = data.display_name.split(',').slice(0, 3).join(',');
        setAddress(parts);
      }
    } catch (e) {
      console.error('Geocoding failed', e);
    }
  };

  const startCamera = async () => {
    try {
      // First try to get the back camera (for mobile devices)
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } });
      } catch (e) {
        // If back camera is not available (e.g., on a MacBook), fallback to any available camera
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      setStream(mediaStream);
      // The useEffect hook will handle attaching this stream to the video element once it mounts
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or unavailable. Please ensure your browser has permission to access the camera.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
              fetchAddress(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
              setLocation({ lat: 40.7128, lng: -74.0060 });
              setAddress("100 Municipal Way, New York");
            }
          );
        } else {
          setLocation({ lat: 40.7128, lng: -74.0060 });
          setAddress("100 Municipal Way, New York");
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
              fetchAddress(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
              setLocation({ lat: 40.7128, lng: -74.0060 });
              setAddress("100 Municipal Way, New York");
            }
          );
        } else {
          setLocation({ lat: 40.7128, lng: -74.0060 });
          setAddress("100 Municipal Way, New York");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submitReport = async () => {
    setLoading(true);
    const loc = location || { lat: 40.7128, lng: -74.0060 };
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : 'u1';
    try {
      const res = await fetch('http://localhost:5001/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: capturedImage,
          location: loc,
          address: address || "Location restricted by device",
          description: description || "User reported waste",
          userId: userId
        })
      });
      if (res.ok) {
        setCapturedImage(null);
        setDescription('');
        setAddress(null);
        fetchComplaints();
        alert("Report submitted successfully! The AI has analyzed the image.");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to submit report.");
      }
    } catch (e) {
      alert("Error submitting report. Server might be unreachable.");
    }
    setLoading(false);
  };

  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const submitFeedback = async (id: string) => {
    if (!feedbackText.trim()) return;
    try {
      const res = await fetch(`http://localhost:5001/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText })
      });
      if (res.ok) {
        setFeedbackText('');
        setActiveFeedbackId(null);
        fetchComplaints();
      }
    } catch (e) {
      alert("Error submitting feedback");
    }
  };

  return (
    <div className="animate-slide-up">
      <div id="report-waste" className="card glass">
        <h3 className="card-title">Report New Waste</h3>
        
        {!stream && !capturedImage && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '2rem 0' }}>
            <button className="btn btn-primary animate-pulse-glow" onClick={startCamera}>
              <span style={{ marginRight: '0.5rem' }}>📷</span> Open Camera
            </button>
            <span style={{ color: 'var(--text-muted)' }}>or</span>
            <label className="btn btn-outline">
              📁 Upload Image
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        )}
        
        {stream && (
          <div className="camera-wrapper animate-slide-up">
            <video ref={videoRef} autoPlay playsInline className="camera-feed" />
            <div className="camera-controls">
              <button className="btn btn-danger" onClick={stopCamera}>Cancel</button>
              <button className="btn btn-primary" onClick={capturePhoto}>Capture Photo</button>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {capturedImage && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="camera-wrapper" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
              <img src={capturedImage} alt="Captured" style={{ width: '100%', display: 'block' }} />
              
              {loading && (
                <div className="ai-scan-overlay">
                  <div className="ai-scan-line"></div>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.7)', padding: '1rem 2rem', borderRadius: '30px', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold', zIndex: 10 }}>
                    🤖 AI Analyzing...
                  </div>
                </div>
              )}
            </div>

            {address && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', background: 'var(--bg-default)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'inline-block' }}>
                <span>📍</span> {address}
              </div>
            )}

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Description (Optional)</label>
              <textarea 
                className="input-field" 
                placeholder="E.g., Large pile of cardboard boxes on the sidewalk" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-solid)', color: 'var(--text-main)', fontSize: '1rem', minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div className="camera-controls" style={{ display: 'flex', gap: '1rem', position: 'static', padding: 0, background: 'none' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setCapturedImage(null)} disabled={loading}>
                Retake
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitReport} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
