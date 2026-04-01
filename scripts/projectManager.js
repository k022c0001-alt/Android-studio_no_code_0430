/**
 * Phase 2: Project Manager
 * Project save/load, template library management
 */

class ProjectManager {
  constructor() {
    this._currentProject = null;
    this._storageKey = 'nc_projects';
    this._templateKey = 'nc_templates';
    this._autoSaveKey = 'nc_autosave';
    this._listeners = [];
    this._autoSaveTimer = null;
    this._autoSaveInterval = 30000; // 30 seconds
  }

  /**
   * Create a new empty project
   * @param {Object} options - Project metadata
   * @returns {Object} New project object
   */
  newProject(options = {}) {
    this._currentProject = {
      id: this._generateId(),
      name: options.name || 'Untitled Project',
      packageName: options.packageName || 'com.example.myapp',
      appName: options.appName || 'MyApp',
      version: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      components: [],
      settings: {
        rootLayout: 'LinearLayout',
        orientation: 'vertical',
        theme: 'Theme.MaterialComponents.DayNight',
        useViewBinding: true,
        useDataBinding: false,
        minSdk: 24,
        targetSdk: 34,
        language: 'kotlin',
      },
      templates: [],
    };
    this._notify('created', this._currentProject);
    this._startAutoSave();
    return this._currentProject;
  }

  /**
   * Get the current project
   * @returns {Object|null}
   */
  getCurrentProject() {
    return this._currentProject;
  }

  /**
   * Set the component list for the current project
   * @param {Array} components
   */
  setComponents(components) {
    if (!this._currentProject) return;
    this._currentProject.components = components;
    this._currentProject.updatedAt = Date.now();
  }

  /**
   * Save project to localStorage
   * @param {string|null} name - Optional new project name
   * @returns {string} Project ID
   */
  saveProject(name) {
    if (!this._currentProject) throw new Error('No project open');
    if (name) this._currentProject.name = name;
    this._currentProject.updatedAt = Date.now();

    const projects = this._loadAllProjects();
    const idx = projects.findIndex(p => p.id === this._currentProject.id);
    if (idx >= 0) {
      projects[idx] = this._currentProject;
    } else {
      projects.push(this._currentProject);
    }
    this._saveAllProjects(projects);
    this._notify('saved', this._currentProject);
    return this._currentProject.id;
  }

  /**
   * Load a project by ID
   * @param {string} projectId
   * @returns {Object|null}
   */
  loadProject(projectId) {
    const projects = this._loadAllProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    this._currentProject = project;
    this._notify('loaded', project);
    this._startAutoSave();
    return project;
  }

  /**
   * List all saved projects
   * @returns {Array}
   */
  listProjects() {
    return this._loadAllProjects()
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Delete a saved project
   * @param {string} projectId
   */
  deleteProject(projectId) {
    const projects = this._loadAllProjects().filter(p => p.id !== projectId);
    this._saveAllProjects(projects);
    if (this._currentProject && this._currentProject.id === projectId) {
      this._currentProject = null;
    }
    this._notify('deleted', projectId);
  }

  /**
   * Export project to JSON string (for download)
   * @returns {string} JSON string
   */
  exportToJson() {
    if (!this._currentProject) throw new Error('No project open');
    return JSON.stringify(this._currentProject, null, 2);
  }

  /**
   * Import project from JSON string
   * @param {string} jsonString
   * @returns {Object} Imported project
   */
  importFromJson(jsonString) {
    const project = JSON.parse(jsonString);
    if (!project.id) project.id = this._generateId();
    project.updatedAt = Date.now();
    this._currentProject = project;

    const projects = this._loadAllProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.push(project);
    }
    this._saveAllProjects(projects);
    this._notify('imported', project);
    return project;
  }

  // ---- Templates ----

  /**
   * Save current component layout as a template
   * @param {string} name - Template name
   * @param {Array} components - Components to save
   * @param {string} description
   * @returns {Object} Template object
   */
  saveTemplate(name, components, description = '') {
    const template = {
      id: this._generateId(),
      name,
      description,
      components: JSON.parse(JSON.stringify(components)),
      createdAt: Date.now(),
    };
    const templates = this._loadTemplates();
    templates.push(template);
    this._saveTemplates(templates);
    this._notify('templateSaved', template);
    return template;
  }

  /**
   * List saved templates
   * @returns {Array}
   */
  listTemplates() {
    return this._loadTemplates().sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Load a template by ID
   * @param {string} templateId
   * @returns {Array|null} Components array or null
   */
  loadTemplate(templateId) {
    const templates = this._loadTemplates();
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;
    // Return deep copy with new IDs
    return JSON.parse(JSON.stringify(template.components)).map(c => ({
      ...c,
      id: `${c.type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    }));
  }

  /**
   * Delete a template
   * @param {string} templateId
   */
  deleteTemplate(templateId) {
    const templates = this._loadTemplates().filter(t => t.id !== templateId);
    this._saveTemplates(templates);
    this._notify('templateDeleted', templateId);
  }

  // ---- Auto-save ----

  _startAutoSave() {
    if (this._autoSaveTimer) clearInterval(this._autoSaveTimer);
    this._autoSaveTimer = setInterval(() => {
      if (this._currentProject) {
        try {
          localStorage.setItem(this._autoSaveKey, JSON.stringify(this._currentProject));
        } catch {}
      }
    }, this._autoSaveInterval);
  }

  /**
   * Get the auto-saved project (if available)
   * @returns {Object|null}
   */
  getAutoSave() {
    try {
      const data = localStorage.getItem(this._autoSaveKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearAutoSave() {
    try { localStorage.removeItem(this._autoSaveKey); } catch {}
  }

  // ---- Event System ----

  subscribe(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  // ---- Private ----

  _notify(event, data) {
    this._listeners.forEach(l => l(event, data));
  }

  _generateId() {
    return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  _loadAllProjects() {
    try {
      return JSON.parse(localStorage.getItem(this._storageKey) || '[]');
    } catch {
      return [];
    }
  }

  _saveAllProjects(projects) {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(projects));
    } catch {}
  }

  _loadTemplates() {
    try {
      return JSON.parse(localStorage.getItem(this._templateKey) || '[]');
    } catch {
      return [];
    }
  }

  _saveTemplates(templates) {
    try {
      localStorage.setItem(this._templateKey, JSON.stringify(templates));
    } catch {}
  }
}

// Built-in starter templates
const BUILT_IN_TEMPLATES = [
  {
    id: 'login_screen',
    name: 'ログイン画面',
    description: 'メールアドレスとパスワードのログインフォーム',
    icon: '🔐',
    components: [
      { type: 'ImageView', props: { id: 'logo', width: '120dp', height: '120dp', src: '@drawable/ic_launcher', contentDescription: 'App Logo', scaleType: 'fitCenter', margin: '24dp' } },
      { type: 'TextView', props: { id: 'title', text: 'ログイン', textSize: '24sp', fontStyle: 'bold', gravity: 'center', margin: '8dp' } },
      { type: 'EditText', props: { id: 'emailInput', hint: 'メールアドレス', inputType: 'textEmailAddress', margin: '8dp' } },
      { type: 'EditText', props: { id: 'passwordInput', hint: 'パスワード', inputType: 'textPassword', margin: '8dp' } },
      { type: 'MaterialButton', props: { id: 'loginButton', text: 'ログイン', width: 'match_parent', margin: '16dp' } },
      { type: 'TextView', props: { id: 'forgotPassword', text: 'パスワードをお忘れの方', textColor: '#6200EE', gravity: 'center', margin: '8dp' } },
    ],
  },
  {
    id: 'list_detail',
    name: 'リスト画面',
    description: 'RecyclerViewを使ったリスト表示',
    icon: '📋',
    components: [
      { type: 'RecyclerView', props: { id: 'itemList', width: 'match_parent', height: 'match_parent', layoutManager: 'LinearLayoutManager', orientation: 'vertical' } },
      { type: 'FloatingActionButton', props: { id: 'addFab', src: '@drawable/ic_add', contentDescription: '追加', layout_gravity: 'bottom|end', margin: '16dp' } },
    ],
  },
  {
    id: 'settings_screen',
    name: '設定画面',
    description: 'スイッチとチェックボックスを含む設定画面',
    icon: '⚙️',
    components: [
      { type: 'TextView', props: { id: 'settingsTitle', text: '設定', textSize: '20sp', fontStyle: 'bold', margin: '16dp' } },
      { type: 'MaterialCardView', props: { id: 'notificationCard', cardElevation: '2dp', cardCornerRadius: '8dp', margin: '8dp' } },
      { type: 'Switch', props: { id: 'notificationSwitch', text: '通知を有効にする', checked: true, margin: '4dp' } },
      { type: 'Switch', props: { id: 'darkModeSwitch', text: 'ダークモード', checked: false, margin: '4dp' } },
      { type: 'CheckBox', props: { id: 'analyticsCheck', text: '使用状況の分析を許可', checked: true, margin: '4dp' } },
      { type: 'Slider', props: { id: 'fontSizeSlider', value: 16, valueFrom: 10, valueTo: 30, stepSize: 1, margin: '8dp' } },
    ],
  },
  {
    id: 'dashboard',
    name: 'ダッシュボード',
    description: 'カードレイアウトのダッシュボード',
    icon: '📊',
    components: [
      { type: 'TabLayout', props: { id: 'tabs', tabLabels: '概要\n詳細\n設定', tabBackground: '#6200EE' } },
      { type: 'MaterialCardView', props: { id: 'statsCard1', cardElevation: '4dp', cardCornerRadius: '8dp', margin: '8dp' } },
      { type: 'TextView', props: { id: 'statsLabel', text: '今日のアクティビティ', textSize: '16sp', fontStyle: 'bold' } },
      { type: 'ProgressBar', props: { id: 'progressBar', progress: 65, max: 100, progressTint: '#6200EE', margin: '8dp' } },
      { type: 'RecyclerView', props: { id: 'recentList', height: '200dp', layoutManager: 'LinearLayoutManager' } },
    ],
  },
];

// Singleton instance
const projectManager = new ProjectManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProjectManager, projectManager, BUILT_IN_TEMPLATES };
}
