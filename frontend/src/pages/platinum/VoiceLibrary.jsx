import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VoiceLibrary() {
  const navigate = useNavigate();
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [defaultVoice, setDefaultVoice] = useState(null);
  const [previewAudio, setPreviewAudio] = useState({});
  const [playingVoice, setPlayingVoice] = useState(null);

  useEffect(() => {
    fetchVoices();
    loadDefaultVoice();
  }, []);

  const loadDefaultVoice = () => {
    const saved = localStorage.getItem("velora_default_voice");
    if (saved) {
      setDefaultVoice(saved);
    }
  };

  const fetchVoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/elevenlabs/voices");
      const data = await response.json();

      if (data.ok) {
        setVoices(data.data.voices || []);
      } else {
        if (data.code === "PLAN_REQUIRED") {
          navigate("/pricing?upgrade=platinum");
        } else {
          setError({ message: data.message || "Failed to load voices" });
        }
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (voiceId) => {
    localStorage.setItem("velora_default_voice", voiceId);
    setDefaultVoice(voiceId);
  };

  const handlePreview = async (voiceId, voiceName) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceId);

    try {
      const response = await fetch("/api/elevenlabs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Hello, this is ${voiceName}. I'm here to help you with your voice calls.`,
          voiceId: voiceId,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setPreviewAudio(prev => ({ ...prev, [voiceId]: data.audioUrl }));
      } else {
        setError({ message: data.message || "Failed to generate preview" });
        setPlayingVoice(null);
      }
    } catch (err) {
      setError({ message: "Network error" });
      setPlayingVoice(null);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 24,
          padding: "8px 16px",
          fontSize: 14,
          fontWeight: "500",
          color: "#555",
          backgroundColor: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: "700" }}>
          Voice Library
        </h2>
        <button
          onClick={fetchVoices}
          disabled={loading}
          style={{
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: "500",
            color: "#2196f3",
            backgroundColor: "#fff",
            border: "1px solid #2196f3",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, marginBottom: 24, backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: 6 }}>
          <div style={{ fontSize: 14, color: "#c62828" }}>{error.message}</div>
        </div>
      )}

      {loading && voices.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Loading voices...</div>
        </div>
      ) : voices.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>No voices available</div>
          <div style={{ fontSize: 14 }}>Check your ElevenLabs API configuration</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {voices.map(voice => (
            <div
              key={voice.voice_id}
              style={{
                padding: 20,
                backgroundColor: "#fff",
                border: defaultVoice === voice.voice_id ? "2px solid #4caf50" : "1px solid #e0e0e0",
                borderRadius: 8,
                position: "relative",
              }}
            >
              {defaultVoice === voice.voice_id && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: "600",
                    color: "#fff",
                    backgroundColor: "#4caf50",
                    borderRadius: 4,
                  }}
                >
                  DEFAULT
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                  {voice.name}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {voice.labels?.accent || "Unknown accent"} • {voice.labels?.age || "Unknown age"} • {voice.labels?.gender || "Unknown"}
                </div>
              </div>

              {voice.labels?.description && (
                <div style={{ fontSize: 13, color: "#777", marginBottom: 12 }}>
                  {voice.labels.description}
                </div>
              )}

              {voice.labels?.use_case && (
                <div style={{ fontSize: 12, color: "#999", marginBottom: 12 }}>
                  Use case: {voice.labels.use_case}
                </div>
              )}

              {previewAudio[voice.voice_id] && (
                <div style={{ marginBottom: 12 }}>
                  <audio
                    controls
                    src={previewAudio[voice.voice_id]}
                    style={{ width: "100%", height: 32 }}
                    onEnded={() => setPlayingVoice(null)}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handlePreview(voice.voice_id, voice.name)}
                  disabled={playingVoice && playingVoice !== voice.voice_id}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: "500",
                    color: playingVoice === voice.voice_id ? "#fff" : "#2196f3",
                    backgroundColor: playingVoice === voice.voice_id ? "#2196f3" : "#fff",
                    border: "1px solid #2196f3",
                    borderRadius: 6,
                    cursor: playingVoice && playingVoice !== voice.voice_id ? "not-allowed" : "pointer",
                  }}
                >
                  {playingVoice === voice.voice_id ? "Generating..." : "Preview"}
                </button>
                <button
                  onClick={() => handleSetDefault(voice.voice_id)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#fff",
                    backgroundColor: defaultVoice === voice.voice_id ? "#9e9e9e" : "#4caf50",
                    border: "none",
                    borderRadius: 6,
                    cursor: defaultVoice === voice.voice_id ? "default" : "pointer",
                  }}
                  disabled={defaultVoice === voice.voice_id}
                >
                  {defaultVoice === voice.voice_id ? "Default" : "Set Default"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
