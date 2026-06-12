import re

file_path = "src/pages/Dashboard.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We need to find the duplicated state block and remove it.
# The block is:
#   const [globalSummary, setGlobalSummary] = useState({
#     totalEmployees: 0,
#     activeEmployees: 0,
#     topPerformers: 0,
#     needHelp: 0
#   });
# 
#   const fetchGlobalSummary = async () => { ... }

block_to_remove = """  const [globalSummary, setGlobalSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    topPerformers: 0,
    needHelp: 0
  });

  const fetchGlobalSummary = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/summary`);
      const data = await res.json();
      if (data.success) {
        setGlobalSummary({
          totalEmployees: data.totalEmployees,
          activeEmployees: data.activeEmployees,
          topPerformers: data.topPerformers,
          needHelp: data.needHelp
        });
      }
    } catch (err) {
      console.error("Error fetching global summary:", err);
    }
  };"""

# Remove the duplicated block if it exists
if content.count("const [globalSummary") > 1:
    content = content.replace(block_to_remove, "", 1)
    print("Removed one duplicated globalSummary block.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done cleanup.")
