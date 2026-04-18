/**
 * Phase 4 Extended: Stripe PaymentForm Component
 * Registers the PaymentForm component with the ComponentRegistry.
 */

const STRIPE_COMPONENTS = [
  {
    type: 'PaymentForm',
    category: 'payment',
    icon: '💳',
    label: 'PaymentForm',
    tags: ['stripe', 'payment', 'credit card', 'checkout', 'paymentform'],
    gradleDependency: "implementation 'com.stripe:stripe-android:20.+'",
    defaultProps: {
      id: 'payment_form',
      width: 'match_parent',
      height: 'wrap_content',
      currency: 'JPY',
      amount: 1000,
      description: '商品の購入',
      publishableKey: '',
      showCardNumber: true,
      showExpiry: true,
      showCvc: true,
      buttonText: 'Pay',
      margin: '8dp',
    },
    propertySchema: [
      { key: 'id',              label: 'ID',                     type: 'text' },
      { key: 'width',           label: 'Width',                  type: 'dimension' },
      { key: 'height',          label: 'Height',                 type: 'dimension' },
      { key: 'currency',        label: '通貨 (Currency)',         type: 'select',
        options: ['JPY', 'USD', 'EUR', 'GBP', 'AUD', 'CAD'] },
      { key: 'amount',          label: '金額 (Amount)',           type: 'number' },
      { key: 'description',     label: '説明 (Description)',      type: 'text' },
      { key: 'buttonText',      label: 'ボタンテキスト',            type: 'text' },
      { key: 'showCvc',         label: 'CVV 表示',               type: 'boolean' },
      { key: 'margin',          label: 'Margin',                 type: 'dimension' },
    ],
    preview: (props) => {
      const currencySymbol = { JPY: '¥', USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$' }[props.currency] || '¥';
      return `
        <div style="
          width:100%;
          background:#fff;
          border:1px solid #e0e0e0;
          border-radius:8px;
          padding:14px;
          box-sizing:border-box;
          font-size:11px;
          color:#333;
          box-shadow:0 2px 6px rgba(0,0,0,0.08);
        ">
          <div style="font-weight:700;margin-bottom:10px;color:#32325d;">💳 カード情報</div>
          <div style="
            border:1px solid #d0d0d0;border-radius:5px;
            padding:8px 10px;margin-bottom:8px;
            font-family:monospace;color:#666;font-size:12px;
            letter-spacing:2px;
          ">•••• •••• •••• ••••</div>
          <div style="display:flex;gap:8px;">
            <div style="flex:1;border:1px solid #d0d0d0;border-radius:5px;padding:8px 10px;color:#666;">MM/YY</div>
            ${props.showCvc ? `<div style="flex:1;border:1px solid #d0d0d0;border-radius:5px;padding:8px 10px;color:#666;">CVV</div>` : ''}
          </div>
          <div style="
            margin-top:12px;background:#635bff;color:#fff;
            border-radius:5px;padding:9px;text-align:center;
            font-weight:700;font-size:12px;cursor:pointer;
          ">${props.buttonText || 'Pay'} ${currencySymbol}${props.amount || 1000}</div>
          <div style="margin-top:6px;text-align:center;font-size:9px;color:#aaa;">Powered by Stripe</div>
        </div>`;
    },
    xmlTag: 'LinearLayout',
    xmlAttrs: (props) => ({
      'android:id': `@+id/${props.id}`,
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:layout_margin': props.margin,
      'android:orientation': 'vertical',
      'android:padding': '16dp',
    }),
    kotlinCode: (id, props) => id ? [
      `// PaymentForm: Stripe`,
      `val stripe = Stripe(this, "${props.publishableKey || 'YOUR_STRIPE_PUBLISHABLE_KEY'}")`,
      `val cardInputWidget = findViewById<com.stripe.android.view.CardInputWidget>(R.id.${id}_card_input)`,
      `findViewById<android.widget.Button>(R.id.${id}_pay_btn).setOnClickListener {`,
      `    val card = cardInputWidget.cardParams ?: return@setOnClickListener`,
      `    createPaymentIntent(${props.amount || 1000}, "${(props.currency || 'JPY').toLowerCase()}") { clientSecret ->`,
      `        stripe.confirmPayment(this, ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(`,
      `            PaymentMethodCreateParams.create(card), clientSecret))`,
      `    }`,
      `}`,
    ] : [],
  },
];

(function registerStripeComponents() {
  function doRegister() {
    if (typeof componentRegistry !== 'undefined') {
      STRIPE_COMPONENTS.forEach(c => componentRegistry.register(c));
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doRegister);
  } else {
    doRegister();
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = STRIPE_COMPONENTS;
}
