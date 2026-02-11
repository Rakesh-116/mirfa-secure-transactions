"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Home() {
  const [partyId, setPartyId] = useState("");
  const [payload, setPayload] = useState('{\n  "amount": 100,\n  "currency": "AED"\n}');
  const [recordId, setRecordId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEncrypt = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const parsedPayload = JSON.parse(payload);
      const response = await fetch(`${API_URL}/tx/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, payload: parsedPayload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Encryption failed");
      setResult(data);
      setRecordId(data.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/tx/${recordId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Fetch failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/tx/${recordId}/decrypt`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Decryption failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔐 Secure Transactions Mini-App</h1>
      <p style={styles.subtitle}>Envelope Encryption using AES-256-GCM</p>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Input</h2>
        <label style={styles.label}>Party ID</label>
        <input
          type="text"
          placeholder="party_123"
          value={partyId}
          onChange={(e) => setPartyId(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>JSON Payload</label>
        <textarea
          placeholder='{"amount": 100, "currency": "AED"}'
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={6}
          style={styles.textarea}
        />

        <button onClick={handleEncrypt} disabled={loading} style={styles.button}>
          {loading ? "Processing..." : "🔒 Encrypt & Save"}
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Fetch & Decrypt</h2>
        <label style={styles.label}>Record ID</label>
        <input
          type="text"
          placeholder="Enter record ID"
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
          style={styles.input}
        />

        <div style={styles.buttonGroup}>
          <button onClick={handleFetch} disabled={loading || !recordId} style={styles.button}>
            📥 Fetch Encrypted
          </button>
          <button onClick={handleDecrypt} disabled={loading || !recordId} style={styles.button}>
            🔓 Decrypt
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={styles.result}>
          <h3 style={styles.resultTitle}>Result</h3>
          <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    textAlign: "center",
    marginBottom: "40px",
  },
  card: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginBottom: "16px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginBottom: "16px",
    fontFamily: "monospace",
    boxSizing: "border-box",
  },
  button: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#0070f3",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "24px",
    border: "1px solid #fcc",
  },
  result: {
    backgroundColor: "#e8f5e9",
    border: "1px solid #c8e6c9",
    borderRadius: "8px",
    padding: "24px",
  },
  resultTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#2e7d32",
  },
  pre: {
    backgroundColor: "#fff",
    padding: "16px",
    borderRadius: "6px",
    overflow: "auto",
    fontSize: "13px",
    fontFamily: "monospace",
    border: "1px solid #ddd",
  },
};
