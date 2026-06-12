import re

with open('c:/Users/DHARMA/inten_1/employee-dashboard/src/pages/Dashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove state variables
content = re.sub(r'const \[isUploading, setIsUploading\] = useState\(false\);\n?', '', content)
content = re.sub(r'const \[uploadedFileNames, setUploadedFileNames\] = useState\(\[\]\);\n?', '', content)
content = re.sub(r'const \[totalRecords, setTotalRecords\] = useState\(0\);\n?', '', content)
content = re.sub(r'const \[hasUploaded, setHasUploaded\] = useState\(false\);\n?', '', content)

# 2. Remove from loadDashboardData
content = re.sub(r'setTotalRecords\(data\.total_records \|\| 0\);\n?', '', content)
content = re.sub(r'setHasUploaded\(rows\.length > 0 \|\| Boolean\(data\.has_data\)\);\n?', '', content)

# 3. Remove handleFileUpload function
content = re.sub(r'// =====================================\s*// FILE UPLOAD — sends to backend /upload-dataset\s*// =====================================\s*const handleFileUpload = async \(e\) => \{.*?\n  \};\n?', '', content, flags=re.DOTALL)

# 4. Remove upload card
content = re.sub(r'\{\/\* ===== FILE UPLOAD ===== \*\/\}\s*<Card className="upload-card glass-card" bordered=\{false\}>.*?</Card>', '', content, flags=re.DOTALL)

# 5. Remove hasUploaded conditions
content = content.replace('{hasUploaded && employees.length > 0 && (', '{employees.length > 0 && (')
content = content.replace('{hasUploaded && projectPerformanceOverview.length > 0 && (', '{projectPerformanceOverview.length > 0 && (')
content = content.replace('{!hasUploaded && employees.length === 0 ? (', '{(!employees || employees.length === 0) ? (')
content = content.replace('!hasUploaded && employees.length === 0', '(!employees || employees.length === 0)')

# 6. Remove totalRecords references
content = content.replace('totalRecords.toLocaleString()', 'totalEmployees.toLocaleString()')

with open('c:/Users/DHARMA/inten_1/employee-dashboard/src/pages/Dashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done processing Dashboard.js')
