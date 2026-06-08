import os
import re

# Mapping based on user recommendations and common sense
icon_mapping = {
    "DashboardOutlined": "fa-chart-line",
    "LineChartOutlined": "fa-chart-line",
    "PieChartOutlined": "fa-chart-pie",
    "RobotOutlined": "fa-robot",
    "TeamOutlined": "fa-user-group",
    "UserOutlined": "fa-user",
    "SettingOutlined": "fa-gear",
    "HistoryOutlined": "fa-clock-rotate-left",
    "BellOutlined": "fa-bell",
    "AuditOutlined": "fa-shield-halved",
    "SafetyOutlined": "fa-lock",
    "SecurityScanOutlined": "fa-lock",
    "SyncOutlined": "fa-arrows-rotate",
    "CloudUploadOutlined": "fa-cloud-arrow-up",
    "CloudDownloadOutlined": "fa-cloud-arrow-down",
    "ExportOutlined": "fa-file-export",
    "FileExcelOutlined": "fa-file-csv",
    "FilePdfOutlined": "fa-file-pdf",
    "FileTextOutlined": "fa-file-lines",
    "FireOutlined": "fa-fire",
    "RiseOutlined": "fa-arrow-trend-up",
    "ProjectOutlined": "fa-diagram-project",
    "BankOutlined": "fa-building",
    "SearchOutlined": "fa-magnifying-glass",
    "FilterOutlined": "fa-filter",
    "BgColorsOutlined": "fa-palette",
    "FormatPainterOutlined": "fa-brush",
    "FontColorsOutlined": "fa-font",
    "LoginOutlined": "fa-right-to-bracket",
    "LogoutOutlined": "fa-right-from-bracket",
    # Additional generic mappings
    "CloseOutlined": "fa-xmark",
    "SendOutlined": "fa-paper-plane",
    "TrophyOutlined": "fa-trophy",
    "LoadingOutlined": "fa-spinner fa-spin",
    "WarningOutlined": "fa-triangle-exclamation",
    "CheckCircleOutlined": "fa-circle-check",
    "CloseCircleOutlined": "fa-circle-xmark",
    "BulbOutlined": "fa-lightbulb",
    "EditOutlined": "fa-pen",
    "DeleteOutlined": "fa-trash",
    "PlusOutlined": "fa-plus",
    "EyeOutlined": "fa-eye",
    "EyeInvisibleOutlined": "fa-eye-slash",
    "MailOutlined": "fa-envelope",
    "PhoneOutlined": "fa-phone",
    "CalendarOutlined": "fa-calendar",
    "ArrowRightOutlined": "fa-arrow-right",
    "MenuOutlined": "fa-bars"
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find ant-design imports
    # Example: import { BulbOutlined, RobotOutlined } from '@ant-design/icons';
    import_pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]@ant-design/icons[\'"];?')
    match = import_pattern.search(content)
    if not match:
        return False
        
    icons_imported = [icon.strip() for icon in match.group(1).split(',')]
    
    # Remove the import statement
    content = import_pattern.sub('', content)
    
    # Replace the components
    for icon in icons_imported:
        if not icon:
            continue
        fa_class = icon_mapping.get(icon, "fa-circle") # Default to circle if unknown
        
        # We need to replace instances like <RobotOutlined /> or <RobotOutlined className="..." style={{...}} />
        # It's tricky to handle all props perfectly, but we can do a simple regex for self-closing tags
        # and extract className and style to apply to the <i> tag
        
        # Simple <IconName />
        content = re.sub(fr'<{icon}\s*/>', f'<i className="fa-solid {fa_class}"></i>', content)
        
        # <IconName prop="val" />
        # We try to keep className and style, and discard others or put them on <i>
        def replace_with_props(m):
            props = m.group(1)
            # If there's an existing className, append fa_class to it
            if 'className=' in props:
                # E.g. className="mr-2" -> className="mr-2 fa-solid fa-icon"
                # This requires careful parsing. Let's just do a simpler approach:
                # Add our fa classes. It's usually safe to just inject them.
                props = re.sub(r'className=(["\'])([^"\']*)(["\'])', r'className=\1\2 fa-solid ' + fa_class + r'\3', props)
                return f'<i {props}></i>'
            else:
                return f'<i className="fa-solid {fa_class}" {props}></i>'
                
        content = re.sub(fr'<{icon}\s+([^>]+)/>', replace_with_props, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    return True

def main():
    modified_files = 0
    src_dir = r"c:\Users\DHARMA\inten_1\employee-dashboard\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    print(f"Updated {filepath}")
                    modified_files += 1
                    
    print(f"Total files updated: {modified_files}")

if __name__ == "__main__":
    main()
