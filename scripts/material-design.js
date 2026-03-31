/**
 * Phase 3: Material Design Integration
 * Material Design 3 theming, attribute mapping, and theme generation
 */

const MATERIAL_DESIGN = {
  // Material Design 3 color system seed colors
  colorSeeds: [
    { name: 'Purple', primary: '#6750A4', secondary: '#625B71', tertiary: '#7D5260' },
    { name: 'Blue', primary: '#0061A4', secondary: '#006781', tertiary: '#6B579A' },
    { name: 'Green', primary: '#006E2C', secondary: '#4D6546', tertiary: '#3E6776' },
    { name: 'Orange', primary: '#9C4300', secondary: '#7E5035', tertiary: '#596277' },
    { name: 'Pink', primary: '#9A25AE', secondary: '#7A536E', tertiary: '#633952' },
    { name: 'Teal', primary: '#006A6A', secondary: '#4A6363', tertiary: '#4E607A' },
  ],

  // Typography scale
  typographyScale: {
    displayLarge:   { size: '57sp', weight: '400', lineHeight: '64sp', tracking: '-0.25' },
    displayMedium:  { size: '45sp', weight: '400', lineHeight: '52sp', tracking: '0' },
    displaySmall:   { size: '36sp', weight: '400', lineHeight: '44sp', tracking: '0' },
    headlineLarge:  { size: '32sp', weight: '400', lineHeight: '40sp', tracking: '0' },
    headlineMedium: { size: '28sp', weight: '400', lineHeight: '36sp', tracking: '0' },
    headlineSmall:  { size: '24sp', weight: '400', lineHeight: '32sp', tracking: '0' },
    titleLarge:     { size: '22sp', weight: '400', lineHeight: '28sp', tracking: '0' },
    titleMedium:    { size: '16sp', weight: '500', lineHeight: '24sp', tracking: '0.15' },
    titleSmall:     { size: '14sp', weight: '500', lineHeight: '20sp', tracking: '0.1' },
    bodyLarge:      { size: '16sp', weight: '400', lineHeight: '24sp', tracking: '0.5' },
    bodyMedium:     { size: '14sp', weight: '400', lineHeight: '20sp', tracking: '0.25' },
    bodySmall:      { size: '12sp', weight: '400', lineHeight: '16sp', tracking: '0.4' },
    labelLarge:     { size: '14sp', weight: '500', lineHeight: '20sp', tracking: '0.1' },
    labelMedium:    { size: '12sp', weight: '500', lineHeight: '16sp', tracking: '0.5' },
    labelSmall:     { size: '11sp', weight: '500', lineHeight: '16sp', tracking: '0.5' },
  },

  // Elevation tiers (dp)
  elevationLevels: [0, 1, 3, 6, 8, 12],

  // Shape system
  shapes: {
    none:        '0dp',
    extraSmall:  '4dp',
    small:       '8dp',
    medium:      '12dp',
    large:       '16dp',
    extraLarge:  '28dp',
    full:        '50%',
  },

  /**
   * Generate a complete themes.xml content for Material Design 3
   * @param {Object} options - Theme options
   * @returns {string} themes.xml content
   */
  generateThemesXml(options = {}) {
    const seed = options.seedColor || this.colorSeeds[0];
    const appName = options.appName || 'MyApp';
    const darkMode = options.darkMode !== false;

    return `<?xml version="1.0" encoding="utf-8"?>
<resources>

    <!-- Base application theme. -->
    <style name="Base.Theme.${appName}" parent="Theme.Material3.DayNight.NoActionBar">
        <!-- Primary colors -->
        <item name="colorPrimary">${seed.primary}</item>
        <item name="colorPrimaryVariant">${this._darken(seed.primary, 20)}</item>
        <item name="colorOnPrimary">#FFFFFF</item>
        <item name="colorPrimaryContainer">${this._lighten(seed.primary, 40)}</item>
        <item name="colorOnPrimaryContainer">${this._darken(seed.primary, 30)}</item>

        <!-- Secondary colors -->
        <item name="colorSecondary">${seed.secondary}</item>
        <item name="colorSecondaryVariant">${this._darken(seed.secondary, 20)}</item>
        <item name="colorOnSecondary">#FFFFFF</item>
        <item name="colorSecondaryContainer">${this._lighten(seed.secondary, 40)}</item>
        <item name="colorOnSecondaryContainer">${this._darken(seed.secondary, 30)}</item>

        <!-- Tertiary colors -->
        <item name="colorTertiary">${seed.tertiary}</item>
        <item name="colorOnTertiary">#FFFFFF</item>
        <item name="colorTertiaryContainer">${this._lighten(seed.tertiary, 40)}</item>
        <item name="colorOnTertiaryContainer">${this._darken(seed.tertiary, 30)}</item>

        <!-- Background & Surface -->
        <item name="android:colorBackground">#FFFBFE</item>
        <item name="colorOnBackground">#1C1B1F</item>
        <item name="colorSurface">#FFFBFE</item>
        <item name="colorOnSurface">#1C1B1F</item>
        <item name="colorSurfaceVariant">#E7E0EC</item>
        <item name="colorOnSurfaceVariant">#49454F</item>

        <!-- Error colors -->
        <item name="colorError">#B3261E</item>
        <item name="colorOnError">#FFFFFF</item>
        <item name="colorErrorContainer">#F9DEDC</item>
        <item name="colorOnErrorContainer">#410E0B</item>

        <!-- Outline -->
        <item name="colorOutline">#79747E</item>
        <item name="colorOutlineVariant">#CAC4D0</item>

        <!-- Typography -->
        <item name="textAppearanceDisplayLarge">@style/TextAppearance.${appName}.DisplayLarge</item>
        <item name="textAppearanceBodyMedium">@style/TextAppearance.${appName}.BodyMedium</item>

        <!-- Shapes -->
        <item name="shapeAppearanceSmallComponent">@style/ShapeAppearance.${appName}.SmallComponent</item>
        <item name="shapeAppearanceMediumComponent">@style/ShapeAppearance.${appName}.MediumComponent</item>
        <item name="shapeAppearanceLargeComponent">@style/ShapeAppearance.${appName}.LargeComponent</item>
    </style>

    <style name="Theme.${appName}" parent="Base.Theme.${appName}" />

    <!-- Typography styles -->
    <style name="TextAppearance.${appName}.DisplayLarge" parent="TextAppearance.Material3.DisplayLarge">
        <item name="fontFamily">@font/roboto</item>
    </style>

    <style name="TextAppearance.${appName}.BodyMedium" parent="TextAppearance.Material3.BodyMedium">
        <item name="fontFamily">@font/roboto</item>
    </style>

    <!-- Shape styles -->
    <style name="ShapeAppearance.${appName}.SmallComponent" parent="ShapeAppearance.Material3.SmallComponent">
        <item name="cornerFamily">rounded</item>
        <item name="cornerSize">4dp</item>
    </style>

    <style name="ShapeAppearance.${appName}.MediumComponent" parent="ShapeAppearance.Material3.MediumComponent">
        <item name="cornerFamily">rounded</item>
        <item name="cornerSize">12dp</item>
    </style>

    <style name="ShapeAppearance.${appName}.LargeComponent" parent="ShapeAppearance.Material3.LargeComponent">
        <item name="cornerFamily">rounded</item>
        <item name="cornerSize">16dp</item>
    </style>

    <!-- MaterialButton styles -->
    <style name="Widget.${appName}.Button" parent="Widget.Material3.Button">
        <item name="android:textColor">@color/white</item>
        <item name="backgroundTint">?colorPrimary</item>
        <item name="cornerRadius">8dp</item>
    </style>

    <style name="Widget.${appName}.Button.Outlined" parent="Widget.Material3.Button.OutlinedButton">
        <item name="strokeColor">?colorPrimary</item>
        <item name="android:textColor">?colorPrimary</item>
        <item name="cornerRadius">8dp</item>
    </style>

</resources>`;
  },

  /**
   * Generate colors.xml
   * @param {Object} options
   * @returns {string} colors.xml content
   */
  generateColorsXml(options = {}) {
    const seed = options.seedColor || this.colorSeeds[0];
    return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>

    <!-- Primary palette -->
    <color name="md_theme_primary">${seed.primary}</color>
    <color name="md_theme_onPrimary">#FFFFFF</color>
    <color name="md_theme_primaryContainer">${this._lighten(seed.primary, 40)}</color>
    <color name="md_theme_onPrimaryContainer">${this._darken(seed.primary, 30)}</color>

    <!-- Secondary palette -->
    <color name="md_theme_secondary">${seed.secondary}</color>
    <color name="md_theme_onSecondary">#FFFFFF</color>
    <color name="md_theme_secondaryContainer">${this._lighten(seed.secondary, 40)}</color>
    <color name="md_theme_onSecondaryContainer">${this._darken(seed.secondary, 30)}</color>

    <!-- Error palette -->
    <color name="md_theme_error">#B3261E</color>
    <color name="md_theme_errorContainer">#F9DEDC</color>
    <color name="md_theme_onError">#FFFFFF</color>
    <color name="md_theme_onErrorContainer">#410E0B</color>

    <!-- Background/Surface -->
    <color name="md_theme_background">#FFFBFE</color>
    <color name="md_theme_surface">#FFFBFE</color>
    <color name="md_theme_surfaceVariant">#E7E0EC</color>
    <color name="md_theme_outline">#79747E</color>
</resources>`;
  },

  /**
   * Generate AndroidManifest.xml
   * @param {Object} options
   * @returns {string} AndroidManifest.xml content
   */
  generateManifestXml(options = {}) {
    const packageName = options.packageName || 'com.example.myapp';
    const appName = options.appName || 'MyApp';
    const activities = options.activities || ['MainActivity'];

    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${appName}">

${activities.map((act, i) => `        <activity
            android:name=".${act}"
            android:exported="${i === 0 ? 'true' : 'false'}"
            android:label="@string/app_name"
            android:theme="@style/Theme.${appName}">
${i === 0 ? `            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>` : ''}
        </activity>`).join('\n\n')}

    </application>

</manifest>`;
  },

  /**
   * Generate strings.xml
   * @param {Object} options
   * @returns {string} strings.xml content
   */
  generateStringsXml(options = {}) {
    const appName = options.appName || 'MyApp';
    const strings = options.strings || {};
    return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
${Object.entries(strings).map(([k, v]) => `    <string name="${k}">${v}</string>`).join('\n')}
</resources>`;
  },

  /**
   * Generate build.gradle dependencies block content
   * @param {Array} additionalDeps - Extra dependencies
   * @returns {string}
   */
  generateGradleDependencies(additionalDeps = []) {
    const coreDeps = [
      "implementation 'androidx.core:core-ktx:1.12.0'",
      "implementation 'androidx.appcompat:appcompat:1.6.1'",
      "implementation 'com.google.android.material:material:1.9.0'",
      "implementation 'androidx.constraintlayout:constraintlayout:2.1.4'",
      "implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.6.2'",
      "implementation 'androidx.activity:activity-ktx:1.8.0'",
    ];
    const allDeps = [...new Set([...coreDeps, ...additionalDeps])];
    return `dependencies {\n${allDeps.map(d => `    ${d}`).join('\n')}\n}`;
  },

  /**
   * Apply Material Design 3 preview styles to a component
   * @param {string} type - Component type
   * @param {Object} props - Component props
   * @returns {Object} Enhanced preview styles
   */
  getMD3PreviewStyles(type, props) {
    const base = {
      fontFamily: 'Roboto, sans-serif',
      transition: 'all 0.2s ease',
    };
    return base;
  },

  // Color manipulation helpers
  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  },

  _rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => {
      const clamped = Math.max(0, Math.min(255, Math.round(v)));
      return clamped.toString(16).padStart(2, '0');
    }).join('').toUpperCase();
  },

  _lighten(hex, amount) {
    const { r, g, b } = this._hexToRgb(hex);
    const factor = amount / 100;
    return this._rgbToHex(
      r + (255 - r) * factor,
      g + (255 - g) * factor,
      b + (255 - b) * factor
    );
  },

  _darken(hex, amount) {
    const { r, g, b } = this._hexToRgb(hex);
    const factor = 1 - amount / 100;
    return this._rgbToHex(r * factor, g * factor, b * factor);
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MATERIAL_DESIGN;
}
