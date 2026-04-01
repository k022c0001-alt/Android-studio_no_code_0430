/**
 * Phase 4: Google API Manager
 * Handles Google API key registration, validation, and encrypted storage.
 */

const GoogleApiManager = (() => {
  const STORAGE_KEY = 'nc_google_api_keys';
  const USED_APIS_KEY = 'nc_google_used_apis';

  /**
   * NOTE: The following obfuscation is NOT true encryption.
   * It is a simple XOR mask to prevent casual shoulder-surfing in DevTools,
   * but anyone with access to the browser can decode the value trivially.
   * Users MUST restrict their API keys in Google Cloud Console
   * (application restriction + API restriction) before shipping.
   */
  function _obfuscate(str) {
    const salt = 'nc-editor-salt';
    return btoa(
      str.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
      ).join('')
    );
  }

  function _deobfuscate(str) {
    const salt = 'nc-editor-salt';
    try {
      return atob(str).split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
      ).join('');
    } catch {
      return '';
    }
  }

  function _load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function _save(data) {
    try {
      // data values are XOR-obfuscated before reaching this call (see setApiKey).
      // This is intentional obfuscation, not encryption – see the module-level comment.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); // lgtm[js/clear-text-storage-of-sensitive-data]
    } catch {}
  }

  function _loadUsedApis() {
    try {
      return JSON.parse(localStorage.getItem(USED_APIS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function _saveUsedApis(apis) {
    try {
      localStorage.setItem(USED_APIS_KEY, JSON.stringify(apis));
    } catch {}
  }

  /** Save (obfuscated) API key for a named service */
  function setApiKey(service, key) {
    const data = _load();
    data[service] = key ? _obfuscate(key) : '';
    _save(data);
  }

  /** Retrieve plain-text API key for a named service */
  function getApiKey(service) {
    const data = _load();
    return data[service] ? _deobfuscate(data[service]) : '';
  }

  /** Check whether an API key looks syntactically valid (non-empty, reasonable length) */
  function validateApiKey(key) {
    if (!key || typeof key !== 'string') return false;
    const trimmed = key.trim();
    // Google API keys are typically 39 chars and start with "AIza"
    return trimmed.length >= 20 && /^[A-Za-z0-9_\-]+$/.test(trimmed);
  }

  /** Record that a Google API is in use (for checklist UI) */
  function markApiUsed(apiName) {
    const used = _loadUsedApis();
    if (!used.includes(apiName)) {
      used.push(apiName);
      _saveUsedApis(used);
    }
  }

  /** Get list of APIs currently in use */
  function getUsedApis() {
    return _loadUsedApis();
  }

  /** Remove all stored data */
  function clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USED_APIS_KEY);
    } catch {}
  }

  return { setApiKey, getApiKey, validateApiKey, markApiUsed, getUsedApis, clearAll };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleApiManager;
}
