# OpenWeatherMap API 使い方ガイド

Android No-Code Editor で **WeatherView** コンポーネントを使うためのガイドです。

---

## 1. APIキーの取得

### ステップ 1: アカウント作成

1. [openweathermap.org](https://openweathermap.org/) にアクセス
2. 「Sign Up」をクリックして無料アカウントを作成
3. メール認証を完了する

### ステップ 2: APIキーの確認

1. ログイン後、右上のユーザー名をクリック → **「My API keys」**
2. デフォルトで1つのキーが作成されています
3. 新しいキーを作成する場合は「Generate」ボタンをクリック
4. キーが有効になるまで最大 **10分** かかります

### ステップ 3: エディタへの設定

1. Android No-Code Editor のツールバーで **「🔑 Google API」** をクリック
2. **「外部API」** タブを選択
3. **「OpenWeatherMap」** セクションにAPIキーを貼り付け
4. 「保存」をクリック

---

## 2. WeatherView コンポーネントの使い方

### 基本的な使い方

1. 左サイドバーの **「Weather」** カテゴリから **WeatherView** をドラッグ＆ドロップ
2. 右側プロパティパネルで都市名・温度単位・言語を設定
3. 「コード」タブで生成されたKotlinコードを確認

### プロパティ一覧

| プロパティ | 説明 | デフォルト |
|-----------|------|---------|
| `city` | 天気を表示する都市名 | `Tokyo` |
| `units` | 温度単位（metric=℃, imperial=℉, standard=K） | `metric` |
| `language` | 天気説明の言語 | `ja` |
| `showForecast` | 5日間予報の表示 | `false` |
| `autoRefreshMinutes` | 自動更新間隔（分、0=無効） | `0` |

---

## 3. 生成されるKotlinコード

```kotlin
class WeatherActivity : AppCompatActivity() {

    private lateinit var apiService: WeatherApiService
    private val apiKey = "YOUR_API_KEY"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_weather)

        val retrofit = Retrofit.Builder()
            .baseUrl("https://api.openweathermap.org/data/2.5/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        apiService = retrofit.create(WeatherApiService::class.java)
        fetchWeather("Tokyo")
    }

    private fun fetchWeather(city: String) {
        val call = apiService.getWeather(city, apiKey, "metric", "ja")
        call.enqueue(object : Callback<WeatherResponse> {
            override fun onResponse(call: Call<WeatherResponse>, response: Response<WeatherResponse>) {
                if (response.isSuccessful) {
                    response.body()?.let { updateWeatherUI(it) }
                }
            }
            override fun onFailure(call: Call<WeatherResponse>, t: Throwable) {
                Log.e("Weather", "Error: ${t.message}")
            }
        })
    }
}
```

---

## 4. build.gradle への追加

```gradle
dependencies {
    // Retrofit + Gson
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
}
```

---

## 5. 天気データの見方

| フィールド | 説明 |
|-----------|------|
| `main.temp` | 気温 |
| `main.feels_like` | 体感温度 |
| `main.humidity` | 湿度 (%) |
| `wind.speed` | 風速 (m/s) |
| `weather[0].description` | 天気説明（例: 晴れ、曇り） |
| `weather[0].icon` | 天気アイコンコード |

### 天気アイコンのURL

```
https://openweathermap.org/img/wn/{icon}@2x.png
```

例: `https://openweathermap.org/img/wn/01d@2x.png`（晴れ・日中）

---

## 6. 料金について

| プラン | 呼び出し数 | 料金 |
|-------|-----------|------|
| Free | 60回/分・1,000,000回/月 | 無料 |
| Starter | 60回/分・無制限 | $40/月 |

個人・小規模アプリには **Free プラン**で十分です。

---

## 7. 対応都市

世界中の200,000以上の都市に対応しています。

- **日本語都市名**: `Tokyo`、`Osaka`、`Kyoto`、`Sapporo` など
- **英語で検索**: `Tokyo, JP` のように国コードを付けると確実です
- **都市名が見つからない場合**: 英語のスペルを確認してください

---

## 参考リンク

- [OpenWeatherMap API ドキュメント](https://openweathermap.org/api/one-call-3)
- [対応言語一覧](https://openweathermap.org/current#multi)
- [天気アイコン一覧](https://openweathermap.org/weather-conditions)
