/**
 * grid.js - グリッド/スナップ機能
 * グリッドラインの表示/非表示、スナップ有効/無効、グリッドサイズカスタマイズ
 */

class GridManager {
    constructor(canvasEl) {
        this.canvas = canvasEl;
        this.enabled = true;       // グリッド表示
        this.snapEnabled = true;   // スナップ有効
        this.gridSize = 20;        // グリッドサイズ(px)
        this._svgGrid = null;

        this._createGridOverlay();
    }

    /**
     * SVGグリッドオーバーレイを作成
     */
    _createGridOverlay() {
        // 既存グリッドを削除
        const existing = document.getElementById('grid-overlay');
        if (existing) existing.remove();

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'grid-overlay';
        svg.style.cssText = `
            position:absolute;top:0;left:0;width:100%;height:100%;
            pointer-events:none;z-index:1;
        `;

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'grid-pattern');
        pattern.setAttribute('width', this.gridSize);
        pattern.setAttribute('height', this.gridSize);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');

        // 細線
        const pathMinor = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathMinor.setAttribute('d', `M ${this.gridSize} 0 L 0 0 0 ${this.gridSize}`);
        pathMinor.setAttribute('fill', 'none');
        pathMinor.setAttribute('stroke', 'rgba(98,0,238,0.15)');
        pathMinor.setAttribute('stroke-width', '0.5');
        pattern.appendChild(pathMinor);
        defs.appendChild(pattern);
        svg.appendChild(defs);

        // グリッド塗りつぶし
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'url(#grid-pattern)');
        svg.appendChild(rect);

        this._svgGrid = svg;

        if (this.canvas) {
            this.canvas.style.position = 'relative';
            this.canvas.insertBefore(svg, this.canvas.firstChild);
        }

        this._updateVisibility();
    }

    _updateVisibility() {
        if (this._svgGrid) {
            this._svgGrid.style.display = this.enabled ? 'block' : 'none';
        }
    }

    _updateGridSize() {
        if (!this._svgGrid) return;
        const pattern = this._svgGrid.querySelector('#grid-pattern');
        if (!pattern) return;
        pattern.setAttribute('width', this.gridSize);
        pattern.setAttribute('height', this.gridSize);
        const path = pattern.querySelector('path');
        if (path) {
            path.setAttribute('d', `M ${this.gridSize} 0 L 0 0 0 ${this.gridSize}`);
        }
    }

    /**
     * グリッド表示切り替え
     */
    toggleGrid() {
        this.enabled = !this.enabled;
        this._updateVisibility();
        return this.enabled;
    }

    setGridVisible(visible) {
        this.enabled = visible;
        this._updateVisibility();
    }

    /**
     * スナップ切り替え
     */
    toggleSnap() {
        this.snapEnabled = !this.snapEnabled;
        return this.snapEnabled;
    }

    setSnapEnabled(enabled) {
        this.snapEnabled = enabled;
    }

    /**
     * グリッドサイズ変更
     */
    setGridSize(size) {
        this.gridSize = Math.max(5, Math.min(100, parseInt(size) || 20));
        this._updateGridSize();
    }

    /**
     * 座標をグリッドにスナップ
     */
    snap(x, y) {
        if (!this.snapEnabled) return { x, y };
        return {
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize
        };
    }

    /**
     * スナップ座標を取得（単値）
     */
    snapValue(v) {
        if (!this.snapEnabled) return v;
        return Math.round(v / this.gridSize) * this.gridSize;
    }

    /**
     * 状態を取得
     */
    getState() {
        return {
            enabled: this.enabled,
            snapEnabled: this.snapEnabled,
            gridSize: this.gridSize
        };
    }

    /**
     * 状態を復元
     */
    setState(state) {
        if (!state) return;
        if (state.enabled !== undefined) this.setGridVisible(state.enabled);
        if (state.snapEnabled !== undefined) this.setSnapEnabled(state.snapEnabled);
        if (state.gridSize) this.setGridSize(state.gridSize);
    }
}

// グローバルインスタンス（editor.js初期化後にセット）
let gridManager = null;

function initGrid(canvasEl) {
    gridManager = new GridManager(canvasEl);
    return gridManager;
}
