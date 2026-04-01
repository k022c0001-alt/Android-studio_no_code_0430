/**
 * Phase 1: Core UI Component Definitions
 * Basic Android UI components for the no-code editor
 */

const CORE_COMPONENTS = [
  {
    type: 'Button',
    category: 'basic',
    icon: '🔘',
    label: 'Button',
    tags: ['button', 'click', 'action'],
    defaultProps: {
      text: 'Button',
      width: 'wrap_content',
      height: 'wrap_content',
      backgroundColor: '#6200EE',
      textColor: '#FFFFFF',
      textSize: '14sp',
      padding: '8dp',
      margin: '4dp',
      id: '',
      enabled: true,
    },
    preview: (props) => `
      <button style="
        background:${props.backgroundColor};
        color:${props.textColor};
        padding:8px 16px;
        border:none;
        border-radius:4px;
        font-size:14px;
        cursor:pointer;
        font-family:sans-serif;
      ">${props.text}</button>`,
    xmlTag: 'Button',
    xmlAttrs: (props) => ({
      'android:text': props.text,
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:backgroundTint': props.backgroundColor,
      'android:textColor': props.textColor,
      'android:textSize': props.textSize,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
  },
  {
    type: 'TextView',
    category: 'basic',
    icon: '📝',
    label: 'TextView',
    tags: ['text', 'label', 'display'],
    defaultProps: {
      text: 'TextView',
      width: 'wrap_content',
      height: 'wrap_content',
      textColor: '#000000',
      textSize: '16sp',
      fontStyle: 'normal',
      padding: '4dp',
      margin: '4dp',
      id: '',
      gravity: 'start',
    },
    preview: (props) => `
      <span style="
        color:${props.textColor};
        font-size:16px;
        font-style:${props.fontStyle === 'italic' ? 'italic' : 'normal'};
        font-weight:${props.fontStyle === 'bold' ? 'bold' : 'normal'};
        font-family:sans-serif;
        display:inline-block;
        padding:4px;
      ">${props.text}</span>`,
    xmlTag: 'TextView',
    xmlAttrs: (props) => ({
      'android:text': props.text,
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:textColor': props.textColor,
      'android:textSize': props.textSize,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:gravity': props.gravity,
    }),
  },
  {
    type: 'ListView',
    category: 'list',
    icon: '📋',
    label: 'ListView',
    tags: ['list', 'scroll', 'items'],
    defaultProps: {
      width: 'match_parent',
      height: '200dp',
      dividerColor: '#E0E0E0',
      dividerHeight: '1dp',
      padding: '0dp',
      margin: '4dp',
      id: '',
      entries: 'Item 1\nItem 2\nItem 3',
    },
    preview: (props) => `
      <div style="
        border:1px solid #ccc;
        border-radius:4px;
        overflow:hidden;
        font-family:sans-serif;
        font-size:14px;
        min-height:80px;
      ">
        ${(props.entries || 'Item 1\nItem 2\nItem 3').split('\n').slice(0, 4).map(item =>
          `<div style="padding:8px 16px;border-bottom:1px solid #eee;">${item}</div>`
        ).join('')}
      </div>`,
    xmlTag: 'ListView',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:divider': props.dividerColor,
      'android:dividerHeight': props.dividerHeight,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
  },
  {
    type: 'Menu',
    category: 'navigation',
    icon: '☰',
    label: 'OptionsMenu',
    tags: ['menu', 'navigation', 'options'],
    defaultProps: {
      title: 'Options',
      items: 'Settings\nHelp\nAbout',
      id: '',
    },
    preview: (props) => `
      <div style="font-family:sans-serif;font-size:14px;">
        <div style="background:#6200EE;color:#fff;padding:8px 16px;display:flex;align-items:center;gap:8px;">
          <span>☰</span><span>${props.title}</span>
        </div>
        <div style="border:1px solid #ccc;background:#fff;display:none;" class="menu-dropdown">
          ${(props.items || '').split('\n').map(item =>
            `<div style="padding:8px 16px;border-bottom:1px solid #eee;">${item}</div>`
          ).join('')}
        </div>
      </div>`,
    xmlTag: 'menu',
    isMenuComponent: true,
    xmlAttrs: (props) => ({}),
  },
  {
    type: 'Spinner',
    category: 'basic',
    icon: '🔽',
    label: 'Spinner',
    tags: ['spinner', 'dropdown', 'select'],
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      entries: 'Option 1\nOption 2\nOption 3',
      padding: '4dp',
      margin: '4dp',
      id: '',
      prompt: 'Select an option',
    },
    preview: (props) => `
      <select style="
        width:100%;
        padding:8px;
        border:1px solid #ccc;
        border-radius:4px;
        font-size:14px;
        font-family:sans-serif;
      ">
        ${(props.entries || '').split('\n').map(opt =>
          `<option>${opt}</option>`
        ).join('')}
      </select>`,
    xmlTag: 'Spinner',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:entries': '@array/spinner_items',
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:prompt': `@string/${props.id || 'spinner_prompt'}`,
    }),
  },
  {
    type: 'ScrollView',
    category: 'layout',
    icon: '📜',
    label: 'ScrollView',
    tags: ['scroll', 'container', 'layout'],
    defaultProps: {
      width: 'match_parent',
      height: 'match_parent',
      padding: '8dp',
      margin: '0dp',
      id: '',
      fillViewport: true,
    },
    preview: (props) => `
      <div style="
        border:2px dashed #9C27B0;
        border-radius:4px;
        padding:8px;
        min-height:80px;
        background:rgba(156,39,176,0.05);
        font-family:sans-serif;
        font-size:12px;
        color:#9C27B0;
        text-align:center;
        display:flex;
        align-items:center;
        justify-content:center;
      ">📜 ScrollView</div>`,
    xmlTag: 'ScrollView',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:fillViewport': props.fillViewport ? 'true' : 'false',
    }),
  },
  {
    type: 'ImageButton',
    category: 'basic',
    icon: '🖼',
    label: 'ImageButton',
    tags: ['image', 'button', 'icon'],
    defaultProps: {
      width: 'wrap_content',
      height: 'wrap_content',
      src: '@drawable/ic_launcher',
      contentDescription: 'Image Button',
      padding: '8dp',
      margin: '4dp',
      id: '',
      scaleType: 'fitCenter',
    },
    preview: (props) => `
      <button style="
        background:#F5F5F5;
        border:1px solid #ccc;
        border-radius:4px;
        padding:8px;
        cursor:pointer;
        font-size:24px;
      ">🖼</button>`,
    xmlTag: 'ImageButton',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:src': props.src,
      'android:contentDescription': props.contentDescription,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:scaleType': props.scaleType,
    }),
  },
  {
    type: 'Switch',
    category: 'basic',
    icon: '🔄',
    label: 'Switch',
    tags: ['switch', 'toggle', 'boolean'],
    defaultProps: {
      width: 'wrap_content',
      height: 'wrap_content',
      text: 'Switch',
      checked: false,
      padding: '4dp',
      margin: '4dp',
      id: '',
      thumbTint: '#6200EE',
    },
    preview: (props) => `
      <label style="
        display:flex;
        align-items:center;
        gap:8px;
        font-family:sans-serif;
        font-size:14px;
        cursor:pointer;
      ">
        <input type="checkbox" ${props.checked ? 'checked' : ''} style="width:40px;height:20px;">
        <span>${props.text}</span>
      </label>`,
    xmlTag: 'Switch',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:text': props.text,
      'android:checked': props.checked ? 'true' : 'false',
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:thumbTint': props.thumbTint,
    }),
  },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CORE_COMPONENTS;
}
