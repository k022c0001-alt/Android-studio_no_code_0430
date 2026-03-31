/**
 * codeGenerator.js
 * XML レイアウト / Kotlin ソースコード生成エンジン
 * Android No-Code Tool
 */

'use strict';

// ============================================================
// ユーティリティ
// ============================================================

/** dp/sp 単位を補完する */
function ensureUnit(value) {
  if (!value || value === 'match_parent' || value === 'wrap_content') return value;
  if (/^[\d.]+$/.test(String(value))) return value + 'dp';
  return value;
}

/** 色を #AARRGGBB または @color/... 形式に対応 */
function formatColor(color) {
  if (!color || color === 'transparent') return '@android:color/transparent';
  if (color.startsWith('@')) return color;
  return color;
}

/** インデントを生成 */
function indent(level, size = 4) {
  return ' '.repeat(level * size);
}

/**
 * Android リソース ID として有効な ASCII 文字列に変換する
 * 非 ASCII 文字や記号を除去し、先頭数字はアンダースコアを付ける
 */
function toAndroidId(str, index) {
  // スペースをアンダースコアに変換、ASCII 英数字とアンダースコア以外を除去
  let id = String(str)
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
  if (!id || /^\d/.test(id)) id = 'item_' + (index + 1);
  return id.toLowerCase();
}

// ============================================================
// XML 生成
// ============================================================

/**
 * コンポーネント配列から Activity レイアウト XML を生成する
 * @param {Array} components
 * @param {string} rootTag - ルートレイアウトタグ (default: LinearLayout)
 * @returns {string} XML 文字列
 */
function generateXML(components, rootTag = 'LinearLayout') {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="utf-8"?>');
  lines.push(`<${rootTag}`);
  lines.push('    xmlns:android="http://schemas.android.com/apk/res/android"');
  lines.push('    android:layout_width="match_parent"');
  lines.push('    android:layout_height="match_parent"');
  lines.push('    android:orientation="vertical"');
  lines.push('    android:padding="16dp">');
  lines.push('');

  for (const comp of components) {
    const xml = componentToXML(comp, 1);
    lines.push(...xml);
    lines.push('');
  }

  lines.push(`</${rootTag}>`);
  return lines.join('\n');
}

/**
 * 個別コンポーネントを XML 要素文字列に変換する
 */
function componentToXML(comp, indentLevel = 1) {
  const ind = indent(indentLevel);
  const ind2 = indent(indentLevel + 1);
  const p = comp.props;
  const lines = [];

  switch (comp.type) {
    case 'Button':
      lines.push(`${ind}<Button`);
      lines.push(`${ind2}android:id="@+id/${p.id || 'button1'}"`);
      lines.push(`${ind2}android:layout_width="${ensureUnit(p.width)}"`);
      lines.push(`${ind2}android:layout_height="${ensureUnit(p.height)}"`);
      if (p.margin && p.margin !== '0dp') lines.push(`${ind2}android:layout_margin="${ensureUnit(p.margin)}"`);
      if (p.padding && p.padding !== '0dp') lines.push(`${ind2}android:padding="${ensureUnit(p.padding)}"`);
      lines.push(`${ind2}android:text="${p.text || 'Button'}"`);
      if (p.textColor) lines.push(`${ind2}android:textColor="${formatColor(p.textColor)}"`);
      if (p.textSize) lines.push(`${ind2}android:textSize="${p.textSize}"`);
      if (p.backgroundColor && p.backgroundColor !== 'transparent') {
        lines.push(`${ind2}android:backgroundTint="${formatColor(p.backgroundColor)}"`);
      }
      if (p.onClick) lines.push(`${ind2}android:onClick="${p.onClick}"`);
      lines.push(`${ind}/>`);
      break;

    case 'TextView':
      lines.push(`${ind}<TextView`);
      lines.push(`${ind2}android:id="@+id/${p.id || 'textView1'}"`);
      lines.push(`${ind2}android:layout_width="${ensureUnit(p.width)}"`);
      lines.push(`${ind2}android:layout_height="${ensureUnit(p.height)}"`);
      if (p.margin && p.margin !== '0dp') lines.push(`${ind2}android:layout_margin="${ensureUnit(p.margin)}"`);
      if (p.padding && p.padding !== '0dp') lines.push(`${ind2}android:padding="${ensureUnit(p.padding)}"`);
      lines.push(`${ind2}android:text="${p.text || ''}"`);
      if (p.textColor) lines.push(`${ind2}android:textColor="${formatColor(p.textColor)}"`);
      if (p.textSize) lines.push(`${ind2}android:textSize="${p.textSize}"`);
      if (p.gravity) lines.push(`${ind2}android:gravity="${p.gravity}"`);
      if (p.fontStyle && p.fontStyle !== 'normal') lines.push(`${ind2}android:textStyle="${p.fontStyle}"`);
      lines.push(`${ind}/>`);
      break;

    case 'EditText':
      lines.push(`${ind}<EditText`);
      lines.push(`${ind2}android:id="@+id/${p.id || 'editText1'}"`);
      lines.push(`${ind2}android:layout_width="${ensureUnit(p.width)}"`);
      lines.push(`${ind2}android:layout_height="${ensureUnit(p.height)}"`);
      if (p.margin && p.margin !== '0dp') lines.push(`${ind2}android:layout_margin="${ensureUnit(p.margin)}"`);
      if (p.padding && p.padding !== '0dp') lines.push(`${ind2}android:padding="${ensureUnit(p.padding)}"`);
      if (p.hint) lines.push(`${ind2}android:hint="${p.hint}"`);
      if (p.textColor) lines.push(`${ind2}android:textColor="${formatColor(p.textColor)}"`);
      if (p.textSize) lines.push(`${ind2}android:textSize="${p.textSize}"`);
      if (p.inputType) lines.push(`${ind2}android:inputType="${p.inputType}"`);
      if (p.maxLines) lines.push(`${ind2}android:maxLines="${p.maxLines}"`);
      lines.push(`${ind}/>`);
      break;

    case 'ImageView':
      lines.push(`${ind}<ImageView`);
      lines.push(`${ind2}android:id="@+id/${p.id || 'imageView1'}"`);
      lines.push(`${ind2}android:layout_width="${ensureUnit(p.width)}"`);
      lines.push(`${ind2}android:layout_height="${ensureUnit(p.height)}"`);
      if (p.margin && p.margin !== '0dp') lines.push(`${ind2}android:layout_margin="${ensureUnit(p.margin)}"`);
      if (p.src) lines.push(`${ind2}android:src="${p.src}"`);
      if (p.scaleType) lines.push(`${ind2}android:scaleType="${p.scaleType}"`);
      if (p.contentDescription) lines.push(`${ind2}android:contentDescription="${p.contentDescription}"`);
      lines.push(`${ind}/>`);
      break;

    case 'ListView':
      lines.push(`${ind}<ListView`);
      lines.push(`${ind2}android:id="@+id/${p.id || 'listView1'}"`);
      lines.push(`${ind2}android:layout_width="${ensureUnit(p.width)}"`);
      lines.push(`${ind2}android:layout_height="${ensureUnit(p.height)}"`);
      if (p.divider) lines.push(`${ind2}android:divider="${p.divider}"`);
      if (p.dividerHeight) lines.push(`${ind2}android:dividerHeight="${ensureUnit(p.dividerHeight)}"`);
      lines.push(`${ind}/>`);
      break;

    case 'RecyclerView':
      lines.push(`${ind}<androidx.recyclerview.widget.RecyclerView`);
      lines.push(`${ind2}android:id="@+id/${p.id || 'recyclerView1'}"`);
      lines.push(`${ind2}android:layout_width="${ensureUnit(p.width)}"`);
      lines.push(`${ind2}android:layout_height="${ensureUnit(p.height)}"`);
      if (p.margin && p.margin !== '0dp') lines.push(`${ind2}android:layout_margin="${ensureUnit(p.margin)}"`);
      lines.push(`${ind}/>`);
      break;

    case 'LinearLayout': {
      lines.push(`${ind}<LinearLayout`);
      lines.push(`${ind2}android:id="@+id/${p.id || 'linearLayout1'}"`);
      lines.push(`${ind2}android:layout_width="${ensureUnit(p.width)}"`);
      lines.push(`${ind2}android:layout_height="${ensureUnit(p.height)}"`);
      lines.push(`${ind2}android:orientation="${p.orientation || 'vertical'}"`);
      if (p.margin && p.margin !== '0dp') lines.push(`${ind2}android:layout_margin="${ensureUnit(p.margin)}"`);
      if (p.padding && p.padding !== '0dp') lines.push(`${ind2}android:padding="${ensureUnit(p.padding)}"`);
      if (p.gravity) lines.push(`${ind2}android:gravity="${p.gravity}"`);
      lines.push(`${ind}>`);
      lines.push(`${ind}    <!-- ここに子ビューを追加 -->`);
      lines.push(`${ind}</LinearLayout>`);
      break;
    }

    case 'OptionsMenu':
      lines.push(`${ind}<!-- OptionsMenu はメニューリソースファイルで定義されます -->`);
      lines.push(`${ind}<!-- res/menu/${p.menuResourceName || 'main_menu'}.xml を参照 -->`);
      break;

    default:
      lines.push(`${ind}<!-- Unknown component: ${comp.type} -->`);
  }

  return lines;
}

/**
 * OptionsMenu 用 XML を生成する
 */
function generateMenuXML(comp) {
  const p = comp.props;
  const items = (p.items || '').split(',').map(s => s.trim()).filter(Boolean);
  const lines = [];
  lines.push('<?xml version="1.0" encoding="utf-8"?>');
  lines.push('<menu xmlns:android="http://schemas.android.com/apk/res/android"');
  lines.push('    xmlns:app="http://schemas.android.com/apk/res-auto">');
  lines.push('');
  items.forEach((item, i) => {
    const itemId = toAndroidId(item, i);
    lines.push(`    <item`);
    lines.push(`        android:id="@+id/${itemId}"`);
    lines.push(`        android:title="${item}"`);
    lines.push(`        app:showAsAction="${p.showAsAction || 'never'}"/>`);
    if (i < items.length - 1) lines.push('');
  });
  lines.push('</menu>');
  return lines.join('\n');
}

// ============================================================
// Kotlin コード生成
// ============================================================

/**
 * コンポーネント配列から MainActivity.kt を生成する
 * @param {Array} components
 * @param {string} packageName
 * @param {string} activityName
 * @returns {string} Kotlin ソースコード文字列
 */
function generateKotlin(components, packageName = 'com.example.myapp', activityName = 'MainActivity') {
  const imports = new Set([
    'android.os.Bundle',
    'androidx.appcompat.app.AppCompatActivity',
  ]);
  const fields = [];
  const onCreate = [];
  const extraMethods = [];

  for (const comp of components) {
    const p = comp.props;
    switch (comp.type) {
      case 'Button':
        imports.add('android.widget.Button');
        fields.push(`    private lateinit var ${p.id || 'button1'}: Button`);
        onCreate.push(`        ${p.id || 'button1'} = findViewById(R.id.${p.id || 'button1'})`);
        if (p.onClick) {
          onCreate.push(`        ${p.id || 'button1'}.setOnClickListener { ${p.onClick}() }`);
          extraMethods.push(
            `    private fun ${p.onClick}() {`,
            `        // TODO: ${p.onClick} の処理を実装してください`,
            `    }`
          );
        }
        break;

      case 'TextView':
        imports.add('android.widget.TextView');
        fields.push(`    private lateinit var ${p.id || 'textView1'}: TextView`);
        onCreate.push(`        ${p.id || 'textView1'} = findViewById(R.id.${p.id || 'textView1'})`);
        break;

      case 'EditText':
        imports.add('android.widget.EditText');
        fields.push(`    private lateinit var ${p.id || 'editText1'}: EditText`);
        onCreate.push(`        ${p.id || 'editText1'} = findViewById(R.id.${p.id || 'editText1'})`);
        break;

      case 'ImageView':
        imports.add('android.widget.ImageView');
        fields.push(`    private lateinit var ${p.id || 'imageView1'}: ImageView`);
        onCreate.push(`        ${p.id || 'imageView1'} = findViewById(R.id.${p.id || 'imageView1'})`);
        break;

      case 'ListView': {
        imports.add('android.widget.ListView');
        imports.add('android.widget.ArrayAdapter');
        imports.add('android.widget.AdapterView');
        const listId = p.id || 'listView1';
        const adapterVar = p.adapterVariable || 'adapter';
        const dataArr = p.dataArrayName || 'items';
        const layoutFile = p.itemLayoutFile || 'simple_list_item_1';
        fields.push(`    private lateinit var ${listId}: ListView`);
        onCreate.push(`        ${listId} = findViewById(R.id.${listId})`);
        onCreate.push('');
        onCreate.push(`        val ${dataArr} = arrayOf("アイテム 1", "アイテム 2", "アイテム 3")`);
        onCreate.push(`        val ${adapterVar} = ArrayAdapter(this, android.R.layout.${layoutFile}, ${dataArr})`);
        onCreate.push(`        ${listId}.adapter = ${adapterVar}`);
        if (p.onItemClick) {
          onCreate.push('');
          onCreate.push(`        ${listId}.setOnItemClickListener { _, _, position, _ ->`);
          onCreate.push(`            ${p.onItemClick}(position)`);
          onCreate.push(`        }`);
          extraMethods.push(
            `    private fun ${p.onItemClick}(position: Int) {`,
            `        // TODO: アイテム選択時の処理 (position: ${'$'}{position})`,
            `    }`
          );
        }
        break;
      }

      case 'RecyclerView': {
        imports.add('androidx.recyclerview.widget.RecyclerView');
        imports.add(`androidx.recyclerview.widget.${p.layoutManager || 'LinearLayoutManager'}`);
        const rvId = p.id || 'recyclerView1';
        const adapterClass = p.adapterClassName || 'MyAdapter';
        const dataList = p.dataListName || 'itemList';
        fields.push(`    private lateinit var ${rvId}: RecyclerView`);
        fields.push(`    private lateinit var ${adapterClass.charAt(0).toLowerCase() + adapterClass.slice(1)}: ${adapterClass}`);
        onCreate.push(`        ${rvId} = findViewById(R.id.${rvId})`);
        onCreate.push(`        ${rvId}.layoutManager = ${p.layoutManager || 'LinearLayoutManager'}(this)`);
        onCreate.push('');
        onCreate.push(`        val ${dataList} = mutableListOf("アイテム 1", "アイテム 2", "アイテム 3")`);
        const adapterVar2 = adapterClass.charAt(0).toLowerCase() + adapterClass.slice(1);
        onCreate.push(`        ${adapterVar2} = ${adapterClass}(${dataList})`);
        onCreate.push(`        ${rvId}.adapter = ${adapterVar2}`);
        extraMethods.push(
          `    // TODO: ${adapterClass} クラスを別ファイルに実装してください`,
          `    // class ${adapterClass}(private val items: List<String>) :`,
          `    //     RecyclerView.Adapter<${adapterClass}.ViewHolder>() { ... }`
        );
        break;
      }

      case 'OptionsMenu': {
        imports.add('android.view.Menu');
        imports.add('android.view.MenuItem');
        const menuRes = p.menuResourceName || 'main_menu';
        const menuItems = (p.items || '').split(',').map(s => s.trim()).filter(Boolean);
        const inflateCode = [
          `    override fun onCreateOptionsMenu(menu: Menu): Boolean {`,
          `        menuInflater.inflate(R.menu.${menuRes}, menu)`,
          `        return true`,
          `    }`,
          ``,
          `    override fun onOptionsItemSelected(item: MenuItem): Boolean {`,
          `        return when (item.itemId) {`,
        ];
        menuItems.forEach((mi, idx) => {
          const miId = toAndroidId(mi, idx);
          inflateCode.push(`            R.id.${miId} -> {`);
          inflateCode.push(`                // TODO: ${mi} の処理`);
          inflateCode.push(`                true`);
          inflateCode.push(`            }`);
        });
        inflateCode.push(`            else -> super.onOptionsItemSelected(item)`);
        inflateCode.push(`        }`);
        inflateCode.push(`    }`);
        extraMethods.push(...inflateCode);
        break;
      }

      default:
        break;
    }
  }

  const importLines = Array.from(imports).sort().map(i => `import ${i}`);

  const lines = [];
  lines.push(`package ${packageName}`);
  lines.push('');
  importLines.forEach(l => lines.push(l));
  lines.push('');
  lines.push(`class ${activityName} : AppCompatActivity() {`);
  lines.push('');
  fields.forEach(f => lines.push(f));
  if (fields.length > 0) lines.push('');
  lines.push('    override fun onCreate(savedInstanceState: Bundle?) {');
  lines.push('        super.onCreate(savedInstanceState)');
  lines.push('        setContentView(R.layout.activity_main)');
  lines.push('');
  onCreate.forEach(l => lines.push(l));
  lines.push('    }');
  if (extraMethods.length > 0) {
    lines.push('');
    extraMethods.forEach(l => lines.push(l));
  }
  lines.push('}');

  return lines.join('\n');
}

/**
 * ListView 選択サンプル専用 Kotlin コード生成
 */
function generateListSelectionKotlin(packageName = 'com.example.myapp') {
  return `package ${packageName}

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.ListView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class ListSelectionActivity : AppCompatActivity() {

    private lateinit var listView: ListView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_list_selection)

        listView = findViewById(R.id.listView)

        val items = arrayOf(
            "アイテム 1",
            "アイテム 2",
            "アイテム 3",
            "アイテム 4",
            "アイテム 5"
        )

        val adapter = ArrayAdapter(this, android.R.layout.simple_list_item_activated_1, items)
        listView.adapter = adapter
        listView.choiceMode = ListView.CHOICE_MODE_SINGLE

        listView.setOnItemClickListener { _, _, position, _ ->
            val selected = items[position]
            Toast.makeText(this, "選択: \$selected", Toast.LENGTH_SHORT).show()
        }
    }
}`;
}
