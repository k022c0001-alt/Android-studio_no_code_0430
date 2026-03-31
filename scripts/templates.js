/**
 * templates.js - テンプレートライブラリ
 * よく使うレイアウトのプリセット保存/管理
 */

const TEMPLATE_STORAGE_KEY = 'nocode_templates';

// ビルトインテンプレート
const BUILTIN_TEMPLATES = [
    {
        id: 'builtin_login',
        name: 'ログイン画面',
        description: 'メールアドレスとパスワードのログインフォーム',
        icon: '🔐',
        builtin: true,
        components: [
            { id: 'c1', type: 'Toolbar', x: 0, y: 0, props: { title: 'ログイン', width: 360, height: 56, backgroundColor: '#6200EE', textColor: '#FFFFFF', id: 'toolbar' } },
            { id: 'c2', type: 'TextView', x: 80, y: 100, props: { text: 'メールアドレス', width: 200, height: 30, textColor: '#333333', fontSize: 14, fontWeight: 'normal', id: 'labelEmail' } },
            { id: 'c3', type: 'EditText', x: 40, y: 135, props: { hint: 'email@example.com', width: 280, height: 48, textColor: '#000000', hintColor: '#999999', fontSize: 16, inputType: 'textEmailAddress', id: 'editEmail' } },
            { id: 'c4', type: 'TextView', x: 80, y: 200, props: { text: 'パスワード', width: 200, height: 30, textColor: '#333333', fontSize: 14, fontWeight: 'normal', id: 'labelPassword' } },
            { id: 'c5', type: 'EditText', x: 40, y: 235, props: { hint: 'パスワード', width: 280, height: 48, textColor: '#000000', hintColor: '#999999', fontSize: 16, inputType: 'textPassword', id: 'editPassword' } },
            { id: 'c6', type: 'Button', x: 100, y: 310, props: { text: 'ログイン', width: 160, height: 48, backgroundColor: '#6200EE', textColor: '#FFFFFF', fontSize: 16, cornerRadius: 4, id: 'btnLogin' } }
        ]
    },
    {
        id: 'builtin_list',
        name: 'リスト画面',
        description: 'ToolbarとRecyclerViewを持つリスト画面',
        icon: '📋',
        builtin: true,
        components: [
            { id: 'c1', type: 'Toolbar', x: 0, y: 0, props: { title: 'アイテムリスト', width: 360, height: 56, backgroundColor: '#6200EE', textColor: '#FFFFFF', id: 'toolbar' } },
            { id: 'c2', type: 'RecyclerView', x: 0, y: 56, props: { width: 360, height: 520, orientation: 'vertical', backgroundColor: '#FFFFFF', id: 'recyclerView' } },
            { id: 'c3', type: 'FloatingActionButton', x: 288, y: 520, props: { icon: '+', width: 56, height: 56, backgroundColor: '#6200EE', iconColor: '#FFFFFF', id: 'fab' } }
        ]
    },
    {
        id: 'builtin_bottomnav',
        name: 'ボトムナビ画面',
        description: 'Toolbar + コンテンツ + BottomNavigationView',
        icon: '📱',
        builtin: true,
        components: [
            { id: 'c1', type: 'Toolbar', x: 0, y: 0, props: { title: 'アプリ', width: 360, height: 56, backgroundColor: '#6200EE', textColor: '#FFFFFF', id: 'toolbar' } },
            { id: 'c2', type: 'FrameLayout', x: 0, y: 56, props: { width: 360, height: 508, backgroundColor: 'rgba(3,169,244,0.05)', id: 'container' } },
            { id: 'c3', type: 'BottomNavigation', x: 0, y: 564, props: { width: 360, height: 56, backgroundColor: '#FFFFFF', activeColor: '#6200EE', items: 'ホーム,検索,プロフィール', id: 'bottomNav' } }
        ]
    },
    {
        id: 'builtin_settings',
        name: '設定画面',
        description: 'スイッチとチェックボックスを含む設定画面',
        icon: '⚙️',
        builtin: true,
        components: [
            { id: 'c1', type: 'Toolbar', x: 0, y: 0, props: { title: '設定', width: 360, height: 56, backgroundColor: '#6200EE', textColor: '#FFFFFF', id: 'toolbar' } },
            { id: 'c2', type: 'TextView', x: 16, y: 72, props: { text: '通知', width: 200, height: 30, textColor: '#6200EE', fontSize: 13, fontWeight: 'bold', id: 'sectionNotif' } },
            { id: 'c3', type: 'CheckBox', x: 16, y: 108, props: { text: 'プッシュ通知を有効にする', width: 280, height: 40, checked: true, textColor: '#333333', fontSize: 14, id: 'cbPush' } },
            { id: 'c4', type: 'CheckBox', x: 16, y: 152, props: { text: 'メール通知を有効にする', width: 280, height: 40, checked: false, textColor: '#333333', fontSize: 14, id: 'cbEmail' } },
            { id: 'c5', type: 'TextView', x: 16, y: 208, props: { text: 'アカウント', width: 200, height: 30, textColor: '#6200EE', fontSize: 13, fontWeight: 'bold', id: 'sectionAccount' } },
            { id: 'c6', type: 'Button', x: 100, y: 250, props: { text: '変更を保存', width: 160, height: 48, backgroundColor: '#6200EE', textColor: '#FFFFFF', fontSize: 16, cornerRadius: 4, id: 'btnSave' } }
        ]
    }
];

class TemplateManager {
    constructor() {
        this._editor = null;
        this._userTemplates = this._loadUserTemplates();
        this._onChangeCallbacks = [];
    }

    setEditor(editor) {
        this._editor = editor;
    }

    onChange(callback) {
        this._onChangeCallbacks.push(callback);
    }

    _notifyChange() {
        this._onChangeCallbacks.forEach(cb => cb(this.getAllTemplates()));
    }

    _loadUserTemplates() {
        try {
            const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    _saveUserTemplates() {
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(this._userTemplates));
        } catch (e) {
            console.error('Failed to save templates:', e);
        }
    }

    /**
     * 全テンプレートを取得（ビルトイン＋ユーザー）
     */
    getAllTemplates() {
        return [...BUILTIN_TEMPLATES, ...this._userTemplates];
    }

    /**
     * ユーザーテンプレートのみ取得
     */
    getUserTemplates() {
        return [...this._userTemplates];
    }

    /**
     * 現在の設計をテンプレートとして保存
     */
    saveCurrentAsTemplate(name, description = '', icon = '📐') {
        if (!this._editor) return null;
        const components = this._editor.getComponents();
        if (!components || components.length === 0) return null;

        const template = {
            id: `user_${Date.now()}`,
            name: name || 'マイテンプレート',
            description: description,
            icon: icon,
            builtin: false,
            savedAt: new Date().toISOString(),
            components: JSON.parse(JSON.stringify(components))
        };

        this._userTemplates.push(template);
        this._saveUserTemplates();
        this._notifyChange();
        return template;
    }

    /**
     * テンプレートを適用（現在の設計を置換）
     */
    applyTemplate(templateId) {
        if (!this._editor) return false;
        const template = this.getAllTemplates().find(t => t.id === templateId);
        if (!template) return false;

        this._editor.loadComponents(template.components);
        return true;
    }

    /**
     * ユーザーテンプレートを削除
     */
    deleteTemplate(templateId) {
        const idx = this._userTemplates.findIndex(t => t.id === templateId);
        if (idx === -1) return false;
        this._userTemplates.splice(idx, 1);
        this._saveUserTemplates();
        this._notifyChange();
        return true;
    }

    /**
     * テンプレートをJSONファイルとしてエクスポート
     */
    exportTemplate(templateId) {
        const template = this.getAllTemplates().find(t => t.id === templateId);
        if (!template) return;
        const json = JSON.stringify(template, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${template.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * JSONファイルからテンプレートをインポート
     */
    importTemplate(callback) {
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
                    if (!data.components) throw new Error('Invalid template');
                    data.id = `user_${Date.now()}`;
                    data.builtin = false;
                    this._userTemplates.push(data);
                    this._saveUserTemplates();
                    this._notifyChange();
                    if (callback) callback(true, data);
                } catch (err) {
                    if (callback) callback(false, null);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    /**
     * 全ユーザーテンプレートをエクスポート
     */
    exportAllUserTemplates() {
        const json = JSON.stringify(this._userTemplates, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_templates_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// グローバルインスタンス
const templateManager = new TemplateManager();
