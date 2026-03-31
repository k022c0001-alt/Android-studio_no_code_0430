/**
 * canvas.js - キャンバス管理（ズーム/パン機能）
 * ズームイン/アウト（50%-200%）、マウスホイール、パン
 */

class CanvasManager {
    constructor(canvasContainerEl, canvasEl) {
        this.container = canvasContainerEl;
        this.canvas = canvasEl;
        this.scale = 1.0;
        this.minScale = 0.5;
        this.maxScale = 2.0;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.spacePressed = false;
        this._onChangeCallbacks = [];

        this._bindEvents();
    }

    onChange(callback) {
        this._onChangeCallbacks.push(callback);
    }

    _notifyChange() {
        this._onChangeCallbacks.forEach(cb => cb({
            scale: this.scale,
            panX: this.panX,
            panY: this.panY
        }));
        this._applyTransform();
        this._updateZoomDisplay();
    }

    _applyTransform() {
        if (!this.canvas) return;
        this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
        this.canvas.style.transformOrigin = '0 0';
    }

    _updateZoomDisplay() {
        const el = document.getElementById('zoom-level');
        if (el) el.textContent = `${Math.round(this.scale * 100)}%`;
    }

    _bindEvents() {
        if (!this.container) return;

        // マウスホイールでズーム
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const factor = e.ctrlKey ? delta * 0.5 : delta;
            this.zoom(this.scale + factor, e.clientX, e.clientY);
        }, { passive: false });

        // スペースキー押下でパンモード
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.spacePressed = true;
                if (this.container) this.container.style.cursor = 'grab';
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.spacePressed = false;
                if (this.container) this.container.style.cursor = '';
                this.isPanning = false;
            }
        });

        // パンのマウスイベント
        this.container.addEventListener('mousedown', (e) => {
            if (this.spacePressed || e.button === 1) {
                e.preventDefault();
                this.isPanning = true;
                this.panStartX = e.clientX - this.panX;
                this.panStartY = e.clientY - this.panY;
                this.container.style.cursor = 'grabbing';
            }
        });
        document.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.panX = e.clientX - this.panStartX;
                this.panY = e.clientY - this.panStartY;
                this._notifyChange();
            }
        });
        document.addEventListener('mouseup', (e) => {
            if (this.isPanning) {
                this.isPanning = false;
                if (this.spacePressed) {
                    this.container.style.cursor = 'grab';
                } else {
                    this.container.style.cursor = '';
                }
            }
        });
    }

    /**
     * ズーム（指定位置を中心に）
     */
    zoom(newScale, clientX, clientY) {
        newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
        if (newScale === this.scale) return;

        // クライアント座標からキャンバス上の座標を計算
        if (clientX !== undefined && clientY !== undefined) {
            const rect = this.container.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;
            // スケール変更後も同じ点が同じ場所に見えるようにパンを調整
            const scaleChange = newScale / this.scale;
            this.panX = mouseX - (mouseX - this.panX) * scaleChange;
            this.panY = mouseY - (mouseY - this.panY) * scaleChange;
        }

        this.scale = newScale;
        this._notifyChange();
    }

    /**
     * ズームイン
     */
    zoomIn() {
        this.zoom(this.scale + 0.1);
    }

    /**
     * ズームアウト
     */
    zoomOut() {
        this.zoom(this.scale - 0.1);
    }

    /**
     * ズームリセット
     */
    reset() {
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this._notifyChange();
    }

    /**
     * キャンバスの状態を取得（保存用）
     */
    getState() {
        return { scale: this.scale, panX: this.panX, panY: this.panY };
    }

    /**
     * キャンバスの状態を復元
     */
    setState(state) {
        if (!state) return;
        this.scale = state.scale || 1.0;
        this.panX = state.panX || 0;
        this.panY = state.panY || 0;
        this._notifyChange();
    }
}

// グローバルインスタンス（editor.js初期化後にセット）
let canvasManager = null;

function initCanvas(containerEl, canvasEl) {
    canvasManager = new CanvasManager(containerEl, canvasEl);
    return canvasManager;
}
