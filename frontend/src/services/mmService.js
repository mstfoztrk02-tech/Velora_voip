import api from "./apiClient";

const DEFAULTS = {
  aiid: "11",
  stime: "09",
  etime: "18",
};

const mmService = {
  /**
   * Adds a single number to MM call list.
   * Backend proxy route: POST /api/mm/add_numbers_to_call
   */
  async addNumberToCall(phone, overrides = {}) {
    const payload = {
      ...DEFAULTS,
      ...overrides,
      content: String(phone ?? "").trim(),
    };
    const res = await api.post("/api/mm/add_numbers_to_call", payload);
    return res.data;
  },

  /**
   * Adds multiple numbers in a single request.
   * The backend proxy accepts a single `content` string; we send newline-separated numbers.
   */
  async addNumbersToCallBulk(phones, overrides = {}) {
    const cleanPhones = (phones || [])
      .map((p) => String(p ?? "").trim())
      .filter(Boolean);

    const payload = {
      ...DEFAULTS,
      ...overrides,
      content: cleanPhones.join("\n"),
    };

    const res = await api.post("/api/mm/add_numbers_to_call", payload);

    // Keep the existing caller contract (per-number results)
    return cleanPhones.map((phone) => ({ ok: true, phone, data: res.data }));
  },
};

export default mmService;
