import jsPDF from "jspdf";
import "jspdf-autotable";

export async function exportAnalyticsPDF(employees, kpis, forecastData) {
  const doc = new jsPDF();

  // Title Header
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, 210, 40, "F");
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 38, 210, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AI Workforce Analytics Report", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(147, 197, 253);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(
    `Total Records: ${kpis.total_employees || employees.length}`,
    14,
    34
  );

  // KPI Summary
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Key Performance Indicators", 14, 52);

  doc.autoTable({
    startY: 58,
    head: [["Metric", "Value"]],
    body: [
      ["Total Employees", String(kpis.total_employees || employees.length)],
      ["Avg Productivity", `${kpis.avg_productivity || 0}%`],
      ["High Burnout", String(kpis.high_burnout || 0)],
      ["Medium Burnout", String(kpis.medium_burnout || 0)],
      ["Low Burnout", String(kpis.low_burnout || 0)],
      ["Overtime Employees", String(kpis.overtime_employees || 0)],
      ["Top Performers", String(kpis.top_performers_count || 0)],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 4 },
    alternateRowStyles: { fillColor: [240, 244, 248] },
  });

  // Employee Data Table
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Analytics Data", 14, 14);

  const tableData = employees.slice(0, 100).map((emp) => [
    emp.employee_name || "",
    emp.project_name || "",
    `${emp.productivity || 0}%`,
    `${emp.predicted_productivity || 0}%`,
    emp.burnout_risk || "",
    `${emp.total_hours || 0}h`,
    `${emp.overtime_hours || 0}h`,
    String(emp.focus_score || 0),
  ]);

  doc.autoTable({
    startY: 26,
    head: [
      [
        "Name",
        "Project",
        "Actual %",
        "Predicted %",
        "Burnout",
        "Hours",
        "Overtime",
        "Focus",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 26 },
      4: { cellWidth: 18 },
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === "body") {
        const val = data.cell.raw;
        if (val === "High") data.cell.styles.textColor = [239, 68, 68];
        else if (val === "Medium") data.cell.styles.textColor = [245, 158, 11];
        else if (val === "Low") data.cell.styles.textColor = [16, 185, 129];
      }
    },
  });

  // Burnout Distribution Summary
  if (employees.length > 0) {
    const highCount = employees.filter((e) => e.burnout_risk === "High").length;
    const medCount = employees.filter(
      (e) => e.burnout_risk === "Medium"
    ).length;
    const lowCount = employees.filter((e) => e.burnout_risk === "Low").length;
    const total = employees.length;

    doc.addPage();
    doc.setFillColor(10, 22, 40);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Burnout Distribution Summary", 14, 14);

    doc.autoTable({
      startY: 26,
      head: [["Burnout Level", "Count", "Percentage"]],
      body: [
        [
          "High Risk",
          String(highCount),
          `${((highCount / total) * 100).toFixed(1)}%`,
        ],
        [
          "Medium Risk",
          String(medCount),
          `${((medCount / total) * 100).toFixed(1)}%`,
        ],
        [
          "Low Risk",
          String(lowCount),
          `${((lowCount / total) * 100).toFixed(1)}%`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 11, cellPadding: 5 },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === "body") {
          const val = data.cell.raw;
          if (val === "High Risk") data.cell.styles.textColor = [239, 68, 68];
          else if (val === "Medium Risk")
            data.cell.styles.textColor = [245, 158, 11];
          else if (val === "Low Risk")
            data.cell.styles.textColor = [16, 185, 129];
        }
      },
    });

    // Forecast Summary
    if (forecastData && forecastData.length > 0) {
      const lastY = doc.lastAutoTable.finalY + 20;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Weekly Productivity Forecast", 14, lastY);

      doc.autoTable({
        startY: lastY + 6,
        head: [["Week", "Actual Avg %", "ML Predicted %"]],
        body: forecastData.map((f) => [
          f.week,
          `${f.productivity}%`,
          `${f.predicted}%`,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: { fontSize: 10, cellPadding: 4 },
      });
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `AI Workforce Analytics | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save("AI_Workforce_Analytics_Report.pdf");
  return true;
}
