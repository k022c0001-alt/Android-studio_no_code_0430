# Google Maps API 使い方ガイド

## 概要

Android No-Code Editor の Phase 4 では Google Maps API との統合が追加されました。
MapView コンポーネントをドラッグ&ドロップで配置するだけで、地図表示・マーカー追加・
完全な Android Kotlin コード生成が行えます。

---

## 1. Google API キーの取得

### 手順

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスしてサインイン
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
3. **「APIとサービス」→「ライブラリ」** を開く
4. 検索ボックスに `Maps SDK for Android` と入力して選択し、**「有効にする」** をクリック
5. **「APIとサービス」→「認証情報」** を開く
6. **「認証情報を作成」→「APIキー」** をクリック
7. 作成されたキー（`AIzaSy...` で始まる文字列）をコピー

### APIキーの制限（推奨）

生成されたキーは必ず制限してください。

1. 認証情報ページでキーの名前をクリック
2. **「アプリケーションの制限」** で「Androidアプリ」を選択
3. パッケージ名（例: `com.example.myapp`）と
   デバッグ用 SHA-1 フィンガープリントを追加
4. **「APIの制限」** で「Maps SDK for Android」のみに制限

---

## 2. エディタへのキー登録

1. ツールバーの **「🔑 Google API」** ボタンをクリック
2. 表示されるモーダルに取得した APIキーを貼り付け
3. **「保存」** をクリック（キーはローカルストレージに難読化保存）

---

## 3. MapView コンポーネントの配置

1. 左サイドバーの **「Google」** カテゴリタブをクリック
2. **「MapView」** コンポーネントをキャンバスにドラッグ&ドロップ
3. 配置されたコンポーネントをクリックするとプロパティパネルが表示

---

## 4. プロパティの設定

| プロパティ | 説明 |
|---|---|
| ID | Kotlin コードから参照するビュー ID |
| Width / Height | 幅・高さ（dp または `match_parent`） |
| 緯度 / 経度 | 地図の初期中心位置 |
| Zoom Level | 1（世界）〜 21（建物レベル）の拡大率 |
| Map Type | Normal / Satellite / Terrain / Hybrid |
| Show My Location | 現在地ボタンを表示するかどうか |

### テンプレートを使う

プロパティパネル下部のテンプレートカードをクリックすると
初期位置・ズームが自動設定されます。

| テンプレート | 内容 |
|---|---|
| 日本地図 | 日本全体 (zoom 5) |
| 東京駅周辺 | 東京駅中心 (zoom 15) |
| 複数マーカー | 3 地点サンプル |
| 衛星写真 | Satellite タイプ |

---

## 5. マーカーの追加

1. MapView のプロパティパネルで **「＋ マーカーを追加」** をクリック
2. ダイアログでタイトル・説明・緯度経度を入力
3. **「追加」** をクリック
4. マーカーリストに表示されたマーカーは編集（✏️）・削除（🗑）が可能

---

## 6. コードの生成

**右パネル → 「コード」タブ** を開くと生成結果が表示されます。

### Kotlin タブ

```kotlin
class MainActivity : AppCompatActivity(), OnMapReadyCallback {
    private lateinit var mMap: GoogleMap
    private lateinit var mapView: com.google.android.gms.maps.MapView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        mapView = findViewById(R.id.map_view)
        mapView.onCreate(savedInstanceState)
        mapView.getMapAsync(this)
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap

        val tokyoStationOptions = MarkerOptions()
            .position(LatLng(35.6812, 139.7671))
            .title("東京駅")
            .snippet("JR東日本")
        mMap.addMarker(tokyoStationOptions)

        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(LatLng(35.6762, 139.6503), 12f))
    }

    // ライフサイクルの転送
    override fun onResume()  { super.onResume();  mapView.onResume()  }
    override fun onPause()   { mapView.onPause(); super.onPause()     }
    override fun onDestroy() { mapView.onDestroy(); super.onDestroy() }
}
```

### 依存関係タブ

**AndroidManifest.xml** と **build.gradle** の追加内容が表示されます。

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY" />
```

```gradle
// build.gradle (app)
implementation 'com.google.android.gms:play-services-maps:18.1.0'
```

---

## 7. セキュリティに関する注意事項

- API キーは **Androidアプリ制限** をかけることで、
  他のアプリやドメインからの不正利用を防止できます
- `google-services.json` は本ツールでは使用しません（シンプルなAPIキー方式）
- 本番リリース前にキーを制限してください

---

## 8. トラブルシューティング

| 症状 | 原因と対策 |
|---|---|
| 地図が表示されない | APIキーが未設定または無効。Cloud Consoleで有効化を確認 |
| `OVER_QUERY_LIMIT` エラー | 無料枠を超過。Cloud Consoleで課金情報を確認 |
| ビルドエラー `play-services-maps` | `build.gradle` に依存関係が追加されているか確認 |
| `SecurityException` | `AndroidManifest.xml` に `INTERNET` 権限があるか確認 |
| 現在地ボタンが機能しない | `ACCESS_FINE_LOCATION` 権限を実行時に要求しているか確認 |

---

## 9. 次フェーズへの準備

Phase 4 Step 1 で実装した基盤は以降のGoogle API統合に活用されます。

- **Firebase Authentication** – ログイン機能の追加
- **Firestore Database** – クラウドデータベース連携
- **複数API連携** – Maps + Firebase の組み合わせ
