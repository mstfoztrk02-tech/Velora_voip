import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AutoDialer() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    script_id: "",
    trunk: "SIP/trunk",
    context: "velora-platinum-dialer",
    concurrency: 1,
    numbers: "",
  });

  useEffect(() => {
    fetchCampaigns();
    fetchScripts();
  }, []);

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

  const fetchScripts = async () => {
    try {
      const response = await fetch("/platinum/campaigns/scripts");
      const data = await response.json();

      if (Array.isArray(data)) {
        setScripts(data);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const parseNumbers = (text) => {
    return text
      .split(/[\n,;]/)
      .map(n => n.trim())
      .filter(n => n && /^\d+$/.test(n));
  };

  const handleCreate = async () => {
    const numbers = parseNumbers(formData.numbers);

    if (!formData.name || !formData.script_id || numbers.length === 0) {
      setError({ message: "Please fill all required fields" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/platinum/campaigns/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          script_id: formData.script_id,
          trunk: formData.trunk,
          context: formData.context,
          concurrency: parseInt(formData.concurrency),
          numbers: numbers,
        }),
      });

      const data = await response.json();

      if (data.id) {
        setShowWizard(false);
        setWizardStep(1);
        setFormData({
          name: "",
          script_id: "",
          trunk: "SIP/trunk",
          context: "velora-platinum-dialer",
          concurrency: 1,
          numbers: "",
        });
        fetchCampaigns();
      } else {
        setError({ message: "Failed to create campaign" });
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/platinum/campaigns/${campaignId}/${action}`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.ok) {
        fetchCampaigns();
      } else {
        setError({ message: data.message || `Failed to ${action} campaign` });
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "#757575",
      scheduled: "#ff9800",
      running: "#4caf50",
      paused: "#ff9800",
      completed: "#2196f3",
      stopped: "#f44336",
    };
    return colors[status] || "#757575";
  };

  const calculateProgress = (stats) => {
    if (!stats || stats.total === 0) return 0;
    const completed = stats.answered + stats.busy + stats.noanswer + stats.failed + stats.completed;
    return Math.round((completed / stats.total) * 100);
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
          Auto Dialer Campaigns
        </h2>
        <button
          onClick={() => setShowWizard(true)}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: "600",
            color: "#fff",
            backgroundColor: "#2196f3",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          + New Campaign
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, marginBottom: 24, backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: 6 }}>
          <div style={{ fontSize: 14, color: "#c62828" }}>{error.message}</div>
        </div>
      )}

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8 }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>No campaigns yet</div>
          <div style={{ fontSize: 14 }}>Create your first auto-dialer campaign</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              style={{
                padding: 20,
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
                    {campaign.name}
                  </div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    Script: {scripts.find(s => s.id === campaign.script_id)?.name || "Unknown"}
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#fff",
                    backgroundColor: getStatusColor(campaign.status),
                    borderRadius: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {campaign.status}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 4 }}>
                  <span>Progress</span>
                  <span>{calculateProgress(campaign.stats)}%</span>
                </div>
                <div style={{ width: "100%", height: 8, backgroundColor: "#e0e0e0", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${calculateProgress(campaign.stats)}%`,
                      height: "100%",
                      backgroundColor: "#4caf50",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                <div style={{ textAlign: "center", padding: 8, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
                  <div style={{ fontSize: 20, fontWeight: "700", color: "#333" }}>
                    {campaign.stats?.total || 0}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>Total</div>
                </div>
                <div style={{ textAlign: "center", padding: 8, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
                  <div style={{ fontSize: 20, fontWeight: "700", color: "#4caf50" }}>
                    {campaign.stats?.answered || 0}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>Answered</div>
                </div>
                <div style={{ textAlign: "center", padding: 8, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
                  <div style={{ fontSize: 20, fontWeight: "700", color: "#ff9800" }}>
                    {campaign.stats?.busy || 0}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>Busy</div>
                </div>
                <div style={{ textAlign: "center", padding: 8, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
                  <div style={{ fontSize: 20, fontWeight: "700", color: "#f44336" }}>
                    {campaign.stats?.failed || 0}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>Failed</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {campaign.status === "draft" && (
                  <button
                    onClick={() => handleCampaignAction(campaign.id, "start")}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#fff",
                      backgroundColor: "#4caf50",
                      border: "none",
                      borderRadius: 6,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    Start
                  </button>
                )}
                {campaign.status === "running" && (
                  <>
                    <button
                      onClick={() => handleCampaignAction(campaign.id, "pause")}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "8px 16px",
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#fff",
                        backgroundColor: "#ff9800",
                        border: "none",
                        borderRadius: 6,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => handleCampaignAction(campaign.id, "stop")}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "8px 16px",
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#fff",
                        backgroundColor: "#f44336",
                        border: "none",
                        borderRadius: 6,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      Stop
                    </button>
                  </>
                )}
                {campaign.status === "paused" && (
                  <>
                    <button
                      onClick={() => handleCampaignAction(campaign.id, "start")}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "8px 16px",
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#fff",
                        backgroundColor: "#4caf50",
                        border: "none",
                        borderRadius: 6,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => handleCampaignAction(campaign.id, "stop")}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "8px 16px",
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#fff",
                        backgroundColor: "#f44336",
                        border: "none",
                        borderRadius: 6,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      Stop
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate(`/crm/platinum/cdr-analytics?campaign=${campaign.id}`)}
                  style={{
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#2196f3",
                    backgroundColor: "#fff",
                    border: "1px solid #2196f3",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  View Calls
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Wizard Modal */}
      {showWizard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowWizard(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 32,
              borderRadius: 8,
              maxWidth: 600,
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>
              Create Campaign - Step {wizardStep} of 3
            </h3>

            {wizardStep === 1 && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Promotion"
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
                    Script
                  </label>
                  <select
                    value={formData.script_id}
                    onChange={(e) => setFormData({ ...formData, script_id: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: 14,
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Select a script...</option>
                    {scripts.map(script => (
                      <option key={script.id} value={script.id}>
                        {script.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                    Concurrency (Max simultaneous calls)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.concurrency}
                    onChange={(e) => setFormData({ ...formData, concurrency: e.target.value })}
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
              </>
            )}

            {wizardStep === 2 && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                    Phone Numbers (one per line)
                  </label>
                  <textarea
                    value={formData.numbers}
                    onChange={(e) => setFormData({ ...formData, numbers: e.target.value })}
                    placeholder="905551234567&#10;905559876543&#10;905551112233"
                    rows={10}
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
                    Detected: {parseNumbers(formData.numbers).length} numbers
                  </div>
                </div>
              </>
            )}

            {wizardStep === 3 && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>
                    Trunk
                  </label>
                  <input
                    type="text"
                    value={formData.trunk}
                    onChange={(e) => setFormData({ ...formData, trunk: e.target.value })}
                    placeholder="SIP/trunk"
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
                    Context
                  </label>
                  <input
                    type="text"
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    placeholder="velora-platinum-dialer"
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

                <div style={{ padding: 12, backgroundColor: "#e3f2fd", border: "1px solid #2196f3", borderRadius: 6, fontSize: 13 }}>
                  <strong>Review:</strong>
                  <div>Campaign: {formData.name}</div>
                  <div>Numbers: {parseNumbers(formData.numbers).length}</div>
                  <div>Concurrency: {formData.concurrency}</div>
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {wizardStep > 1 && (
                <button
                  onClick={() => setWizardStep(wizardStep - 1)}
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#555",
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              )}
              {wizardStep < 3 ? (
                <button
                  onClick={() => setWizardStep(wizardStep + 1)}
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#fff",
                    backgroundColor: "#2196f3",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreate}
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
                  {loading ? "Creating..." : "Create Campaign"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
