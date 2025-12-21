import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TTSGenerator() {
  const navigate = useNavigate();
  const [voices, setVoices] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    voiceId: "",
  });

  useEffect(() => {
    fetchVoices();
    loadAssets();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch("/api/elevenlabs/voices");
      const data = await response.json();

      if (data.ok) {
        setVoices(data.data.voices || []);

        const defaultVoice = localStorage.getItem("velora_default_voice");
        if (defaultVoice) {
          setFormData(prev => ({ ...prev, voiceId: defaultVoice }));
        }
      }
    } catch (err) {
      // Silent fail
    }
  };

  const loadAssets = () => {
    const saved = localStorage.getItem("velora_tts_assets");
    if (saved) {
      try {
        setAssets(JSON.parse(saved));
      } catch (err) {
        // Invalid JSON
      }
    }
  };

  const saveAsset = (asset) => {
    const newAssets = [asset, ...assets].slice(0, 50); // Keep last 50
    setAssets(newAssets);
    localStorage.setItem("velora_tts_assets", JSON.stringify(newAssets));
  };

  const handleGenerate = async () => {
    if (!formData.text.trim()) {
      setError({ message: "Please enter text to generate" });
      return;
    }

    if (formData.text.length > 5000) {
      setError({ message: "Text too long (max 5000 characters)" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/elevenlabs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: formData.text,
          voiceId: formData.voiceId || undefined,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        const asset = {
          audioId: data.audioId,
          audioUrl: data.audioUrl,
          text: formData.text.substring(0, 100),
          voiceId: data.voiceId,
          format: data.format,
          cached: data.cached,
          timestamp: new Date().toISOString(),
        };

        saveAsset(asset);
        setFormData({ ...formData, text: "" });
      } else {
        if (data.code === "PLAN_REQUIRED") {
          navigate("/pricing?upgrade=platinum");
        } else {
          setError({ message: data.message || "Failed to generate TTS" });
        }
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (audioId) => {
    const filtered = assets.filter(a => a.audioId !== audioId);
    setAssets(filtered);
    localStorage.setItem("velora_tts_assets", JSON.stringify(filtered));
  };

  const getVoiceName = (voiceId) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    return voice ? voice.name : "Default Voice";
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

      <h2 style={{ marginBottom: 32, fontSize: 24, fontWeight: "700" }}>
        TTS Generator
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Generator Section */}
        <div>
          <div style={{ padding: 24, backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Generate Speech</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                Text to Speech
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter text to convert to speech..."
                rows={8}
                maxLength={5000}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {formData.text.length} / 5000 characters
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                Voice
              </label>
              <select
                value={formData.voiceId}
                onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  boxSizing: "border-box",
                }}
              >
                <option value="">Default Voice</option>
                {voices.map(voice => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} ({voice.labels?.accent || "Unknown"})
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{ padding: 12, marginBottom: 16, backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: 6 }}>
                <div style={{ fontSize: 14, color: "#c62828" }}>{error.message}</div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !formData.text.trim()}
              style={{
                width: "100%",
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: "600",
                color: "#fff",
                backgroundColor: loading || !formData.text.trim() ? "#9e9e9e" : "#2196f3",
                border: "none",
                borderRadius: 6,
                cursor: loading || !formData.text.trim() ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Generating..." : "Generate Audio"}
            </button>
          </div>
        </div>

        {/* Assets List Section */}
        <div>
          <div style={{ padding: 24, backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Generated Assets</h3>

            {assets.length === 0 ? (
              <div style={{ textAlign: "center", color: "#999", padding: 40 }}>
                No assets yet. Generate your first TTS audio!
              </div>
            ) : (
              <div style={{ maxHeight: 600, overflowY: "auto" }}>
                {assets.map(asset => (
                  <div
                    key={asset.audioId}
                    style={{
                      padding: 12,
                      marginBottom: 12,
                      border: "1px solid #e0e0e0",
                      borderRadius: 6,
                      backgroundColor: asset.cached ? "#f0f8ff" : "#fff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: "500", marginBottom: 4 }}>
                          {asset.text}...
                        </div>
                        <div style={{ fontSize: 11, color: "#666" }}>
                          {getVoiceName(asset.voiceId)} • {asset.format?.toUpperCase()}
                          {asset.cached && " • Cached"}
                        </div>
                        <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
                          {new Date(asset.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(asset.audioId)}
                        style={{
                          padding: "4px 8px",
                          fontSize: 12,
                          color: "#f44336",
                          backgroundColor: "transparent",
                          border: "1px solid #f44336",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    <audio
                      controls
                      src={asset.audioUrl}
                      style={{ width: "100%", height: 32 }}
                    />

                    <div style={{ fontSize: 10, color: "#999", marginTop: 4, fontFamily: "monospace" }}>
                      ID: {asset.audioId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
