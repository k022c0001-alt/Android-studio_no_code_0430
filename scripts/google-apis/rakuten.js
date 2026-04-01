/**
 * Phase 4 Extended: Rakuten ProductSearch Component
 * Registers the ProductSearch component with the ComponentRegistry.
 */

const RAKUTEN_COMPONENTS = [
  {
    type: 'ProductSearch',
    category: 'ecommerce',
    icon: '🛒',
    label: 'ProductSearch',
    tags: ['rakuten', 'ecommerce', 'product', 'search', 'shopping', 'productsearch'],
    gradleDependency: "implementation 'com.squareup.retrofit2:retrofit:2.9.0'\n    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'\n    implementation 'com.github.bumptech.glide:glide:4.16.0'",
    defaultProps: {
      id: 'product_search',
      width: 'match_parent',
      height: 'match_parent',
      apiKey: '',
      affiliateId: '',
      keyword: '',
      genreId: '',
      minPrice: 0,
      maxPrice: 0,
      sort: '+itemPrice',
      hits: 30,
      margin: '0dp',
    },
    propertySchema: [
      { key: 'id',          label: 'ID',                          type: 'text' },
      { key: 'width',       label: 'Width',                       type: 'dimension' },
      { key: 'height',      label: 'Height',                      type: 'dimension' },
      { key: 'keyword',     label: 'デフォルトキーワード',            type: 'text' },
      { key: 'genreId',     label: 'ジャンルID (空=全体)',           type: 'text' },
      { key: 'minPrice',    label: '最低価格 (0=指定なし)',           type: 'number' },
      { key: 'maxPrice',    label: '最高価格 (0=指定なし)',           type: 'number' },
      { key: 'sort',        label: '並び替え',                      type: 'select',
        options: ['+itemPrice', '-itemPrice', '-reviewCount', '-reviewAverage', '-updateTimestamp'] },
      { key: 'hits',        label: '表示件数 (最大30)',              type: 'number' },
      { key: 'margin',      label: 'Margin',                      type: 'dimension' },
    ],
    preview: (props) => {
      const sortLabel = {
        '+itemPrice': '価格昇順', '-itemPrice': '価格降順',
        '-reviewCount': '口コミ数', '-reviewAverage': '評価順',
        '-updateTimestamp': '新着順',
      }[props.sort] || '価格昇順';
      return `
        <div style="
          width:100%;
          background:#f5f5f5;
          border-radius:8px;
          padding:10px;
          box-sizing:border-box;
          font-size:11px;
          color:#333;
        ">
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <div style="flex:1;border:1px solid #e0e0e0;border-radius:4px;padding:6px 8px;background:#fff;color:#888;">
              ${props.keyword || '商品を検索...'}
            </div>
            <div style="background:#BF0000;color:#fff;border-radius:4px;padding:6px 10px;font-weight:700;white-space:nowrap;">
              🔍 検索
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            ${[
              { name: 'スマートウォッチ', price: '¥4,980', rating: '★4.3', points: 'P×3倍' },
              { name: 'ワイヤレスイヤホン', price: '¥2,480', rating: '★4.1', points: 'P×2倍' },
            ].map(item => `
              <div style="background:#fff;border-radius:6px;padding:8px;border:1px solid #e0e0e0;">
                <div style="background:#e0e0e0;height:60px;border-radius:4px;margin-bottom:6px;display:flex;align-items:center;justify-content:center;font-size:18px;">🛍️</div>
                <div style="font-size:10px;font-weight:600;margin-bottom:2px;">${item.name}</div>
                <div style="color:#BF0000;font-weight:700;">${item.price}</div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:#888;margin-top:2px;">
                  <span>${item.rating}</span>
                  <span style="color:#f56;">${item.points}</span>
                </div>
              </div>`).join('')}
          </div>
          <div style="text-align:right;font-size:9px;color:#aaa;margin-top:4px;">並び替え: ${sortLabel}</div>
        </div>`;
    },
    xmlTag: 'LinearLayout',
    xmlAttrs: (props) => ({
      'android:id': `@+id/${props.id}`,
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:layout_margin': props.margin,
      'android:orientation': 'vertical',
    }),
    kotlinCode: (id, props) => id ? [
      `// ProductSearch: 楽天API`,
      `val rakutenService = RakutenApiService.create()`,
      `rakutenService.searchProducts(`,
      `    keyword = "${props.keyword || ''}",`,
      `    applicationId = "${props.apiKey || 'YOUR_RAKUTEN_APP_ID'}",`,
      `    affiliateId = "${props.affiliateId || ''}",`,
      `    sort = "${props.sort || '+itemPrice'}",`,
      `    hits = ${props.hits || 30}`,
      `).enqueue(productSearchCallback)`,
    ] : [],
  },
];

(function registerRakutenComponents() {
  function doRegister() {
    if (typeof componentRegistry !== 'undefined') {
      RAKUTEN_COMPONENTS.forEach(c => componentRegistry.register(c));
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doRegister);
  } else {
    doRegister();
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RAKUTEN_COMPONENTS;
}
