import re

filepath = r"c:\Users\DHARMA\inten_1\employee-dashboard\src\pages\Dashboard.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add active projects KPI
old_kpi_calc = """  const totalEmployees = filteredEmployees.length;

  const highBurnout = filteredEmployees.filter("""

new_kpi_calc = """  const totalEmployees = filteredEmployees.length;
  
  const totalProjects = new Set(filteredEmployees.map(e => e.project_name).filter(Boolean)).size;

  const highBurnout = filteredEmployees.filter("""

content = content.replace(old_kpi_calc, new_kpi_calc)

# Update the layout of KPI cards to be lg={3} instead of lg={4} to fit 8 cards. We have 6 right now, let's add 2 more.
content = content.replace('<Col xs={24} sm={12} md={8} lg={4}>', '<Col xs={24} sm={12} md={8} lg={6}>')
# Wait, 8 cards of lg={3} fits in a 24-col grid. Right now there are 6 cards of lg={4} (6 * 4 = 24).
# We can make it 8 cards of lg={3} (8 * 3 = 24). Let's change lg={4} to lg={3}.
content = content.replace('lg={4}', 'lg={3}')

# Now insert the new cards right after the Row starts.
old_first_card = """          <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
            <Col xs={24} sm={12} md={8} lg={3}>"""

new_first_cards = """          <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
            <Col xs={24} sm={12} md={8} lg={3}>
              <Card className="kpi-card kpi-card-0 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-diagram-project" style={{ color: "#3b82f6" }} ></i>
                </span>
                <Statistic
                  title="Connected Projects"
                  value={totalProjects}
                  valueStyle={{ color: "#60a5fa" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={3}>"""

content = content.replace(old_first_card, new_first_cards)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard KPIs updated successfully.")
