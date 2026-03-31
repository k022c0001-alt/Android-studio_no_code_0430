/**
 * storage.js - プロジェクト保存/読込機能
 * JSON形式でのプロジェクト設計ファイル保存、ローカルストレージ＋ダウンロード
 */

const STORAGE_KEY = 'nocode_project';
const STORAGE_META_KEY = 'nocode_project_meta';

class StorageManager {
    constructor() {
        this._editor = null;
    }

    /**
     * エディタ参照をセット
     */
    setEditor(editor) {
        this._editor = editor;
    }

    /**
     * 現在のプロジェクトをJSONオブジェクトに変換
     */
    exportToJSON() {
        if (!this._editor) return null;
        return {
            version: '2.0',
            name: this._editor.projectName || 'Untitled Project',
            description: this._editor.projectDescription || '',
            savedAt: new Date().toISOString(),
            components: this._editor.getComponents(),
            canvasState: this._editor.getCanvasState ? this._editor.getCanvasState() : {}
        };
    }

    /**
     * JSONからプロジェクトを読込
     */
    importFromJSON(data) {
        if (!this._editor) return false;
        if (!data || !data.components) {
            console.error('Invalid project data');
            return false;
        }
        try {
            this._editor.loadProject(data);
            return true;
        } catch (e) {
            console.error('Failed to load project:', e);
            return false;
        }
    }

    /**
     * ローカルストレージに保存
     */
    saveToLocalStorage() {
        const data = this.exportToJSON();
        if (!data) return false;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            localStorage.setItem(STORAGE_META_KEY, JSON.stringify({
                name: data.name,
                savedAt: data.savedAt
            }));
            return true;
        } catch (e) {
            console.error('LocalStorage save failed:', e);
            return false;
        }
    }

    /**
     * ローカルストレージから読込
     */
    loadFromLocalStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('LocalStorage load failed:', e);
            return null;
        }
    }

    /**
     * 最後の保存メタ情報を取得
     */
    getLastSaveMeta() {
        try {
            const raw = localStorage.getItem(STORAGE_META_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * JSONファイルとしてダウンロード
     */
    downloadProject() {
        const data = this.exportToJSON();
        if (!data) return;
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * ファイル選択してプロジェクトを読込
     */
    uploadProject(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    const ok = this.importFromJSON(data);
                    if (callback) callback(ok, data);
                } catch (err) {
                    console.error('File parse error:', err);
                    if (callback) callback(false, null);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    /**
     * ローカルストレージをクリア
     */
    clearLocalStorage() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_META_KEY);
    }
}

// グローバルインスタンス
const storageManager = new StorageManager();

/**
 * 自動保存（30秒ごと）
 */
let _autoSaveInterval = null;
function startAutoSave(intervalMs = 30000) {
    stopAutoSave();
    _autoSaveInterval = setInterval(() => {
        const ok = storageManager.saveToLocalStorage();
        if (ok) {
            const indicator = document.getElementById('autosave-indicator');
            if (indicator) {
                indicator.textContent = `自動保存: ${new Date().toLocaleTimeString()}`;
                indicator.style.opacity = '1';
                setTimeout(() => { indicator.style.opacity = '0.5'; }, 2000);
            }
        }
    }, intervalMs);
}

function stopAutoSave() {
    if (_autoSaveInterval) {
        clearInterval(_autoSaveInterval);
        _autoSaveInterval = null;
    }
}
