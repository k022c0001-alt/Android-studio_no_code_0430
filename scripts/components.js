/**
 * components.js - UIコンポーネント定義
 * Android UIコンポーネントのメタデータと生成ロジック
 */

const COMPONENTS = {
    Button: {
        name: 'Button',
        icon: '🔘',
        category: 'basic',
        defaultProps: {
            text: 'Button',
            width: 120,
            height: 48,
            backgroundColor: '#6200EE',
            textColor: '#FFFFFF',
            fontSize: 14,
            cornerRadius: 4,
            id: ''
        },
        render(props) {
            return `<div class="component-button" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                color:${props.textColor};
                font-size:${props.fontSize}px;
                border-radius:${props.cornerRadius}px;
                display:flex;align-items:center;justify-content:center;
                cursor:pointer;font-weight:500;user-select:none;
                box-shadow:0 2px 4px rgba(0,0,0,0.3);">${props.text}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<Button
${indent}    android:id="@+id/${props.id || 'button'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:text="${props.text}"
${indent}    android:textColor="${props.textColor}"
${indent}    android:backgroundTint="${props.backgroundColor}"
${indent}    android:textSize="${props.fontSize}sp" />`;
        }
    },

    TextView: {
        name: 'TextView',
        icon: '📝',
        category: 'basic',
        defaultProps: {
            text: 'Text View',
            width: 200,
            height: 40,
            textColor: '#000000',
            fontSize: 16,
            fontWeight: 'normal',
            id: ''
        },
        render(props) {
            return `<div class="component-textview" style="
                width:${props.width}px;
                height:${props.height}px;
                color:${props.textColor};
                font-size:${props.fontSize}px;
                font-weight:${props.fontWeight};
                display:flex;align-items:center;
                user-select:none;overflow:hidden;">${props.text}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<TextView
${indent}    android:id="@+id/${props.id || 'textView'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:text="${props.text}"
${indent}    android:textColor="${props.textColor}"
${indent}    android:textSize="${props.fontSize}sp" />`;
        }
    },

    EditText: {
        name: 'EditText',
        icon: '✏️',
        category: 'basic',
        defaultProps: {
            hint: 'Enter text...',
            width: 200,
            height: 48,
            textColor: '#000000',
            hintColor: '#999999',
            fontSize: 16,
            inputType: 'text',
            id: ''
        },
        render(props) {
            return `<div class="component-edittext" style="
                width:${props.width}px;
                height:${props.height}px;
                color:${props.hintColor};
                font-size:${props.fontSize}px;
                display:flex;align-items:center;padding:0 8px;
                border-bottom:2px solid #6200EE;
                user-select:none;overflow:hidden;">${props.hint}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<EditText
${indent}    android:id="@+id/${props.id || 'editText'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:hint="${props.hint}"
${indent}    android:textColor="${props.textColor}"
${indent}    android:textColorHint="${props.hintColor}"
${indent}    android:inputType="${props.inputType}"
${indent}    android:textSize="${props.fontSize}sp" />`;
        }
    },

    ImageView: {
        name: 'ImageView',
        icon: '🖼️',
        category: 'basic',
        defaultProps: {
            src: '',
            width: 100,
            height: 100,
            scaleType: 'centerCrop',
            backgroundColor: '#E0E0E0',
            id: ''
        },
        render(props) {
            return `<div class="component-imageview" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                display:flex;align-items:center;justify-content:center;
                user-select:none;overflow:hidden;font-size:32px;">🖼️</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<ImageView
${indent}    android:id="@+id/${props.id || 'imageView'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:scaleType="${props.scaleType}"
${indent}    android:src="@drawable/placeholder" />`;
        }
    },

    CheckBox: {
        name: 'CheckBox',
        icon: '☑️',
        category: 'basic',
        defaultProps: {
            text: 'CheckBox',
            width: 150,
            height: 40,
            checked: false,
            textColor: '#000000',
            fontSize: 14,
            id: ''
        },
        render(props) {
            return `<div class="component-checkbox" style="
                width:${props.width}px;
                height:${props.height}px;
                color:${props.textColor};
                font-size:${props.fontSize}px;
                display:flex;align-items:center;gap:8px;
                user-select:none;">
                <span style="font-size:18px;">${props.checked ? '☑' : '☐'}</span>
                ${props.text}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<CheckBox
${indent}    android:id="@+id/${props.id || 'checkBox'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:text="${props.text}"
${indent}    android:checked="${props.checked}"
${indent}    android:textSize="${props.fontSize}sp" />`;
        }
    },

    RadioButton: {
        name: 'RadioButton',
        icon: '🔵',
        category: 'basic',
        defaultProps: {
            text: 'RadioButton',
            width: 150,
            height: 40,
            checked: false,
            textColor: '#000000',
            fontSize: 14,
            id: ''
        },
        render(props) {
            return `<div class="component-radiobutton" style="
                width:${props.width}px;
                height:${props.height}px;
                color:${props.textColor};
                font-size:${props.fontSize}px;
                display:flex;align-items:center;gap:8px;
                user-select:none;">
                <span style="font-size:18px;">${props.checked ? '🔵' : '⚪'}</span>
                ${props.text}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<RadioButton
${indent}    android:id="@+id/${props.id || 'radioButton'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:text="${props.text}"
${indent}    android:checked="${props.checked}"
${indent}    android:textSize="${props.fontSize}sp" />`;
        }
    },

    ListView: {
        name: 'ListView',
        icon: '📋',
        category: 'layout',
        defaultProps: {
            width: 300,
            height: 200,
            itemCount: 3,
            itemText: 'List Item',
            backgroundColor: '#FFFFFF',
            dividerColor: '#E0E0E0',
            id: ''
        },
        render(props) {
            let items = '';
            for (let i = 1; i <= Math.min(props.itemCount, 5); i++) {
                items += `<div style="padding:8px 12px;border-bottom:1px solid ${props.dividerColor};font-size:14px;">${props.itemText} ${i}</div>`;
            }
            if (props.itemCount > 5) {
                items += `<div style="padding:8px 12px;color:#999;font-size:12px;">... (${props.itemCount - 5} more)</div>`;
            }
            return `<div class="component-listview" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                border:1px solid #E0E0E0;
                overflow:hidden;
                user-select:none;">${items}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<ListView
${indent}    android:id="@+id/${props.id || 'listView'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:divider="${props.dividerColor}"
${indent}    android:dividerHeight="1dp" />`;
        }
    },

    RecyclerView: {
        name: 'RecyclerView',
        icon: '♻️',
        category: 'layout',
        defaultProps: {
            width: 300,
            height: 200,
            orientation: 'vertical',
            backgroundColor: '#FFFFFF',
            id: ''
        },
        render(props) {
            const items = [1, 2, 3].map(i =>
                `<div style="padding:12px;border-bottom:1px solid #E0E0E0;display:flex;align-items:center;gap:12px;font-size:14px;">
                    <div style="width:40px;height:40px;background:#6200EE;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;">${i}</div>
                    <div>Item ${i}</div>
                </div>`
            ).join('');
            return `<div class="component-recyclerview" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                border:1px solid #E0E0E0;
                overflow:hidden;
                user-select:none;">${items}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<androidx.recyclerview.widget.RecyclerView
${indent}    android:id="@+id/${props.id || 'recyclerView'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    app:layoutManager="androidx.recyclerview.widget.LinearLayoutManager"
${indent}    android:orientation="${props.orientation}" />`;
        }
    },

    LinearLayout: {
        name: 'LinearLayout',
        icon: '▤',
        category: 'layout',
        defaultProps: {
            width: 280,
            height: 120,
            orientation: 'vertical',
            backgroundColor: 'rgba(98,0,238,0.05)',
            padding: 8,
            id: ''
        },
        render(props) {
            return `<div class="component-linearlayout" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                border:2px dashed #6200EE;
                padding:${props.padding}px;
                display:flex;
                flex-direction:${props.orientation === 'vertical' ? 'column' : 'row'};
                user-select:none;box-sizing:border-box;">
                <span style="color:#6200EE;font-size:11px;font-weight:500;">LinearLayout (${props.orientation})</span>
            </div>`;
        },
        generateXML(props, indent) {
            return `${indent}<LinearLayout
${indent}    android:id="@+id/${props.id || 'linearLayout'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:orientation="${props.orientation}"
${indent}    android:padding="${props.padding}dp">
${indent}</LinearLayout>`;
        }
    },

    FrameLayout: {
        name: 'FrameLayout',
        icon: '▢',
        category: 'layout',
        defaultProps: {
            width: 280,
            height: 120,
            backgroundColor: 'rgba(3,169,244,0.05)',
            id: ''
        },
        render(props) {
            return `<div class="component-framelayout" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                border:2px dashed #03A9F4;
                display:flex;align-items:center;justify-content:center;
                user-select:none;">
                <span style="color:#03A9F4;font-size:11px;font-weight:500;">FrameLayout</span>
            </div>`;
        },
        generateXML(props, indent) {
            return `${indent}<FrameLayout
${indent}    android:id="@+id/${props.id || 'frameLayout'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp">
${indent}</FrameLayout>`;
        }
    },

    Toolbar: {
        name: 'Toolbar',
        icon: '🔧',
        category: 'navigation',
        defaultProps: {
            title: 'App Title',
            width: 360,
            height: 56,
            backgroundColor: '#6200EE',
            textColor: '#FFFFFF',
            id: ''
        },
        render(props) {
            return `<div class="component-toolbar" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                color:${props.textColor};
                display:flex;align-items:center;
                padding:0 16px;
                font-size:20px;font-weight:500;
                user-select:none;
                box-shadow:0 2px 4px rgba(0,0,0,0.3);">
                ☰ ${props.title}
            </div>`;
        },
        generateXML(props, indent) {
            return `${indent}<androidx.appcompat.widget.Toolbar
${indent}    android:id="@+id/${props.id || 'toolbar'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:background="${props.backgroundColor}"
${indent}    app:title="${props.title}"
${indent}    app:titleTextColor="${props.textColor}" />`;
        }
    },

    BottomNavigation: {
        name: 'BottomNavigation',
        icon: '⬇️',
        category: 'navigation',
        defaultProps: {
            width: 360,
            height: 56,
            backgroundColor: '#FFFFFF',
            activeColor: '#6200EE',
            items: 'Home,Search,Profile',
            id: ''
        },
        render(props) {
            const items = props.items.split(',');
            const icons = ['🏠', '🔍', '👤', '❤️', '⚙️'];
            const itemsHtml = items.map((item, i) =>
                `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
                    color:${i === 0 ? props.activeColor : '#757575'};font-size:10px;gap:2px;">
                    <span style="font-size:18px;">${icons[i % icons.length]}</span>
                    <span>${item.trim()}</span>
                </div>`
            ).join('');
            return `<div class="component-bottomnav" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                display:flex;align-items:center;
                border-top:1px solid #E0E0E0;
                user-select:none;">${itemsHtml}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<com.google.android.material.bottomnavigation.BottomNavigationView
${indent}    android:id="@+id/${props.id || 'bottomNavigation'}"
${indent}    android:layout_width="${props.width}dp"
${indent}    android:layout_height="${props.height}dp"
${indent}    android:background="${props.backgroundColor}"
${indent}    app:itemIconTint="${props.activeColor}"
${indent}    app:itemTextColor="${props.activeColor}"
${indent}    app:menu="@menu/bottom_nav_menu" />`;
        }
    },

    FloatingActionButton: {
        name: 'FloatingActionButton',
        icon: '➕',
        category: 'basic',
        defaultProps: {
            icon: '+',
            width: 56,
            height: 56,
            backgroundColor: '#6200EE',
            iconColor: '#FFFFFF',
            id: ''
        },
        render(props) {
            return `<div class="component-fab" style="
                width:${props.width}px;
                height:${props.height}px;
                background:${props.backgroundColor};
                color:${props.iconColor};
                border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                font-size:24px;font-weight:bold;
                cursor:pointer;
                user-select:none;
                box-shadow:0 4px 8px rgba(0,0,0,0.3);">${props.icon}</div>`;
        },
        generateXML(props, indent) {
            return `${indent}<com.google.android.material.floatingactionbutton.FloatingActionButton
${indent}    android:id="@+id/${props.id || 'fab'}"
${indent}    android:layout_width="wrap_content"
${indent}    android:layout_height="wrap_content"
${indent}    android:backgroundTint="${props.backgroundColor}"
${indent}    app:tint="${props.iconColor}"
${indent}    app:srcCompat="@drawable/ic_add" />`;
        }
    }
};

/**
 * コンポーネントのデフォルトプロパティを取得
 */
function getDefaultProps(type) {
    if (!COMPONENTS[type]) return {};
    return Object.assign({}, COMPONENTS[type].defaultProps);
}

/**
 * コンポーネントのHTMLをレンダリング
 */
function renderComponent(type, props) {
    if (!COMPONENTS[type]) return '<div>Unknown Component</div>';
    return COMPONENTS[type].render(props);
}

/**
 * コンポーネントのXMLを生成
 */
function generateComponentXML(type, props, indent = '    ') {
    if (!COMPONENTS[type]) return '';
    return COMPONENTS[type].generateXML(props, indent);
}

/**
 * カテゴリ別コンポーネント一覧を取得
 */
function getComponentsByCategory() {
    const categories = {};
    Object.entries(COMPONENTS).forEach(([key, comp]) => {
        const cat = comp.category || 'other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ key, ...comp });
    });
    return categories;
}
