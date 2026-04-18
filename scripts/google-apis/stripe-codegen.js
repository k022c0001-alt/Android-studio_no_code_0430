/**
 * Phase 4 Extended: Stripe Code Generator
 * Generates AndroidManifest additions, build.gradle dependencies,
 * and full Kotlin Activity code for PaymentForm components.
 */

const StripeCodegen = (() => {

  /**
   * Generate full Kotlin Activity for Stripe payment.
   * @param {Object} paymentComponent
   * @param {Object} options
   * @returns {string}
   */
  function generateKotlinActivity(paymentComponent, options = {}) {
    const packageName  = options.packageName  || 'com.example.myapp';
    const activityName = options.activityName || 'PaymentActivity';
    const props        = (paymentComponent && paymentComponent.props) || {};
    const id           = props.id             || 'payment_form';
    const pubKey       = props.publishableKey || 'YOUR_STRIPE_PUBLISHABLE_KEY';
    const amount       = parseInt(props.amount || 1000, 10);
    const currency     = (props.currency || 'JPY').toLowerCase();
    const description  = _escapeKt(props.description || '商品の購入');
    const buttonText   = _escapeKt(props.buttonText   || 'Pay');

    return `package ${packageName}

import android.os.Bundle
import android.util.Log
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.stripe.android.PaymentConfiguration
import com.stripe.android.Stripe
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.PaymentMethodCreateParams
import com.stripe.android.view.CardInputWidget
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * IMPORTANT: createPaymentIntent() must call YOUR OWN server endpoint.
 * Never embed the Stripe Secret Key in the Android app.
 * See: https://stripe.com/docs/payments/accept-a-payment?platform=android
 */
class ${activityName} : AppCompatActivity() {

    private lateinit var stripe: Stripe

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_payment)

        // Stripe 初期化
        PaymentConfiguration.init(this, "${pubKey}")
        stripe = Stripe(this, PaymentConfiguration.getInstance(this).publishableKey)

        val cardInput = findViewById<CardInputWidget>(R.id.${id}_card_input)
        val payButton = findViewById<Button>(R.id.${id}_pay_btn)
        payButton.text = "${buttonText}"

        payButton.setOnClickListener {
            val params = cardInput.cardParams ?: run {
                Log.w("Stripe", "カード情報が不完全です")
                return@setOnClickListener
            }
            payButton.isEnabled = false
            createPaymentIntent(${amount}, "${currency}") { clientSecret ->
                if (clientSecret != null) {
                    stripe.confirmPayment(
                        this,
                        ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(
                            PaymentMethodCreateParams.create(params),
                            clientSecret
                        )
                    )
                } else {
                    Log.e("Stripe", "PaymentIntentの作成に失敗しました")
                    runOnUiThread { payButton.isEnabled = true }
                }
            }
        }
    }

    /**
     * YOUR SERVER ENDPOINT を呼び出して PaymentIntent の clientSecret を取得します。
     * 以下の URL を実際のサーバーエンドポイントに変更してください。
     */
    private fun createPaymentIntent(amount: Int, currency: String, callback: (String?) -> Unit) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("https://your-server.example.com/create-payment-intent")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.outputStream.write(
                    """{"amount":$amount,"currency":"$currency","description":"${description}"}""".toByteArray()
                )
                val response = conn.inputStream.bufferedReader().readText()
                val clientSecret = JSONObject(response).getString("clientSecret")
                withContext(Dispatchers.Main) { callback(clientSecret) }
            } catch (e: Exception) {
                Log.e("Stripe", "createPaymentIntent error: \${e.message}")
                withContext(Dispatchers.Main) { callback(null) }
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: android.content.Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        stripe.onPaymentResult(requestCode, data) { result ->
            when (result) {
                is com.stripe.android.PaymentIntentResult -> {
                    val intent = result.intent
                    Log.d("Stripe", "Payment status: \${intent.status}")
                }
            }
        }
    }
}`;
  }

  /**
   * Test card numbers reference returned as a comment block.
   */
  function getTestCardsInfo() {
    return `// ---- Stripe テストカード番号 ----
// 成功:   4242 4242 4242 4242  (Visa)
// 3Dセキュア: 4000 0025 0000 3155
// 残高不足: 4000 0000 0000 9995
// 有効期限: 任意の未来日 (例: 12/34)
// CVV:    任意の3桁 (Amexは4桁)`;
  }

  /**
   * AndroidManifest addition for Stripe (INTERNET only).
   */
  function generateManifestSnippet() {
    return `    <!-- Stripe: requires internet access -->
    <uses-permission android:name="android.permission.INTERNET" />`;
  }

  /**
   * build.gradle with Stripe Android SDK dependency.
   */
  function generateGradleContent(options = {}) {
    const compileSdk  = options.compileSdk  || 34;
    const minSdk      = options.minSdk      || 24;
    const targetSdk   = options.targetSdk   || 34;
    const appId       = options.appId       || 'com.example.myapp';
    const versionCode = options.versionCode || 1;
    const versionName = options.versionName || '1.0';

    return `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${appId}'
    compileSdk ${compileSdk}

    defaultConfig {
        applicationId "${appId}"
        minSdk ${minSdk}
        targetSdk ${targetSdk}
        versionCode ${versionCode}
        versionName "${versionName}"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions { jvmTarget = '1.8' }
    buildFeatures { viewBinding true }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'

    // Stripe Android SDK
    implementation 'com.stripe:stripe-android:20.+'

    // Coroutines (for async payment intent creation)
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}`;
  }

  function getGradleDependency() {
    return "implementation 'com.stripe:stripe-android:20.+'";
  }

  // ---- Private helpers ----
  function _escapeKt(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  return {
    generateKotlinActivity,
    getTestCardsInfo,
    generateManifestSnippet,
    generateGradleContent,
    getGradleDependency,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StripeCodegen;
}
