/**
 * Phase 4 Extended: OpenWeatherMap WeatherView Component
 * Registers the WeatherView component with the ComponentRegistry.
 */

const WEATHER_COMPONENTS = [
  {
    type: 'WeatherView',
    category: 'weather',
    icon: '🌤️',
    label: 'WeatherView',
    tags: ['weather', 'openweathermap', 'temperature', 'forecast', 'api', 'weatherview'],
    gradleDependency: "implementation 'com.squareup.retrofit2:retrofit:2.9.0'\n    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'",
    defaultProps: {
      id: 'weather_view',
      width: 'match_parent',
      height: 'wrap_content',
      city: 'Tokyo',
      apiKey: '',
      units: 'metric',
      showForecast: false,
      autoRefreshMinutes: 0,
      language: 'ja',
      margin: '8dp',
    },
    propertySchema: [
      { key: 'id',                 label: 'ID',                    type: 'text' },
      { key: 'width',              label: 'Width',                 type: 'dimension' },
      { key: 'height',             label: 'Height',                type: 'dimension' },
      { key: 'city',               label: '都市名 (City)',          type: 'text' },
      { key: 'units',              label: '温度単位',               type: 'select',
        options: ['metric', 'imperial', 'standard'] },
      { key: 'showForecast',       label: '5日間予報表示',           type: 'boolean' },
      { key: 'autoRefreshMinutes', label: '自動更新 (分, 0=無効)',   type: 'number' },
      { key: 'language',          label: '言語',                   type: 'select',
        options: ['ja', 'en', 'zh_cn', 'ko', 'de', 'fr', 'es'] },
      { key: 'margin',             label: 'Margin',                type: 'dimension' },
    ],
    preview: (props) => {
      const unitSymbol = props.units === 'imperial' ? '℉' : props.units === 'standard' ? 'K' : '℃';
      return `
        <div style="
          width:100%;
          background:linear-gradient(135deg,#1a73e8,#0d47a1);
          border-radius:8px;
          padding:12px;
          box-sizing:border-box;
          color:#fff;
          font-size:11px;
          position:relative;overflow:hidden;
        ">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-size:16px;font-weight:700;">☀️ 晴れ</div>
              <div style="font-size:22px;font-weight:300;margin:4px 0;">28${unitSymbol}</div>
              <div style="opacity:0.8;">${props.city || 'Tokyo'}</div>
            </div>
            <div style="text-align:right;opacity:0.85;font-size:10px;">
              <div>体感 26${unitSymbol}</div>
              <div>湿度 60%</div>
              <div>風速 3m/s</div>
            </div>
          </div>
          ${props.showForecast ? `
          <div style="display:flex;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.3);">
            ${['月','火','水','木','金'].map(d => `
              <div style="flex:1;text-align:center;font-size:9px;">
                <div>${d}</div>
                <div>⛅</div>
                <div>24${unitSymbol}</div>
              </div>`).join('')}
          </div>` : ''}
          <div style="position:absolute;top:4px;right:4px;font-size:9px;opacity:0.6;">WeatherView</div>
        </div>`;
    },
    xmlTag: 'LinearLayout',
    xmlAttrs: (props) => ({
      'android:id': `@+id/${props.id}`,
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:layout_margin': props.margin,
      'android:orientation': 'vertical',
      'android:background': '@drawable/weather_card_bg',
      'android:padding': '16dp',
    }),
    kotlinCode: (id, props) => id ? [
      `// WeatherView: ${props.city || 'Tokyo'}`,
      `val weatherManager = WeatherManager(this, "${props.apiKey || "YOUR_OPENWEATHERMAP_API_KEY"}")`,
      `weatherManager.fetchWeather("${props.city || 'Tokyo'}", "${props.units || 'metric'}") { data ->`,
      `    runOnUiThread { updateWeatherUI(data) }`,
      `}`,
    ] : [],
  },
];

(function registerWeatherComponents() {
  function doRegister() {
    if (typeof componentRegistry !== 'undefined') {
      WEATHER_COMPONENTS.forEach(c => componentRegistry.register(c));
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doRegister);
  } else {
    doRegister();
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WEATHER_COMPONENTS;
}
