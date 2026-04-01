/**
 * Phase 3: Extended Component Library
 * New UI components including Material Design support
 */

const EXTENDED_COMPONENTS = [
  // ===== Basic Components =====
  {
    type: 'ImageView',
    category: 'basic',
    icon: '🖼️',
    label: 'ImageView',
    tags: ['image', 'photo', 'picture', 'drawable'],
    defaultProps: {
      width: '100dp',
      height: '100dp',
      src: '@drawable/ic_launcher',
      contentDescription: 'Image',
      scaleType: 'centerCrop',
      padding: '0dp',
      margin: '4dp',
      id: '',
      adjustViewBounds: true,
    },
    propertySchema: [
      { key: 'src', label: 'Source', type: 'text', placeholder: '@drawable/image_name' },
      { key: 'contentDescription', label: 'Content Description', type: 'text' },
      { key: 'scaleType', label: 'Scale Type', type: 'select',
        options: ['center', 'centerCrop', 'centerInside', 'fitCenter', 'fitEnd', 'fitStart', 'fitXY', 'matrix'] },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'adjustViewBounds', label: 'Adjust View Bounds', type: 'boolean' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        width:80px;height:80px;
        background:linear-gradient(135deg,#667eea,#764ba2);
        border-radius:4px;
        display:flex;align-items:center;justify-content:center;
        font-size:28px;
        border:1px solid #ddd;
        overflow:hidden;
      ">🖼️</div>`,
    xmlTag: 'ImageView',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:src': props.src,
      'android:contentDescription': props.contentDescription,
      'android:scaleType': props.scaleType,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:adjustViewBounds': props.adjustViewBounds ? 'true' : 'false',
    }),
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<ImageView>(R.id.${id})`,
      `${id}.setImageResource(R.drawable.your_image)`,
      `${id}.scaleType = ImageView.ScaleType.${props.scaleType.toUpperCase()}`,
    ] : [],
  },
  {
    type: 'EditText',
    category: 'basic',
    icon: '✏️',
    label: 'EditText',
    tags: ['input', 'text', 'field', 'form', 'edittext'],
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      hint: 'Enter text...',
      text: '',
      inputType: 'text',
      maxLines: 1,
      textSize: '16sp',
      textColor: '#000000',
      hintColor: '#999999',
      padding: '8dp',
      margin: '4dp',
      id: '',
      multiline: false,
      imeOptions: 'actionDone',
    },
    propertySchema: [
      { key: 'hint', label: 'Hint Text', type: 'text' },
      { key: 'text', label: 'Default Text', type: 'text' },
      { key: 'inputType', label: 'Input Type', type: 'select',
        options: ['text', 'textMultiLine', 'textPassword', 'textEmailAddress', 'phone', 'number', 'numberDecimal', 'textUri', 'textCapSentences'] },
      { key: 'maxLines', label: 'Max Lines', type: 'number' },
      { key: 'textSize', label: 'Text Size', type: 'text' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'hintColor', label: 'Hint Color', type: 'color' },
      { key: 'imeOptions', label: 'IME Options', type: 'select',
        options: ['actionDone', 'actionNext', 'actionSearch', 'actionSend', 'actionGo'] },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <input type="${props.inputType === 'textPassword' ? 'password' : 'text'}"
        placeholder="${props.hint}"
        value="${props.text}"
        style="
          width:100%;
          padding:8px 12px;
          border:1px solid #ccc;
          border-bottom:2px solid #6200EE;
          border-radius:4px 4px 0 0;
          font-size:${props.textSize?.replace('sp','') || 16}px;
          color:${props.textColor};
          font-family:sans-serif;
          box-sizing:border-box;
          background:#fff;
        " readonly>`,
    xmlTag: 'EditText',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:hint': props.hint,
      'android:text': props.text,
      'android:inputType': props.inputType,
      'android:maxLines': String(props.maxLines),
      'android:textSize': props.textSize,
      'android:textColor': props.textColor,
      'android:textColorHint': props.hintColor,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:imeOptions': props.imeOptions,
    }),
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<EditText>(R.id.${id})`,
      `val ${id}Text = ${id}.text.toString()`,
      `${id}.addTextChangedListener { text -> /* handle text change */ }`,
    ] : [],
  },
  {
    type: 'CheckBox',
    category: 'basic',
    icon: '☑️',
    label: 'CheckBox',
    tags: ['checkbox', 'check', 'boolean', 'toggle'],
    defaultProps: {
      width: 'wrap_content',
      height: 'wrap_content',
      text: 'CheckBox',
      checked: false,
      textSize: '16sp',
      textColor: '#000000',
      buttonTint: '#6200EE',
      padding: '4dp',
      margin: '4dp',
      id: '',
    },
    propertySchema: [
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'checked', label: 'Checked', type: 'boolean' },
      { key: 'textSize', label: 'Text Size', type: 'text' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'buttonTint', label: 'Button Tint', type: 'color' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <label style="display:flex;align-items:center;gap:8px;font-family:sans-serif;font-size:${props.textSize?.replace('sp','') || 16}px;color:${props.textColor};cursor:pointer;">
        <input type="checkbox" ${props.checked ? 'checked' : ''} style="width:18px;height:18px;accent-color:${props.buttonTint};" onclick="event.preventDefault()">
        <span>${props.text}</span>
      </label>`,
    xmlTag: 'CheckBox',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:text': props.text,
      'android:checked': props.checked ? 'true' : 'false',
      'android:textSize': props.textSize,
      'android:textColor': props.textColor,
      'android:buttonTint': props.buttonTint,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<CheckBox>(R.id.${id})`,
      `${id}.setOnCheckedChangeListener { _, isChecked -> /* handle change */ }`,
      `val isChecked = ${id}.isChecked`,
    ] : [],
  },
  {
    type: 'RadioButton',
    category: 'basic',
    icon: '🔘',
    label: 'RadioButton',
    tags: ['radio', 'button', 'select', 'single'],
    defaultProps: {
      width: 'wrap_content',
      height: 'wrap_content',
      text: 'RadioButton',
      checked: false,
      textSize: '16sp',
      textColor: '#000000',
      buttonTint: '#6200EE',
      padding: '4dp',
      margin: '4dp',
      id: '',
    },
    propertySchema: [
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'checked', label: 'Checked', type: 'boolean' },
      { key: 'textSize', label: 'Text Size', type: 'text' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'buttonTint', label: 'Button Tint', type: 'color' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <label style="display:flex;align-items:center;gap:8px;font-family:sans-serif;font-size:${props.textSize?.replace('sp','') || 16}px;color:${props.textColor};cursor:pointer;">
        <input type="radio" ${props.checked ? 'checked' : ''} style="width:18px;height:18px;accent-color:${props.buttonTint};" onclick="event.preventDefault()">
        <span>${props.text}</span>
      </label>`,
    xmlTag: 'RadioButton',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:text': props.text,
      'android:checked': props.checked ? 'true' : 'false',
      'android:textSize': props.textSize,
      'android:textColor': props.textColor,
      'android:buttonTint': props.buttonTint,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<RadioButton>(R.id.${id})`,
      `${id}.setOnCheckedChangeListener { _, isChecked -> /* handle change */ }`,
    ] : [],
  },
  {
    type: 'ToggleButton',
    category: 'basic',
    icon: '🔁',
    label: 'ToggleButton',
    tags: ['toggle', 'button', 'on', 'off'],
    defaultProps: {
      width: 'wrap_content',
      height: 'wrap_content',
      textOn: 'ON',
      textOff: 'OFF',
      checked: false,
      padding: '8dp',
      margin: '4dp',
      id: '',
      backgroundTint: '#6200EE',
    },
    propertySchema: [
      { key: 'textOn', label: 'Text (ON)', type: 'text' },
      { key: 'textOff', label: 'Text (OFF)', type: 'text' },
      { key: 'checked', label: 'Checked', type: 'boolean' },
      { key: 'backgroundTint', label: 'Background Tint', type: 'color' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <button style="
        background:${props.checked ? props.backgroundTint : '#ccc'};
        color:#fff;
        border:none;
        border-radius:4px;
        padding:8px 16px;
        font-size:14px;
        font-family:sans-serif;
        cursor:pointer;
      ">${props.checked ? props.textOn : props.textOff}</button>`,
    xmlTag: 'ToggleButton',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:textOn': props.textOn,
      'android:textOff': props.textOff,
      'android:checked': props.checked ? 'true' : 'false',
      'android:backgroundTint': props.backgroundTint,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<ToggleButton>(R.id.${id})`,
      `${id}.setOnCheckedChangeListener { _, isChecked -> /* handle toggle */ }`,
    ] : [],
  },

  // ===== Layout Components =====
  {
    type: 'LinearLayout',
    category: 'layout',
    icon: '⬛',
    label: 'LinearLayout',
    tags: ['layout', 'linear', 'vertical', 'horizontal', 'container'],
    isContainer: true,
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      orientation: 'vertical',
      gravity: 'start|top',
      weightSum: '',
      padding: '8dp',
      margin: '0dp',
      id: '',
      backgroundColor: 'transparent',
      dividerDrawable: '',
    },
    propertySchema: [
      { key: 'orientation', label: 'Orientation', type: 'select', options: ['vertical', 'horizontal'] },
      { key: 'gravity', label: 'Gravity', type: 'select', options: ['start|top', 'center', 'end|bottom', 'center_horizontal', 'center_vertical'] },
      { key: 'weightSum', label: 'Weight Sum', type: 'number' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        border:2px dashed #2196F3;
        border-radius:4px;
        padding:8px;
        min-height:60px;
        background:rgba(33,150,243,0.05);
        display:flex;
        flex-direction:${props.orientation === 'horizontal' ? 'row' : 'column'};
        gap:4px;
        font-family:sans-serif;
        font-size:11px;
        color:#2196F3;
      ">
        <div style="text-align:center;width:100%;">LinearLayout (${props.orientation})</div>
      </div>`,
    xmlTag: 'LinearLayout',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:orientation': props.orientation,
      'android:gravity': props.gravity,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      ...(props.backgroundColor !== 'transparent' ? { 'android:background': props.backgroundColor } : {}),
      ...(props.weightSum ? { 'android:weightSum': props.weightSum } : {}),
    }),
  },
  {
    type: 'FrameLayout',
    category: 'layout',
    icon: '🪟',
    label: 'FrameLayout',
    tags: ['layout', 'frame', 'overlay', 'container'],
    isContainer: true,
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      padding: '8dp',
      margin: '0dp',
      id: '',
      backgroundColor: 'transparent',
      foreground: '',
    },
    propertySchema: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color' },
      { key: 'foreground', label: 'Foreground', type: 'text' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        border:2px dashed #FF9800;
        border-radius:4px;
        padding:8px;
        min-height:60px;
        background:rgba(255,152,0,0.05);
        position:relative;
        font-family:sans-serif;
        font-size:11px;
        color:#FF9800;
        text-align:center;
      ">FrameLayout</div>`,
    xmlTag: 'FrameLayout',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      ...(props.backgroundColor !== 'transparent' ? { 'android:background': props.backgroundColor } : {}),
    }),
  },
  {
    type: 'GridLayout',
    category: 'layout',
    icon: '▦',
    label: 'GridLayout',
    tags: ['layout', 'grid', 'columns', 'container'],
    isContainer: true,
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      columnCount: 2,
      rowCount: '',
      padding: '8dp',
      margin: '0dp',
      id: '',
      useDefaultMargins: true,
      alignmentMode: 'alignBounds',
    },
    propertySchema: [
      { key: 'columnCount', label: 'Column Count', type: 'number' },
      { key: 'rowCount', label: 'Row Count', type: 'number' },
      { key: 'useDefaultMargins', label: 'Use Default Margins', type: 'boolean' },
      { key: 'alignmentMode', label: 'Alignment Mode', type: 'select', options: ['alignBounds', 'alignMargins'] },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        border:2px dashed #4CAF50;
        border-radius:4px;
        padding:8px;
        min-height:60px;
        background:rgba(76,175,80,0.05);
        display:grid;
        grid-template-columns:repeat(${props.columnCount || 2}, 1fr);
        gap:4px;
        font-family:sans-serif;
        font-size:11px;
        color:#4CAF50;
      ">
        ${Array.from({length: (props.columnCount || 2) * 2}).map(() =>
          `<div style="background:rgba(76,175,80,0.2);border-radius:2px;padding:4px;text-align:center;font-size:10px;">cell</div>`
        ).join('')}
      </div>`,
    xmlTag: 'GridLayout',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:columnCount': String(props.columnCount),
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:useDefaultMargins': props.useDefaultMargins ? 'true' : 'false',
      'android:alignmentMode': props.alignmentMode,
      ...(props.rowCount ? { 'android:rowCount': String(props.rowCount) } : {}),
    }),
  },
  {
    type: 'RelativeLayout',
    category: 'layout',
    icon: '⊞',
    label: 'RelativeLayout',
    tags: ['layout', 'relative', 'position', 'container'],
    isContainer: true,
    defaultProps: {
      width: 'match_parent',
      height: 'match_parent',
      padding: '8dp',
      margin: '0dp',
      id: '',
      gravity: '',
      backgroundColor: 'transparent',
    },
    propertySchema: [
      { key: 'gravity', label: 'Gravity', type: 'select', options: ['', 'center', 'top', 'bottom', 'left', 'right'] },
      { key: 'backgroundColor', label: 'Background Color', type: 'color' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        border:2px dashed #E91E63;
        border-radius:4px;
        padding:8px;
        min-height:60px;
        background:rgba(233,30,99,0.05);
        position:relative;
        font-family:sans-serif;
        font-size:11px;
        color:#E91E63;
        text-align:center;
      ">RelativeLayout</div>`,
    xmlTag: 'RelativeLayout',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      ...(props.gravity ? { 'android:gravity': props.gravity } : {}),
      ...(props.backgroundColor !== 'transparent' ? { 'android:background': props.backgroundColor } : {}),
    }),
  },
  {
    type: 'ConstraintLayout',
    category: 'layout',
    icon: '🔗',
    label: 'ConstraintLayout',
    tags: ['layout', 'constraint', 'responsive', 'container'],
    isContainer: true,
    defaultProps: {
      width: 'match_parent',
      height: 'match_parent',
      padding: '0dp',
      margin: '0dp',
      id: '',
      backgroundColor: 'transparent',
    },
    propertySchema: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        border:2px dashed #9C27B0;
        border-radius:4px;
        padding:8px;
        min-height:80px;
        background:rgba(156,39,176,0.05);
        position:relative;
        font-family:sans-serif;
        font-size:11px;
        color:#9C27B0;
        text-align:center;
      ">ConstraintLayout</div>`,
    xmlTag: 'ConstraintLayout',
    xmlNamespace: 'androidx.constraintlayout.widget',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      ...(props.backgroundColor !== 'transparent' ? { 'android:background': props.backgroundColor } : {}),
    }),
    gradleDependency: "implementation 'androidx.constraintlayout:constraintlayout:2.1.4'",
  },

  // ===== Advanced Components =====
  {
    type: 'RecyclerView',
    category: 'list',
    icon: '♻️',
    label: 'RecyclerView',
    tags: ['list', 'recycler', 'scroll', 'adapter', 'modern'],
    defaultProps: {
      width: 'match_parent',
      height: 'match_parent',
      layoutManager: 'LinearLayoutManager',
      orientation: 'vertical',
      hasFixedSize: true,
      clipToPadding: false,
      padding: '0dp',
      margin: '0dp',
      id: '',
      itemDecoration: 'DividerItemDecoration',
    },
    propertySchema: [
      { key: 'layoutManager', label: 'Layout Manager', type: 'select',
        options: ['LinearLayoutManager', 'GridLayoutManager', 'StaggeredGridLayoutManager'] },
      { key: 'orientation', label: 'Orientation', type: 'select', options: ['vertical', 'horizontal'] },
      { key: 'hasFixedSize', label: 'Has Fixed Size', type: 'boolean' },
      { key: 'itemDecoration', label: 'Item Decoration', type: 'select',
        options: ['None', 'DividerItemDecoration'] },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="border:1px solid #ccc;border-radius:4px;overflow:hidden;font-family:sans-serif;font-size:13px;">
        ${[1,2,3].map(i => `
          <div style="display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid #eee;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);flex-shrink:0;"></div>
            <div>
              <div style="font-weight:500;font-size:14px;">Item ${i}</div>
              <div style="color:#666;font-size:12px;">Subtitle ${i}</div>
            </div>
          </div>`).join('')}
        <div style="text-align:center;padding:8px;color:#999;font-size:11px;">♻️ RecyclerView</div>
      </div>`,
    xmlTag: 'androidx.recyclerview.widget.RecyclerView',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      'android:clipToPadding': props.clipToPadding ? 'true' : 'false',
      'app:layoutManager': props.layoutManager === 'GridLayoutManager'
        ? 'androidx.recyclerview.widget.GridLayoutManager'
        : 'androidx.recyclerview.widget.LinearLayoutManager',
      'android:orientation': props.orientation,
    }),
    gradleDependency: "implementation 'androidx.recyclerview:recyclerview:1.3.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<RecyclerView>(R.id.${id})`,
      `${id}.layoutManager = ${props.layoutManager}(this${props.orientation === 'horizontal' ? ', RecyclerView.HORIZONTAL' : ''})`,
      `${id}.adapter = Your${id.charAt(0).toUpperCase() + id.slice(1)}Adapter(dataList)`,
      ...(props.hasFixedSize ? [`${id}.setHasFixedSize(true)`] : []),
      ...(props.itemDecoration === 'DividerItemDecoration' ? [
        `${id}.addItemDecoration(DividerItemDecoration(this, DividerItemDecoration.VERTICAL))`
      ] : []),
    ] : [],
    adapterTemplate: (id) => `
class ${id ? id.charAt(0).toUpperCase() + id.slice(1) : 'My'}Adapter(private val items: List<String>) :
    RecyclerView.Adapter<${id ? id.charAt(0).toUpperCase() + id.slice(1) : 'My'}Adapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textView: TextView = view.findViewById(R.id.text)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_layout, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.textView.text = items[position]
    }

    override fun getItemCount() = items.size
}`,
  },
  {
    type: 'ViewPager',
    category: 'list',
    icon: '📖',
    label: 'ViewPager2',
    tags: ['pager', 'swipe', 'pages', 'viewpager'],
    defaultProps: {
      width: 'match_parent',
      height: 'match_parent',
      orientation: 'horizontal',
      offscreenPageLimit: 1,
      padding: '0dp',
      margin: '0dp',
      id: '',
      overScrollMode: 'never',
    },
    propertySchema: [
      { key: 'orientation', label: 'Orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'offscreenPageLimit', label: 'Offscreen Page Limit', type: 'number' },
      { key: 'overScrollMode', label: 'Over Scroll Mode', type: 'select', options: ['never', 'always', 'ifContentScrolls'] },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="border:1px solid #ccc;border-radius:4px;overflow:hidden;font-family:sans-serif;font-size:13px;position:relative;">
        <div style="display:flex;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:40px 16px;justify-content:center;align-items:center;">
          <div style="font-size:16px;">Page 1</div>
        </div>
        <div style="display:flex;justify-content:center;gap:4px;padding:8px;">
          <span style="width:8px;height:8px;border-radius:50%;background:#6200EE;display:inline-block;"></span>
          <span style="width:8px;height:8px;border-radius:50%;background:#ccc;display:inline-block;"></span>
          <span style="width:8px;height:8px;border-radius:50%;background:#ccc;display:inline-block;"></span>
        </div>
      </div>`,
    xmlTag: 'androidx.viewpager2.widget.ViewPager2',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:orientation': props.orientation,
      'android:overScrollMode': props.overScrollMode,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
    gradleDependency: "implementation 'androidx.viewpager2:viewpager2:1.0.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<ViewPager2>(R.id.${id})`,
      `${id}.adapter = YourPagerAdapter(supportFragmentManager, lifecycle)`,
      `${id}.offscreenPageLimit = ${props.offscreenPageLimit}`,
    ] : [],
  },
  {
    type: 'TabLayout',
    category: 'navigation',
    icon: '📑',
    label: 'TabLayout',
    tags: ['tab', 'navigation', 'layout', 'tabs'],
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      tabMode: 'fixed',
      tabGravity: 'fill',
      selectedTabIndicatorColor: '#FFFFFF',
      tabTextColor: '#FFFFFF',
      selectedTabTextColor: '#FFFFFF',
      tabBackground: '#6200EE',
      padding: '0dp',
      margin: '0dp',
      id: '',
      tabCount: 3,
      tabLabels: 'Tab 1\nTab 2\nTab 3',
    },
    propertySchema: [
      { key: 'tabLabels', label: 'Tab Labels (newline separated)', type: 'textarea' },
      { key: 'tabMode', label: 'Tab Mode', type: 'select', options: ['fixed', 'scrollable', 'auto'] },
      { key: 'tabGravity', label: 'Tab Gravity', type: 'select', options: ['fill', 'center', 'start'] },
      { key: 'tabBackground', label: 'Tab Background', type: 'color' },
      { key: 'selectedTabIndicatorColor', label: 'Indicator Color', type: 'color' },
      { key: 'tabTextColor', label: 'Tab Text Color', type: 'color' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => {
      const tabs = (props.tabLabels || 'Tab 1\nTab 2\nTab 3').split('\n').filter(Boolean);
      return `<div style="
        background:${props.tabBackground || '#6200EE'};
        display:flex;
        font-family:sans-serif;
        font-size:13px;
        border-radius:4px;
        overflow:hidden;
      ">
        ${tabs.map((tab, i) => `
          <div style="
            flex:1;padding:12px 8px;
            color:${props.tabTextColor || '#FFFFFF'};
            text-align:center;
            font-weight:${i===0?'600':'400'};
            border-bottom:${i===0?`3px solid ${props.selectedTabIndicatorColor || '#fff'}`:'none'};
            font-size:12px;
          ">${tab}</div>`).join('')}
      </div>`;
    },
    xmlTag: 'com.google.android.material.tabs.TabLayout',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'app:tabMode': props.tabMode,
      'app:tabGravity': props.tabGravity,
      'app:tabIndicatorColor': props.selectedTabIndicatorColor,
      'app:tabTextColor': props.tabTextColor,
      'app:tabSelectedTextColor': props.selectedTabTextColor,
      'android:background': props.tabBackground,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
    gradleDependency: "implementation 'com.google.android.material:material:1.9.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<TabLayout>(R.id.${id})`,
      `${(props.tabLabels || 'Tab 1\nTab 2\nTab 3').split('\n').map(tab =>
        `${id}.addTab(${id}.newTab().setText("${tab}"))`).join('\n')}`,
      `${id}.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {`,
      `    override fun onTabSelected(tab: TabLayout.Tab?) { /* handle */ }`,
      `    override fun onTabUnselected(tab: TabLayout.Tab?) {}`,
      `    override fun onTabReselected(tab: TabLayout.Tab?) {}`,
      `})`,
    ] : [],
  },
  {
    type: 'NavigationView',
    category: 'navigation',
    icon: '🧭',
    label: 'NavigationView',
    tags: ['navigation', 'drawer', 'menu', 'nav'],
    defaultProps: {
      width: 'wrap_content',
      height: 'match_parent',
      headerLayout: '@layout/nav_header',
      menu: '@menu/nav_menu',
      padding: '0dp',
      margin: '0dp',
      id: '',
      fitsSystemWindows: true,
    },
    propertySchema: [
      { key: 'headerLayout', label: 'Header Layout', type: 'text' },
      { key: 'menu', label: 'Menu Resource', type: 'text' },
      { key: 'fitsSystemWindows', label: 'Fits System Windows', type: 'boolean' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        border:1px solid #ccc;
        border-radius:4px;
        overflow:hidden;
        font-family:sans-serif;
        font-size:13px;
        min-width:220px;
      ">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;color:#fff;">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.3);margin-bottom:8px;"></div>
          <div style="font-weight:600;">User Name</div>
          <div style="font-size:11px;opacity:0.8;">user@example.com</div>
        </div>
        ${['Home', 'Profile', 'Settings', 'Help'].map((item, i) => `
          <div style="padding:12px 16px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:12px;${i===0?'background:#EDE7F6;color:#6200EE;':''}">
            <span>${['🏠','👤','⚙️','❓'][i]}</span>
            <span style="font-size:14px;">${item}</span>
          </div>`).join('')}
      </div>`,
    xmlTag: 'com.google.android.material.navigation.NavigationView',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'app:headerLayout': props.headerLayout,
      'app:menu': props.menu,
      'android:fitsSystemWindows': props.fitsSystemWindows ? 'true' : 'false',
      'android:layout_gravity': 'start',
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
    gradleDependency: "implementation 'com.google.android.material:material:1.9.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<NavigationView>(R.id.${id})`,
      `${id}.setNavigationItemSelectedListener { item ->`,
      `    when (item.itemId) {`,
      `        R.id.nav_home -> { /* navigate to home */ }`,
      `        R.id.nav_profile -> { /* navigate to profile */ }`,
      `    }`,
      `    true`,
      `}`,
    ] : [],
  },
  {
    type: 'FloatingActionButton',
    category: 'material',
    icon: '➕',
    label: 'FAB',
    tags: ['fab', 'floating', 'action', 'button', 'material'],
    defaultProps: {
      width: 'wrap_content',
      height: 'wrap_content',
      src: '@drawable/ic_add',
      contentDescription: 'Floating Action Button',
      backgroundTint: '#6200EE',
      tint: '#FFFFFF',
      size: 'normal',
      elevation: '6dp',
      margin: '16dp',
      id: '',
      layout_gravity: 'bottom|end',
    },
    propertySchema: [
      { key: 'src', label: 'Icon Source', type: 'text' },
      { key: 'contentDescription', label: 'Content Description', type: 'text' },
      { key: 'backgroundTint', label: 'Background Tint', type: 'color' },
      { key: 'tint', label: 'Icon Tint', type: 'color' },
      { key: 'size', label: 'Size', type: 'select', options: ['normal', 'mini', 'auto'] },
      { key: 'elevation', label: 'Elevation', type: 'dimension' },
      { key: 'layout_gravity', label: 'Layout Gravity', type: 'select', options: ['bottom|end', 'bottom|start', 'bottom|center_horizontal', 'top|end', 'top|start'] },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        width:${props.size === 'mini' ? '40px' : '56px'};
        height:${props.size === 'mini' ? '40px' : '56px'};
        border-radius:50%;
        background:${props.backgroundTint};
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:${props.size === 'mini' ? '18px' : '24px'};
        box-shadow:0 4px 8px rgba(0,0,0,0.3);
        cursor:pointer;
        color:${props.tint};
      ">➕</div>`,
    xmlTag: 'com.google.android.material.floatingactionbutton.FloatingActionButton',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'app:srcCompat': props.src,
      'android:contentDescription': props.contentDescription,
      'app:backgroundTint': props.backgroundTint,
      'app:tint': props.tint,
      'app:fabSize': props.size,
      'android:elevation': props.elevation,
      'android:layout_gravity': props.layout_gravity,
      'android:layout_margin': props.margin,
    }),
    gradleDependency: "implementation 'com.google.android.material:material:1.9.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<FloatingActionButton>(R.id.${id})`,
      `${id}.setOnClickListener { /* handle FAB click */ }`,
    ] : [],
  },

  // ===== Material Design Components =====
  {
    type: 'MaterialButton',
    category: 'material',
    icon: '🔷',
    label: 'MaterialButton',
    tags: ['button', 'material', 'design', 'md3'],
    defaultProps: {
      width: 'wrap_content',
      height: 'wrap_content',
      text: 'Material Button',
      style: 'filled',
      backgroundTint: '#6200EE',
      textColor: '#FFFFFF',
      rippleColor: '#3700B3',
      cornerRadius: '4dp',
      strokeWidth: '0dp',
      strokeColor: '#6200EE',
      iconSrc: '',
      iconGravity: 'textStart',
      padding: '8dp',
      margin: '4dp',
      id: '',
      textAllCaps: true,
    },
    propertySchema: [
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'style', label: 'Style', type: 'select', options: ['filled', 'outlined', 'text', 'elevated', 'tonal'] },
      { key: 'backgroundTint', label: 'Background Color', type: 'color' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'cornerRadius', label: 'Corner Radius', type: 'dimension' },
      { key: 'strokeWidth', label: 'Stroke Width', type: 'dimension' },
      { key: 'strokeColor', label: 'Stroke Color', type: 'color' },
      { key: 'iconSrc', label: 'Icon', type: 'text' },
      { key: 'textAllCaps', label: 'All Caps', type: 'boolean' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => {
      const isOutlined = props.style === 'outlined';
      const isText = props.style === 'text';
      return `<button style="
        background:${isOutlined || isText ? 'transparent' : props.backgroundTint};
        color:${isOutlined || isText ? props.backgroundTint : props.textColor};
        border:${isOutlined ? `2px solid ${props.strokeColor || props.backgroundTint}` : 'none'};
        border-radius:${props.cornerRadius?.replace('dp','') || 4}px;
        padding:10px 24px;
        font-size:14px;
        font-family:sans-serif;
        cursor:pointer;
        font-weight:500;
        text-transform:${props.textAllCaps ? 'uppercase' : 'none'};
        letter-spacing:0.05em;
        box-shadow:${props.style === 'elevated' ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'};
      ">${props.text}</button>`;
    },
    xmlTag: 'com.google.android.material.button.MaterialButton',
    xmlStyle: (props) => {
      const styles = {
        filled: '',
        outlined: '@style/Widget.Material3.Button.OutlinedButton',
        text: '@style/Widget.Material3.Button.TextButton',
        elevated: '@style/Widget.Material3.Button.ElevatedButton',
        tonal: '@style/Widget.Material3.Button.TonalButton',
      };
      return styles[props.style] || '';
    },
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:text': props.text,
      'app:backgroundTint': props.backgroundTint,
      'android:textColor': props.textColor,
      'app:cornerRadius': props.cornerRadius,
      'app:strokeWidth': props.strokeWidth,
      'app:strokeColor': props.strokeColor,
      'android:textAllCaps': props.textAllCaps ? 'true' : 'false',
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
      ...(props.iconSrc ? { 'app:icon': props.iconSrc, 'app:iconGravity': props.iconGravity } : {}),
    }),
    gradleDependency: "implementation 'com.google.android.material:material:1.9.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<MaterialButton>(R.id.${id})`,
      `${id}.setOnClickListener { /* handle click */ }`,
    ] : [],
  },
  {
    type: 'MaterialCardView',
    category: 'material',
    icon: '🃏',
    label: 'MaterialCardView',
    tags: ['card', 'material', 'container', 'elevation'],
    isContainer: true,
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      cardElevation: '4dp',
      cardCornerRadius: '8dp',
      strokeWidth: '0dp',
      strokeColor: '#E0E0E0',
      cardBackgroundColor: '#FFFFFF',
      contentPadding: '16dp',
      margin: '8dp',
      id: '',
      rippleColor: '',
      checkedIconTint: '#6200EE',
    },
    propertySchema: [
      { key: 'cardElevation', label: 'Elevation', type: 'dimension' },
      { key: 'cardCornerRadius', label: 'Corner Radius', type: 'dimension' },
      { key: 'strokeWidth', label: 'Stroke Width', type: 'dimension' },
      { key: 'strokeColor', label: 'Stroke Color', type: 'color' },
      { key: 'cardBackgroundColor', label: 'Background Color', type: 'color' },
      { key: 'contentPadding', label: 'Content Padding', type: 'dimension' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        background:${props.cardBackgroundColor};
        border-radius:${props.cardCornerRadius?.replace('dp','') || 8}px;
        padding:${props.contentPadding?.replace('dp','') || 16}px;
        box-shadow:0 ${props.cardElevation?.replace('dp','') || 4}px ${(parseInt(props.cardElevation) || 4) * 2}px rgba(0,0,0,0.15);
        border:${props.strokeWidth !== '0dp' ? `1px solid ${props.strokeColor}` : 'none'};
        font-family:sans-serif;
        min-height:80px;
      ">
        <div style="font-weight:600;font-size:14px;margin-bottom:4px;">Card Title</div>
        <div style="font-size:12px;color:#666;">Card content goes here</div>
      </div>`,
    xmlTag: 'com.google.android.material.card.MaterialCardView',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'app:cardElevation': props.cardElevation,
      'app:cardCornerRadius': props.cardCornerRadius,
      'app:strokeWidth': props.strokeWidth,
      'app:strokeColor': props.strokeColor,
      'app:cardBackgroundColor': props.cardBackgroundColor,
      'app:contentPadding': props.contentPadding,
      'android:layout_margin': props.margin,
    }),
    gradleDependency: "implementation 'com.google.android.material:material:1.9.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<MaterialCardView>(R.id.${id})`,
      `${id}.setOnClickListener { /* handle card click */ }`,
    ] : [],
  },
  {
    type: 'Chip',
    category: 'material',
    icon: '🏷️',
    label: 'Chip',
    tags: ['chip', 'tag', 'filter', 'material'],
    defaultProps: {
      width: 'wrap_content',
      height: 'wrap_content',
      text: 'Chip Label',
      chipStyle: 'action',
      chipBackgroundColor: '#E8EAF6',
      textColor: '#3F51B5',
      chipIconTint: '#3F51B5',
      chipIcon: '',
      checkable: false,
      closable: false,
      padding: '0dp',
      margin: '4dp',
      id: '',
    },
    propertySchema: [
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'chipStyle', label: 'Chip Style', type: 'select', options: ['action', 'choice', 'filter', 'entry'] },
      { key: 'chipBackgroundColor', label: 'Background Color', type: 'color' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'chipIcon', label: 'Icon', type: 'text' },
      { key: 'checkable', label: 'Checkable', type: 'boolean' },
      { key: 'closable', label: 'Close Button', type: 'boolean' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => `
      <div style="
        display:inline-flex;
        align-items:center;
        gap:4px;
        background:${props.chipBackgroundColor};
        color:${props.textColor};
        border-radius:16px;
        padding:4px 12px;
        font-size:13px;
        font-family:sans-serif;
        white-space:nowrap;
      ">
        ${props.chipIcon ? `<span>🏷️</span>` : ''}
        <span>${props.text}</span>
        ${props.closable ? `<span style="margin-left:4px;cursor:pointer;opacity:0.7;">✕</span>` : ''}
      </div>`,
    xmlTag: 'com.google.android.material.chip.Chip',
    xmlStyle: (props) => {
      const styles = {
        action: '@style/Widget.Material3.Chip.Action',
        choice: '@style/Widget.Material3.Chip.Choice',
        filter: '@style/Widget.Material3.Chip.Filter',
        entry: '@style/Widget.Material3.Chip.Input',
      };
      return styles[props.chipStyle] || '';
    },
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:text': props.text,
      'app:chipBackgroundColor': props.chipBackgroundColor,
      'android:textColor': props.textColor,
      'android:checkable': props.checkable ? 'true' : 'false',
      'app:closeIconVisible': props.closable ? 'true' : 'false',
      'android:layout_margin': props.margin,
      ...(props.chipIcon ? { 'app:chipIcon': props.chipIcon, 'app:chipIconTint': props.chipIconTint } : {}),
    }),
    gradleDependency: "implementation 'com.google.android.material:material:1.9.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<Chip>(R.id.${id})`,
      `${id}.setOnClickListener { /* handle chip click */ }`,
      ...(props.closable ? [`${id}.setOnCloseIconClickListener { /* handle close */ }`] : []),
    ] : [],
  },
  {
    type: 'ProgressBar',
    category: 'material',
    icon: '⏳',
    label: 'ProgressBar',
    tags: ['progress', 'loading', 'indicator', 'bar'],
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      style: 'horizontal',
      progress: 50,
      max: 100,
      min: 0,
      indeterminate: false,
      progressTint: '#6200EE',
      progressBackgroundTint: '#E0E0E0',
      padding: '4dp',
      margin: '4dp',
      id: '',
      secondaryProgress: 0,
    },
    propertySchema: [
      { key: 'style', label: 'Style', type: 'select', options: ['horizontal', 'circular'] },
      { key: 'progress', label: 'Progress', type: 'number' },
      { key: 'max', label: 'Max Value', type: 'number' },
      { key: 'min', label: 'Min Value', type: 'number' },
      { key: 'indeterminate', label: 'Indeterminate', type: 'boolean' },
      { key: 'progressTint', label: 'Progress Color', type: 'color' },
      { key: 'progressBackgroundTint', label: 'Track Color', type: 'color' },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => {
      const pct = props.indeterminate ? 40 : Math.min(100, Math.max(0, (props.progress / props.max) * 100));
      if (props.style === 'circular') {
        return `<div style="
          width:48px;height:48px;
          border:4px solid ${props.progressBackgroundTint};
          border-top-color:${props.progressTint};
          border-radius:50%;
          ${props.indeterminate ? 'animation:spin 1s linear infinite;' : ''}
          display:inline-block;
        "></div>`;
      }
      return `<div style="font-family:sans-serif;font-size:12px;">
        <div style="background:${props.progressBackgroundTint};border-radius:4px;height:8px;overflow:hidden;">
          <div style="background:${props.progressTint};width:${pct}%;height:100%;border-radius:4px;transition:width 0.3s;${props.indeterminate ? 'animation:indeterminate 1.5s ease-in-out infinite;' : ''}"></div>
        </div>
        ${!props.indeterminate ? `<div style="text-align:right;color:#666;margin-top:2px;font-size:11px;">${props.progress}/${props.max}</div>` : ''}
      </div>`;
    },
    xmlTag: 'ProgressBar',
    xmlStyle: (props) => props.style === 'circular'
      ? '?android:attr/progressBarStyle'
      : '?android:attr/progressBarStyleHorizontal',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:progress': String(props.progress),
      'android:max': String(props.max),
      'android:min': String(props.min),
      'android:indeterminate': props.indeterminate ? 'true' : 'false',
      'android:progressTint': props.progressTint,
      'android:progressBackgroundTint': props.progressBackgroundTint,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<ProgressBar>(R.id.${id})`,
      `${id}.progress = ${props.progress}`,
      `${id}.max = ${props.max}`,
      ...(props.indeterminate ? [`${id}.isIndeterminate = true`] : []),
    ] : [],
  },
  {
    type: 'Slider',
    category: 'material',
    icon: '🎚️',
    label: 'Slider',
    tags: ['slider', 'range', 'seek', 'material'],
    defaultProps: {
      width: 'match_parent',
      height: 'wrap_content',
      value: 50,
      valueFrom: 0,
      valueTo: 100,
      stepSize: 1,
      thumbRadius: '10dp',
      thumbColor: '#6200EE',
      trackColor: '#6200EE',
      trackColorInactive: '#E0E0E0',
      padding: '8dp',
      margin: '4dp',
      id: '',
      labelBehavior: 'floating',
      haloRadius: '16dp',
    },
    propertySchema: [
      { key: 'value', label: 'Value', type: 'number' },
      { key: 'valueFrom', label: 'Min Value', type: 'number' },
      { key: 'valueTo', label: 'Max Value', type: 'number' },
      { key: 'stepSize', label: 'Step Size', type: 'number' },
      { key: 'thumbColor', label: 'Thumb Color', type: 'color' },
      { key: 'trackColor', label: 'Active Track Color', type: 'color' },
      { key: 'trackColorInactive', label: 'Inactive Track Color', type: 'color' },
      { key: 'labelBehavior', label: 'Label Behavior', type: 'select', options: ['floating', 'withinBounds', 'gone'] },
      { key: 'width', label: 'Width', type: 'dimension' },
      { key: 'height', label: 'Height', type: 'dimension' },
      { key: 'padding', label: 'Padding', type: 'dimension' },
      { key: 'margin', label: 'Margin', type: 'dimension' },
      { key: 'id', label: 'ID', type: 'text' },
    ],
    preview: (props) => {
      const pct = ((props.value - props.valueFrom) / (props.valueTo - props.valueFrom)) * 100;
      return `<div style="padding:8px 0;font-family:sans-serif;">
        <input type="range"
          min="${props.valueFrom}"
          max="${props.valueTo}"
          value="${props.value}"
          step="${props.stepSize}"
          style="width:100%;accent-color:${props.thumbColor};"
          oninput="event.preventDefault()">
        <div style="text-align:center;font-size:11px;color:#666;">${props.value}</div>
      </div>`;
    },
    xmlTag: 'com.google.android.material.slider.Slider',
    xmlAttrs: (props) => ({
      'android:layout_width': props.width,
      'android:layout_height': props.height,
      'android:value': String(props.value),
      'android:valueFrom': String(props.valueFrom),
      'android:valueTo': String(props.valueTo),
      'android:stepSize': String(props.stepSize),
      'app:thumbRadius': props.thumbRadius,
      'app:thumbColor': props.thumbColor,
      'app:trackColor': props.trackColor,
      'app:trackColorInactive': props.trackColorInactive,
      'app:labelBehavior': props.labelBehavior,
      'app:haloRadius': props.haloRadius,
      'android:padding': props.padding,
      'android:layout_margin': props.margin,
    }),
    gradleDependency: "implementation 'com.google.android.material:material:1.9.0'",
    kotlinCode: (id, props) => id ? [
      `val ${id} = findViewById<Slider>(R.id.${id})`,
      `${id}.value = ${props.value}f`,
      `${id}.addOnChangeListener { slider, value, fromUser -> /* handle change */ }`,
    ] : [],
  },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EXTENDED_COMPONENTS;
}
