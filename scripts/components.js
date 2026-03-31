/**
 * components.js
 * UIコンポーネント定義モジュール
 * Android No-Code Tool
 */

'use strict';

// ============================================================
// コンポーネント基底クラス
// ============================================================
class UIComponent {
  constructor(type, props = {}) {
    this.id = UIComponent.generateId();
    this.type = type;
    this.props = Object.assign({}, this.defaultProps(), props);
    this.children = [];
  }

  static generateId() {
    return 'comp_' + Math.random().toString(36).substr(2, 9);
  }

  defaultProps() {
    return {
      id: '',
      width: 'match_parent',
      height: 'wrap_content',
      margin: '8dp',
      padding: '0dp',
    };
  }

  clone() {
    const c = new UIComponent(this.type, JSON.parse(JSON.stringify(this.props)));
    c.id = UIComponent.generateId();
    return c;
  }

  toJSON() {
    return { id: this.id, type: this.type, props: this.props, children: this.children };
  }
}

// ============================================================
// Button コンポーネント
// ============================================================
class ButtonComponent extends UIComponent {
  constructor(props = {}) {
    super('Button', props);
  }

  defaultProps() {
    return {
      id: 'button1',
      text: 'Button',
      width: 'wrap_content',
      height: 'wrap_content',
      margin: '8dp',
      padding: '8dp',
      textColor: '#FFFFFF',
      backgroundColor: '#6200EE',
      textSize: '14sp',
      onClick: '',
    };
  }

  getPropertySchema() {
    return [
      { key: 'id',              label: 'ID',               type: 'text' },
      { key: 'text',            label: 'テキスト',          type: 'text' },
      { key: 'width',           label: '幅',               type: 'dimension' },
      { key: 'height',          label: '高さ',             type: 'dimension' },
      { key: 'margin',          label: 'マージン',          type: 'text' },
      { key: 'padding',         label: 'パディング',        type: 'text' },
      { key: 'textColor',       label: '文字色',           type: 'color' },
      { key: 'backgroundColor', label: '背景色',           type: 'color' },
      { key: 'textSize',        label: '文字サイズ',        type: 'text' },
      { key: 'onClick',         label: 'onClickメソッド名', type: 'text' },
    ];
  }
}

// ============================================================
// TextView コンポーネント
// ============================================================
class TextViewComponent extends UIComponent {
  constructor(props = {}) {
    super('TextView', props);
  }

  defaultProps() {
    return {
      id: 'textView1',
      text: 'Hello, World!',
      width: 'match_parent',
      height: 'wrap_content',
      margin: '8dp',
      padding: '4dp',
      textColor: '#000000',
      backgroundColor: 'transparent',
      textSize: '16sp',
      gravity: 'start',
      fontStyle: 'normal',
    };
  }

  getPropertySchema() {
    return [
      { key: 'id',              label: 'ID',        type: 'text' },
      { key: 'text',            label: 'テキスト',   type: 'text' },
      { key: 'width',           label: '幅',        type: 'dimension' },
      { key: 'height',          label: '高さ',      type: 'dimension' },
      { key: 'margin',          label: 'マージン',   type: 'text' },
      { key: 'padding',         label: 'パディング', type: 'text' },
      { key: 'textColor',       label: '文字色',    type: 'color' },
      { key: 'backgroundColor', label: '背景色',    type: 'color' },
      { key: 'textSize',        label: '文字サイズ', type: 'text' },
      { key: 'gravity',         label: '配置',      type: 'select', options: ['start', 'center', 'end'] },
      { key: 'fontStyle',       label: 'スタイル',  type: 'select', options: ['normal', 'bold', 'italic', 'bold|italic'] },
    ];
  }
}

// ============================================================
// EditText コンポーネント
// ============================================================
class EditTextComponent extends UIComponent {
  constructor(props = {}) {
    super('EditText', props);
  }

  defaultProps() {
    return {
      id: 'editText1',
      hint: 'テキストを入力...',
      width: 'match_parent',
      height: 'wrap_content',
      margin: '8dp',
      padding: '8dp',
      textColor: '#000000',
      textSize: '16sp',
      inputType: 'text',
      maxLines: '',
    };
  }

  getPropertySchema() {
    return [
      { key: 'id',        label: 'ID',         type: 'text' },
      { key: 'hint',      label: 'ヒント',      type: 'text' },
      { key: 'width',     label: '幅',         type: 'dimension' },
      { key: 'height',    label: '高さ',       type: 'dimension' },
      { key: 'margin',    label: 'マージン',    type: 'text' },
      { key: 'padding',   label: 'パディング',  type: 'text' },
      { key: 'textColor', label: '文字色',     type: 'color' },
      { key: 'textSize',  label: '文字サイズ', type: 'text' },
      { key: 'inputType', label: '入力タイプ', type: 'select', options: ['text', 'number', 'phone', 'textEmailAddress', 'textPassword'] },
      { key: 'maxLines',  label: '最大行数',   type: 'text' },
    ];
  }
}

// ============================================================
// ListView コンポーネント
// ============================================================
class ListViewComponent extends UIComponent {
  constructor(props = {}) {
    super('ListView', props);
  }

  defaultProps() {
    return {
      id: 'listView1',
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
    };
  }

  getPropertySchema() {
    return [
      { key: 'id',             label: 'ID',                 type: 'text' },
      { key: 'width',          label: '幅',                 type: 'dimension' },
      { key: 'height',         label: '高さ',               type: 'dimension' },
      { key: 'margin',         label: 'マージン',            type: 'text' },
      { key: 'dividerHeight',  label: '区切り線の高さ',      type: 'text' },
      { key: 'adapterVariable',label: 'アダプター変数名',    type: 'text' },
      { key: 'itemLayoutFile', label: 'アイテムレイアウト',  type: 'select', options: ['simple_list_item_1', 'simple_list_item_2', 'simple_list_item_activated_1'] },
      { key: 'dataArrayName',  label: 'データ配列名',       type: 'text' },
      { key: 'onItemClick',    label: 'onItemClickメソッド', type: 'text' },
    ];
  }
}

// ============================================================
// RecyclerView コンポーネント
// ============================================================
class RecyclerViewComponent extends UIComponent {
  constructor(props = {}) {
    super('RecyclerView', props);
  }

  defaultProps() {
    return {
      id: 'recyclerView1',
      width: 'match_parent',
      height: 'match_parent',
      margin: '0dp',
      padding: '0dp',
      layoutManager: 'LinearLayoutManager',
      adapterClassName: 'MyAdapter',
      dataListName: 'itemList',
    };
  }

  getPropertySchema() {
    return [
      { key: 'id',               label: 'ID',                   type: 'text' },
      { key: 'width',            label: '幅',                   type: 'dimension' },
      { key: 'height',           label: '高さ',                 type: 'dimension' },
      { key: 'margin',           label: 'マージン',              type: 'text' },
      { key: 'layoutManager',    label: 'レイアウトマネージャー', type: 'select', options: ['LinearLayoutManager', 'GridLayoutManager', 'StaggeredGridLayoutManager'] },
      { key: 'adapterClassName', label: 'アダプタークラス名',    type: 'text' },
      { key: 'dataListName',     label: 'データリスト名',        type: 'text' },
    ];
  }
}

// ============================================================
// OptionsMenu コンポーネント
// ============================================================
class OptionsMenuComponent extends UIComponent {
  constructor(props = {}) {
    super('OptionsMenu', props);
  }

  defaultProps() {
    return {
      id: 'optionsMenu',
      menuResourceName: 'main_menu',
      menuTitle: 'メニュー',
      items: 'Item1,Item2,Item3',
      showAsAction: 'never',
    };
  }

  getPropertySchema() {
    return [
      { key: 'id',               label: 'ID',                    type: 'text' },
      { key: 'menuResourceName', label: 'メニューリソース名',     type: 'text' },
      { key: 'menuTitle',        label: 'メニュータイトル',       type: 'text' },
      { key: 'items',            label: 'アイテム (カンマ区切り)', type: 'text' },
      { key: 'showAsAction',     label: 'アクション表示',         type: 'select', options: ['never', 'ifRoom', 'always', 'withText'] },
    ];
  }
}

// ============================================================
// ImageView コンポーネント
// ============================================================
class ImageViewComponent extends UIComponent {
  constructor(props = {}) {
    super('ImageView', props);
  }

  defaultProps() {
    return {
      id: 'imageView1',
      src: '@drawable/ic_launcher_foreground',
      width: '100dp',
      height: '100dp',
      margin: '8dp',
      padding: '0dp',
      scaleType: 'centerCrop',
      contentDescription: '画像',
    };
  }

  getPropertySchema() {
    return [
      { key: 'id',                 label: 'ID',               type: 'text' },
      { key: 'src',                label: '画像ソース',        type: 'text' },
      { key: 'width',              label: '幅',               type: 'dimension' },
      { key: 'height',             label: '高さ',             type: 'dimension' },
      { key: 'margin',             label: 'マージン',          type: 'text' },
      { key: 'scaleType',          label: 'スケールタイプ',    type: 'select', options: ['centerCrop', 'centerInside', 'fitCenter', 'fitXY', 'center'] },
      { key: 'contentDescription', label: 'コンテンツ説明',   type: 'text' },
    ];
  }
}

// ============================================================
// LinearLayout コンポーネント
// ============================================================
class LinearLayoutComponent extends UIComponent {
  constructor(props = {}) {
    super('LinearLayout', props);
  }

  defaultProps() {
    return {
      id: 'linearLayout1',
      width: 'match_parent',
      height: 'wrap_content',
      orientation: 'vertical',
      margin: '8dp',
      padding: '8dp',
      gravity: 'start',
      backgroundColor: 'transparent',
    };
  }

  getPropertySchema() {
    return [
      { key: 'id',              label: 'ID',        type: 'text' },
      { key: 'width',           label: '幅',        type: 'dimension' },
      { key: 'height',          label: '高さ',      type: 'dimension' },
      { key: 'orientation',     label: '向き',      type: 'select', options: ['vertical', 'horizontal'] },
      { key: 'margin',          label: 'マージン',   type: 'text' },
      { key: 'padding',         label: 'パディング', type: 'text' },
      { key: 'gravity',         label: '配置',      type: 'select', options: ['start', 'center', 'end', 'center_vertical', 'center_horizontal'] },
      { key: 'backgroundColor', label: '背景色',    type: 'color' },
    ];
  }
}

// ============================================================
// コンポーネントレジストリ
// ============================================================
const COMPONENT_REGISTRY = {
  Button:        { cls: ButtonComponent,        label: 'Button',        icon: '🔘', category: 'basic' },
  TextView:      { cls: TextViewComponent,      label: 'TextView',      icon: '📝', category: 'basic' },
  EditText:      { cls: EditTextComponent,      label: 'EditText',      icon: '✏️', category: 'basic' },
  ImageView:     { cls: ImageViewComponent,     label: 'ImageView',     icon: '🖼️', category: 'basic' },
  LinearLayout:  { cls: LinearLayoutComponent,  label: 'LinearLayout',  icon: '📐', category: 'layout' },
  ListView:      { cls: ListViewComponent,      label: 'ListView',      icon: '📋', category: 'list' },
  RecyclerView:  { cls: RecyclerViewComponent,  label: 'RecyclerView',  icon: '♻️', category: 'list' },
  OptionsMenu:   { cls: OptionsMenuComponent,   label: 'OptionsMenu',   icon: '☰',  category: 'menu' },
};

/**
 * コンポーネントを生成するファクトリ関数
 */
function createComponent(type, props = {}) {
  const entry = COMPONENT_REGISTRY[type];
  if (!entry) throw new Error('Unknown component type: ' + type);
  return new entry.cls(props);
}

/**
 * プロパティスキーマを取得する
 */
function getPropertySchema(type) {
  const entry = COMPONENT_REGISTRY[type];
  if (!entry) return [];
  const instance = new entry.cls();
  return typeof instance.getPropertySchema === 'function' ? instance.getPropertySchema() : [];
}
