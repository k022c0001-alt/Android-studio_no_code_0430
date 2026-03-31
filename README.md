# 📱 Android No-Code Tool

Android Studio 向け HTML ベースのノーコードツールです。  
ビジュアルエディタで UI コンポーネントを操作すると、リアルタイムで Android の **XML レイアウト** と **Kotlin コード** が生成されます。

---

## 🚀 使い方

### 1. ブラウザで開く

```
index.html をダブルクリックするか、ブラウザにドラッグして開く
```

> ローカルサーバーは不要です。ファイルをそのまま開けば動作します。

---

### 2. コンポーネントを追加する

左側の **コンポーネントパレット** からキャンバスへ：

- **ドラッグ&ドロップ** でキャンバスに配置
- **ダブルクリック** で末尾に追加

対応コンポーネント一覧：

| カテゴリ | コンポーネント |
|----------|---------------|
| 基本     | Button, TextView, EditText, ImageView |
| レイアウト | LinearLayout |
| リスト   | ListView, RecyclerView |
| メニュー | OptionsMenu |

---

### 3. プロパティを編集する

右側の **プロパティパネル** でコンポーネントの属性を変更できます。

- テキスト内容、ID、幅・高さ、色、フォントサイズ など

---

### 4. コードを生成する

上部の **⚡ Generate Code** ボタンをクリックすると、画面下部にコードが表示されます：

- **activity_main.xml** タブ: Android レイアウト XML
- **MainActivity.kt** タブ: Kotlin ソースコード
- **menu XML** タブ: OptionsMenu 用のメニューリソース XML

各コードはコピーボタンでクリップボードにコピーできます。

---

### 5. サンプルを読み込む

ページ上部の **サンプルバー** から代表的な実装例を読み込めます：

| サンプル | 内容 |
|---------|------|
| ☰ オプションメニュー | ActionBar にメニューを追加するパターン |
| 📋 リストビュー | ArrayAdapter を使った基本 ListView |
| ✅ リスト選択 | アイテム選択 + Toast 表示パターン |

---

## ⌨️ キーボードショートカット

| キー | 操作 |
|------|------|
| `Ctrl+Z` / `Cmd+Z` | Undo (元に戻す) |
| `Ctrl+Y` / `Cmd+Y` | Redo (やり直す) |
| `Delete` / `Backspace` | 選択中のコンポーネントを削除 |

---

## 📁 ファイル構成

```
Android-studio_no_code_0430/
├── index.html              # メインエディタページ
├── styles/
│   └── style.css           # UI スタイルシート
├── scripts/
│   ├── components.js       # コンポーネント定義
│   ├── editor.js           # ドラッグ&ドロップ・エディタ機能
│   ├── codeGenerator.js    # XML / Kotlin コード生成エンジン
│   └── samples.js          # サンプルテンプレート定義
└── docs/
    └── architecture.md     # アーキテクチャドキュメント
```

---

## 🔧 生成コードの使い方 (Android Studio)

1. `activity_main.xml` の内容を `res/layout/activity_main.xml` にコピー
2. `MainActivity.kt` の内容を `app/src/main/java/.../MainActivity.kt` にコピー
3. OptionsMenu を使用した場合は `menu XML` を `res/menu/<名前>.xml` に保存
4. Gradle sync を実行してビルド

---

## 📖 ドキュメント

- [アーキテクチャドキュメント](docs/architecture.md)

---

## ライセンス

MIT License
