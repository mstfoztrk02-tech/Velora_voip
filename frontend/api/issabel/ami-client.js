// Issabel AMI Client - Asterisk Manager Interface
// Uses asterisk-manager package for AMI connection

let AmiClient;
try {
  AmiClient = require("asterisk-manager");
} catch (e) {
  // Package not installed, will handle gracefully
  AmiClient = null;
}

class IssabelAMI {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connecting = false;
  }

  /**
   * Connect to Asterisk AMI
   */
  async connect() {
    if (this.connected) return;
    if (this.connecting) {
      // Wait for ongoing connection
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.connect();
    }

    if (!AmiClient) {
      throw new Error(
        "asterisk-manager package not installed. Run: npm install asterisk-manager"
      );
    }

    const host = process.env.ISSABEL_AMI_HOST || "185.8.12.117";
    const port = parseInt(process.env.ISSABEL_AMI_PORT || "5038", 10);
    const username = process.env.ISSABEL_AMI_USERNAME || "admin";
    const secret = process.env.ISSABEL_AMI_SECRET;

    if (!secret) {
      throw new Error("ISSABEL_AMI_SECRET not configured");
    }

    this.connecting = true;

    try {
      this.client = new AmiClient(port, host, username, secret, true);

      await new Promise((resolve, reject) => {
        this.client.keepConnected();

        this.client.on("connect", () => {
          this.connected = true;
          this.connecting = false;
          resolve();
        });

        this.client.on("error", (err) => {
          this.connected = false;
          this.connecting = false;
          reject(err);
        });

        // Timeout after 10s
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error("AMI connection timeout"));
          }
        }, 10000);
      });
    } catch (error) {
      this.connecting = false;
      throw error;
    }
  }

  /**
   * Disconnect from AMI
   */
  disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.connected = false;
    }
  }

  /**
   * Originate a call
   * @param {object} params - Call parameters
   * @returns {Promise<object>} Call result
   */
  async originate({
    channel,
    exten,
    context,
    priority = 1,
    callerid,
    timeout = 30000,
    variables = {},
  }) {
    await this.connect();

    return new Promise((resolve, reject) => {
      const action = {
        Action: "Originate",
        Channel: channel,
        Exten: exten,
        Context: context,
        Priority: priority,
        Timeout: timeout,
        CallerID: callerid || process.env.ISSABEL_CALLERID || "AutoDialer",
        Async: "true", // Non-blocking
      };

      // Add custom variables
      if (Object.keys(variables).length > 0) {
        let varIndex = 1;
        for (const [key, value] of Object.entries(variables)) {
          action[`Variable${varIndex}`] = `${key}=${value}`;
          varIndex++;
        }
      }

      this.client.action(action, (err, res) => {
        if (err) {
          return reject(err);
        }

        if (res.response === "Success") {
          resolve({
            ok: true,
            actionid: res.actionid,
            message: res.message,
          });
        } else {
          reject(
            new Error(res.message || "Originate failed")
          );
        }
      });
    });
  }

  /**
   * Get active channels (live calls)
   */
  async getActiveChannels() {
    await this.connect();

    return new Promise((resolve, reject) => {
      const channels = [];

      this.client.action(
        {
          Action: "CoreShowChannels",
        },
        (err, res) => {
          if (err) return reject(err);
          resolve(channels);
        }
      );

      this.client.on("coreshowchannel", (channel) => {
        channels.push(channel);
      });
    });
  }

  /**
   * Hangup a channel
   */
  async hangup(channel) {
    await this.connect();

    return new Promise((resolve, reject) => {
      this.client.action(
        {
          Action: "Hangup",
          Channel: channel,
        },
        (err, res) => {
          if (err) return reject(err);

          if (res.response === "Success") {
            resolve({ ok: true, message: res.message });
          } else {
            reject(new Error(res.message || "Hangup failed"));
          }
        }
      );
    });
  }
}

// Singleton instance
const amiInstance = new IssabelAMI();

module.exports = amiInstance;
