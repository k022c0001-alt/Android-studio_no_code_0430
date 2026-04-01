/**
 * Phase 4: Google Maps Component Definition
 * Registers the MapView component with the ComponentRegistry.
 */

const GOOGLE_MAPS_COMPONENTS = [
  {
    type: 'MapView',
    category: 'google',
    icon: '🗺️',
    label: 'MapView',
    tags: ['map', 'google', 'maps', 'location', 'gps', 'mapview'],
    gradleDependency: "implementation 'com.google.android.gms:play-services-maps:18.1.0'",
    defaultProps: {
      id: 'map_view',
      width: 'match_parent',
      height: '300dp',
      lat: 35.6762,
      lng: 139.6503,
      zoom: 12,
      mapType: 'normal',
      apiKey: '',
      showMyLocation: false,
      margin: '0dp',
    },
    propertySchema: [
      { key: 'id',             label: 'ID',              type: 'text' },
      { key: 'width',          label: 'Width',           type: 'dimension' },
      { key: 'height',         label: 'Height',          type: 'dimension' },
      { key: 'lat',            label: '緯度 (Latitude)', type: 'number' },
      { key: 'lng',            label: '経度 (Longitude)', type: 'number' },
      { key: 'zoom',           label: 'Zoom Level (1–21)', type: 'slider', min: 1, max: 21, step: 1 },
      { key: 'mapType',        label: 'Map Type',        type: 'select',
        options: ['normal', 'satellite', 'terrain', 'hybrid'] },
      { key: 'showMyLocation', label: 'Show My Location', type: 'boolean' },
      { key: 'margin',         label: 'Margin',          type: 'dimension' },
    ],
    preview: (props) => {
      const mapTypeColors = {
        normal:    '#e8f4f8',
        satellite: '#2d4a22',
        terrain:   '#c8e6c9',
        hybrid:    '#1a3a1a',
      };
      const bg = mapTypeColors[props.mapType] || mapTypeColors.normal;
      const textColor = (props.mapType === 'satellite' || props.mapType === 'hybrid') ? '#fff' : '#333';
      return `
        <div style="
          width:100%;height:120px;
          background:${bg};
          border-radius:4px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          border:1px solid #ccc;
          font-size:11px;color:${textColor};
          position:relative;overflow:hidden;
        ">
          <div style="font-size:28px;margin-bottom:4px;">🗺️</div>
          <div style="font-weight:600;">MapView</div>
          <div style="font-size:10px;opacity:0.8;">${props.lat}, ${props.lng} · Zoom ${props.zoom}</div>
          <div style="font-size:10px;opacity:0.7;text-transform:capitalize;">${props.mapType}</div>
        </div>`;
    },
    xmlTag: 'com.google.android.gms.maps.MapView',
    xmlAttrs: (props) => ({
      'android:layout_width':  props.width,
      'android:layout_height': props.height,
      'android:layout_margin': props.margin,
      'map:mapType': props.mapType === 'normal'    ? '1' :
                     props.mapType === 'satellite' ? '2' :
                     props.mapType === 'terrain'   ? '3' :
                     props.mapType === 'hybrid'    ? '4' : '1',
      'map:uiZoomControls': 'true',
    }),
    xmlNamespaces: {
      'xmlns:map': 'http://schemas.android.com/apk/res-auto',
    },
    kotlinCode: (id, props) => id ? [
      `// MapView initialization`,
      `val ${id} = findViewById<com.google.android.gms.maps.MapView>(R.id.${id})`,
      `${id}.onCreate(savedInstanceState)`,
      `${id}.getMapAsync(this)`,
    ] : [],
  },
];

// Register with ComponentRegistry when available
(function registerMapsComponents() {
  function doRegister() {
    if (typeof componentRegistry !== 'undefined') {
      // Ensure 'google' category is supported in UI
      GOOGLE_MAPS_COMPONENTS.forEach(c => componentRegistry.register(c));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doRegister);
  } else {
    doRegister();
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GOOGLE_MAPS_COMPONENTS;
}
