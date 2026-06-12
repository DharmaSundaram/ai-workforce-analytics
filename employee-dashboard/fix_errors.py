import re

with open("src/pages/Dashboard.js", "r", encoding="utf-8") as f:
    code = f.read()

# Remove setModelAccuracy and setTotalRecords
code = re.sub(r'\s*setModelAccuracy\(.*?\);\n', '\n', code)
code = re.sub(r'\s*setTotalRecords\(.*?\);\n', '\n', code)

# Remove exportCSV button
export_btn_pattern = r'\s*<Button\s+icon=\{<i className="fa-solid fa-file-export"></i>\}\s+onClick=\{exportCSV\}.*?</Button>\n'
code = re.sub(export_btn_pattern, '', code, flags=re.DOTALL)

# Remove the ML Accuracy Card column
# It starts with <Col xs={24} sm={12} md={8} lg={6}> and ends with </Col> containing ML Accuracy
ml_accuracy_pattern = r'\s*<Col xs=\{24\} sm=\{12\} md=\{8\} lg=\{6\}>\s*<Card className="kpi-card kpi-card-3 glass-card" bordered=\{false\}>\s*<span className="kpi-icon">\s*<i className="fa-solid fa-microchip".*?</Card>\s*</Col>\n'
code = re.sub(ml_accuracy_pattern, '', code, flags=re.DOTALL)

with open("src/pages/Dashboard.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Dashboard.js fixed successfully.")
