/**
 * editor.js - コアエディタ機能
 * コンポーネントの追加/削除/移動、プロパティ編集
 */

class Editor {
    constructor() {
        this.components = [];       // { id, type, x, y, props }
        this.selectedId = null;
        this.projectName = 'Untitled Project';
        this.projectDescription = '';
        this._nextId = 1;
        this._dragState = null;
        this._onChangeCallbacks = [];
        this._onSelectCallbacks = [];
    }

    onChange(callback) {
        this._onChangeCallbacks.push(callback);
    }

    onSelect(callback) {
        this._onSelectCallbacks.push(callback);
    }

    _notifyChange() {
        this._onChangeCallbacks.forEach(cb => cb(this.components));
        this._refreshCodeOutput();
    }

    _notifySelect(component) {
        this._onSelectCallbacks.forEach(cb => cb(component));
    }

    _generateId() {
        return `comp_${Date.now()}_${this._nextId++}`;
    }

    // -------------------------------------------------------
    // コンポーネント操作
    // -------------------------------------------------------

    /**
     * コンポーネントを追加（Undo対応）
     */
    addComponent(type, x, y) {
        const props = getDefaultProps(type);
        props.id = props.id || `${type.toLowerCase()}${this._nextId}`;
        const comp = {
            id: this._generateId(),
            type,
            x: x || 20,
            y: y || 20,
            props
        };

        // グリッドスナップ
        if (typeof gridManager !== 'undefined' && gridManager) {
            const snapped = gridManager.snap(comp.x, comp.y);
            comp.x = snapped.x;
            comp.y = snapped.y;
        }

        const doAdd = () => {
            this.components.push(comp);
            this._renderAll();
            this._notifyChange();
        };

        const doRemove = () => {
            this.components = this.components.filter(c => c.id !== comp.id);
            this._renderAll();
            this._notifyChange();
        };

        doAdd();

        // 履歴記録
        if (typeof historyManager !== 'undefined') {
            historyManager.record({
                type: 'add',
                description: `Add ${type}`,
                undo: doRemove,
                redo: doAdd
            });
        }

        this.selectComponent(comp.id);
        return comp;
    }

    /**
     * コンポーネントを削除（Undo対応）
     */
    removeComponent(id) {
        const comp = this.components.find(c => c.id === id);
        if (!comp) return;

        const snapshot = JSON.parse(JSON.stringify(comp));
        const doRemove = () => {
            this.components = this.components.filter(c => c.id !== id);
            if (this.selectedId === id) {
                this.selectedId = null;
                this._notifySelect(null);
            }
            this._renderAll();
            this._notifyChange();
        };

        const doAdd = () => {
            this.components.push(JSON.parse(JSON.stringify(snapshot)));
            this._renderAll();
            this._notifyChange();
        };

        doRemove();

        if (typeof historyManager !== 'undefined') {
            historyManager.record({
                type: 'remove',
                description: `Remove ${comp.type}`,
                undo: doAdd,
                redo: doRemove
            });
        }
    }

    /**
     * コンポーネントを移動（Undo対応）
     */
    moveComponent(id, newX, newY) {
        const comp = this.components.find(c => c.id === id);
        if (!comp) return;

        const oldX = comp.x;
        const oldY = comp.y;

        // グリッドスナップ
        if (typeof gridManager !== 'undefined' && gridManager) {
            const snapped = gridManager.snap(newX, newY);
            newX = snapped.x;
            newY = snapped.y;
        }

        comp.x = newX;
        comp.y = newY;
        this._updateComponentElement(comp);
        this._notifyChange();

        // 最後のmoveアクションを更新（連続移動を1アクションにまとめる）
        if (typeof historyManager !== 'undefined') {
            const last = historyManager.undoStack[historyManager.undoStack.length - 1];
            if (last && last.type === 'move' && last.compId === id) {
                last.newX = newX;
                last.newY = newY;
                last.redo = () => {
                    comp.x = newX;
                    comp.y = newY;
                    this._updateComponentElement(comp);
                    this._notifyChange();
                };
                return;
            }

            const capturedOldX = oldX;
            const capturedOldY = oldY;
            historyManager.record({
                type: 'move',
                compId: id,
                description: `Move ${comp.type}`,
                newX,
                newY,
                undo: () => {
                    comp.x = capturedOldX;
                    comp.y = capturedOldY;
                    this._updateComponentElement(comp);
                    this._notifyChange();
                },
                redo: () => {
                    comp.x = newX;
                    comp.y = newY;
                    this._updateComponentElement(comp);
                    this._notifyChange();
                }
            });
        }
    }

    /**
     * プロパティを更新（Undo対応）
     */
    updateProps(id, newProps) {
        const comp = this.components.find(c => c.id === id);
        if (!comp) return;

        const oldProps = JSON.parse(JSON.stringify(comp.props));
        comp.props = Object.assign({}, comp.props, newProps);
        this._updateComponentElement(comp);
        this._notifyChange();
        this._notifySelect(comp);

        if (typeof historyManager !== 'undefined') {
            historyManager.record({
                type: 'props',
                description: `Edit ${comp.type}`,
                undo: () => {
                    comp.props = JSON.parse(JSON.stringify(oldProps));
                    this._updateComponentElement(comp);
                    this._notifyChange();
                    if (this.selectedId === id) this._notifySelect(comp);
                },
                redo: () => {
                    comp.props = Object.assign({}, comp.props, newProps);
                    this._updateComponentElement(comp);
                    this._notifyChange();
                    if (this.selectedId === id) this._notifySelect(comp);
                }
            });
        }
    }

    /**
     * コンポーネントを選択
     */
    selectComponent(id) {
        this.selectedId = id;
        // 選択状態をビジュアルで更新
        document.querySelectorAll('.canvas-component').forEach(el => {
            el.classList.remove('selected');
        });
        if (id) {
            const el = document.getElementById(`comp-${id}`);
            if (el) el.classList.add('selected');
        }
        const comp = id ? this.components.find(c => c.id === id) : null;
        this._notifySelect(comp);
    }

    /**
     * 選択解除
     */
    deselect() {
        this.selectComponent(null);
    }

    /**
     * コンポーネント一覧を取得
     */
    getComponents() {
        return JSON.parse(JSON.stringify(this.components));
    }

    /**
     * コンポーネント一覧を読込（テンプレート/保存データから）
     */
    loadComponents(components) {
        this.components = JSON.parse(JSON.stringify(components || []));
        this.selectedId = null;
        this._renderAll();
        this._notifyChange();
        this._notifySelect(null);
        if (typeof historyManager !== 'undefined') {
            historyManager.clear();
        }
    }

    /**
     * プロジェクトを読込
     */
    loadProject(data) {
        this.projectName = data.name || 'Untitled Project';
        this.projectDescription = data.description || '';
        this.loadComponents(data.components || []);

        // プロジェクト名表示更新
        const nameEl = document.getElementById('project-name');
        if (nameEl) nameEl.value = this.projectName;

        // キャンバス状態復元
        if (data.canvasState && typeof canvasManager !== 'undefined' && canvasManager) {
            canvasManager.setState(data.canvasState);
        }
    }

    /**
     * キャンバス状態を取得
     */
    getCanvasState() {
        if (typeof canvasManager !== 'undefined' && canvasManager) {
            return canvasManager.getState();
        }
        return {};
    }

    /**
     * 全コンポーネントをクリア
     */
    clearAll() {
        const old = this.getComponents();
        this.loadComponents([]);
        if (typeof historyManager !== 'undefined') {
            historyManager.record({
                type: 'clear',
                description: 'Clear All',
                undo: () => this.loadComponents(old),
                redo: () => this.loadComponents([])
            });
        }
    }

    // -------------------------------------------------------
    // レンダリング
    // -------------------------------------------------------

    /**
     * 全コンポーネントを再レンダリング
     */
    _renderAll() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        // グリッドオーバーレイは残す
        const gridOverlay = document.getElementById('grid-overlay');

        // コンポーネント要素をすべて削除
        canvas.querySelectorAll('.canvas-component').forEach(el => el.remove());

        // 再描画
        this.components.forEach(comp => {
            this._createComponentElement(comp);
        });

        // 選択状態を復元
        if (this.selectedId) {
            const el = document.getElementById(`comp-${this.selectedId}`);
            if (el) el.classList.add('selected');
        }
    }

    /**
     * コンポーネント要素を作成してキャンバスに追加
     */
    _createComponentElement(comp) {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        const wrapper = document.createElement('div');
        wrapper.id = `comp-${comp.id}`;
        wrapper.className = 'canvas-component';
        wrapper.style.cssText = `
            position:absolute;
            left:${comp.x}px;
            top:${comp.y}px;
            cursor:move;
            z-index:10;
        `;
        wrapper.innerHTML = renderComponent(comp.type, comp.props);

        // クリックで選択
        wrapper.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.selectComponent(comp.id);
            this._startDrag(e, comp);
        });

        canvas.appendChild(wrapper);
    }

    /**
     * コンポーネント要素を更新
     */
    _updateComponentElement(comp) {
        const wrapper = document.getElementById(`comp-${comp.id}`);
        if (!wrapper) return;
        wrapper.style.left = `${comp.x}px`;
        wrapper.style.top = `${comp.y}px`;
        wrapper.innerHTML = renderComponent(comp.type, comp.props);
    }

    // -------------------------------------------------------
    // ドラッグ
    // -------------------------------------------------------

    _startDrag(e, comp) {
        if (typeof canvasManager !== 'undefined' && canvasManager && canvasManager.spacePressed) return;

        const scale = (typeof canvasManager !== 'undefined' && canvasManager) ? canvasManager.scale : 1;
        const startX = e.clientX;
        const startY = e.clientY;
        const startCompX = comp.x;
        const startCompY = comp.y;
        let hasMoved = false;

        const onMove = (ev) => {
            const dx = (ev.clientX - startX) / scale;
            const dy = (ev.clientY - startY) / scale;
            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                hasMoved = true;
                comp.x = startCompX + dx;
                comp.y = startCompY + dy;
                const el = document.getElementById(`comp-${comp.id}`);
                if (el) {
                    el.style.left = `${comp.x}px`;
                    el.style.top = `${comp.y}px`;
                }
            }
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            if (hasMoved) {
                this.moveComponent(comp.id, comp.x, comp.y);
            }
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    // -------------------------------------------------------
    // コード出力
    // -------------------------------------------------------

    _refreshCodeOutput() {
        const outputEl = document.getElementById('code-output');
        if (!outputEl || typeof codeGenerator === 'undefined') return;
        outputEl.textContent = codeGenerator.generate(this.components);
    }
}

// グローバルインスタンス
const editor = new Editor();

/**
 * ドロップゾーンのセットアップ
 */
function setupDropZone() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('component-type');
        if (!type) return;

        const rect = canvas.getBoundingClientRect();
        const scale = (typeof canvasManager !== 'undefined' && canvasManager) ? canvasManager.scale : 1;
        const panX = (typeof canvasManager !== 'undefined' && canvasManager) ? canvasManager.panX : 0;
        const panY = (typeof canvasManager !== 'undefined' && canvasManager) ? canvasManager.panY : 0;
        const x = (e.clientX - rect.left - panX) / scale;
        const y = (e.clientY - rect.top - panY) / scale;

        editor.addComponent(type, x, y);
    });

    // キャンバス空白クリックで選択解除
    canvas.addEventListener('mousedown', (e) => {
        if (e.target === canvas || e.target.id === 'grid-overlay') {
            editor.deselect();
        }
    });
}

/**
 * コンポーネントパレットのセットアップ
 */
function setupComponentPalette() {
    const palette = document.getElementById('component-palette');
    if (!palette) return;

    const categories = getComponentsByCategory();
    const categoryNames = {
        basic: '基本コンポーネント',
        layout: 'レイアウト',
        navigation: 'ナビゲーション'
    };

    Object.entries(categories).forEach(([cat, comps]) => {
        const section = document.createElement('div');
        section.className = 'palette-section';

        const title = document.createElement('div');
        title.className = 'palette-section-title';
        title.textContent = categoryNames[cat] || cat;
        section.appendChild(title);

        comps.forEach(comp => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            item.draggable = true;
            item.dataset.type = comp.key;
            item.innerHTML = `<span class="palette-icon">${comp.icon}</span><span class="palette-name">${comp.name}</span>`;

            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('component-type', comp.key);
                e.dataTransfer.effectAllowed = 'copy';
            });

            item.addEventListener('click', () => {
                editor.addComponent(comp.key, 50, 50 + editor.components.length * 10);
            });

            section.appendChild(item);
        });

        palette.appendChild(section);
    });
}

/**
 * プロパティパネルのセットアップ
 */
function setupPropertiesPanel() {
    editor.onSelect((comp) => {
        const panel = document.getElementById('properties-panel');
        const emptyMsg = document.getElementById('properties-empty');
        const deleteBtn = document.getElementById('btn-delete-component');
        if (!panel) return;

        // 既存フィールドをクリア
        const fields = document.getElementById('property-fields');
        if (fields) fields.innerHTML = '';

        if (!comp) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (deleteBtn) deleteBtn.disabled = true;
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';
        if (deleteBtn) deleteBtn.disabled = false;

        // コンポーネントタイプ表示
        const typeLabel = document.getElementById('selected-component-type');
        if (typeLabel) typeLabel.textContent = comp.type;

        // プロパティフィールド生成
        if (!fields) return;
        Object.entries(comp.props).forEach(([key, value]) => {
            const row = document.createElement('div');
            row.className = 'property-row';

            const label = document.createElement('label');
            label.textContent = key;
            label.htmlFor = `prop-${key}`;
            row.appendChild(label);

            let input;
            if (typeof value === 'boolean') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = value;
                input.id = `prop-${key}`;
                input.addEventListener('change', () => {
                    editor.updateProps(comp.id, { [key]: input.checked });
                });
            } else if (key === 'backgroundColor' || key === 'textColor' || key === 'activeColor' || key === 'iconColor' || key === 'dividerColor') {
                input = document.createElement('input');
                input.type = 'color';
                input.value = value.startsWith('#') ? value : '#6200EE';
                input.id = `prop-${key}`;
                input.addEventListener('change', () => {
                    editor.updateProps(comp.id, { [key]: input.value });
                });
            } else if (typeof value === 'number') {
                input = document.createElement('input');
                input.type = 'number';
                input.value = value;
                input.id = `prop-${key}`;
                input.addEventListener('change', () => {
                    editor.updateProps(comp.id, { [key]: Number(input.value) });
                });
            } else {
                input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.id = `prop-${key}`;
                input.addEventListener('change', () => {
                    editor.updateProps(comp.id, { [key]: input.value });
                });
            }

            row.appendChild(input);
            fields.appendChild(row);
        });
    });
}

/**
 * トースト表示
 */
function showToast(message, duration = 2000) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}
