/**
 * Phase 4: Marker Manager
 * Manages Google Maps markers – add, remove, edit, and persist per-component.
 */

class MarkerManager {
  constructor() {
    /** Map from mapComponentId → marker array */
    this._markers = new Map();
    this._listeners = [];
  }

  /**
   * Add a marker to the given map component.
   * @param {string} mapId - ID of the MapView component instance
   * @param {Object} markerData - { lat, lng, title, snippet, clickHandler }
   * @returns {Object} The created marker object (with generated id)
   */
  addMarker(mapId, markerData) {
    if (!this._markers.has(mapId)) {
      this._markers.set(mapId, []);
    }
    const marker = {
      id: `marker_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      lat: markerData.lat !== undefined ? Number(markerData.lat) : 35.6762,
      lng: markerData.lng !== undefined ? Number(markerData.lng) : 139.6503,
      title: markerData.title || 'マーカー',
      snippet: markerData.snippet || '',
      clickHandler: markerData.clickHandler || '',
    };
    this._markers.get(mapId).push(marker);
    this._notify('added', { mapId, marker });
    return marker;
  }

  /**
   * Update an existing marker.
   * @param {string} mapId
   * @param {string} markerId
   * @param {Object} updates
   * @returns {Object|null} Updated marker or null
   */
  updateMarker(mapId, markerId, updates) {
    const list = this._markers.get(mapId);
    if (!list) return null;
    const idx = list.findIndex(m => m.id === markerId);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], ...updates };
    this._notify('updated', { mapId, marker: list[idx] });
    return list[idx];
  }

  /**
   * Remove a marker by ID.
   * @param {string} mapId
   * @param {string} markerId
   * @returns {boolean} Whether removal succeeded
   */
  removeMarker(mapId, markerId) {
    const list = this._markers.get(mapId);
    if (!list) return false;
    const before = list.length;
    const filtered = list.filter(m => m.id !== markerId);
    this._markers.set(mapId, filtered);
    const removed = filtered.length < before;
    if (removed) this._notify('removed', { mapId, markerId });
    return removed;
  }

  /**
   * Get all markers for a map component.
   * @param {string} mapId
   * @returns {Array}
   */
  getMarkers(mapId) {
    return [...(this._markers.get(mapId) || [])];
  }

  /**
   * Remove all markers from a map component.
   * @param {string} mapId
   */
  clearMarkers(mapId) {
    this._markers.set(mapId, []);
    this._notify('cleared', { mapId });
  }

  /**
   * Serialise marker data for project save/load.
   * @returns {Object} Plain object representation
   */
  serialize() {
    const out = {};
    this._markers.forEach((list, mapId) => {
      out[mapId] = list;
    });
    return out;
  }

  /**
   * Restore from serialised data.
   * @param {Object} data
   */
  deserialize(data) {
    this._markers.clear();
    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([mapId, list]) => {
        this._markers.set(mapId, Array.isArray(list) ? list : []);
      });
    }
    this._notify('restored', {});
  }

  subscribe(listener) {
    this._listeners.push(listener);
    return () => { this._listeners = this._listeners.filter(l => l !== listener); };
  }

  _notify(event, data) {
    this._listeners.forEach(l => l(event, data));
  }
}

// Singleton
const markerManager = new MarkerManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MarkerManager, markerManager };
}
