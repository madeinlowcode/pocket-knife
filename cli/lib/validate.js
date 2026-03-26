/**
 * Validate an API key for a given provider
 * @param {string} envVarName - Environment variable name (e.g., 'GOOGLE_API_KEY')
 * @param {string} key - The API key to validate
 * @returns {Promise<{valid: boolean|null, skipped?: boolean, error?: string}>}
 */
export async function validateKey(envVarName, key) {
  const timeoutMs = 8000;

  // Skip validation for providers without free validation endpoints
  if (envVarName === 'FAL_KEY') {
    return { valid: null, skipped: true };
  }
  if (envVarName.startsWith('X_')) {
    return { valid: null, skipped: true };
  }

  const controllers = {
    google: () => {
      const ac = new AbortController();
      setTimeout(() => ac.abort(), timeoutMs);
      return fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`, {
        signal: ac.signal
      });
    },
    elevenlabs: () => {
      const ac = new AbortController();
      setTimeout(() => ac.abort(), timeoutMs);
      return fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': key },
        signal: ac.signal
      });
    },
    tavily: () => {
      const ac = new AbortController();
      setTimeout(() => ac.abort(), timeoutMs);
      return fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({ query: 'test' }),
        signal: ac.signal
      });
    },
    exa: () => {
      const ac = new AbortController();
      setTimeout(() => ac.abort(), timeoutMs);
      return fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key
        },
        body: JSON.stringify({ query: 'test', num_results: 1 }),
        signal: ac.signal
      });
    },
    dashscope: () => {
      const ac = new AbortController();
      setTimeout(() => ac.abort(), timeoutMs);
      return fetch('https://dashscope.aliyuncs.com/api/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` },
        signal: ac.signal
      });
    }
  };

  // Map env var names to validation functions
  const checkerMap = {
    'GOOGLE_API_KEY': 'google',
    'ELEVENLABS_API_KEY': 'elevenlabs',
    'TAVILY_API_KEY': 'tavily',
    'EXA_API_KEY': 'exa',
    'DASHSCOPE_API_KEY': 'dashscope'
  };

  const checker = checkerMap[envVarName];
  if (!checker) {
    return { valid: null, skipped: true };
  }

  try {
    const res = await controllers[checker]();
    return { valid: res.ok };
  } catch (err) {
    if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
      return { valid: false, error: 'Network error or timeout' };
    }
    return { valid: false, error: err.message || 'Network error' };
  }
}
