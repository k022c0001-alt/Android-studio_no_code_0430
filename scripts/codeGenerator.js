/**
 * codeGenerator.js - XML/Kotlinコード自動生成
 */

class CodeGenerator {
    constructor() {
        this.mode = 'xml'; // 'xml' or 'kotlin'
    }

    setMode(mode) {
        this.mode = mode;
    }

    /**
     * コンポーネント一覧からXMLレイアウトを生成
     */
    generateXML(components) {
        if (!components || components.length === 0) {
            return '<?xml version="1.0" encoding="utf-8"?>\n<!-- コンポーネントを追加してください -->';
        }

        let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
        xml += '<ConstraintLayout\n';
        xml += '    xmlns:android="http://schemas.android.com/apk/res/android"\n';
        xml += '    xmlns:app="http://schemas.android.com/apk/res-auto"\n';
        xml += '    android:layout_width="match_parent"\n';
        xml += '    android:layout_height="match_parent">\n\n';

        components.forEach(comp => {
            const xmlComp = generateComponentXML(comp.type, comp.props, '    ');
            xml += xmlComp + '\n\n';
        });

        xml += '</ConstraintLayout>';
        return xml;
    }

    /**
     * コンポーネント一覧からKotlinコードを生成
     */
    generateKotlin(components, activityName = 'MainActivity') {
        if (!components || components.length === 0) {
            return `// コンポーネントを追加してください\nclass ${activityName} : AppCompatActivity() {}`;
        }

        const bindings = components
            .filter(c => c.props.id)
            .map(c => `        val ${c.props.id} = binding.${c.props.id}`)
            .join('\n');

        const listeners = components
            .filter(c => c.type === 'Button' && c.props.id)
            .map(c => `\n        binding.${c.props.id}.setOnClickListener {\n            // TODO: ${c.props.text || 'Button'} clicked\n        }`)
            .join('\n');

        return `package com.example.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.app.databinding.ActivityMainBinding

class ${activityName} : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

${bindings}${listeners}
    }
}`;
    }

    /**
     * strings.xmlを生成
     */
    generateStringsXML(components) {
        let strings = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';
        strings += '    <string name="app_name">My App</string>\n';
        components.forEach(comp => {
            if (comp.props.text && comp.props.id) {
                strings += `    <string name="${comp.props.id}_text">${comp.props.text}</string>\n`;
            }
            if (comp.props.hint && comp.props.id) {
                strings += `    <string name="${comp.props.id}_hint">${comp.props.hint}</string>\n`;
            }
            if (comp.props.title && comp.props.id) {
                strings += `    <string name="${comp.props.id}_title">${comp.props.title}</string>\n`;
            }
        });
        strings += '</resources>';
        return strings;
    }

    /**
     * 現在のモードでコード生成
     */
    generate(components) {
        if (this.mode === 'kotlin') {
            return this.generateKotlin(components);
        } else if (this.mode === 'strings') {
            return this.generateStringsXML(components);
        }
        return this.generateXML(components);
    }
}

// グローバルインスタンス
const codeGenerator = new CodeGenerator();
