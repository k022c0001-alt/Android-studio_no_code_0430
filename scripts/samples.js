/**
 * samples.js
 * サンプルテンプレート定義
 * Android No-Code Tool
 */

'use strict';

// ============================================================
// サンプル 1: オプションメニュー
// ============================================================
const SAMPLE_OPTIONS_MENU = {
  name: 'オプションメニュー',
  description: 'ActionBar にオプションメニューを追加するサンプル',
  components: [
    {
      type: 'TextView',
      props: {
        id: 'titleText',
        text: 'オプションメニューサンプル',
        width: 'match_parent',
        height: 'wrap_content',
        margin: '16dp',
        padding: '8dp',
        textSize: '20sp',
        textColor: '#212121',
        gravity: 'center',
        fontStyle: 'bold',
      },
    },
    {
      type: 'TextView',
      props: {
        id: 'descriptionText',
        text: '右上の ⋮ メニューアイコンをタップしてください',
        width: 'match_parent',
        height: 'wrap_content',
        margin: '8dp',
        padding: '8dp',
        textSize: '14sp',
        textColor: '#757575',
        gravity: 'center',
        fontStyle: 'normal',
      },
    },
    {
      type: 'OptionsMenu',
      props: {
        id: 'optionsMenu',
        menuResourceName: 'main_menu',
        menuTitle: 'メニュー',
        items: '設定,ヘルプ,終了',
        showAsAction: 'never',
      },
    },
  ],
  xml: null,   // 動的生成
  kotlin: null, // 動的生成
};

// ============================================================
// サンプル 2: リストビュー
// ============================================================
const SAMPLE_LIST_VIEW = {
  name: 'リストビュー',
  description: 'ArrayAdapter を使った基本的な ListView サンプル',
  components: [
    {
      type: 'TextView',
      props: {
        id: 'listTitleText',
        text: 'アイテムリスト',
        width: 'match_parent',
        height: 'wrap_content',
        margin: '0dp',
        padding: '16dp',
        textSize: '18sp',
        textColor: '#FFFFFF',
        backgroundColor: '#6200EE',
        gravity: 'start',
        fontStyle: 'bold',
      },
    },
    {
      type: 'ListView',
      props: {
        id: 'listView',
        width: 'match_parent',
        height: 'match_parent',
        margin: '0dp',
        padding: '0dp',
        divider: '@android:color/darker_gray',
        dividerHeight: '1dp',
        adapterVariable: 'adapter',
        itemLayoutFile: 'simple_list_item_1',
        dataArrayName: 'items',
        onItemClick: 'onItemClick',
      },
    },
  ],
  xml: null,
  kotlin: null,
};

// ============================================================
// サンプル 3: リスト選択
// ============================================================
const SAMPLE_LIST_SELECTION = {
  name: 'リスト選択',
  description: 'タップで選択できる ListView サンプル（Toast 表示付き）',
  components: [
    {
      type: 'TextView',
      props: {
        id: 'selectionTitle',
        text: 'リストから選択してください',
        width: 'match_parent',
        height: 'wrap_content',
        margin: '0dp',
        padding: '16dp',
        textSize: '18sp',
        textColor: '#FFFFFF',
        backgroundColor: '#03DAC5',
        gravity: 'start',
        fontStyle: 'bold',
      },
    },
    {
      type: 'ListView',
      props: {
        id: 'listView',
        width: 'match_parent',
        height: '0dp',
        margin: '0dp',
        padding: '0dp',
        divider: '@android:color/darker_gray',
        dividerHeight: '1dp',
        adapterVariable: 'adapter',
        itemLayoutFile: 'simple_list_item_activated_1',
        dataArrayName: 'items',
        onItemClick: 'onItemSelected',
      },
    },
    {
      type: 'TextView',
      props: {
        id: 'selectedItemText',
        text: '選択中: なし',
        width: 'match_parent',
        height: 'wrap_content',
        margin: '0dp',
        padding: '16dp',
        textSize: '16sp',
        textColor: '#212121',
        backgroundColor: '#F5F5F5',
        gravity: 'start',
        fontStyle: 'normal',
      },
    },
  ],
  xml: null,
  kotlin: null,
};

/** 全サンプル一覧 */
const ALL_SAMPLES = [
  SAMPLE_OPTIONS_MENU,
  SAMPLE_LIST_VIEW,
  SAMPLE_LIST_SELECTION,
];

/**
 * サンプルをエディタにロードする
 * @param {object} sample - SAMPLE_* オブジェクト
 * @param {EditorState} editor - エディタ状態オブジェクト
 */
function loadSample(sample, editor) {
  editor.clearComponents();
  sample.components.forEach(def => {
    const comp = createComponent(def.type, def.props);
    editor.addComponent(comp);
  });
}
