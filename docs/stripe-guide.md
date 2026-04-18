# Stripe API 使い方ガイド

Android No-Code Editor で **PaymentForm** コンポーネントを使うためのガイドです。

---

## ⚠️ セキュリティに関する重要事項

| キー種別 | 用途 | Androidアプリへの組み込み |
|---------|------|----------------------|
| **公開キー** (`pk_test_...` / `pk_live_...`) | フロントエンド・SDKの初期化 | ✅ **OK** |
| **シークレットキー** (`sk_test_...` / `sk_live_...`) | サーバー側でのPaymentIntent作成 | ❌ **絶対NG** |

**シークレットキーはAndroidアプリに含めないでください。** 必ずサーバー側（バックエンドAPI）で使用してください。

---

## 1. APIキーの取得

### ステップ 1: Stripeアカウント作成

1. [dashboard.stripe.com/register](https://dashboard.stripe.com/register) にアクセス
2. アカウントを作成してメール認証を完了

### ステップ 2: APIキーの確認

1. Stripeダッシュボードで **「開発者」→「APIキー」** をクリック
2. **テスト環境**: `pk_test_...` (公開可能キー) をコピー
3. **本番環境**: アカウントを有効化後、`pk_live_...` が表示されます

### ステップ 3: エディタへの設定

1. ツールバーで **「🔑 Google API」** をクリック
2. **「外部API」** タブを選択
3. **「Stripe」** セクションに公開キーを貼り付け
4. 「保存」をクリック

---

## 2. PaymentForm コンポーネントの使い方

### 基本的な使い方

1. 左サイドバーの **「Payment」** カテゴリから **PaymentForm** をドラッグ＆ドロップ
2. 右側プロパティパネルで通貨・金額・説明を設定
3. 「コード」タブで生成されたKotlinコードを確認

### プロパティ一覧

| プロパティ | 説明 | デフォルト |
|-----------|------|---------|
| `publishableKey` | Stripe公開キー | `pk_test_...` |
| `currency` | 通貨コード | `JPY` |
| `amount` | 決済金額 | `1000` |
| `description` | 決済説明 | `商品の購入` |
| `buttonText` | ボタンのテキスト | `Pay` |

---

## 3. 生成されるKotlinコード

```kotlin
class PaymentActivity : AppCompatActivity() {

    private lateinit var stripe: Stripe

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_payment)

        PaymentConfiguration.init(this, "YOUR_PUBLISHABLE_KEY")
        stripe = Stripe(this, PaymentConfiguration.getInstance(this).publishableKey)

        val cardInput = findViewById<CardInputWidget>(R.id.payment_form_card_input)
        val payButton = findViewById<Button>(R.id.payment_form_pay_btn)

        payButton.setOnClickListener {
            val params = cardInput.cardParams ?: return@setOnClickListener
            createPaymentIntent(1000, "jpy") { clientSecret ->
                stripe.confirmPayment(this,
                    ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(
                        PaymentMethodCreateParams.create(params), clientSecret!!))
            }
        }
    }

    private fun createPaymentIntent(amount: Int, currency: String, callback: (String?) -> Unit) {
        // YOUR SERVER ENDPOINT を呼び出す
        // 決してシークレットキーをここに書かないこと！
    }
}
```

---

## 4. build.gradle への追加

```gradle
dependencies {
    // Stripe Android SDK
    implementation 'com.stripe:stripe-android:20.+'

    // Coroutines (非同期処理)
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}
```

---

## 5. テスト用カード番号

| カード番号 | 結果 |
|-----------|------|
| `4242 4242 4242 4242` | 決済成功 (Visa) |
| `4000 0025 0000 3155` | 3Dセキュア認証が必要 |
| `4000 0000 0000 9995` | 残高不足エラー |
| `4000 0000 0000 0002` | カード拒否エラー |

- **有効期限**: 任意の未来日（例: `12/34`）
- **CVV**: 任意の3桁（例: `123`）

詳細: [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## 6. サーバー側の実装（PaymentIntent作成）

Androidアプリから独自サーバーのAPIを呼び出してPaymentIntentを作成します。

### Node.js (Express) の例

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

---

## 7. Webhook 設定

本番環境では決済完了のWebhookを設定して確実に処理を完了させます。

1. Stripeダッシュボード → **「開発者」→「Webhook」**
2. 「エンドポイントを追加」でサーバーURLを入力
3. 受け取りたいイベントを選択（例: `payment_intent.succeeded`）

---

## 参考リンク

- [Stripe Android SDK ドキュメント](https://stripe.com/docs/payments/accept-a-payment?platform=android)
- [Stripe テストガイド](https://stripe.com/docs/testing)
- [PaymentIntent API](https://stripe.com/docs/api/payment_intents)
