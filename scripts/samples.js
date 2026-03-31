/**
 * samples.js - サンプルレイアウト定義
 */

const SAMPLES = [
    {
        id: 'sample_menu',
        name: 'オプションメニュー',
        description: 'Toolbarとオプションメニューのサンプル',
        components: [
            { id: 's1', type: 'Toolbar', x: 0, y: 0, props: { title: 'My App', width: 360, height: 56, backgroundColor: '#6200EE', textColor: '#FFFFFF', id: 'toolbar' } },
            { id: 's2', type: 'TextView', x: 16, y: 80, props: { text: 'メインコンテンツ', width: 328, height: 40, textColor: '#333333', fontSize: 18, fontWeight: 'bold', id: 'tvContent' } },
            { id: 's3', type: 'Button', x: 16, y: 140, props: { text: 'アクション', width: 160, height: 48, backgroundColor: '#6200EE', textColor: '#FFFFFF', fontSize: 14, cornerRadius: 4, id: 'btnAction' } }
        ]
    },
    {
        id: 'sample_listview',
        name: 'リストビュー',
        description: 'ListViewを使ったシンプルなリスト画面',
        components: [
            { id: 's1', type: 'Toolbar', x: 0, y: 0, props: { title: 'リスト', width: 360, height: 56, backgroundColor: '#6200EE', textColor: '#FFFFFF', id: 'toolbar' } },
            { id: 's2', type: 'ListView', x: 0, y: 56, props: { width: 360, height: 400, itemCount: 5, itemText: 'アイテム', backgroundColor: '#FFFFFF', dividerColor: '#E0E0E0', id: 'listView' } }
        ]
    },
    {
        id: 'sample_select',
        name: 'リスト選択',
        description: 'チェックボックスとリストを組み合わせた選択画面',
        components: [
            { id: 's1', type: 'Toolbar', x: 0, y: 0, props: { title: '選択してください', width: 360, height: 56, backgroundColor: '#6200EE', textColor: '#FFFFFF', id: 'toolbar' } },
            { id: 's2', type: 'CheckBox', x: 16, y: 72, props: { text: 'オプション A', width: 280, height: 40, checked: true, textColor: '#333333', fontSize: 14, id: 'cbA' } },
            { id: 's3', type: 'CheckBox', x: 16, y: 116, props: { text: 'オプション B', width: 280, height: 40, checked: false, textColor: '#333333', fontSize: 14, id: 'cbB' } },
            { id: 's4', type: 'CheckBox', x: 16, y: 160, props: { text: 'オプション C', width: 280, height: 40, checked: false, textColor: '#333333', fontSize: 14, id: 'cbC' } },
            { id: 's5', type: 'Button', x: 100, y: 220, props: { text: 'OK', width: 160, height: 48, backgroundColor: '#6200EE', textColor: '#FFFFFF', fontSize: 16, cornerRadius: 4, id: 'btnOk' } }
        ]
    }
];

function loadSample(sampleId, editor) {
    const sample = SAMPLES.find(s => s.id === sampleId);
    if (!sample || !editor) return;
    editor.loadComponents(sample.components);
}
