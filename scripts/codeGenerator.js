/**
 * Phase 1 + Phase 3: Code Generator
 * Generates Android XML layout files and Kotlin activity code
 */

class CodeGenerator {
  constructor(registry) {
    this._registry = registry;
  }

  /**
   * Generate complete XML layout file content
   * @param {Array} components - Array of component instances
   * @param {Object} options
   * @returns {string} XML string
   */
  generateXml(components, options = {}) {
    const rootLayout = options.rootLayout || 'LinearLayout';
    const orientation = options.orientation || 'vertical';
    const namespace = options.namespace !== false;

    const nsAttrs = namespace ? `
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"` : '';

    const inner = components.map(c => this._generateComponentXml(c, 1)).join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<${rootLayout}${nsAttrs}
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="${orientation}"
    tools:context=".MainActivity">

${inner}
</${rootLayout}>`;
  }

  /**
   * Generate Kotlin Activity code
   * @param {Array} components - Component instances
   * @param {Object} options
   * @returns {string} Kotlin code string
   */
  generateKotlin(components, options = {}) {
    const activityName = options.activityName || 'MainActivity';
    const packageName = options.packageName || 'com.example.myapp';
    const useViewBinding = options.useViewBinding !== false;
    const layoutName = options.layoutName || 'activity_main';

    // Check for MapView components – delegate to GoogleMapsCodegen when present
    const mapComponents = components.filter(c => c.type === 'MapView');
    if (mapComponents.length > 0 && typeof GoogleMapsCodegen !== 'undefined') {
      const mapComp = mapComponents[0];
      const markers = (typeof markerManager !== 'undefined')
        ? markerManager.getMarkers(mapComp.props && mapComp.props.id || '')
        : [];
      return GoogleMapsCodegen.generateKotlinActivity(mapComp, markers, { packageName, activityName });
    }

    // Gather imports
    const imports = new Set([
      'android.os.Bundle',
      'androidx.appcompat.app.AppCompatActivity',
    ]);

    // Gather component-specific code
    const initCode = [];
    const adapterClasses = [];

    components.forEach(comp => {
      const def = this._registry ? this._registry.get(comp.type) : null;
      const id = comp.props && comp.props.id;

      // Add type-specific imports
      const typeImports = this._getTypeImports(comp.type);
      typeImports.forEach(i => imports.add(i));

      // Binding or findViewById code
      if (id) {
        if (!useViewBinding) {
          initCode.push(`        val ${id} = findViewById<${this._getAndroidClass(comp.type)}>(R.id.${id})`);
        }
        // Add event listeners for interactive components
        const eventCode = this._generateEventCode(comp.type, id, comp.props, useViewBinding);
        eventCode.forEach(line => initCode.push(`        ${line}`));

        // RecyclerView adapter template
        if (comp.type === 'RecyclerView' && id) {
          adapterClasses.push(this._generateAdapterClass(id, comp.props));
        }
      }
    });

    const bindingRef = useViewBinding ? 'binding.' : '';
    const viewBindingInit = useViewBinding
      ? `        val binding = ActivityMainBinding.inflate(layoutInflater)\n        setContentView(binding.root)`
      : `        setContentView(R.layout.${layoutName})`;

    if (useViewBinding) {
      imports.add('${packageName}.databinding.ActivityMainBinding');
    }

    const importsStr = Array.from(imports)
      .sort()
      .map(i => `import ${i}`)
      .join('\n');

    const initCodeStr = initCode.length > 0
      ? `\n\n${initCode.join('\n')}`
      : '';

    let code = `package ${packageName}

${importsStr}

class ${activityName} : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
${viewBindingInit}${initCodeStr}
    }
}`;

    if (adapterClasses.length > 0) {
      code += '\n\n' + adapterClasses.join('\n\n');
    }

    return code;
  }

  /**
   * Generate menu XML (for OptionsMenu component)
   * @param {Object} menuComponent - Menu component instance
   * @returns {string}
   */
  generateMenuXml(menuComponent) {
    const items = (menuComponent.props.items || '').split('\n').filter(Boolean);
    return `<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">

${items.map((item, i) => {
  const id = item.toLowerCase().replace(/\s+/g, '_');
  return `    <item
        android:id="@+id/${id}"
        android:title="${item}"
        app:showAsAction="never" />`;
}).join('\n\n')}

</menu>`;
  }

  /**
   * Generate strings.xml resource file
   * @param {Array} components - Component instances
   * @param {Object} options
   * @returns {string}
   */
  generateStringsXml(components, options = {}) {
    const appName = options.appName || 'MyApp';
    const strings = new Map();
    strings.set('app_name', appName);

    components.forEach(comp => {
      if (comp.props) {
        if (comp.props.text) strings.set(`${comp.props.id || comp.type.toLowerCase()}_text`, comp.props.text);
        if (comp.props.hint) strings.set(`${comp.props.id || comp.type.toLowerCase()}_hint`, comp.props.hint);
        if (comp.props.contentDescription) {
          strings.set(`${comp.props.id || comp.type.toLowerCase()}_desc`, comp.props.contentDescription);
        }
      }
    });

    const entries = Array.from(strings.entries())
      .map(([k, v]) => `    <string name="${k}">${this._escapeXml(v)}</string>`)
      .join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<resources>
${entries}
</resources>`;
  }

  /**
   * Generate a RecyclerView item layout XML
   * @param {string} itemId - Layout file name
   * @returns {string}
   */
  generateRecyclerItemLayout(itemId = 'item_layout') {
    return `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="16dp">

    <ImageView
        android:id="@+id/item_icon"
        android:layout_width="40dp"
        android:layout_height="40dp"
        android:src="@drawable/ic_launcher"
        android:contentDescription="@string/app_name"
        android:scaleType="centerCrop" />

    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:orientation="vertical"
        android:paddingStart="12dp">

        <TextView
            android:id="@+id/item_title"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Title"
            android:textSize="16sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/item_subtitle"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Subtitle"
            android:textSize="12sp"
            android:textColor="@color/secondary_text" />

    </LinearLayout>

</LinearLayout>`;
  }

  // ---- Private helpers ----

  _generateComponentXml(component, indent) {
    const def = this._registry ? this._registry.get(component.type) : null;
    const tag = def ? def.xmlTag : component.type;
    const props = component.props || {};
    const id = props.id;

    const attrFn = def && def.xmlAttrs ? def.xmlAttrs : () => ({});
    const rawAttrs = attrFn(props);

    // Filter out empty/null attrs
    const attrs = Object.fromEntries(
      Object.entries(rawAttrs).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    if (id) attrs['android:id'] = `@+id/${id}`;

    // Apply style if any
    const styleAttr = def && def.xmlStyle ? def.xmlStyle(props) : '';

    const indentStr = '    '.repeat(indent);
    const attrLines = Object.entries(attrs)
      .map(([k, v]) => `${indentStr}    ${k}="${this._escapeXml(String(v))}"`)
      .join('\n');

    const styleStr = styleAttr ? `\n${indentStr}    style="${styleAttr}"` : '';

    if (component.children && component.children.length > 0) {
      const childrenXml = component.children
        .map(c => this._generateComponentXml(c, indent + 1))
        .join('\n');
      return `${indentStr}<${tag}${styleStr}\n${attrLines}>\n\n${childrenXml}\n\n${indentStr}</${tag}>`;
    }

    if (!attrLines && !styleStr) {
      return `${indentStr}<${tag} />`;
    }
    return `${indentStr}<${tag}${styleStr}\n${attrLines} />`;
  }

  _generateEventCode(type, id, props, useViewBinding) {
    const lines = [];
    const ref = useViewBinding ? `binding.${id}` : id;

    switch (type) {
      case 'Button':
      case 'MaterialButton':
      case 'ImageButton':
      case 'FloatingActionButton':
        lines.push(`${ref}.setOnClickListener { /* TODO: handle click */ }`);
        break;
      case 'EditText':
        lines.push(`${ref}.addTextChangedListener { text -> /* TODO: handle text change */ }`);
        break;
      case 'CheckBox':
      case 'RadioButton':
      case 'ToggleButton':
        lines.push(`${ref}.setOnCheckedChangeListener { _, isChecked -> /* TODO: handle toggle */ }`);
        break;
      case 'Switch':
        lines.push(`${ref}.setOnCheckedChangeListener { _, isChecked -> /* TODO: handle switch */ }`);
        break;
      case 'Slider':
        lines.push(`${ref}.addOnChangeListener { _, value, _ -> /* TODO: handle slide */ }`);
        break;
      case 'Chip':
        lines.push(`${ref}.setOnClickListener { /* TODO: handle chip click */ }`);
        break;
      case 'RecyclerView': {
        const lm = props && props.layoutManager || 'LinearLayoutManager';
        lines.push(`${ref}.layoutManager = ${lm}(this)`);
        lines.push(`// ${ref}.adapter = YourAdapter(dataList)`);
        break;
      }
      case 'TabLayout':
        lines.push(`${ref}.addOnTabSelectedListener(object : com.google.android.material.tabs.TabLayout.OnTabSelectedListener {`);
        lines.push(`    override fun onTabSelected(tab: com.google.android.material.tabs.TabLayout.Tab?) { /* TODO */ }`);
        lines.push(`    override fun onTabUnselected(tab: com.google.android.material.tabs.TabLayout.Tab?) {}`);
        lines.push(`    override fun onTabReselected(tab: com.google.android.material.tabs.TabLayout.Tab?) {}`);
        lines.push(`})`);
        break;
    }
    return lines;
  }

  _generateAdapterClass(id, props) {
    const className = id.charAt(0).toUpperCase() + id.slice(1) + 'Adapter';
    return `class ${className}(private val items: List<String>) :
    androidx.recyclerview.widget.RecyclerView.Adapter<${className}.ViewHolder>() {

    inner class ViewHolder(itemView: android.view.View) :
        androidx.recyclerview.widget.RecyclerView.ViewHolder(itemView) {
        val titleView: android.widget.TextView = itemView.findViewById(R.id.item_title)
    }

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_layout, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.titleView.text = items[position]
    }

    override fun getItemCount() = items.size
}`;
  }

  _getTypeImports(type) {
    const importMap = {
      RecyclerView: ['androidx.recyclerview.widget.RecyclerView', 'androidx.recyclerview.widget.LinearLayoutManager'],
      ViewPager: ['androidx.viewpager2.widget.ViewPager2'],
      TabLayout: ['com.google.android.material.tabs.TabLayout'],
      FloatingActionButton: ['com.google.android.material.floatingactionbutton.FloatingActionButton'],
      MaterialButton: ['com.google.android.material.button.MaterialButton'],
      MaterialCardView: ['com.google.android.material.card.MaterialCardView'],
      Chip: ['com.google.android.material.chip.Chip'],
      Slider: ['com.google.android.material.slider.Slider'],
      NavigationView: ['com.google.android.material.navigation.NavigationView'],
      CheckBox: ['android.widget.CheckBox'],
      RadioButton: ['android.widget.RadioButton'],
      EditText: ['android.widget.EditText'],
      ImageView: ['android.widget.ImageView'],
      ToggleButton: ['android.widget.ToggleButton'],
      ProgressBar: ['android.widget.ProgressBar'],
    };
    return importMap[type] || [];
  }

  _getAndroidClass(type) {
    const classMap = {
      RecyclerView: 'RecyclerView',
      ViewPager: 'ViewPager2',
      TabLayout: 'TabLayout',
      FloatingActionButton: 'FloatingActionButton',
      MaterialButton: 'MaterialButton',
      MaterialCardView: 'MaterialCardView',
      Chip: 'Chip',
      Slider: 'Slider',
      NavigationView: 'NavigationView',
      ConstraintLayout: 'ConstraintLayout',
      LinearLayout: 'LinearLayout',
      FrameLayout: 'FrameLayout',
      RelativeLayout: 'RelativeLayout',
      GridLayout: 'GridLayout',
    };
    return classMap[type] || type;
  }

  _escapeXml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeGenerator;
}
