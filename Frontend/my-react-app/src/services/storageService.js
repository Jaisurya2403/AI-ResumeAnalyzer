const STORAGE_PREFIX = "agy_resume_ai_";
const RESULTS_INDEX_KEY = `${STORAGE_PREFIX}results_index`;
const API_CONFIG_KEY = `${STORAGE_PREFIX}api_config`;

export const storageService = {
  // Save full attempt
  saveResult(result) {
    try {
      if (!result.resultId) {
        result.resultId = "res_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
      }
      if (!result.createdAt) {
        result.createdAt = new Date().toISOString();
      }

      // Save full result payload
      const key = `${STORAGE_PREFIX}result:${result.resultId}`;
      localStorage.setItem(key, JSON.stringify(result));

      // Update index
      const index = this.getResultsIndex();
      const existingIdx = index.findIndex(item => item.resultId === result.resultId);
      const summaryItem = {
        resultId: result.resultId,
        createdAt: result.createdAt,
        candidateName: result.resumeProfile?.candidateName || "Candidate",
        jobRole: result.jobRole || { title: "Software Engineer", domain: "Software" },
        fitnessPercent: result.finalReport?.fitnessPercent ?? result.fitnessPercent ?? 0,
        roundScores: result.roundScores || {}
      };

      if (existingIdx >= 0) {
        index[existingIdx] = summaryItem;
      } else {
        index.unshift(summaryItem);
      }

      localStorage.setItem(RESULTS_INDEX_KEY, JSON.stringify(index));
      return result.resultId;
    } catch (err) {
      console.error("Failed to save result to localStorage:", err);
      return null;
    }
  },

  // Get index of all attempts
  getResultsIndex() {
    try {
      const data = localStorage.getItem(RESULTS_INDEX_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Failed to read results index:", err);
      return [];
    }
  },

  // Get single full result by ID
  getResultById(resultId) {
    try {
      const key = `${STORAGE_PREFIX}result:${resultId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(`Failed to get result for ${resultId}:`, err);
      return null;
    }
  },

  // Delete a result
  deleteResult(resultId) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}result:${resultId}`);
      const index = this.getResultsIndex().filter(item => item.resultId !== resultId);
      localStorage.setItem(RESULTS_INDEX_KEY, JSON.stringify(index));
      return true;
    } catch (err) {
      console.error(`Failed to delete result ${resultId}:`, err);
      return false;
    }
  },

  // API Config (Provider, Key, Model)
  getApiConfig() {
    try {
      const data = localStorage.getItem(API_CONFIG_KEY);
      return data ? JSON.parse(data) : { provider: "gemini", apiKey: "", model: "gemini-1.5-flash" };
    } catch {
      return { provider: "gemini", apiKey: "", model: "gemini-1.5-flash" };
    }
  },

  saveApiConfig(config) {
    try {
      localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
      return true;
    } catch (err) {
      console.error("Failed to save API config:", err);
      return false;
    }
  }
};
