import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function VariableTag({ variable, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 8px",
        backgroundColor: "#e3f2fd",
        border: "1px solid #2196f3",
        borderRadius: 4,
        fontSize: 12,
        fontFamily: "monospace",
        color: "#1976d2",
        margin: "2px 4px",
      }}
    >
      {variable}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "#1976d2",
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </span>
  );
}

export default function ScriptStudio() {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [scriptsLoading, setScriptsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    text: "",
    language: "en-US",
    voiceId: "",
    variables: [],
  });
  const [newVariable, setNewVariable] = useState("");

  useEffect(() => {
    fetchVoices();
    fetchScripts();
  }, []);

  const fetchVoices = async () => {
    setVoicesLoading(true);
    try {
      const response = await fetch("/api/elevenlabs/voices");
      const data = await response.json();

      if (data.ok) {
        setVoices(data.data.voices || []);
      } else {
        if (data.code === "PLAN_REQUIRED") {
          navigate("/pricing?upgrade=platinum");
        }
      }
    } catch (err) {
      // Silent fail for voices
    } finally {
      setVoicesLoading(false);
    }
  };

  const fetchScripts = async () => {
    setScriptsLoading(true);
    try {
      const response = await fetch("/platinum/campaigns/scripts");
      const data = await response.json();

      if (Array.isArray(data)) {
        setScripts(data);
      }
    } catch (err) {
      // Silent fail
    } finally {
      setScriptsLoading(false);
    }
  };

  const extractVariables = (text) => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [...text.matchAll(regex)];
    return [...new Set(matches.map(m => m[1]))];
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setFormData({ ...formData, text });

    const detected = extractVariables(text);
    setFormData(prev => ({ ...prev, text, variables: detected }));
  };

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      const placeholder = `{{${newVariable}}}`;
      setFormData(prev => ({
        ...prev,
        text: prev.text + (prev.text ? " " : "") + placeholder,
        variables: [...prev.variables, newVariable],
      }));
      setNewVariable("");
    }
  };

  const removeVariable = (variable) => {
    const regex = new RegExp(`\\{\\{${variable}\\}\\}`, "g");
    setFormData(prev => ({
      ...prev,
      text: prev.text.replace(regex, "").trim(),
      variables: prev.variables.filter(v => v !== variable),
    }));
  };

  const handlePreview = async () => {
    if (!formData.text.trim()) {
      setError({ message: "Please enter script text" });
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewAudio(null);

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
        setPreviewAudio(data.audioUrl);
      } else {
        if (data.code === "PLAN_REQUIRED") {
          navigate("/pricing?upgrade=platinum");
        } else {
          setError({ message: data.message || "Failed to generate preview" });
        }
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.text.trim()) {
      setError({ message: "Name and text are required" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/platinum/campaigns/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          text: formData.text,
          language: formData.language,
          variables: formData.variables,
          voice_id: formData.voiceId || null,
        }),
      });

      const data = await response.json();

      if (data.id) {
        setFormData({ name: "", text: "", language: "en-US", voiceId: "", variables: [] });
        fetchScripts();
      } else {
        setError({ message: "Failed to save script" });
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
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

      <h2 style={{ marginBottom: 32, fontSize: 24, fontWeight: "700" }}>
        Script Studio
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Editor Section */}
        <div>
          <div style={{ marginBottom: 24, padding: 24, backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Create Script</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                Script Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Message"
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                Script Text
              </label>
              <textarea
                value={formData.text}
                onChange={handleTextChange}
                placeholder="Hello {{name}}, welcome to {{company}}..."
                rows={8}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontFamily: "monospace",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Use {`{{variable}}`} syntax for dynamic content
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
                disabled={voicesLoading}
              >
                <option value="">Default Voice</option>
                {voices.map(voice => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} ({voice.labels?.accent || "Unknown"})
                  </option>
                ))}
              </select>
            </div>

            {/* Variables Helper */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                Variables Helper
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="e.g., name, company"
                  onKeyPress={(e) => e.key === "Enter" && addVariable()}
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    fontSize: 14,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                  }}
                />
                <button
                  onClick={addVariable}
                  style={{
                    padding: "6px 16px",
                    fontSize: 14,
                    color: "#fff",
                    backgroundColor: "#2196f3",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>

              {formData.variables.length > 0 && (
                <div style={{ padding: 8, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
                  {formData.variables.map(variable => (
                    <VariableTag
                      key={variable}
                      variable={`{{${variable}}}`}
                      onRemove={() => removeVariable(variable)}
                    />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div style={{ padding: 12, marginBottom: 16, backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: 6 }}>
                <div style={{ fontSize: 14, color: "#c62828" }}>{error.message}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handlePreview}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: "600",
                  color: loading ? "#999" : "#2196f3",
                  backgroundColor: "#fff",
                  border: "2px solid #2196f3",
                  borderRadius: 6,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Generating..." : "Preview TTS"}
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#fff",
                  backgroundColor: loading ? "#9e9e9e" : "#4caf50",
                  border: "none",
                  borderRadius: 6,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Save Script
              </button>
            </div>

            {previewAudio && (
              <div style={{ marginTop: 16, padding: 12, backgroundColor: "#e8f5e9", borderRadius: 6 }}>
                <div style={{ fontSize: 14, fontWeight: "500", marginBottom: 8, color: "#2e7d32" }}>
                  Preview
                </div>
                <audio controls src={previewAudio} style={{ width: "100%" }} />
              </div>
            )}
          </div>
        </div>

        {/* Versions List Section */}
        <div>
          <div style={{ padding: 24, backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Saved Scripts</h3>

            {scriptsLoading ? (
              <div style={{ textAlign: "center", color: "#999", padding: 20 }}>Loading...</div>
            ) : scripts.length === 0 ? (
              <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
                No scripts yet. Create your first script!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {scripts.map(script => (
                  <div
                    key={script.id}
                    style={{
                      padding: 12,
                      border: "1px solid #e0e0e0",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setFormData({
                        name: script.name,
                        text: script.text,
                        language: script.language,
                        voiceId: script.voice_id || "",
                        variables: script.variables || [],
                      });
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
                      {script.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                      {script.text.substring(0, 60)}...
                    </div>
                    <div style={{ fontSize: 11, color: "#999" }}>
                      {script.variables?.length || 0} variables
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
