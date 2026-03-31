/**
 * editor.js
 * エディタ機能モジュール
 * ドラッグ&ドロップ、コンポーネント追加/削除/編集、プロパティパネル制御
 * Android No-Code Tool
 */

'use strict';

// ============================================================
// エディタ状態管理
// ============================================================
class EditorState {
  constructor() {
    this.components = [];
    this.selectedId = null;
    this.listeners = [];
    this.history = [];
    this.historyIndex = -1;
  }

  /** 変更リスナーを登録する */
  onChange(fn) {
    this.listeners.push(fn);
  }

  /** 変更を通知する */
  _notify(event) {
    this.listeners.forEach(fn => fn(event));
  }

  /** コンポーネントを追加する */
  addComponent(comp) {
    this.components.push(comp);
    this._saveHistory();
    this._notify({ type: 'add', comp });
  }

  /** コンポーネントを削除する */
  removeComponent(id) {
    const idx = this.components.findIndex(c => c.id === id);
    if (idx === -1) return;
    this.components.splice(idx, 1);
    if (this.selectedId === id) this.selectedId = null;
    this._saveHistory();
    this._notify({ type: 'remove', id });
  }

  /** プロパティを更新する */
  updateProps(id, key, value) {
    const comp = this.components.find(c => c.id === id);
    if (!comp) return;
    comp.props[key] = value;
    this._saveHistory();
    this._notify({ type: 'update', id, key, value });
  }

  /** コンポーネントを選択する */
  select(id) {
    this.selectedId = id;
    this._notify({ type: 'select', id });
  }

  /** 選択を解除する */
  deselect() {
    this.selectedId = null;
    this._notify({ type: 'deselect' });
  }

  /** 選択中のコンポーネントを取得する */
  getSelected() {
    return this.components.find(c => c.id === this.selectedId) || null;
  }

  /** 全コンポーネントをクリアする */
  clearComponents() {
    this.components = [];
    this.selectedId = null;
    this._saveHistory();
    this._notify({ type: 'clear' });
  }

  /** 順序を変更する (ドラッグ並び替え用) */
  moveComponent(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const [comp] = this.components.splice(fromIndex, 1);
    this.components.splice(toIndex, 0, comp);
    this._saveHistory();
    this._notify({ type: 'reorder' });
  }

  // ---- 履歴管理 ----

  _saveHistory() {
    // 現在位置より先の履歴を切り捨て
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.components.map(c => c.toJSON()))));
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this._restoreHistory();
    this._notify({ type: 'undo' });
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this._restoreHistory();
    this._notify({ type: 'redo' });
  }

  _restoreHistory() {
    const snapshot = this.history[this.historyIndex];
    this.components = snapshot.map(data => {
      const comp = createComponent(data.type, data.props);
      comp.id = data.id;
      return comp;
    });
    this.selectedId = null;
  }
}

// ============================================================
// ドラッグ&ドロップ ドロップゾーン管理
// ============================================================
class DragDropManager {
  constructor(editor, canvasEl) {
    this.editor = editor;
    this.canvasEl = canvasEl;
    this._dragType = null;
    this._dragFromCanvas = null;
    this._dragOverIndex = null;

    this._bindCanvas();
  }

  /** パレットアイテムの dragstart をセットアップする */
  setupPaletteItem(el, type) {
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', e => {
      this._dragType = type;
      this._dragFromCanvas = null;
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', type);
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      this._dragType = null;
    });
  }

  /** キャンバス内コンポーネントアイテムのドラッグをセットアップする */
  setupCanvasItem(el, compId) {
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', e => {
      this._dragFromCanvas = compId;
      this._dragType = null;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', compId);
      el.classList.add('dragging');
      e.stopPropagation();
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      this._dragFromCanvas = null;
      this._clearDropIndicators();
    });
  }

  _bindCanvas() {
    const canvas = this.canvasEl;

    canvas.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = this._dragFromCanvas ? 'move' : 'copy';
      this._updateDropIndicator(e);
    });

    canvas.addEventListener('dragleave', e => {
      if (!canvas.contains(e.relatedTarget)) {
        this._clearDropIndicators();
      }
    });

    canvas.addEventListener('drop', e => {
      e.preventDefault();
      this._clearDropIndicators();

      const dropIndex = this._calcDropIndex(e);

      if (this._dragFromCanvas) {
        // キャンバス内の並び替え
        const fromIndex = this.editor.components.findIndex(c => c.id === this._dragFromCanvas);
        if (fromIndex !== -1 && fromIndex !== dropIndex) {
          this.editor.moveComponent(fromIndex, dropIndex);
        }
      } else if (this._dragType) {
        // パレットから新規追加
        const comp = createComponent(this._dragType);
        // 指定位置に挿入
        this.editor.components.splice(dropIndex, 0, comp);
        this.editor._saveHistory();
        this.editor._notify({ type: 'add', comp });
        this.editor.select(comp.id);
      }
      this._dragType = null;
      this._dragFromCanvas = null;
    });
  }

  _calcDropIndex(e) {
    const items = Array.from(this.canvasEl.querySelectorAll('.canvas-component'));
    if (items.length === 0) return 0;

    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) return i;
    }
    return items.length;
  }

  _updateDropIndicator(e) {
    this._clearDropIndicators();
    const index = this._calcDropIndex(e);
    const items = Array.from(this.canvasEl.querySelectorAll('.canvas-component'));
    if (index < items.length) {
      items[index].classList.add('drop-before');
    } else if (items.length > 0) {
      items[items.length - 1].classList.add('drop-after');
    } else {
      this.canvasEl.classList.add('drop-empty');
    }
  }

  _clearDropIndicators() {
    this.canvasEl.querySelectorAll('.drop-before, .drop-after').forEach(el => {
      el.classList.remove('drop-before', 'drop-after');
    });
    this.canvasEl.classList.remove('drop-empty');
  }
}

// ============================================================
// UI レンダリング
// ============================================================
class EditorUI {
  constructor(state, dragDrop, elements) {
    this.state = state;
    this.dragDrop = dragDrop;
    this.els = elements; // { canvas, propPanel, propContent, codeXml, codeKotlin, menuXml }

    state.onChange(event => this._handleStateChange(event));
  }

  _handleStateChange(event) {
    switch (event.type) {
      case 'add':
      case 'remove':
      case 'reorder':
      case 'clear':
      case 'undo':
      case 'redo':
        this.renderCanvas();
        this.renderPropertyPanel();
        this.updateLivePreview();
        break;
      case 'update':
        this.renderCanvas();
        this.renderPropertyPanel();
        this.updateLivePreview();
        break;
      case 'select':
      case 'deselect':
        this._highlightSelected();
        this.renderPropertyPanel();
        break;
    }
  }

  /** キャンバスを再描画する */
  renderCanvas() {
    const canvas = this.els.canvas;
    canvas.innerHTML = '';

    if (this.state.components.length === 0) {
      canvas.innerHTML = `
        <div class="canvas-empty">
          <span class="canvas-empty-icon">📱</span>
          <p>コンポーネントをここにドラッグしてください</p>
        </div>`;
      return;
    }

    this.state.components.forEach((comp, idx) => {
      const el = this._createCanvasItem(comp, idx);
      canvas.appendChild(el);
    });
  }

  /** キャンバスアイテムの DOM 要素を作成する */
  _createCanvasItem(comp, idx) {
    const el = document.createElement('div');
    el.className = 'canvas-component';
    el.dataset.id = comp.id;
    el.dataset.index = idx;
    if (this.state.selectedId === comp.id) el.classList.add('selected');

    const preview = this._buildPreviewHTML(comp);
    const label = COMPONENT_REGISTRY[comp.type]?.label || comp.type;
    const icon  = COMPONENT_REGISTRY[comp.type]?.icon  || '📦';

    el.innerHTML = `
      <div class="comp-header">
        <span class="comp-icon">${icon}</span>
        <span class="comp-label">${label}</span>
        <span class="comp-id">#${comp.props.id || comp.id}</span>
        <button class="comp-delete" title="削除" data-id="${comp.id}">✕</button>
      </div>
      <div class="comp-preview">${preview}</div>`;

    // 選択
    el.addEventListener('click', e => {
      if (e.target.classList.contains('comp-delete')) return;
      this.state.select(comp.id);
    });

    // 削除ボタン
    el.querySelector('.comp-delete').addEventListener('click', e => {
      e.stopPropagation();
      this.state.removeComponent(comp.id);
    });

    // ドラッグ
    this.dragDrop.setupCanvasItem(el, comp.id);

    return el;
  }

  /** コンポーネントのプレビュー HTML を生成する */
  _buildPreviewHTML(comp) {
    const p = comp.props;
    switch (comp.type) {
      case 'Button':
        return `<button class="preview-button" style="background:${p.backgroundColor || '#6200EE'};color:${p.textColor || '#FFF'};font-size:${p.textSize || '14sp'}">${p.text || 'Button'}</button>`;
      case 'TextView':
        return `<span class="preview-text" style="color:${p.textColor || '#000'};font-size:${p.textSize || '16sp'};font-style:${p.fontStyle === 'italic' ? 'italic' : 'normal'};font-weight:${(p.fontStyle || '').includes('bold') ? 'bold' : 'normal'}">${p.text || ''}</span>`;
      case 'EditText':
        return `<input class="preview-input" type="text" placeholder="${p.hint || ''}" disabled/>`;
      case 'ImageView':
        return `<div class="preview-image">🖼 ${p.src || 'image'}</div>`;
      case 'ListView':
        return `<div class="preview-list"><div class="preview-list-item">▸ アイテム 1</div><div class="preview-list-item">▸ アイテム 2</div><div class="preview-list-item">▸ アイテム 3</div></div>`;
      case 'RecyclerView':
        return `<div class="preview-list"><div class="preview-list-item">♻ アイテム 1</div><div class="preview-list-item">♻ アイテム 2</div></div>`;
      case 'OptionsMenu': {
        const items = (p.items || '').split(',').map(s => s.trim()).filter(Boolean);
        return `<div class="preview-menu">☰ ${items.join(' | ')}</div>`;
      }
      case 'LinearLayout':
        return `<div class="preview-layout">📐 LinearLayout (${p.orientation || 'vertical'})</div>`;
      default:
        return `<span class="preview-unknown">${comp.type}</span>`;
    }
  }

  /** 選択ハイライトのみ更新する */
  _highlightSelected() {
    this.els.canvas.querySelectorAll('.canvas-component').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === this.state.selectedId);
    });
  }

  /** プロパティパネルを再描画する */
  renderPropertyPanel() {
    const comp = this.state.getSelected();
    const container = this.els.propContent;

    if (!comp) {
      container.innerHTML = '<p class="prop-empty">コンポーネントを選択してください</p>';
      return;
    }

    const schema = getPropertySchema(comp.type);
    let html = `<div class="prop-title">${COMPONENT_REGISTRY[comp.type]?.label || comp.type}</div>`;

    schema.forEach(field => {
      const val = comp.props[field.key] !== undefined ? comp.props[field.key] : '';
      html += `<div class="prop-row">
        <label class="prop-label">${field.label}</label>`;

      if (field.type === 'select') {
        html += `<select class="prop-input" data-key="${field.key}">`;
        (field.options || []).forEach(opt => {
          html += `<option value="${opt}" ${opt === val ? 'selected' : ''}>${opt}</option>`;
        });
        html += `</select>`;
      } else if (field.type === 'color') {
        const colorVal = val.startsWith('#') ? val : '#000000';
        html += `<div class="prop-color-row">
          <input class="prop-input prop-color" type="color" data-key="${field.key}" value="${colorVal}"/>
          <input class="prop-input prop-color-text" type="text" data-key="${field.key}" value="${val}" placeholder="#RRGGBB or @color/..."/>
        </div>`;
      } else if (field.type === 'dimension') {
        html += `<select class="prop-input" data-key="${field.key}">
          <option value="match_parent" ${val === 'match_parent' ? 'selected' : ''}>match_parent</option>
          <option value="wrap_content" ${val === 'wrap_content' ? 'selected' : ''}>wrap_content</option>
          <option value="custom" ${val !== 'match_parent' && val !== 'wrap_content' ? 'selected' : ''}>カスタム値</option>
        </select>
        <input class="prop-input prop-dim-custom" type="text" data-key="${field.key}" value="${val}"
          placeholder="例: 100dp" style="${val !== 'match_parent' && val !== 'wrap_content' ? '' : 'display:none'}"/>`;
      } else {
        html += `<input class="prop-input" type="text" data-key="${field.key}" value="${val}"/>`;
      }

      html += `</div>`;
    });

    container.innerHTML = html;

    // イベントリスナー設定
    container.querySelectorAll('.prop-input').forEach(input => {
      const key = input.dataset.key;
      if (!key) return;

      if (input.tagName === 'SELECT') {
        input.addEventListener('change', () => {
          if (input.nextElementSibling?.classList.contains('prop-dim-custom')) {
            input.nextElementSibling.style.display = input.value === 'custom' ? '' : 'none';
          }
          if (input.value !== 'custom') {
            this.state.updateProps(comp.id, key, input.value);
          }
        });
      } else if (input.type === 'color') {
        input.addEventListener('input', () => {
          const textInput = input.nextElementSibling;
          if (textInput) textInput.value = input.value;
          this.state.updateProps(comp.id, key, input.value);
        });
      } else {
        input.addEventListener('input', () => {
          this.state.updateProps(comp.id, key, input.value);
        });
      }
    });
  }

  /** リアルタイムコードプレビューを更新する (簡易版) */
  updateLivePreview() {
    if (!this.els.codeXml || !this.els.codeKotlin) return;
    if (this.state.components.length === 0) {
      this.els.codeXml.textContent = '<!-- コンポーネントを追加するとXMLが表示されます -->';
      this.els.codeKotlin.textContent = '// コンポーネントを追加するとKotlinコードが表示されます';
      if (this.els.menuXml) this.els.menuXml.textContent = '';
      return;
    }
    const xml = generateXML(this.state.components);
    const kotlin = generateKotlin(this.state.components);
    this.els.codeXml.textContent = xml;
    this.els.codeKotlin.textContent = kotlin;

    // オプションメニューが含まれる場合
    if (this.els.menuXml) {
      const menuComp = this.state.components.find(c => c.type === 'OptionsMenu');
      if (menuComp) {
        this.els.menuXml.textContent = generateMenuXML(menuComp);
      } else {
        this.els.menuXml.textContent = '';
      }
    }
  }
}

// ============================================================
// アプリ起動
// ============================================================
function initEditor() {
  const state = new EditorState();

  const canvasEl     = document.getElementById('canvas');
  const propContent  = document.getElementById('prop-content');
  const codeXmlEl    = document.getElementById('code-xml');
  const codeKotlinEl = document.getElementById('code-kotlin');
  const menuXmlEl    = document.getElementById('code-menu-xml');

  const dragDrop = new DragDropManager(state, canvasEl);

  const ui = new EditorUI(state, dragDrop, {
    canvas: canvasEl,
    propContent: propContent,
    codeXml: codeXmlEl,
    codeKotlin: codeKotlinEl,
    menuXml: menuXmlEl,
  });

  // パレットアイテムのセットアップ
  document.querySelectorAll('.palette-item').forEach(el => {
    const type = el.dataset.type;
    if (type) dragDrop.setupPaletteItem(el, type);
    // ダブルクリックでも追加
    el.addEventListener('dblclick', () => {
      const comp = createComponent(type);
      state.addComponent(comp);
      state.select(comp.id);
    });
  });

  // 「Generate Code」ボタン
  document.getElementById('btn-generate')?.addEventListener('click', () => {
    ui.updateLivePreview();
    document.getElementById('code-panel')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Undo/Redo
  document.getElementById('btn-undo')?.addEventListener('click', () => state.undo());
  document.getElementById('btn-redo')?.addEventListener('click', () => state.redo());

  // Clear
  document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (confirm('全てのコンポーネントを削除しますか？')) state.clearComponents();
  });

  // サンプルボタン
  document.querySelectorAll('[data-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleName = btn.dataset.sample;
      const sample = ALL_SAMPLES.find(s => s.name === sampleName);
      if (sample) loadSample(sample, state);
    });
  });

  // コピーボタン
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copy;
      const el = document.getElementById(targetId);
      if (!el) return;
      navigator.clipboard.writeText(el.textContent).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'コピー完了！';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      }).catch(() => {
        alert('クリップボードへのコピーに失敗しました。コードを手動でコピーしてください。');
      });
    });
  });

  // タブ切り替え (コードパネル)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });

  // キャンバス上のクリックで選択解除
  canvasEl.addEventListener('click', e => {
    if (e.target === canvasEl) state.deselect();
  });

  // キーボードショートカット
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); state.undo(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); state.redo(); }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;
      if (state.selectedId) state.removeComponent(state.selectedId);
    }
  });

  // 初期描画
  ui.renderCanvas();
  ui.renderPropertyPanel();
  ui.updateLivePreview();

  return { state, ui, dragDrop };
}

// DOM 準備完了後に起動
document.addEventListener('DOMContentLoaded', initEditor);
