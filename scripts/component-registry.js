/**
 * Phase 3: Component Registry
 * Central registry for all UI components - manages registration, lookup, and categorization
 */

class ComponentRegistry {
  constructor() {
    this._components = new Map();
    this._categories = new Map();
    this._favorites = new Set(this._loadFavorites());
    this._recentlyUsed = this._loadRecentlyUsed();
    this._listeners = [];
  }

  /**
   * Register a component definition
   * @param {Object} component - Component definition object
   */
  register(component) {
    if (!component.type) {
      throw new Error('Component must have a type property');
    }
    this._components.set(component.type, component);
    const cat = component.category || 'other';
    if (!this._categories.has(cat)) {
      this._categories.set(cat, []);
    }
    if (!this._categories.get(cat).includes(component.type)) {
      this._categories.get(cat).push(component.type);
    }
    this._notify('register', component);
  }

  /**
   * Register multiple components at once
   * @param {Array} components - Array of component definitions
   */
  registerAll(components) {
    components.forEach(c => this.register(c));
  }

  /**
   * Get a component by type
   * @param {string} type - Component type identifier
   * @returns {Object|null} Component definition or null
   */
  get(type) {
    return this._components.get(type) || null;
  }

  /**
   * Get all registered components
   * @returns {Array} All component definitions
   */
  getAll() {
    return Array.from(this._components.values());
  }

  /**
   * Get all components in a category
   * @param {string} category - Category name
   * @returns {Array} Component definitions in the category
   */
  getByCategory(category) {
    const types = this._categories.get(category) || [];
    return types.map(t => this._components.get(t)).filter(Boolean);
  }

  /**
   * Get all available categories with metadata
   * @returns {Array} Category objects {id, label, icon, components}
   */
  getCategories() {
    const categoryMeta = {
      basic:      { id: 'basic',      label: '基本コンポーネント', icon: '⬛', order: 1 },
      layout:     { id: 'layout',     label: 'レイアウト',         icon: '📐', order: 2 },
      list:       { id: 'list',       label: 'リスト/スクロール', icon: '📋', order: 3 },
      material:   { id: 'material',   label: 'Material Design',   icon: '💎', order: 4 },
      navigation: { id: 'navigation', label: 'ナビゲーション',     icon: '🧭', order: 5 },
      google:     { id: 'google',     label: 'Google APIs',        icon: '🗺️', order: 6 },
      other:      { id: 'other',      label: 'その他',             icon: '🔧', order: 7 },
    };

    const result = [];
    for (const [id, types] of this._categories.entries()) {
      const meta = categoryMeta[id] || { id, label: id, icon: '🔧', order: 99 };
      result.push({
        ...meta,
        components: types.map(t => this._components.get(t)).filter(Boolean),
      });
    }
    result.sort((a, b) => a.order - b.order);
    return result;
  }

  /**
   * Search components by name or tags
   * @param {string} query - Search query
   * @returns {Array} Matching component definitions
   */
  search(query) {
    if (!query || query.trim() === '') return this.getAll();
    const q = query.trim().toLowerCase();
    return this.getAll().filter(c => {
      return (
        c.type.toLowerCase().includes(q) ||
        (c.label && c.label.toLowerCase().includes(q)) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q))) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    });
  }

  /**
   * Check if a component type is registered
   * @param {string} type - Component type
   * @returns {boolean}
   */
  has(type) {
    return this._components.has(type);
  }

  /**
   * Create a new instance of a component with default props
   * @param {string} type - Component type
   * @param {Object} overrides - Property overrides
   * @returns {Object} Component instance
   */
  createInstance(type, overrides = {}) {
    const def = this.get(type);
    if (!def) throw new Error(`Unknown component type: ${type}`);
    const id = this._generateId(type);
    return {
      id,
      type,
      props: {
        ...JSON.parse(JSON.stringify(def.defaultProps || {})),
        id: this._toViewId(type),
        ...overrides,
      },
      children: def.isContainer ? [] : undefined,
      _createdAt: Date.now(),
    };
  }

  /**
   * Add component type to favorites
   * @param {string} type - Component type
   */
  addFavorite(type) {
    this._favorites.add(type);
    this._saveFavorites();
    this._notify('favoriteAdded', type);
  }

  /**
   * Remove component type from favorites
   * @param {string} type - Component type
   */
  removeFavorite(type) {
    this._favorites.delete(type);
    this._saveFavorites();
    this._notify('favoriteRemoved', type);
  }

  /**
   * Toggle favorite status
   * @param {string} type - Component type
   */
  toggleFavorite(type) {
    if (this._favorites.has(type)) {
      this.removeFavorite(type);
    } else {
      this.addFavorite(type);
    }
  }

  /**
   * Check if a component is in favorites
   * @param {string} type - Component type
   * @returns {boolean}
   */
  isFavorite(type) {
    return this._favorites.has(type);
  }

  /**
   * Get favorite components
   * @returns {Array} Favorite component definitions
   */
  getFavorites() {
    return Array.from(this._favorites)
      .map(t => this._components.get(t))
      .filter(Boolean);
  }

  /**
   * Record that a component was used (for recently used list)
   * @param {string} type - Component type
   */
  recordUsage(type) {
    this._recentlyUsed = [type, ...this._recentlyUsed.filter(t => t !== type)].slice(0, 10);
    this._saveRecentlyUsed();
    this._notify('used', type);
  }

  /**
   * Get recently used components
   * @returns {Array} Recently used component definitions
   */
  getRecentlyUsed() {
    return this._recentlyUsed
      .map(t => this._components.get(t))
      .filter(Boolean);
  }

  /**
   * Get Gradle dependencies required by components in a list of instances
   * @param {Array} instances - Component instances
   * @returns {Array} Unique dependency strings
   */
  getRequiredDependencies(instances) {
    const deps = new Set();
    instances.forEach(inst => {
      const def = this.get(inst.type);
      if (def && def.gradleDependency) {
        (Array.isArray(def.gradleDependency) ? def.gradleDependency : [def.gradleDependency])
          .forEach(d => deps.add(d));
      }
    });
    return Array.from(deps);
  }

  /**
   * Subscribe to registry events
   * @param {Function} listener - Event listener
   */
  subscribe(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  // ---- Private Helpers ----

  _notify(event, data) {
    this._listeners.forEach(l => l(event, data));
  }

  _generateId(type) {
    return `${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  _toViewId(type) {
    return type.charAt(0).toLowerCase() + type.slice(1).replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  _loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('nc_favorites') || '[]');
    } catch {
      return [];
    }
  }

  _saveFavorites() {
    try {
      localStorage.setItem('nc_favorites', JSON.stringify(Array.from(this._favorites)));
    } catch {}
  }

  _loadRecentlyUsed() {
    try {
      return JSON.parse(localStorage.getItem('nc_recently_used') || '[]');
    } catch {
      return [];
    }
  }

  _saveRecentlyUsed() {
    try {
      localStorage.setItem('nc_recently_used', JSON.stringify(this._recentlyUsed));
    } catch {}
  }
}

// Singleton instance
const componentRegistry = new ComponentRegistry();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ComponentRegistry, componentRegistry };
}
