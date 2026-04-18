/**
 * Phase 1 + Phase 2 + Phase 3: Editor Core
 * Main editor logic - handles drag & drop, selection, property panel, and code generation
 */

class Editor {
  constructor() {
    this._components = [];
    this._selectedId = null;
    this._dragState = null;
    this._searchQuery = '';
    this._activeCategory = 'all';
    this._codeTabActive = 'xml';
    this._previewDevice = 'phone_portrait';
    this._gridEnabled = false;
    this._gridSize = 8;
    this._zoomLevel = 1.0;
    this._listeners = new Map();

    // Initialize after DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._init());
    } else {
      this._init();
    }
  }

  _init() {
    this._canvas = document.getElementById('canvas');
    this._palette = document.getElementById('componentPalette');
    this._propertiesPanel = document.getElementById('propertiesPanel');
    this._xmlOutput = document.getElementById('xmlOutput');
    this._kotlinOutput = document.getElementById('kotlinOutput');
    this._searchInput = document.getElementById('componentSearch');

    if (!this._canvas) return;

    // Register all components
    this._registerComponents();

    // Set up event listeners
    this._setupPaletteEvents();
    this._setupCanvasEvents();
    this._setupToolbarEvents();
    this._setupKeyboardShortcuts();

    // Set up undo/redo listeners
    undoRedoManager.subscribe(state => this._updateUndoRedoButtons(state));

    // Render palette
    this._renderPalette();

    // Load auto-save if exists
    const autoSave = projectManager.getAutoSave();
    if (autoSave && autoSave.components && autoSave.components.length > 0) {
      if (confirm('自動保存されたデータが見つかりました。復元しますか？')) {
        this._components = autoSave.components;
        this._renderCanvas();
        this._updateCode();
      }
    }

    // Start with a new project
    projectManager.newProject();
    projectManager.subscribe((evt) => {
      if (evt === 'loaded') this._renderCanvas();
    });

    this._updateCode();
    this._showWelcomeMessage();
  }

  _registerComponents() {
    if (typeof componentRegistry !== 'undefined') {
      if (typeof CORE_COMPONENTS !== 'undefined') {
        componentRegistry.registerAll(CORE_COMPONENTS);
      }
      if (typeof EXTENDED_COMPONENTS !== 'undefined') {
        componentRegistry.registerAll(EXTENDED_COMPONENTS);
      }
    }
  }

  // ---- Palette Rendering ----

  _renderPalette(query = '') {
    if (!this._palette) return;
    const registry = typeof componentRegistry !== 'undefined' ? componentRegistry : null;
    if (!registry) return;

    let components;
    if (query) {
      components = registry.search(query);
    } else if (this._activeCategory === 'all') {
      components = registry.getAll();
    } else if (this._activeCategory === 'favorites') {
      components = registry.getFavorites();
    } else if (this._activeCategory === 'recent') {
      components = registry.getRecentlyUsed();
    } else {
      components = registry.getByCategory(this._activeCategory);
    }

    this._palette.innerHTML = '';

    if (components.length === 0) {
      this._palette.innerHTML = '<div class="palette-empty">コンポーネントが見つかりません</div>';
      return;
    }

    components.forEach(comp => {
      const item = document.createElement('div');
      item.className = 'palette-item';
      item.draggable = true;
      item.dataset.type = comp.type;
      item.title = comp.label + (comp.tags ? '\nタグ: ' + comp.tags.join(', ') : '');

      const isFav = registry.isFavorite(comp.type);
      item.innerHTML = `
        <span class="palette-icon">${comp.icon || '⬛'}</span>
        <span class="palette-label">${comp.label || comp.type}</span>
        <button class="palette-fav ${isFav ? 'active' : ''}" data-type="${comp.type}" title="${isFav ? 'お気に入りから削除' : 'お気に入りに追加'}">
          ${isFav ? '★' : '☆'}
        </button>`;

      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', comp.type);
        e.dataTransfer.effectAllowed = 'copy';
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => item.classList.remove('dragging'));

      item.querySelector('.palette-fav').addEventListener('click', (e) => {
        e.stopPropagation();
        registry.toggleFavorite(comp.type);
        this._renderPalette(this._searchQuery);
      });

      // Click to add
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('palette-fav')) return;
        this._addComponent(comp.type);
      });

      this._palette.appendChild(item);
    });
  }

  // ---- Canvas Rendering ----

  _renderCanvas() {
    if (!this._canvas) return;

    if (this._components.length === 0) {
      this._canvas.innerHTML = `
        <div class="canvas-empty">
          <div class="canvas-empty-icon">📱</div>
          <div class="canvas-empty-title">コンポーネントをここにドロップ</div>
          <div class="canvas-empty-subtitle">左のパレットからコンポーネントをドラッグするか<br>クリックして追加してください</div>
        </div>`;
      return;
    }

    this._canvas.innerHTML = '';
    this._components.forEach(comp => {
      const el = this._createComponentElement(comp);
      this._canvas.appendChild(el);
    });
  }

  _createComponentElement(comp) {
    const registry = typeof componentRegistry !== 'undefined' ? componentRegistry : null;
    const def = registry ? registry.get(comp.type) : null;

    const wrapper = document.createElement('div');
    wrapper.className = `canvas-component${this._selectedId === comp.id ? ' selected' : ''}`;
    wrapper.dataset.id = comp.id;
    wrapper.dataset.type = comp.type;

    // Preview HTML
    let previewHtml = '';
    if (def && def.preview) {
      try {
        previewHtml = def.preview(comp.props);
      } catch {
        previewHtml = `<div class="preview-error">${comp.type}</div>`;
      }
    } else {
      previewHtml = `<div class="preview-placeholder">${comp.type}</div>`;
    }

    wrapper.innerHTML = `
      <div class="component-type-label">${def ? def.icon || '' : ''} ${comp.type}</div>
      <div class="component-preview">${previewHtml}</div>
      <div class="component-actions">
        <button class="btn-action btn-move-up" title="上に移動">↑</button>
        <button class="btn-action btn-move-down" title="下に移動">↓</button>
        <button class="btn-action btn-duplicate" title="複製">⧉</button>
        <button class="btn-action btn-delete" title="削除">🗑</button>
      </div>`;

    // Selection
    wrapper.addEventListener('click', (e) => {
      if (e.target.closest('.component-actions')) return;
      this._selectComponent(comp.id);
    });

    // Action buttons
    wrapper.querySelector('.btn-move-up').addEventListener('click', (e) => {
      e.stopPropagation();
      this._moveComponent(comp.id, -1);
    });
    wrapper.querySelector('.btn-move-down').addEventListener('click', (e) => {
      e.stopPropagation();
      this._moveComponent(comp.id, 1);
    });
    wrapper.querySelector('.btn-duplicate').addEventListener('click', (e) => {
      e.stopPropagation();
      this._duplicateComponent(comp.id);
    });
    wrapper.querySelector('.btn-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      this._deleteComponent(comp.id);
    });

    return wrapper;
  }

  // ---- Component Management ----

  _addComponent(type, props = {}) {
    const registry = typeof componentRegistry !== 'undefined' ? componentRegistry : null;
    if (!registry) return;

    const instance = registry.createInstance(type, props);
    const cmd = new AddComponentCommand(this._components, instance);
    undoRedoManager.execute(cmd);
    registry.recordUsage(type);
    this._selectComponent(instance.id);
    this._renderCanvas();
    this._updateCode();
    projectManager.setComponents(this._components);
  }

  _deleteComponent(id) {
    const cmd = new RemoveComponentCommand(this._components, id);
    undoRedoManager.execute(cmd);
    if (this._selectedId === id) this._selectedId = null;
    this._renderCanvas();
    this._renderProperties();
    this._updateCode();
    projectManager.setComponents(this._components);
  }

  _duplicateComponent(id) {
    const original = this._components.find(c => c.id === id);
    if (!original) return;
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = `${original.type.toLowerCase()}_${Date.now()}`;
    copy.props = { ...copy.props, id: copy.props.id ? copy.props.id + '_copy' : '' };
    const idx = this._components.findIndex(c => c.id === id);
    const cmd = new AddComponentCommand(this._components, copy, idx + 1);
    undoRedoManager.execute(cmd);
    this._selectComponent(copy.id);
    this._renderCanvas();
    this._updateCode();
    projectManager.setComponents(this._components);
  }

  _moveComponent(id, direction) {
    const idx = this._components.findIndex(c => c.id === id);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= this._components.length) return;
    const cmd = new MoveComponentCommand(this._components, idx, newIdx);
    undoRedoManager.execute(cmd);
    this._renderCanvas();
    this._updateCode();
    projectManager.setComponents(this._components);
  }

  _selectComponent(id) {
    this._selectedId = id;
    this._renderCanvas();
    this._renderProperties();
    // Scroll component into view
    const el = this._canvas.querySelector(`[data-id="${id}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---- Properties Panel ----

  _renderProperties() {
    if (!this._propertiesPanel) return;

    if (!this._selectedId) {
      this._propertiesPanel.innerHTML = `
        <div class="properties-empty">
          <div>コンポーネントを選択してください</div>
          <div class="properties-empty-hint">クリックして選択すると<br>プロパティを編集できます</div>
        </div>`;
      return;
    }

    const comp = this._components.find(c => c.id === this._selectedId);
    if (!comp) return;

    const registry = typeof componentRegistry !== 'undefined' ? componentRegistry : null;
    const def = registry ? registry.get(comp.type) : null;
    const schema = def && def.propertySchema ? def.propertySchema : this._getDefaultSchema(comp);

    this._propertiesPanel.innerHTML = `
      <div class="properties-header">
        <span class="properties-type-icon">${def ? def.icon || '' : ''}</span>
        <span class="properties-type-name">${comp.type}</span>
      </div>
      <div class="properties-form" id="propsForm"></div>`;

    const form = document.getElementById('propsForm');
    schema.forEach(field => {
      const fieldEl = this._createPropertyField(field, comp.props[field.key], (value) => {
        const cmd = new UpdatePropsCommand(comp, { [field.key]: value });
        undoRedoManager.execute(cmd);
        this._renderCanvas();
        this._updateCode();
        projectManager.setComponents(this._components);
      });
      form.appendChild(fieldEl);
    });

    // MapView-specific: show marker management panel
    if (comp.type === 'MapView') {
      this._renderMapViewExtra(form, comp);
    }
  }

  _createPropertyField(field, value, onChange) {
    const group = document.createElement('div');
    group.className = 'prop-group';

    const label = document.createElement('label');
    label.className = 'prop-label';
    label.textContent = field.label;

    let input;

    switch (field.type) {
      case 'boolean':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'prop-checkbox';
        input.checked = !!value;
        input.addEventListener('change', () => onChange(input.checked));
        group.appendChild(label);
        group.appendChild(input);
        return group;

      case 'select':
        input = document.createElement('select');
        input.className = 'prop-select';
        (field.options || []).forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          option.selected = opt === value;
          input.appendChild(option);
        });
        input.addEventListener('change', () => onChange(input.value));
        break;

      case 'color':
        input = document.createElement('div');
        input.className = 'prop-color-row';
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.className = 'prop-color-picker';
        colorPicker.value = value && value.startsWith('#') ? value.substring(0, 7) : '#000000';
        const colorText = document.createElement('input');
        colorText.type = 'text';
        colorText.className = 'prop-color-text';
        colorText.value = value || '';
        colorPicker.addEventListener('input', () => {
          colorText.value = colorPicker.value;
          onChange(colorPicker.value);
        });
        colorText.addEventListener('change', () => {
          onChange(colorText.value);
          if (colorText.value.startsWith('#')) colorPicker.value = colorText.value.substring(0, 7);
        });
        input.appendChild(colorPicker);
        input.appendChild(colorText);
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.className = 'prop-textarea';
        input.value = value || '';
        input.rows = 3;
        input.addEventListener('change', () => onChange(input.value));
        break;

      case 'number':
        input = document.createElement('input');
        input.type = 'number';
        input.className = 'prop-input';
        input.value = value !== undefined ? value : '';
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        input.addEventListener('change', () => onChange(Number(input.value)));
        break;

      case 'slider': {
        input = document.createElement('div');
        input.className = 'prop-slider-row';
        input.style.display = 'flex';
        input.style.alignItems = 'center';
        input.style.gap = '8px';
        const sliderEl = document.createElement('input');
        sliderEl.type = 'range';
        sliderEl.className = 'prop-input';
        sliderEl.style.flex = '1';
        sliderEl.min  = field.min  !== undefined ? field.min  : 0;
        sliderEl.max  = field.max  !== undefined ? field.max  : 100;
        sliderEl.step = field.step !== undefined ? field.step : 1;
        sliderEl.value = value !== undefined ? value : sliderEl.min;
        const sliderVal = document.createElement('span');
        sliderVal.style.minWidth = '28px';
        sliderVal.style.textAlign = 'right';
        sliderVal.style.fontSize = '12px';
        sliderVal.textContent = sliderEl.value;
        sliderEl.addEventListener('input', () => {
          sliderVal.textContent = sliderEl.value;
          onChange(Number(sliderEl.value));
        });
        input.appendChild(sliderEl);
        input.appendChild(sliderVal);
        break;
      }

      default: // text, dimension
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'prop-input';
        input.value = value !== undefined ? value : '';
        if (field.placeholder) input.placeholder = field.placeholder;
        input.addEventListener('change', () => onChange(input.value));
    }

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }

  _getDefaultSchema(comp) {
    return [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
    ];
  }

  // ---- MapView Extra: Marker Management Panel ----

  _renderMapViewExtra(form, comp) {
    if (typeof markerManager === 'undefined') return;
    const mapId = comp.props && comp.props.id || '';

    const sep = document.createElement('hr');
    sep.style.cssText = 'margin:12px 0;border:none;border-top:1px solid var(--divider,#eee);';
    form.appendChild(sep);

    const title = document.createElement('div');
    title.className = 'maps-props-section-title';
    title.textContent = 'マーカー管理';
    title.style.cssText = 'font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--on-surface-secondary);margin-bottom:8px;';
    form.appendChild(title);

    const listEl = document.createElement('div');
    listEl.id = 'mapMarkerList_' + (mapId || 'default');
    listEl.className = 'marker-list';
    form.appendChild(listEl);

    const addBtn = document.createElement('button');
    addBtn.className = 'marker-add-btn';
    addBtn.textContent = '＋ マーカーを追加';
    addBtn.addEventListener('click', () => {
      const modal = document.getElementById('markerEditorModal');
      if (modal) {
        modal.dataset.mapId = mapId;
        document.getElementById('markerEditorModalTitle').textContent = '📍 マーカーを追加';
        // Reset form
        ['markerTitleInput','markerSnippetInput'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        const latEl = document.getElementById('markerLatInput');
        const lngEl = document.getElementById('markerLngInput');
        // Default to the MapView component's current center position
        if (latEl) latEl.value = comp.props && comp.props.lat !== undefined ? comp.props.lat : 35.6762;
        if (lngEl) lngEl.value = comp.props && comp.props.lng !== undefined ? comp.props.lng : 139.6503;
        modal.style.display = 'flex';
      }
    });
    form.appendChild(addBtn);

    // Subscribe to marker updates
    if (!this._markerUnsub) this._markerUnsub = {};
    if (this._markerUnsub[mapId]) this._markerUnsub[mapId]();
    this._markerUnsub[mapId] = markerManager.subscribe(() => {
      this._renderMarkerList(listEl, mapId);
      this._updateCode();
    });

    this._renderMarkerList(listEl, mapId);
  }

  _renderMarkerList(listEl, mapId) {
    if (!listEl || typeof markerManager === 'undefined') return;
    const markers = markerManager.getMarkers(mapId);
    if (markers.length === 0) {
      listEl.innerHTML = '<div style="font-size:12px;color:var(--on-surface-secondary);padding:6px 0;">マーカーはまだ追加されていません</div>';
      return;
    }
    listEl.innerHTML = '';
    markers.forEach(m => {
      const item = document.createElement('div');
      item.className = 'marker-item';
      item.innerHTML = `
        <span class="marker-item-icon">📍</span>
        <div class="marker-item-info">
          <div class="marker-item-title">${this._escapeHtml(m.title)}</div>
          <div class="marker-item-coords">${m.lat}, ${m.lng}</div>
        </div>
        <div class="marker-item-actions">
          <button class="marker-item-btn delete" data-id="${m.id}" title="削除">🗑</button>
        </div>`;
      item.querySelector('.delete').addEventListener('click', () => {
        markerManager.removeMarker(mapId, m.id);
      });
      listEl.appendChild(item);
    });
  }

  _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---- Code Generation ----

  _updateCode() {
    const registry = typeof componentRegistry !== 'undefined' ? componentRegistry : null;
    const codeGen = registry ? new CodeGenerator(registry) : null;
    if (!codeGen) return;

    const project = projectManager.getCurrentProject();
    const options = project ? {
      rootLayout: project.settings.rootLayout,
      orientation: project.settings.orientation,
      packageName: project.packageName,
      appName: project.appName,
      useViewBinding: project.settings.useViewBinding,
    } : {};

    // XML
    if (this._xmlOutput) {
      this._xmlOutput.textContent = codeGen.generateXml(this._components, options);
    }

    // Kotlin
    if (this._kotlinOutput) {
      this._kotlinOutput.textContent = codeGen.generateKotlin(this._components, options);
    }
  }

  // ---- Setup Events ----

  _setupPaletteEvents() {
    if (this._searchInput) {
      this._searchInput.addEventListener('input', (e) => {
        this._searchQuery = e.target.value;
        this._renderPalette(this._searchQuery);
      });
    }

    // Category buttons
    document.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._activeCategory = btn.dataset.category;
        this._searchQuery = '';
        if (this._searchInput) this._searchInput.value = '';
        this._renderPalette();
      });
    });
  }

  _setupCanvasEvents() {
    if (!this._canvas) return;

    this._canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this._canvas.classList.add('drag-over');
    });

    this._canvas.addEventListener('dragleave', (e) => {
      if (!this._canvas.contains(e.relatedTarget)) {
        this._canvas.classList.remove('drag-over');
      }
    });

    this._canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      this._canvas.classList.remove('drag-over');
      const type = e.dataTransfer.getData('text/plain');
      if (type) this._addComponent(type);
    });
  }

  _setupToolbarEvents() {
    // Undo/Redo
    const undoBtn = document.getElementById('btnUndo');
    const redoBtn = document.getElementById('btnRedo');
    if (undoBtn) undoBtn.addEventListener('click', () => {
      undoRedoManager.undo();
      this._renderCanvas();
      this._renderProperties();
      this._updateCode();
    });
    if (redoBtn) redoBtn.addEventListener('click', () => {
      undoRedoManager.redo();
      this._renderCanvas();
      this._renderProperties();
      this._updateCode();
    });

    // Clear canvas
    const clearBtn = document.getElementById('btnClear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (confirm('キャンバスをクリアしますか？')) {
        this._components = [];
        this._selectedId = null;
        undoRedoManager.clear();
        this._renderCanvas();
        this._renderProperties();
        this._updateCode();
        projectManager.setComponents(this._components);
      }
    });

    // Save project
    const saveBtn = document.getElementById('btnSave');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      projectManager.setComponents(this._components);
      const id = projectManager.saveProject();
      this._showToast('プロジェクトを保存しました ✓');
    });

    // Export JSON
    const exportBtn = document.getElementById('btnExportJson');
    if (exportBtn) exportBtn.addEventListener('click', () => {
      projectManager.setComponents(this._components);
      const json = projectManager.exportToJson();
      this._downloadFile('project.json', json, 'application/json');
    });

    // Export XML
    const exportXmlBtn = document.getElementById('btnExportXml');
    if (exportXmlBtn) exportXmlBtn.addEventListener('click', () => {
      if (this._xmlOutput) {
        this._downloadFile('activity_main.xml', this._xmlOutput.textContent, 'text/xml');
      }
    });

    // Export Kotlin
    const exportKtBtn = document.getElementById('btnExportKt');
    if (exportKtBtn) exportKtBtn.addEventListener('click', () => {
      if (this._kotlinOutput) {
        this._downloadFile('MainActivity.kt', this._kotlinOutput.textContent, 'text/plain');
      }
    });

    // Copy XML
    const copyXmlBtn = document.getElementById('btnCopyXml');
    if (copyXmlBtn) copyXmlBtn.addEventListener('click', () => {
      if (this._xmlOutput) {
        navigator.clipboard.writeText(this._xmlOutput.textContent)
          .then(() => this._showToast('XMLをコピーしました ✓'));
      }
    });

    // Copy Kotlin
    const copyKtBtn = document.getElementById('btnCopyKt');
    if (copyKtBtn) copyKtBtn.addEventListener('click', () => {
      if (this._kotlinOutput) {
        navigator.clipboard.writeText(this._kotlinOutput.textContent)
          .then(() => this._showToast('Kotlinコードをコピーしました ✓'));
      }
    });

    // Load template
    const templateBtns = document.querySelectorAll('[data-sample]');
    templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sampleId = btn.dataset.sample;
        const sample = typeof SAMPLES !== 'undefined' ? SAMPLES.find(s => s.id === sampleId) : null;
        if (sample) this._loadSample(sample);
      });
    });

    // Code tabs
    document.querySelectorAll('[data-code-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-code-tab]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.codeTab;
        document.querySelectorAll('[data-code-panel]').forEach(p => {
          p.style.display = p.dataset.codePanel === tab ? '' : 'none';
        });
      });
    });

    // Zoom controls
    const zoomInBtn = document.getElementById('btnZoomIn');
    const zoomOutBtn = document.getElementById('btnZoomOut');
    const zoomResetBtn = document.getElementById('btnZoomReset');
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => {
      layoutManager.zoomIn();
      this._applyZoom(layoutManager.getZoom());
    });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => {
      layoutManager.zoomOut();
      this._applyZoom(layoutManager.getZoom());
    });
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => {
      layoutManager.resetZoom();
      this._applyZoom(1.0);
    });

    // Grid toggle
    const gridBtn = document.getElementById('btnGrid');
    if (gridBtn) gridBtn.addEventListener('click', () => {
      this._gridEnabled = !this._gridEnabled;
      layoutManager.setGridEnabled(this._gridEnabled);
      gridBtn.classList.toggle('active', this._gridEnabled);
      this._canvas && this._canvas.classList.toggle('grid-enabled', this._gridEnabled);
    });

    // Device selector
    document.querySelectorAll('[data-device]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-device]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._previewDevice = btn.dataset.device;
        this._applyDevicePreset(this._previewDevice);
      });
    });

    // Theme generator
    const genThemeBtn = document.getElementById('btnGenerateTheme');
    if (genThemeBtn) genThemeBtn.addEventListener('click', () => this._showThemeGenerator());
  }

  _setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoRedoManager.undo();
        this._renderCanvas();
        this._renderProperties();
        this._updateCode();
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        undoRedoManager.redo();
        this._renderCanvas();
        this._renderProperties();
        this._updateCode();
      }
      if (mod && e.key === 's') {
        e.preventDefault();
        projectManager.setComponents(this._components);
        projectManager.saveProject();
        this._showToast('プロジェクトを保存しました ✓');
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this._selectedId && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          this._deleteComponent(this._selectedId);
        }
      }
      if (mod && e.key === 'd') {
        e.preventDefault();
        if (this._selectedId) this._duplicateComponent(this._selectedId);
      }
    });
  }

  // ---- Helpers ----

  _loadSample(sample) {
    if (!confirm(`サンプル「${sample.name}」を読み込みますか？現在の内容は失われます。`)) return;
    this._components = JSON.parse(JSON.stringify(sample.components)).map(c => ({
      ...c,
      id: `${c.type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    }));
    this._selectedId = null;
    undoRedoManager.clear();
    this._renderCanvas();
    this._renderProperties();
    this._updateCode();
    projectManager.setComponents(this._components);
    this._showToast(`「${sample.name}」を読み込みました ✓`);
  }

  _applyZoom(level) {
    if (this._canvas) {
      this._canvas.style.transform = `scale(${level})`;
      this._canvas.style.transformOrigin = 'top center';
    }
    const zoomLabel = document.getElementById('zoomLabel');
    if (zoomLabel) zoomLabel.textContent = `${Math.round(level * 100)}%`;
  }

  _applyDevicePreset(presetId) {
    const presets = {
      phone_portrait:   { width: '360px', height: '800px' },
      phone_landscape:  { width: '800px', height: '360px' },
      tablet_portrait:  { width: '768px', height: '1024px' },
      tablet_landscape: { width: '1024px', height: '768px' },
    };
    const preset = presets[presetId] || presets.phone_portrait;
    const wrapper = document.getElementById('canvasWrapper');
    if (wrapper) {
      wrapper.style.width = preset.width;
      wrapper.style.minHeight = preset.height;
    }
  }

  _showThemeGenerator() {
    const modal = document.getElementById('themeModal');
    if (modal) modal.style.display = 'flex';
  }

  _updateUndoRedoButtons(state) {
    const undoBtn = document.getElementById('btnUndo');
    const redoBtn = document.getElementById('btnRedo');
    if (undoBtn) {
      undoBtn.disabled = !state.canUndo;
      undoBtn.title = state.undoLabel ? `元に戻す: ${state.undoLabel}` : '元に戻す';
    }
    if (redoBtn) {
      redoBtn.disabled = !state.canRedo;
      redoBtn.title = state.redoLabel ? `やり直す: ${state.redoLabel}` : 'やり直す';
    }
  }

  _showToast(message, duration = 2500) {
    let toast = document.getElementById('toastMessage');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastMessage';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  _showWelcomeMessage() {
    // Only show on first visit
    if (localStorage.getItem('nc_visited')) return;
    localStorage.setItem('nc_visited', '1');
    setTimeout(() => {
      this._showToast('🎉 ノーコードAndroidエディタへようこそ！左のパレットからコンポーネントを追加してください。', 4000);
    }, 500);
  }

  _downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize editor when scripts are loaded
let editor;
document.addEventListener('DOMContentLoaded', () => {
  editor = new Editor();
});
