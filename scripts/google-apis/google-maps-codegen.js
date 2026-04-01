/**
 * Phase 4: Google Maps Code Generator
 * Generates AndroidManifest.xml snippets, build.gradle dependencies,
 * and Kotlin Activity code for MapView components.
 */

const GoogleMapsCodegen = (() => {

  /**
   * Generate the AndroidManifest.xml additions required for Google Maps.
   * @param {Object} options
   * @param {string} options.packageName
   * @param {string} options.appName
   * @param {string} options.apiKey          - Google Maps API key (may be placeholder)
   * @param {boolean} options.needsLocation  - Whether to add location permissions
   * @returns {string}
   */
  function generateManifestSnippet(options = {}) {
    const apiKey = options.apiKey || 'YOUR_GOOGLE_MAPS_API_KEY';
    const needsLocation = options.needsLocation !== false;

    const locationPerms = needsLocation ? `
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />` : '';

    return `    <!-- Google Maps Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />${locationPerms}

    <!-- Inside <application> tag -->
    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="${apiKey}" />`;
  }

  /**
   * Generate a complete AndroidManifest.xml with Maps support.
   * @param {Object} options
   * @returns {string}
   */
  function generateManifestXml(options = {}) {
    const packageName = options.packageName || 'com.example.myapp';
    const appName     = options.appName     || 'MyApp';
    const apiKey      = options.apiKey      || 'YOUR_GOOGLE_MAPS_API_KEY';
    const needsLocation = options.needsLocation !== false;

    const locationPerms = needsLocation ? `
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />` : '';

    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <uses-permission android:name="android.permission.INTERNET" />${locationPerms}

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.${appName}">

        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="${apiKey}" />

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>`;
  }

  /**
   * Generate build.gradle (app) content with Maps dependency.
   * @param {Object} options
   * @returns {string}
   */
  function generateGradleContent(options = {}) {
    const compileSdk = options.compileSdk || 34;
    const minSdk     = options.minSdk     || 24;
    const targetSdk  = options.targetSdk  || 34;
    const appId      = options.appId      || 'com.example.myapp';
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
    kotlinOptions {
        jvmTarget = '1.8'
    }
    buildFeatures {
        viewBinding true
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'

    // Google Maps
    implementation 'com.google.android.gms:play-services-maps:18.1.0'
}`;
  }

  /**
   * Generate the Maps dependency snippet only (for the deps panel).
   * @returns {string}
   */
  function getGradleDependency() {
    return "implementation 'com.google.android.gms:play-services-maps:18.1.0'";
  }

  /**
   * Generate Kotlin code for a MapView component.
   * @param {Object} mapComponent  - Component instance with props
   * @param {Array}  markers       - Marker objects [{lat, lng, title, snippet}, …]
   * @param {Object} options
   * @returns {string} Full Kotlin Activity source
   */
  function generateKotlinActivity(mapComponent, markers = [], options = {}) {
    const packageName  = options.packageName  || 'com.example.myapp';
    const activityName = options.activityName || 'MainActivity';
    const props        = (mapComponent && mapComponent.props) || {};
    const id           = props.id || 'map_view';
    const lat          = props.lat !== undefined ? props.lat : 35.6762;
    const lng          = props.lng !== undefined ? props.lng : 139.6503;
    const zoom         = props.zoom !== undefined ? props.zoom : 12;
    const showMyLoc    = props.showMyLocation ? 'true' : 'false';

    const markerCode = markers.length > 0
      ? markers.map(m => {
          const mLat = m.lat !== undefined ? m.lat : lat;
          const mLng = m.lng !== undefined ? m.lng : lng;
          return `        val ${_safeId(m.title || 'marker')}Options = MarkerOptions()
            .position(LatLng(${mLat}, ${mLng}))
            .title("${_escapeKt(m.title || 'マーカー')}")
            .snippet("${_escapeKt(m.snippet || '')}")
        mMap.addMarker(${_safeId(m.title || 'marker')}Options)`;
        }).join('\n\n')
      : `        // マーカー追加例:
        // val markerOptions = MarkerOptions()
        //     .position(LatLng(${lat}, ${lng}))
        //     .title("東京駅")
        // mMap.addMarker(markerOptions)`;

    const locationImport  = props.showMyLocation
      ? '\nimport android.Manifest\nimport androidx.core.app.ActivityCompat\nimport android.content.pm.PackageManager' : '';
    const locationSetup   = props.showMyLocation
      ? `\n        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)\n            == PackageManager.PERMISSION_GRANTED) {\n            mMap.isMyLocationEnabled = true\n        }` : '';

    return `package ${packageName}

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions${locationImport}

class ${activityName} : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var mMap: GoogleMap
    private lateinit var mapView: com.google.android.gms.maps.MapView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        mapView = findViewById(R.id.${id})
        mapView.onCreate(savedInstanceState)
        mapView.getMapAsync(this)
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap

${markerCode}

        // 初期位置を移動
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(LatLng(${lat}, ${lng}), ${zoom}f))${locationSetup}
    }

    // ライフサイクルメソッド (MapView requires forwarding)
    override fun onResume()  { super.onResume();  mapView.onResume()  }
    override fun onStart()   { super.onStart();   mapView.onStart()   }
    override fun onStop()    { super.onStop();    mapView.onStop()    }
    override fun onPause()   { mapView.onPause(); super.onPause()     }
    override fun onDestroy() { mapView.onDestroy(); super.onDestroy() }
    override fun onLowMemory() { super.onLowMemory(); mapView.onLowMemory() }
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        mapView.onSaveInstanceState(outState)
    }
}`;
  }

  // ---- Private helpers ----

  function _safeId(title) {
    return title
      .replace(/[^\w]/g, '_')
      .replace(/^(\d)/, '_$1')
      .toLowerCase()
      .slice(0, 30) || 'marker';
  }

  function _escapeKt(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  return {
    generateManifestSnippet,
    generateManifestXml,
    generateGradleContent,
    getGradleDependency,
    generateKotlinActivity,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleMapsCodegen;
}
