import os

file_path = r"c:\Users\DHARMA\inten_1\employee-dashboard\src\pages\Dashboard.js"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{/* ===== EXECUTIVE KPIs ===== */}" in line:
        start_idx = i
    if "{/* ===== EMPLOYEE TABLE ===== */}" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [
        "        {/* ===== PROJECT PORTFOLIO GRID ===== */}\n",
        "        <ProjectPortfolioGrid projectPerformanceOverview={projectPerformanceOverview} />\n\n",
        "        {/* ===== NEW AI STRATEGIC INSIGHTS CHARTS ===== */}\n",
        "        {hasUploaded && employees.length > 0 && (\n",
        "          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>\n",
        "            <Col xs={24} lg={12}>\n",
        "              <StrategicInsightsChart employees={filteredEmployees} aggregatedEmployees={aggregatedEmployees} />\n",
        "            </Col>\n",
        "            <Col xs={24} lg={12}>\n",
        "              <DepartmentPerformanceChart employees={filteredEmployees} />\n",
        "            </Col>\n",
        "            <Col xs={24} lg={12}>\n",
        "              <WorkforceHealthTrend trendData={productivityTrend} />\n",
        "            </Col>\n",
        "            <Col xs={24} lg={12}>\n",
        "              <EmployeeDistributionChart aggregatedEmployees={aggregatedEmployees} />\n",
        "            </Col>\n",
        "          </Row>\n",
        "        )}\n\n",
        "        {/* ===== JIRA INSIGHTS & RANKINGS ===== */}\n",
        "        {hasUploaded && employees.length > 0 && (\n",
        "          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>\n",
        "            <Col xs={24} lg={8}>\n",
        "              <JiraInsightsCard jiraInsights={jiraInsights} />\n",
        "            </Col>\n",
        "            <Col xs={24} lg={16}>\n",
        "              <DepartmentRankingsTable employees={filteredEmployees} />\n",
        "            </Col>\n",
        "          </Row>\n",
        "        )}\n\n"
    ] + lines[end_idx:]
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print(f"Replaced lines {start_idx} to {end_idx}. Total lines dropped: {end_idx - start_idx}")
else:
    print(f"Failed to find indices: start={start_idx}, end={end_idx}")
