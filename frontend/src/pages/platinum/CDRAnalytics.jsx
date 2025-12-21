import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CDRAnalytics() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaign");

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || "");
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCallLogs();
    }
  }, [selectedCampaign, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/platinum/campaigns/");
      const data = await response.json();

      if (Array.isArray(data)) {
        setCampaigns(data);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const fetchCallLogs = async () => {
    if (!selectedCampaign) return;

    setLoading(true);
    setError(null);

    try {
      const url = `/platinum/campaigns/${selectedCampaign}/calls${statusFilter ? `?status=${statusFilter}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        setCallLogs(data);
      } else {
        setError({ message: "Failed to fetch call logs" });
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      total: callLogs.length,
      answered: 0,
      busy: 0,
      noanswer: 0,
      failed: 0,
      totalDuration: 0,
      avgDuration: 0,
    };

    callLogs.forEach(log => {
      if (log.status === "answered") stats.answered++;
      if (log.status === "busy") stats.busy++;
      if (log.status === "noanswer") stats.noanswer++;
      if (log.status === "failed") stats.failed++;
      if (log.duration) stats.totalDuration += log.duration;
    });

    if (stats.answered > 0) {
      stats.avgDuration = Math.round(stats.totalDuration / stats.answered);
    }

    return stats;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#757575",
      dialing: "#ff9800",
      answered: "#4caf50",
      busy: "#ff9800",
      noanswer: "#9e9e9e",
      failed: "#f44336",
      completed: "#2196f3",
    };
    return colors[status] || "#757575";
  };

  const stats = calculateStats();
  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);

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

      <h2 style={{ marginBottom: 32, fontSize: 24, fontWeight: "700" }}>
        CDR Analytics
      </h2>

      {/* Campaign Selector */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: "500" }}>
          Select Campaign
        </label>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 400,
            padding: "8px 12px",
            fontSize: 14,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <option value="">-- Select a campaign --</option>
          {campaigns.map(campaign => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name} ({campaign.status})
            </option>
          ))}
        </select>
      </div>

      {selectedCampaign && (
        <>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div style={{ padding: 20, backgroundColor: "#fff", border: "2px solid #e0e0e0", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: "700", color: "#333", marginBottom: 4 }}>
                {stats.total}
              </div>
              <div style={{ fontSize: 13, color: "#666", fontWeight: "500" }}>Total Calls</div>
            </div>

            <div style={{ padding: 20, backgroundColor: "#e8f5e9", border: "2px solid #4caf50", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: "700", color: "#4caf50", marginBottom: 4 }}>
                {stats.answered}
              </div>
              <div style={{ fontSize: 13, color: "#2e7d32", fontWeight: "500" }}>Answered</div>
              {stats.total > 0 && (
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {Math.round((stats.answered / stats.total) * 100)}%
                </div>
              )}
            </div>

            <div style={{ padding: 20, backgroundColor: "#fff3e0", border: "2px solid #ff9800", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: "700", color: "#ff9800", marginBottom: 4 }}>
                {stats.busy}
              </div>
              <div style={{ fontSize: 13, color: "#e65100", fontWeight: "500" }}>Busy</div>
              {stats.total > 0 && (
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {Math.round((stats.busy / stats.total) * 100)}%
                </div>
              )}
            </div>

            <div style={{ padding: 20, backgroundColor: "#f5f5f5", border: "2px solid #9e9e9e", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: "700", color: "#9e9e9e", marginBottom: 4 }}>
                {stats.noanswer}
              </div>
              <div style={{ fontSize: 13, color: "#666", fontWeight: "500" }}>No Answer</div>
              {stats.total > 0 && (
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {Math.round((stats.noanswer / stats.total) * 100)}%
                </div>
              )}
            </div>

            <div style={{ padding: 20, backgroundColor: "#ffebee", border: "2px solid #f44336", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: "700", color: "#f44336", marginBottom: 4 }}>
                {stats.failed}
              </div>
              <div style={{ fontSize: 13, color: "#c62828", fontWeight: "500" }}>Failed</div>
              {stats.total > 0 && (
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {Math.round((stats.failed / stats.total) * 100)}%
                </div>
              )}
            </div>

            <div style={{ padding: 20, backgroundColor: "#e3f2fd", border: "2px solid #2196f3", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: "700", color: "#2196f3", marginBottom: 4 }}>
                {formatDuration(stats.avgDuration)}
              </div>
              <div style={{ fontSize: 13, color: "#1565c0", fontWeight: "500" }}>Avg Duration</div>
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ fontSize: 14, fontWeight: "500" }}>Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "6px 12px",
                fontSize: 14,
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="dialing">Dialing</option>
              <option value="answered">Answered</option>
              <option value="busy">Busy</option>
              <option value="noanswer">No Answer</option>
              <option value="failed">Failed</option>
              <option value="completed">Completed</option>
            </select>

            <button
              onClick={fetchCallLogs}
              disabled={loading}
              style={{
                padding: "6px 16px",
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

          {/* Call Logs Table */}
          {loading && callLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#999", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>Loading...</div>
            </div>
          ) : callLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#999", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>No call logs</div>
              <div style={{ fontSize: 14 }}>Call logs will appear here after calls are made</div>
            </div>
          ) : (
            <div style={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                      Number
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                      Started
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                      Duration
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                      DTMF
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: "600", color: "#555" }}>
                      Hangup Cause
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.map((log, index) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: "1px solid #e0e0e0",
                        backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace" }}>
                        {log.number}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: "600",
                            color: "#fff",
                            backgroundColor: getStatusColor(log.status),
                            borderRadius: 4,
                            textTransform: "uppercase",
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>
                        {log.started_at ? new Date(log.started_at).toLocaleString() : "-"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace" }}>
                        {log.duration ? formatDuration(log.duration) : "-"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace" }}>
                        {log.dtmf || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>
                        {log.hangup_cause || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!selectedCampaign && (
        <div style={{ textAlign: "center", padding: 60, color: "#999", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Select a campaign</div>
          <div style={{ fontSize: 14 }}>Choose a campaign above to view call analytics</div>
        </div>
      )}
    </div>
  );
}
