/**
 * Phase 2: Undo/Redo System
 * Command pattern-based history management
 */

class UndoRedoManager {
  constructor(maxHistory = 50) {
    this._undoStack = [];
    this._redoStack = [];
    this._maxHistory = maxHistory;
    this._listeners = [];
    this._isExecuting = false;
  }

  /**
   * Execute a command and push it to the undo stack
   * @param {Object} command - Command with execute() and undo() methods
   */
  execute(command) {
    if (this._isExecuting) return;
    this._isExecuting = true;
    try {
      command.execute();
      this._undoStack.push(command);
      if (this._undoStack.length > this._maxHistory) {
        this._undoStack.shift();
      }
      this._redoStack = [];
      this._notify();
    } finally {
      this._isExecuting = false;
    }
  }

  /**
   * Undo the last command
   * @returns {boolean} Whether undo was possible
   */
  undo() {
    if (this._undoStack.length === 0) return false;
    const command = this._undoStack.pop();
    command.undo();
    this._redoStack.push(command);
    this._notify();
    return true;
  }

  /**
   * Redo the last undone command
   * @returns {boolean} Whether redo was possible
   */
  redo() {
    if (this._redoStack.length === 0) return false;
    const command = this._redoStack.pop();
    command.execute();
    this._undoStack.push(command);
    this._notify();
    return true;
  }

  /**
   * Whether undo is available
   * @returns {boolean}
   */
  canUndo() { return this._undoStack.length > 0; }

  /**
   * Whether redo is available
   * @returns {boolean}
   */
  canRedo() { return this._redoStack.length > 0; }

  /**
   * Clear all history
   */
  clear() {
    this._undoStack = [];
    this._redoStack = [];
    this._notify();
  }

  /**
   * Get description of undo operation
   * @returns {string}
   */
  getUndoLabel() {
    const cmd = this._undoStack[this._undoStack.length - 1];
    return cmd ? (cmd.description || 'Undo') : '';
  }

  /**
   * Get description of redo operation
   * @returns {string}
   */
  getRedoLabel() {
    const cmd = this._redoStack[this._redoStack.length - 1];
    return cmd ? (cmd.description || 'Redo') : '';
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  _notify() {
    this._listeners.forEach(l => l({
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoLabel: this.getUndoLabel(),
      redoLabel: this.getRedoLabel(),
    }));
  }
}

// ---- Standard Command Implementations ----

class AddComponentCommand {
  constructor(components, component, insertIndex = -1) {
    this.components = components;
    this.component = component;
    this.insertIndex = insertIndex;
    this.description = `Add ${component.type}`;
  }
  execute() {
    if (this.insertIndex >= 0) {
      this.components.splice(this.insertIndex, 0, this.component);
    } else {
      this.components.push(this.component);
    }
  }
  undo() {
    const idx = this.components.findIndex(c => c.id === this.component.id);
    if (idx >= 0) this.components.splice(idx, 1);
  }
}

class RemoveComponentCommand {
  constructor(components, componentId) {
    this.components = components;
    this.componentId = componentId;
    this._component = null;
    this._index = -1;
    this.description = 'Remove component';
  }
  execute() {
    this._index = this.components.findIndex(c => c.id === this.componentId);
    if (this._index >= 0) {
      this._component = this.components[this._index];
      this.components.splice(this._index, 1);
    }
  }
  undo() {
    if (this._component && this._index >= 0) {
      this.components.splice(this._index, 0, this._component);
    }
  }
}

class UpdatePropsCommand {
  constructor(component, newProps) {
    this.component = component;
    this.newProps = { ...newProps };
    this._oldProps = { ...component.props };
    this.description = `Update ${component.type} properties`;
  }
  execute() {
    Object.assign(this.component.props, this.newProps);
  }
  undo() {
    this.component.props = { ...this._oldProps };
  }
}

class MoveComponentCommand {
  constructor(components, fromIndex, toIndex) {
    this.components = components;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.description = 'Move component';
  }
  execute() {
    const item = this.components.splice(this.fromIndex, 1)[0];
    this.components.splice(this.toIndex, 0, item);
  }
  undo() {
    const item = this.components.splice(this.toIndex, 1)[0];
    this.components.splice(this.fromIndex, 0, item);
  }
}

// Singleton instance
const undoRedoManager = new UndoRedoManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UndoRedoManager,
    undoRedoManager,
    AddComponentCommand,
    RemoveComponentCommand,
    UpdatePropsCommand,
    MoveComponentCommand,
  };
}
