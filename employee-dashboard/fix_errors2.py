import re

with open("src/pages/Dashboard.js", "r", encoding="utf-8") as f:
    code = f.read()

# Remove setModelAccuracy and setTotalRecords
code = re.sub(r'^\s*setModelAccuracy\(.*?\);\n?', '', code, flags=re.MULTILINE)
code = re.sub(r'^\s*setTotalRecords\(.*?\);\n?', '', code, flags=re.MULTILINE)

# Remove the CSV button
code = re.sub(r'\s*<Button[^>]*onClick=\{exportCSV\}[^>]*>.*?</Button>', '', code, flags=re.DOTALL)

# define modelAccuracy = null so that JSX doesn't break
code = code.replace("const [hasUploaded, setHasUploaded] = useState(false);", "const [hasUploaded, setHasUploaded] = useState(false);\n  const modelAccuracy = null;")

with open("src/pages/Dashboard.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Fixed variables safely.")
