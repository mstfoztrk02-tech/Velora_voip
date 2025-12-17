import React, { useState } from "react";

function IntegrationCard({ title, children }) {
  return (
    <div
      style={{
        marginBottom: 32,
        padding: 24,
        border: "2px solid #e0e0e0",
        borderRadius: 12,
        backgroundColor: "#fff",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 20, fontWeight: "600" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatusBadge({ loading, success, error }) {
  let color = "#757575";
  let text = "Not tested";
  let icon = "⚪";

  if (loading) {
    color = "#ff9800";
    text = "Loading...";
    icon = "⏳";
  } else if (success) {
    color = "#4caf50";
    text = "Connected";
    icon = "✅";
  } else if (error) {
    color = "#f44336";
    text = "Error";
    icon = "❌";
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontSize: 16, fontWeight: "600", color }}>{text}</span>
    </div>
  );
}

function ErrorDisplay({ error }) {
  if (!error) return null;

  return (
    <div
      style={{
        padding: 12,
        marginTop: 12,
        borderRadius: 6,
        backgroundColor: "#ffebee",
        border: "1px solid #ef5350",
      }}
    >
      <div style={{ fontSize: 14, color: "#c62828", fontWeight: "500" }}>
        {error.message || "Unknown error"}
      </div>
      {error.details && (
        <div style={{ fontSize: 12, color: "#d32f2f", marginTop: 4 }}>
          {error.details}
        </div>
      )}
    </div>
  );
}

function DataDisplay({ data, label }) {
  if (!data) return null;

  return (
    <div
      style={{
        padding: 12,
        marginTop: 12,
        borderRadius: 6,
        backgroundColor: "#e8f5e9",
        border: "1px solid #81c784",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: "500", color: "#2e7d32", marginBottom: 8 }}>
        {label || "Response"}
      </div>
      <pre
        style={{
          margin: 0,
          fontSize: 11,
          fontFamily: "monospace",
          color: "#1b5e20",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function IntegrationsPage() {
  const [sippyState, setSippyState] = useState({ loading: false, data: null, error: null });
  const [issabelState, setIssabelState] = useState({ loading: false, data: null, error: null });
  const [elevenLabsVoices, setElevenLabsVoices] = useState({ loading: false, data: null, error: null });
  const [elevenLabsTTS, setElevenLabsTTS] = useState({ loading: false, data: null, error: null });
  const [ttsText, setTtsText] = useState("Hello, this is a test.");

  const testSippy = async () => {
    setSippyState({ loading: true, data: null, error: null });

    try {
      const response = await fetch("/api/sippy/health");
      const data = await response.json();

      if (data.ok) {
        setSippyState({ loading: false, data: data.details, error: null });
      } else {
        setSippyState({ loading: false, data: null, error: { message: data.message, details: data.details } });
      }
    } catch (e) {
      setSippyState({ loading: false, data: null, error: { message: "Network error", details: e.message } });
    }
  };

  const testIssabel = async () => {
    setIssabelState({ loading: true, data: null, error: null });

    try {
      const response = await fetch("/api/issabel/health");
      const data = await response.json();

      if (data.ok) {
        setIssabelState({ loading: false, data: data.details, error: null });
      } else {
        setIssabelState({ loading: false, data: null, error: { message: data.message, details: data.details } });
      }
    } catch (e) {
      setIssabelState({ loading: false, data: null, error: { message: "Network error", details: e.message } });
    }
  };

  const testElevenLabsVoices = async () => {
    setElevenLabsVoices({ loading: true, data: null, error: null });

    try {
      const response = await fetch("/api/elevenlabs/voices");
      const data = await response.json();

      if (data.ok) {
        setElevenLabsVoices({ loading: false, data: data.data, error: null });
      } else {
        setElevenLabsVoices({ loading: false, data: null, error: { message: data.message, details: data.details } });
      }
    } catch (e) {
      setElevenLabsVoices({ loading: false, data: null, error: { message: "Network error", details: e.message } });
    }
  };

  const testElevenLabsTTS = async () => {
    if (!ttsText.trim()) {
      setElevenLabsTTS({ loading: false, data: null, error: { message: "Please enter text" } });
      return;
    }

    setElevenLabsTTS({ loading: true, data: null, error: null });

    try {
      const response = await fetch("/api/elevenlabs/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText }),
      });
      const data = await response.json();

      if (data.ok) {
        setElevenLabsTTS({ loading: false, data: data.data, error: null });
      } else {
        setElevenLabsTTS({ loading: false, data: null, error: { message: data.message, details: data.details } });
      }
    } catch (e) {
      setElevenLabsTTS({ loading: false, data: null, error: { message: "Network error", details: e.message } });
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 32, fontSize: 24, fontWeight: "700" }}>
        Integration Tests
      </h2>

      <IntegrationCard title="SippySoft Health">
        <StatusBadge loading={sippyState.loading} success={!!sippyState.data} error={!!sippyState.error} />
        <button
          onClick={testSippy}
          disabled={sippyState.loading}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: "600",
            color: "#fff",
            backgroundColor: sippyState.loading ? "#9e9e9e" : "#2196f3",
            border: "none",
            borderRadius: 6,
            cursor: sippyState.loading ? "not-allowed" : "pointer",
          }}
        >
          Test Connection
        </button>
        <ErrorDisplay error={sippyState.error} />
        <DataDisplay data={sippyState.data} label="Connection Details" />
      </IntegrationCard>

      <IntegrationCard title="Issabel Health">
        <StatusBadge loading={issabelState.loading} success={!!issabelState.data} error={!!issabelState.error} />
        <button
          onClick={testIssabel}
          disabled={issabelState.loading}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: "600",
            color: "#fff",
            backgroundColor: issabelState.loading ? "#9e9e9e" : "#2196f3",
            border: "none",
            borderRadius: 6,
            cursor: issabelState.loading ? "not-allowed" : "pointer",
          }}
        >
          Test Connection
        </button>
        <ErrorDisplay error={issabelState.error} />
        <DataDisplay data={issabelState.data} label="Connection Details" />
      </IntegrationCard>

      <IntegrationCard title="ElevenLabs Voices">
        <StatusBadge loading={elevenLabsVoices.loading} success={!!elevenLabsVoices.data} error={!!elevenLabsVoices.error} />
        <button
          onClick={testElevenLabsVoices}
          disabled={elevenLabsVoices.loading}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: "600",
            color: "#fff",
            backgroundColor: elevenLabsVoices.loading ? "#9e9e9e" : "#2196f3",
            border: "none",
            borderRadius: 6,
            cursor: elevenLabsVoices.loading ? "not-allowed" : "pointer",
          }}
        >
          Fetch Voices
        </button>
        <ErrorDisplay error={elevenLabsVoices.error} />
        {elevenLabsVoices.data && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#2e7d32" }}>
            Found {elevenLabsVoices.data.voices?.length || 0} voices
          </div>
        )}
        <DataDisplay data={elevenLabsVoices.data} label="Available Voices" />
      </IntegrationCard>

      <IntegrationCard title="ElevenLabs TTS Test">
        <StatusBadge loading={elevenLabsTTS.loading} success={!!elevenLabsTTS.data} error={!!elevenLabsTTS.error} />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
            Text to synthesize:
          </label>
          <input
            type="text"
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="Enter text..."
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 14,
              border: "1px solid #ccc",
              borderRadius: 6,
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={testElevenLabsTTS}
          disabled={elevenLabsTTS.loading}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: "600",
            color: "#fff",
            backgroundColor: elevenLabsTTS.loading ? "#9e9e9e" : "#2196f3",
            border: "none",
            borderRadius: 6,
            cursor: elevenLabsTTS.loading ? "not-allowed" : "pointer",
          }}
        >
          Generate Speech
        </button>
        <ErrorDisplay error={elevenLabsTTS.error} />
        {elevenLabsTTS.data && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#2e7d32" }}>
            Audio generated successfully ({elevenLabsTTS.data.format})
            {elevenLabsTTS.data.audio && (
              <div style={{ fontSize: 11, marginTop: 4 }}>
                Base64 length: {elevenLabsTTS.data.audio.length} characters
              </div>
            )}
          </div>
        )}
      </IntegrationCard>
    </div>
  );
}
