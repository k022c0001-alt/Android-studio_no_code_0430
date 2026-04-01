/**
 * Phase 4 Extended: OpenWeatherMap Code Generator
 * Generates AndroidManifest additions, build.gradle dependencies,
 * and full Kotlin Activity code for WeatherView components.
 */

const WeatherCodegen = (() => {

  /**
   * Generate Retrofit service interface and data classes for OpenWeatherMap.
   * @param {Object} options
   * @returns {string} Kotlin source
   */
  function generateKotlinActivity(weatherComponent, options = {}) {
    const packageName  = options.packageName  || 'com.example.myapp';
    const activityName = options.activityName || 'WeatherActivity';
    const props        = (weatherComponent && weatherComponent.props) || {};
    const city         = props.city     || 'Tokyo';
    const apiKey       = props.apiKey   || 'YOUR_OPENWEATHERMAP_API_KEY';
    const units        = props.units    || 'metric';
    const unitSymbol   = units === 'imperial' ? '°F' : units === 'standard' ? 'K' : '°C';
    const showForecast = !!props.showForecast;
    const autoRefresh  = parseInt(props.autoRefreshMinutes || 0, 10);
    const language     = props.language || 'ja';
    const id           = props.id       || 'weather_view';

    const forecastCode = showForecast ? `
    private fun fetchForecast(city: String) {
        val call = apiService.getForecast(city, apiKey, units, language)
        call.enqueue(object : Callback<ForecastResponse> {
            override fun onResponse(call: Call<ForecastResponse>, response: Response<ForecastResponse>) {
                if (response.isSuccessful) {
                    response.body()?.list?.let { updateForecastUI(it) }
                }
            }
            override fun onFailure(call: Call<ForecastResponse>, t: Throwable) {
                Log.e("Weather", "Forecast error: \${t.message}")
            }
        })
    }

    private fun updateForecastUI(forecasts: List<ForecastItem>) {
        // TODO: bind forecasts to RecyclerView or LinearLayout items
    }` : '';

    const autoRefreshCode = autoRefresh > 0 ? `
    private val handler = android.os.Handler(android.os.Looper.getMainLooper())
    private val refreshRunnable = object : Runnable {
        override fun run() {
            fetchWeather(cityName)
            handler.postDelayed(this, ${autoRefresh * 60 * 1000}L)
        }
    }

    override fun onResume() {
        super.onResume()
        handler.postDelayed(refreshRunnable, ${autoRefresh * 60 * 1000}L)
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(refreshRunnable)
    }` : '';

    return `package ${packageName}

import android.os.Bundle
import android.util.Log
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query
import com.google.gson.annotations.SerializedName

class ${activityName} : AppCompatActivity() {

    private lateinit var apiService: WeatherApiService
    private val apiKey = "${apiKey}"
    private val units  = "${units}"
    private val language = "${language}"
    private var cityName = "${city}"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_weather)

        val retrofit = Retrofit.Builder()
            .baseUrl("https://api.openweathermap.org/data/2.5/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        apiService = retrofit.create(WeatherApiService::class.java)
        fetchWeather(cityName)${showForecast ? '\n        fetchForecast(cityName)' : ''}
    }

    private fun fetchWeather(city: String) {
        val call = apiService.getWeather(city, apiKey, units, language)
        call.enqueue(object : Callback<WeatherResponse> {
            override fun onResponse(call: Call<WeatherResponse>, response: Response<WeatherResponse>) {
                if (response.isSuccessful) {
                    response.body()?.let { updateWeatherUI(it) }
                }
            }
            override fun onFailure(call: Call<WeatherResponse>, t: Throwable) {
                Log.e("Weather", "Error: \${t.message}")
            }
        })
    }

    private fun updateWeatherUI(data: WeatherResponse) {
        // TODO: bind data to views
        // data.main.temp        -> 気温 (unit depends on `units` param: metric=℃, imperial=℉, standard=K)
        // data.main.feelsLike   -> 体感温度
        // data.main.humidity    -> 湿度 (%)
        // data.wind.speed       -> 風速 (m/s)
        // data.weather[0].description -> 天気説明
        // data.weather[0].icon  -> アイコンコード (e.g. "01d")
        //   Image URL: "https://openweathermap.org/img/wn/\${data.weather[0].icon}@2x.png"
        Log.d("Weather", "Temp: \${data.main.temp}${unitSymbol}, City: \${data.name}")
    }
${forecastCode}${autoRefreshCode}
}

// ---- Retrofit interface ----
interface WeatherApiService {
    @GET("weather")
    fun getWeather(
        @Query("q")     city:     String,
        @Query("appid") apiKey:   String,
        @Query("units") units:    String,
        @Query("lang")  language: String
    ): Call<WeatherResponse>
${showForecast ? `
    @GET("forecast")
    fun getForecast(
        @Query("q")     city:     String,
        @Query("appid") apiKey:   String,
        @Query("units") units:    String,
        @Query("lang")  language: String
    ): Call<ForecastResponse>` : ''}
}

// ---- Data classes ----
data class WeatherResponse(
    val name: String,
    val main: MainData,
    val wind: WindData,
    val weather: List<WeatherDescription>
)

data class MainData(
    val temp: Double,
    @SerializedName("feels_like") val feelsLike: Double,
    val humidity: Int
)

data class WindData(val speed: Double)

data class WeatherDescription(
    val description: String,
    val icon: String
)
${showForecast ? `
data class ForecastResponse(val list: List<ForecastItem>)

data class ForecastItem(
    val dt: Long,
    val main: MainData,
    val weather: List<WeatherDescription>
)` : ''}`;
  }

  /**
   * Generate the AndroidManifest additions for weather (INTERNET permission).
   */
  function generateManifestSnippet() {
    return `    <!-- OpenWeatherMap: requires internet access -->
    <uses-permission android:name="android.permission.INTERNET" />`;
  }

  /**
   * Generate build.gradle with Retrofit + Gson dependencies.
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

    // Retrofit + Gson (OpenWeatherMap)
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
}`;
  }

  function getGradleDependency() {
    return "implementation 'com.squareup.retrofit2:retrofit:2.9.0'\n    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'";
  }

  return {
    generateKotlinActivity,
    generateManifestSnippet,
    generateGradleContent,
    getGradleDependency,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherCodegen;
}
