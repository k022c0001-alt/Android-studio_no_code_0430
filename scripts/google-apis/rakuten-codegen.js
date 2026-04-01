/**
 * Phase 4 Extended: Rakuten API Code Generator
 * Generates AndroidManifest additions, build.gradle dependencies,
 * and full Kotlin Activity code for ProductSearch components.
 */

const RakutenCodegen = (() => {

  /**
   * Generate complete Kotlin Activity for Rakuten product search.
   * @param {Object} searchComponent
   * @param {Object} options
   * @returns {string}
   */
  function generateKotlinActivity(searchComponent, options = {}) {
    const packageName  = options.packageName  || 'com.example.myapp';
    const activityName = options.activityName || 'ProductSearchActivity';
    const props        = (searchComponent && searchComponent.props) || {};
    const id           = props.id           || 'product_search';
    const appId        = props.apiKey       || 'YOUR_RAKUTEN_APP_ID';
    const affiliateId  = props.affiliateId  || '';
    const keyword      = _escapeKt(props.keyword  || '');
    const sort         = props.sort         || '+itemPrice';
    const hits         = parseInt(props.hits || 30, 10);
    const minPrice     = parseInt(props.minPrice || 0, 10);
    const maxPrice     = parseInt(props.maxPrice || 0, 10);
    const minPriceParam = minPrice > 0 ? `\n        minPrice = ${minPrice},` : '';
    const maxPriceParam = maxPrice > 0 ? `\n        maxPrice = ${maxPrice},` : '';

    return `package ${packageName}

import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.google.gson.annotations.SerializedName
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

class ${activityName} : AppCompatActivity() {

    private lateinit var productAdapter: ProductAdapter
    private lateinit var apiService: RakutenApiService
    private val applicationId = "${appId}"
    private val affiliateId   = "${affiliateId}"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product_search)

        setupRecyclerView()
        setupRetrofit()

        // 初期検索
        val initialKeyword = "${keyword}"
        if (initialKeyword.isNotEmpty()) searchProducts(initialKeyword)

        val searchInput  = findViewById<EditText>(R.id.${id}_search_input)
        val searchButton = findViewById<Button>(R.id.${id}_search_btn)
        searchButton.setOnClickListener {
            val kw = searchInput.text.toString().trim()
            if (kw.isNotEmpty()) searchProducts(kw)
        }
    }

    private fun setupRecyclerView() {
        val recycler = findViewById<RecyclerView>(R.id.${id}_recycler)
        productAdapter = ProductAdapter()
        recycler.layoutManager = GridLayoutManager(this, 2)
        recycler.adapter = productAdapter
    }

    private fun setupRetrofit() {
        val retrofit = Retrofit.Builder()
            .baseUrl("https://app.rakuten.co.jp/services/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        apiService = retrofit.create(RakutenApiService::class.java)
    }

    private fun searchProducts(keyword: String) {
        val call = apiService.searchProducts(
            keyword      = keyword,
            applicationId = applicationId,
            affiliateId  = affiliateId.ifEmpty { null },
            sort         = "${sort}",
            hits         = ${hits},${minPriceParam}${maxPriceParam}
        )
        call.enqueue(object : Callback<RakutenSearchResponse> {
            override fun onResponse(call: Call<RakutenSearchResponse>, response: Response<RakutenSearchResponse>) {
                if (response.isSuccessful) {
                    val items = response.body()?.items?.map { it.item } ?: emptyList()
                    productAdapter.submitList(items)
                }
            }
            override fun onFailure(call: Call<RakutenSearchResponse>, t: Throwable) {
                Log.e("Rakuten", "Error: \${t.message}")
            }
        })
    }
}

// ---- Retrofit interface ----
interface RakutenApiService {
    @GET("IchibaItem/Search/20170706")
    fun searchProducts(
        @Query("keyword")       keyword:       String,
        @Query("applicationId") applicationId: String,
        @Query("affiliateId")   affiliateId:   String?,
        @Query("sort")          sort:          String  = "+itemPrice",
        @Query("hits")          hits:          Int     = 30,
        @Query("minPrice")      minPrice:      Int?    = null,
        @Query("maxPrice")      maxPrice:      Int?    = null,
        @Query("formatVersion") formatVersion: Int     = 2
    ): Call<RakutenSearchResponse>
}

// ---- Data classes ----
data class RakutenSearchResponse(val items: List<ItemWrapper>)
data class ItemWrapper(val item: RakutenItem)
data class RakutenItem(
    val itemName: String,
    val itemPrice: Int,
    val itemUrl: String,
    @SerializedName("affiliateUrl") val affiliateUrl: String?,
    val reviewAverage: Double,
    val reviewCount: Int,
    val pointRate: Int,
    val mediumImageUrls: List<ImageUrl>
)
data class ImageUrl(val imageUrl: String)

// ---- RecyclerView Adapter ----
class ProductAdapter : androidx.recyclerview.widget.ListAdapter<RakutenItem,
        ProductAdapter.ProductViewHolder>(ProductDiffCallback()) {

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ProductViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_product, parent, false)
        return ProductViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ProductViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        fun bind(item: RakutenItem) {
            itemView.findViewById<android.widget.TextView>(R.id.product_name).text = item.itemName
            itemView.findViewById<android.widget.TextView>(R.id.product_price).text = "¥\${item.itemPrice}"
            itemView.findViewById<android.widget.TextView>(R.id.product_rating).text = "★\${item.reviewAverage}"
            val imgView = itemView.findViewById<android.widget.ImageView>(R.id.product_image)
            val imageUrl = item.mediumImageUrls.firstOrNull()?.imageUrl ?: ""
            if (imageUrl.isNotEmpty()) {
                Glide.with(itemView.context).load(imageUrl).into(imgView)
            }
            itemView.setOnClickListener {
                val url = item.affiliateUrl ?: item.itemUrl
                val intent = android.content.Intent(android.content.Intent.ACTION_VIEW,
                    android.net.Uri.parse(url))
                itemView.context.startActivity(intent)
            }
        }
    }
}

class ProductDiffCallback : androidx.recyclerview.widget.DiffUtil.ItemCallback<RakutenItem>() {
    override fun areItemsTheSame(oldItem: RakutenItem, newItem: RakutenItem) = oldItem.itemUrl == newItem.itemUrl
    override fun areContentsTheSame(oldItem: RakutenItem, newItem: RakutenItem) = oldItem == newItem
}`;
  }

  /**
   * AndroidManifest addition for Rakuten API.
   */
  function generateManifestSnippet() {
    return `    <!-- Rakuten API: requires internet access -->
    <uses-permission android:name="android.permission.INTERNET" />`;
  }

  /**
   * build.gradle with Retrofit + Glide dependencies.
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
    id 'kotlin-kapt'
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
    implementation 'androidx.recyclerview:recyclerview:1.3.2'

    // Retrofit + Gson (Rakuten API)
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'

    // Glide (画像読み込み)
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    kapt 'com.github.bumptech.glide:compiler:4.16.0'
}`;
  }

  function getGradleDependency() {
    return "implementation 'com.squareup.retrofit2:retrofit:2.9.0'\n    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'\n    implementation 'com.github.bumptech.glide:glide:4.16.0'";
  }

  // ---- Private helpers ----
  function _escapeKt(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  return {
    generateKotlinActivity,
    generateManifestSnippet,
    generateGradleContent,
    getGradleDependency,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RakutenCodegen;
}
