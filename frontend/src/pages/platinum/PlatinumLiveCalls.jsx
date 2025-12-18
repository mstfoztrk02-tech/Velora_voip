import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function PlatinumLiveCalls() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchLiveCalls();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLiveCalls, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchLiveCalls = async () => {
    if (!autoRefresh) {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/issabel/live-calls");
      const data = await response.json();

      if (data.ok) {
        setCalls(data.channels || []);
        setError(null);
      } else {
        if (data.code === "PLAN_REQUIRED") {
          navigate("/pricing?upgrade=platinum");
        } else {
          setError({ message: data.message || "Failed to fetch live calls" });
        }
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleHangup = async (channel) => {
    if (!window.confirm(`Hangup call on ${channel}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/issabel/hangup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });

      const data = await response.json();

      if (data.ok) {
        fetchLiveCalls();
      } else {
        setError({ message: data.message || "Failed to hangup" });
      }
    } catch (err) {
      setError({ message: "Network error" });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getStateColor = (state) => {
    const colors = {
      Up: "#4caf50",
      Ringing: "#ff9800",
      Down: "#f44336",
      Busy: "#ff9800",
    };
    return colors[state] || "#757575";
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
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
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: "700" }}>
            Live Calls
          </h2>
          <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            {calls.length} active call{calls.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span style={{ fontSize: 14 }}>Auto-refresh (3s)</span>
          </label>

          <button
            onClick={fetchLiveCalls}
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
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, marginBottom: 24, backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: 6 }}>
          <div style={{ fontSize: 14, color: "#c62828" }}>{error.message}</div>
        </div>
      )}

      {loading && calls.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Loading...</div>
        </div>
      ) : calls.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>No active calls</div>
          <div style={{ fontSize: 14 }}>Calls will appear here when in progress</div>
        </div>
      ) : (
        <div style={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                  Channel
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                  State
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                  Caller ID
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                  Context
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                  Duration
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                  Application
                </th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, fontWeight: "600", color: "#555" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace" }}>
                    {call.channel}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: "600",
                        color: "#fff",
                        backgroundColor: getStateColor(call.state),
                        borderRadius: 4,
                      }}
                    >
                      {call.state}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>
                    {call.callerIdNum || "Unknown"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace" }}>
                    {call.context}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace" }}>
                    {formatDuration(call.duration)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>
                    {call.application || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <button
                      onClick={() => handleHangup(call.channel)}
                      style={{
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#fff",
                        backgroundColor: "#f44336",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Hangup
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
