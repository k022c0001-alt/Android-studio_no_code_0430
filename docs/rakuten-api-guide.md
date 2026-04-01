# 楽天API 使い方ガイド

Android No-Code Editor で **ProductSearch** コンポーネントを使うためのガイドです。

---

## 1. APIキーの取得

### ステップ 1: 楽天ウェブサービスへの登録

1. [webservice.rakuten.co.jp](https://webservice.rakuten.co.jp/) にアクセス
2. 「アプリIDを発行する」をクリック
3. 楽天会員でログイン（楽天ID未取得の場合は新規登録）

### ステップ 2: アプリの登録

1. 「新規アプリ登録」をクリック
2. 以下の情報を入力:
   - **アプリ名**: 作成するアプリの名前
   - **アプリURL**: `https://example.com`（テスト時は仮URLでOK）
3. 登録完了後、**アプリケーションID** が表示されます

### ステップ 3: エディタへの設定

1. ツールバーで **「🔑 Google API」** をクリック
2. **「外部API」** タブを選択
3. **「楽天API」** セクションにアプリケーションIDを貼り付け
4. 「保存」をクリック

---

## 2. ProductSearch コンポーネントの使い方

### 基本的な使い方

1. 左サイドバーの **「eCommerce」** カテゴリから **ProductSearch** をドラッグ＆ドロップ
2. 右側プロパティパネルで検索設定を調整
3. 「コード」タブで生成されたKotlinコードを確認

### プロパティ一覧

| プロパティ | 説明 | デフォルト |
|-----------|------|---------|
| `apiKey` | 楽天アプリケーションID | `(空)` |
| `affiliateId` | アフィリエイトID（任意） | `(空)` |
| `keyword` | デフォルト検索キーワード | `(空)` |
| `sort` | 並び替え順 | `+itemPrice`（価格昇順） |
| `hits` | 1ページの表示件数（最大30） | `30` |
| `minPrice` | 最低価格フィルター（0=指定なし） | `0` |
| `maxPrice` | 最高価格フィルター（0=指定なし） | `0` |

### 並び替えオプション

| 値 | 説明 |
|----|------|
| `+itemPrice` | 価格昇順（安い順） |
| `-itemPrice` | 価格降順（高い順） |
| `-reviewCount` | 口コミ件数順 |
| `-reviewAverage` | 評価順（高評価順） |
| `-updateTimestamp` | 新着順 |

---

## 3. 生成されるKotlinコード

```kotlin
class ProductSearchActivity : AppCompatActivity() {

    private lateinit var productAdapter: ProductAdapter
    private lateinit var apiService: RakutenApiService
    private val applicationId = "YOUR_RAKUTEN_APP_ID"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product_search)

        setupRecyclerView()
        setupRetrofit()

        val searchInput  = findViewById<EditText>(R.id.product_search_input)
        val searchButton = findViewById<Button>(R.id.product_search_btn)
        searchButton.setOnClickListener {
            val keyword = searchInput.text.toString().trim()
            if (keyword.isNotEmpty()) searchProducts(keyword)
        }
    }

    private fun searchProducts(keyword: String) {
        val call = apiService.searchProducts(
            keyword       = keyword,
            applicationId = applicationId,
            sort          = "+itemPrice",
            hits          = 30
        )
        call.enqueue(object : Callback<RakutenSearchResponse> {
            override fun onResponse(call: Call<RakutenSearchResponse>, response: Response<RakutenSearchResponse>) {
                if (response.isSuccessful) {
                    val items = response.body()?.items?.map { it.item } ?: emptyList()
                    productAdapter.submitList(items)
                }
            }
            override fun onFailure(call: Call<RakutenSearchResponse>, t: Throwable) {
                Log.e("Rakuten", "Error: ${t.message}")
            }
        })
    }
}
```

---

## 4. build.gradle への追加

```gradle
plugins {
    id 'kotlin-kapt'
}

dependencies {
    // Retrofit + Gson (楽天API)
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'

    // Glide (商品画像読み込み)
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    kapt 'com.github.bumptech.glide:compiler:4.16.0'
}
```

---

## 5. 楽天商品検索APIのパラメータ

### エンドポイント

```
GET https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706
```

### 主要パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `applicationId` | string | アプリケーションID（必須） |
| `keyword` | string | 検索キーワード |
| `genreId` | string | ジャンルID（空=全ジャンル） |
| `minPrice` | int | 最低価格 |
| `maxPrice` | int | 最高価格 |
| `sort` | string | 並び替え順 |
| `hits` | int | 1ページの件数（1〜30） |
| `page` | int | ページ番号（1〜100） |
| `affiliateId` | string | アフィリエイトID（任意） |
| `formatVersion` | int | `2` 推奨（レスポンス形式） |

---

## 6. 主なジャンルID

| ジャンルID | カテゴリ |
|-----------|---------|
| `0` | 全ジャンル |
| `100371` | 家電・カメラ |
| `200162` | スマートフォン・タブレット |
| `558885` | ファッション |
| `101070` | 食品 |
| `100433` | スポーツ・アウトドア |

完全な一覧: [楽天ジャンル検索API](https://webservice.rakuten.co.jp/documentation/ichiba-genre-search)

---

## 7. アフィリエイト設定

楽天アフィリエイトに登録すると、リンク経由での購入に対して報酬が発生します。

1. [affiliate.rakuten.co.jp](https://affiliate.rakuten.co.jp/) でアフィリエイト登録
2. 「ツール」→「リンク作成」でアフィリエイトIDを確認
3. 商品検索コンポーネントの「アフィリエイトID」フィールドに設定

アフィリエイトIDを設定すると、生成されるコードの商品URLが自動的にアフィリエイトリンクになります。

---

## 8. 利用規約と制限

- APIコールは **1秒間に1回** 以内（レート制限）
- レスポンスのキャッシュを活用して効率化
- 楽天の[利用規約](https://webservice.rakuten.co.jp/terms/)を必ず確認してください

---

## 参考リンク

- [楽天ウェブサービス ドキュメント](https://webservice.rakuten.co.jp/documentation/)
- [楽天市場商品検索API](https://webservice.rakuten.co.jp/documentation/ichiba-item-search)
- [楽天アフィリエイト](https://affiliate.rakuten.co.jp/)
