/**
 * Phase 3: Layout Manager Engine
 * Manages layout hierarchy, constraint resolution, and layout rendering
 */

class LayoutManager {
  constructor() {
    this._root = null;
    this._nodeMap = new Map();
    this._changeListeners = [];
    this._screenPresets = {
      phone_portrait:  { width: 360, height: 800,  label: 'Phone (Portrait)',  icon: '📱' },
      phone_landscape: { width: 800, height: 360,  label: 'Phone (Landscape)', icon: '📱' },
      tablet_portrait: { width: 768, height: 1024, label: 'Tablet (Portrait)', icon: '📟' },
      tablet_landscape:{ width: 1024,height: 768,  label: 'Tablet (Landscape)',icon: '📟' },
      watch:           { width: 280, height: 280,  label: 'Wear OS Watch',     icon: '⌚' },
    };
    this._currentScreen = 'phone_portrait';
    this._zoomLevel = 1.0;
    this._gridEnabled = false;
    this._gridSize = 8;
    this._snapToGrid = true;
  }

  // ---- Root and Tree Management ----

  /**
   * Set the root layout node
   * @param {Object} node - Root layout node
   */
  setRoot(node) {
    this._root = node;
    this._buildNodeMap(node);
    this._notifyChange('rootChanged', node);
  }

  /**
   * Get the root layout node
   * @returns {Object|null}
   */
  getRoot() {
    return this._root;
  }

  /**
   * Add a child node to a parent
   * @param {string} parentId - Parent node ID
   * @param {Object} childNode - Child node to add
   * @param {number} index - Insert position (-1 = append)
   */
  addChild(parentId, childNode, index = -1) {
    const parent = this._nodeMap.get(parentId);
    if (!parent) throw new Error(`Parent node not found: ${parentId}`);
    if (!parent.children) parent.children = [];

    if (index < 0 || index >= parent.children.length) {
      parent.children.push(childNode);
    } else {
      parent.children.splice(index, 0, childNode);
    }
    this._buildNodeMap(childNode);
    this._notifyChange('childAdded', { parentId, childNode, index });
  }

  /**
   * Remove a node by ID
   * @param {string} nodeId - Node ID to remove
   * @returns {Object|null} Removed node or null
   */
  removeNode(nodeId) {
    const parent = this._findParent(nodeId, this._root);
    if (!parent) return null;
    const index = parent.children.findIndex(c => c.id === nodeId);
    if (index < 0) return null;
    const removed = parent.children.splice(index, 1)[0];
    this._removeFromNodeMap(removed);
    this._notifyChange('nodeRemoved', { nodeId, parent });
    return removed;
  }

  /**
   * Move a node to a new parent
   * @param {string} nodeId - Node to move
   * @param {string} newParentId - New parent ID
   * @param {number} index - Insert position
   */
  moveNode(nodeId, newParentId, index = -1) {
    const node = this._nodeMap.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    const removed = this.removeNode(nodeId);
    if (removed) {
      this.addChild(newParentId, removed, index);
    }
  }

  /**
   * Get a node by ID
   * @param {string} nodeId
   * @returns {Object|null}
   */
  getNode(nodeId) {
    return this._nodeMap.get(nodeId) || null;
  }

  /**
   * Get the parent of a node
   * @param {string} nodeId
   * @returns {Object|null}
   */
  getParent(nodeId) {
    return this._findParent(nodeId, this._root);
  }

  /**
   * Update a node's properties
   * @param {string} nodeId
   * @param {Object} propUpdates - Properties to merge in
   */
  updateNodeProps(nodeId, propUpdates) {
    const node = this._nodeMap.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    node.props = { ...node.props, ...propUpdates };
    this._notifyChange('propsUpdated', { nodeId, props: node.props });
  }

  // ---- Layout Validation ----

  /**
   * Validate that a child can be placed inside a parent
   * @param {string} parentType - Parent component type
   * @param {string} childType - Child component type
   * @returns {{ valid: boolean, message: string }}
   */
  validateParentChild(parentType, childType) {
    // Some components should not be nested inside themselves deeply
    const scrollViews = ['ScrollView', 'HorizontalScrollView', 'NestedScrollView'];
    if (scrollViews.includes(parentType) && scrollViews.includes(childType)) {
      return { valid: false, message: `${childType} cannot be nested inside ${parentType}` };
    }

    // FAB should be a direct child of CoordinatorLayout or be at the end of FrameLayout
    const layouts = ['LinearLayout', 'FrameLayout', 'GridLayout', 'RelativeLayout', 'ConstraintLayout', 'CoordinatorLayout'];
    if (childType === 'FloatingActionButton' && !layouts.includes(parentType)) {
      return { valid: false, message: 'FloatingActionButton should be inside a layout container' };
    }

    return { valid: true, message: '' };
  }

  /**
   * Get suggestions for fixing layout issues
   * @param {Object} node - Layout tree node
   * @returns {Array} Issue objects {severity, message, fix}
   */
  getLintIssues(node) {
    const issues = [];
    this._lintNode(node, issues);
    return issues;
  }

  // ---- Screen / Preview Configuration ----

  /**
   * Set the preview screen size
   * @param {string} presetId - Screen preset ID
   */
  setScreen(presetId) {
    if (!this._screenPresets[presetId]) throw new Error(`Unknown preset: ${presetId}`);
    this._currentScreen = presetId;
    this._notifyChange('screenChanged', this.getScreenConfig());
  }

  /**
   * Get the current screen configuration
   * @returns {Object} Screen configuration object
   */
  getScreenConfig() {
    return {
      ...this._screenPresets[this._currentScreen],
      id: this._currentScreen,
    };
  }

  /**
   * Get all available screen presets
   * @returns {Array}
   */
  getScreenPresets() {
    return Object.entries(this._screenPresets).map(([id, preset]) => ({ id, ...preset }));
  }

  // ---- Grid and Snap ----

  /**
   * Snap a position to the grid
   * @param {number} x
   * @param {number} y
   * @returns {{ x: number, y: number }}
   */
  snapToGrid(x, y) {
    if (!this._snapToGrid) return { x, y };
    const g = this._gridSize;
    return {
      x: Math.round(x / g) * g,
      y: Math.round(y / g) * g,
    };
  }

  setGridEnabled(enabled) {
    this._gridEnabled = enabled;
    this._snapToGrid = enabled;
    this._notifyChange('gridChanged', { enabled, size: this._gridSize });
  }

  setGridSize(size) {
    this._gridSize = Math.max(4, Math.min(64, size));
    this._notifyChange('gridChanged', { enabled: this._gridEnabled, size: this._gridSize });
  }

  // ---- Zoom ----

  setZoom(level) {
    this._zoomLevel = Math.max(0.25, Math.min(4.0, level));
    this._notifyChange('zoomChanged', this._zoomLevel);
  }

  getZoom() {
    return this._zoomLevel;
  }

  zoomIn() { this.setZoom(this._zoomLevel * 1.25); }
  zoomOut() { this.setZoom(this._zoomLevel * 0.8); }
  resetZoom() { this.setZoom(1.0); }

  // ---- Serialization ----

  /**
   * Export the layout tree to JSON
   * @returns {Object}
   */
  export() {
    return {
      version: 3,
      screen: this._currentScreen,
      root: this._serializeNode(this._root),
      settings: {
        gridEnabled: this._gridEnabled,
        gridSize: this._gridSize,
        zoomLevel: this._zoomLevel,
      },
    };
  }

  /**
   * Import a layout tree from JSON
   * @param {Object} data
   */
  import(data) {
    if (data.root) {
      this.setRoot(this._deserializeNode(data.root));
    }
    if (data.screen) this._currentScreen = data.screen;
    if (data.settings) {
      this._gridEnabled = data.settings.gridEnabled || false;
      this._gridSize = data.settings.gridSize || 8;
      this._zoomLevel = data.settings.zoomLevel || 1.0;
    }
    this._notifyChange('imported', data);
  }

  // ---- Event System ----

  onChange(listener) {
    this._changeListeners.push(listener);
    return () => {
      this._changeListeners = this._changeListeners.filter(l => l !== listener);
    };
  }

  // ---- Private Helpers ----

  _notifyChange(event, data) {
    this._changeListeners.forEach(l => l(event, data));
  }

  _buildNodeMap(node) {
    if (!node) return;
    this._nodeMap.set(node.id, node);
    if (node.children) node.children.forEach(c => this._buildNodeMap(c));
  }

  _removeFromNodeMap(node) {
    if (!node) return;
    this._nodeMap.delete(node.id);
    if (node.children) node.children.forEach(c => this._removeFromNodeMap(c));
  }

  _findParent(nodeId, current) {
    if (!current || !current.children) return null;
    if (current.children.some(c => c.id === nodeId)) return current;
    for (const child of current.children) {
      const found = this._findParent(nodeId, child);
      if (found) return found;
    }
    return null;
  }

  _lintNode(node, issues) {
    if (!node) return;
    // Check for missing ID on interactive components
    const interactiveTypes = ['Button', 'EditText', 'CheckBox', 'RadioButton', 'Switch', 'Slider', 'RecyclerView'];
    if (interactiveTypes.includes(node.type) && (!node.props.id || node.props.id === '')) {
      issues.push({
        severity: 'warning',
        nodeId: node.id,
        message: `${node.type} has no ID set. Set an ID to reference it in code.`,
        fix: 'Set an ID in the properties panel',
      });
    }
    // Check match_parent in ScrollView
    if (node.type === 'ScrollView' && node.children) {
      node.children.forEach(child => {
        if (child.props && child.props.height === 'match_parent') {
          issues.push({
            severity: 'error',
            nodeId: child.id,
            message: `Child of ScrollView should not use match_parent height. Use wrap_content instead.`,
            fix: 'Change height to wrap_content',
          });
        }
      });
    }
    if (node.children) node.children.forEach(c => this._lintNode(c, issues));
  }

  _serializeNode(node) {
    if (!node) return null;
    return {
      ...node,
      children: node.children ? node.children.map(c => this._serializeNode(c)) : undefined,
    };
  }

  _deserializeNode(data) {
    if (!data) return null;
    return {
      ...data,
      children: data.children ? data.children.map(c => this._deserializeNode(c)) : undefined,
    };
  }
}

// Singleton instance
const layoutManager = new LayoutManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LayoutManager, layoutManager };
}
