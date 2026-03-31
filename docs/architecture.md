# アーキテクチャドキュメント

## 概要

Android No-Code Tool は、純粋な HTML / CSS / JavaScript で構成された  
ブラウザ動作型のビジュアルエディタです。外部ライブラリや Node.js などを  
一切必要とせず、`index.html` をブラウザで開くだけで動作します。

---

## モジュール構成

```
index.html
  │
  ├── styles/style.css            … UI スタイル定義
  │
  └── scripts/
       ├── components.js          … [1] コンポーネント定義
       ├── codeGenerator.js       … [2] コード生成エンジン
       ├── samples.js             … [3] サンプルテンプレート
       └── editor.js              … [4] エディタ本体
```

スクリプトの読み込み順序は依存関係に従って決まっています：

```
components.js  →  codeGenerator.js  →  samples.js  →  editor.js
```

---

## 各モジュールの責務

### [1] components.js

**UIComponent 基底クラス**と各コンポーネントクラス (`ButtonComponent`, `TextViewComponent`, ...) を定義します。

```
UIComponent (基底)
  ├── ButtonComponent
  ├── TextViewComponent
  ├── EditTextComponent
  ├── ImageViewComponent
  ├── ListViewComponent
  ├── RecyclerViewComponent
  ├── OptionsMenuComponent
  └── LinearLayoutComponent
```

各クラスは以下を持ちます：

| メンバー | 説明 |
|---------|------|
| `defaultProps()` | プロパティのデフォルト値を返す |
| `getPropertySchema()` | プロパティパネルの項目定義を返す |
| `toJSON()` | シリアライズ用 JSON を返す |

**COMPONENT_REGISTRY** オブジェクトで型名 → クラスのマッピングを管理し、  
`createComponent(type)` ファクトリ関数で統一的にインスタンス生成します。

---

### [2] codeGenerator.js

コンポーネント配列を受け取り、Android プロジェクト用コードを出力します。

| 関数 | 出力 |
|------|------|
| `generateXML(components)` | `activity_main.xml` 相当の XML 文字列 |
| `generateKotlin(components, packageName, activityName)` | `MainActivity.kt` 相当の Kotlin 文字列 |
| `generateMenuXML(optionsMenuComp)` | `res/menu/*.xml` 相当の XML 文字列 |
| `generateListSelectionKotlin(packageName)` | リスト選択専用の Kotlin 文字列 |

XML / Kotlin の生成はテンプレートリテラルを使ったシンプルな文字列連結で  
実装されており、外部テンプレートエンジンには依存していません。

---

### [3] samples.js

```javascript
SAMPLE_OPTIONS_MENU   // オプションメニューサンプル
SAMPLE_LIST_VIEW      // リストビューサンプル
SAMPLE_LIST_SELECTION // リスト選択サンプル

ALL_SAMPLES           // 全サンプルの配列
loadSample(sample, editor) // サンプルをエディタへロード
```

各サンプルは `{ name, description, components: [...] }` の形式で定義されています。

---

### [4] editor.js

エディタの中核となる 3 クラス構成：

#### EditorState (状態管理)

```
EditorState
  ├── components[]     - 配置済みコンポーネントの配列
  ├── selectedId       - 現在選択中のコンポーネント ID
  ├── history[]        - Undo/Redo 用スナップショット配列
  ├── addComponent()
  ├── removeComponent()
  ├── updateProps()
  ├── select() / deselect()
  ├── moveComponent()  - 順序変更 (ドラッグ並び替え)
  ├── undo() / redo()
  └── onChange(fn)     - 変更リスナー登録
```

#### DragDropManager (D&D 管理)

- パレットアイテムの `draggable` 設定と `dragstart` / `dragend` イベント処理
- キャンバスの `dragover` / `drop` イベント処理
- ドロップ位置のビジュアルフィードバック (`.drop-before` / `.drop-after`)

#### EditorUI (UI レンダリング)

- `EditorState.onChange` のリスナーとして登録され、状態変化を DOM 更新に反映
- `renderCanvas()` - キャンバス全体の再描画
- `renderPropertyPanel()` - 選択コンポーネントのプロパティ入力フォーム生成
- `updateLivePreview()` - コードパネルのリアルタイム更新

#### initEditor() (起動エントリーポイント)

`DOMContentLoaded` 後に呼ばれ、上記 3 クラスのインスタンスを生成し  
各種 DOM イベント (ボタン、タブ、キーボードショートカット) を紐付けます。

---

## データフロー

```
ユーザー操作
    │
    ▼
DragDropManager / UI イベント
    │  addComponent / removeComponent / updateProps / moveComponent
    ▼
EditorState  ─────────────────── onChange(event) ───────────────▶ EditorUI
    │
    ▼
generateXML / generateKotlin / generateMenuXML
    │
    ▼
コードパネル表示 (リアルタイム)
```

---

## 状態のシリアライズ

`EditorState._saveHistory()` は現在の `components[]` を `JSON.parse(JSON.stringify(...))` で  
ディープコピーし、`history[]` に積みます。  
Undo 時は `history[historyIndex]` から `createComponent` でインスタンスを再生成します。

---

## 拡張方法

### 新しいコンポーネントを追加する

1. `scripts/components.js` に新クラスを追加 (`UIComponent` を継承)
2. `COMPONENT_REGISTRY` に登録
3. `scripts/codeGenerator.js` の `componentToXML()` / `generateKotlin()` に `case` を追加
4. `scripts/editor.js` の `_buildPreviewHTML()` にプレビュー HTML を追加
5. `index.html` のパレットに `<div class="palette-item" data-type="NewType">` を追加

### Android Studio プラグイン化

将来的に Android Studio プラグイン (IntelliJ Platform Plugin) として組み込む場合：

- JCEF (Java Chromium Embedded Framework) で `index.html` をホストし、  
  JavaScript ↔ Java 間でメッセージ通信を使ってコード生成結果をエディタに注入する  
  アーキテクチャが適しています。

---

## 技術スタック

| 技術 | 用途 |
|------|------|
| HTML5 | 画面構造 |
| CSS3 (CSS Grid, Flexbox, CSS Variables) | スタイル |
| Vanilla JavaScript (ES6+) | アプリロジック |
| HTML5 Drag and Drop API | ドラッグ&ドロップ |
| Clipboard API | コピー機能 |

外部依存なし・バンドルツールなし・ビルドステップなし。
