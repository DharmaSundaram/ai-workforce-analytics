import re

with open("src/pages/Dashboard.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Remove PapaParse
code = re.sub(r'import Papa from "papaparse";\n', '', code)

# 2. Remove states
states_to_remove = [
    r'  const \[isUploading, setIsUploading\] = useState\(false\);\n',
    r'  const \[modelAccuracy, setModelAccuracy\] = useState\(null\);\n',
    r'  const \[uploadedFileNames, setUploadedFileNames\] = useState\(\[\]\);\n',
    r'  const \[totalRecords, setTotalRecords\] = useState\(0\);\n'
]
for state in states_to_remove:
    code = re.sub(state, '', code)

# 3. Remove fileInputRef
code = re.sub(r'  const fileInputRef = useRef\(null\);\n', '', code)

# 4. Remove handleFileUpload function
upload_func_pattern = r'  // =====================================\n  // FILE UPLOAD — sends to backend /upload-dataset\n  // =====================================.*?  };\n'
code = re.sub(upload_func_pattern, '', code, flags=re.DOTALL)

# 5. Remove exportCSV function
export_func_pattern = r'  // =====================================\n  // EXPORT CSV\n  // =====================================.*?  };\n'
code = re.sub(export_func_pattern, '', code, flags=re.DOTALL)

# 6. Remove the FILE UPLOAD card JSX
upload_jsx_pattern = r'        \{\/\* ===== FILE UPLOAD ===== \*\/\}.*?        <\/Card>\n'
code = re.sub(upload_jsx_pattern, '', code, flags=re.DOTALL)

# 7. Modify AIStrategicInsights to include productivityTrend
ai_insights_pattern = r'(\{\/\* ===== AI STRATEGIC INSIGHTS ===== \*\/\}\s*\{)hasUploaded && (employees\.length > 0 && \(\s*<AIStrategicInsights employees=\{filteredEmployees\} aiSummary=\{aiSummary\}) />\s*\)\}'
code = re.sub(ai_insights_pattern, r'\1\2 productivityTrend={productivityTrend} />\n        )}', code)

# Also remove hasUploaded check from KPI cards
kpi_pattern = r'\{!hasUploaded && employees\.length === 0 \? \('
code = re.sub(kpi_pattern, r'{employees.length === 0 ? (', code)

with open("src/pages/Dashboard.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Dashboard.js patched successfully.")
