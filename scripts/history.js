/**
 * history.js - Undo/Redo機能
 * Commandパターンで操作履歴を管理（最大50アクション）
 */

class HistoryManager {
    constructor() {
        this.maxHistory = 50;
        this.undoStack = [];
        this.redoStack = [];
        this._onChangeCallbacks = [];
    }

    /**
     * コールバック登録
     */
    onChange(callback) {
        this._onChangeCallbacks.push(callback);
    }

    _notifyChange() {
        this._onChangeCallbacks.forEach(cb => cb({
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length
        }));
    }

    /**
     * アクションを記録
     * @param {object} action - { type, undo: fn, redo: fn, description }
     */
    record(action) {
        this.undoStack.push(action);
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        // 新しいアクションを記録したらRedoスタックをクリア
        this.redoStack = [];
        this._notifyChange();
    }

    /**
     * Undo実行
     */
    undo() {
        if (!this.canUndo()) return false;
        const action = this.undoStack.pop();
        try {
            action.undo();
            this.redoStack.push(action);
            this._notifyChange();
            return action.description || 'Undo';
        } catch (e) {
            console.error('Undo failed:', e);
            return false;
        }
    }

    /**
     * Redo実行
     */
    redo() {
        if (!this.canRedo()) return false;
        const action = this.redoStack.pop();
        try {
            action.redo();
            this.undoStack.push(action);
            this._notifyChange();
            return action.description || 'Redo';
        } catch (e) {
            console.error('Redo failed:', e);
            return false;
        }
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * 履歴をクリア
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this._notifyChange();
    }

    /**
     * 履歴の概要を返す
     */
    getSummary() {
        return {
            undoStack: this.undoStack.map(a => a.description || a.type),
            redoStack: this.redoStack.map(a => a.description || a.type)
        };
    }
}

// グローバルインスタンス
const historyManager = new HistoryManager();

/**
 * キーボードショートカット登録
 */
function initHistoryShortcuts() {
    document.addEventListener('keydown', (e) => {
        // テキスト入力中は無視
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const isCtrl = e.ctrlKey || e.metaKey;

        if (isCtrl && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            const result = historyManager.undo();
            if (result) showToast(`Undo: ${result}`);
        } else if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            const result = historyManager.redo();
            if (result) showToast(`Redo: ${result}`);
        }
    });
}

/**
 * Undo/Redoボタン状態更新
 */
function updateHistoryButtons(state) {
    const undoBtn = document.getElementById('btn-undo');
    const redoBtn = document.getElementById('btn-redo');
    if (undoBtn) undoBtn.disabled = !state.canUndo;
    if (redoBtn) redoBtn.disabled = !state.canRedo;
}
