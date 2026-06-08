import React, { useState } from 'react';
import { API_BASE_URL as BACKEND_URL } from '../services/api';
import { Button, notification } from 'antd';



const buildReportHTML = (report) => {
  const {
    generated_at,
    total_employees,
    productivity,
    burnout,
    workload,
    top_performers,
    needs_improvement,
    jira,
    recommendations,
  } = report;

  const topRows = (top_performers || [])
    .slice(0, 5)
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.productivity}%</td>
        <td>${p.project}</td>
      </tr>`
    )
    .join('');

  const bottomRows = (needs_improvement || [])
    .slice(0, 5)
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.productivity}%</td>
        <td>${p.project}</td>
      </tr>`
    )
    .join('');

  const recItems = (recommendations || [])
    .map((r) => `<li>${r}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>AI Workforce Analytics — Executive Report</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    color: #1a1a2e;
    background: #ffffff;
    padding: 40px 48px;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @media print {
    body { padding: 24px; }
    .no-print { display: none !important; }
    @page { margin: 20mm 15mm; }
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #6c5ce7;
    padding-bottom: 16px;
    margin-bottom: 32px;
  }
  .header-left h1 {
    font-size: 22px;
    color: #6c5ce7;
    font-weight: 700;
  }
  .header-left p {
    font-size: 13px;
    color: #636e72;
    margin-top: 4px;
  }
  .logo-placeholder {
    width: 80px;
    height: 80px;
    border: 2px dashed #b2bec3;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #b2bec3;
    text-align: center;
  }
  .section { margin-bottom: 28px; }
  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #2d3436;
    border-left: 4px solid #6c5ce7;
    padding-left: 10px;
    margin-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-top: 8px;
  }
  th {
    background: #6c5ce7;
    color: #fff;
    text-align: left;
    padding: 8px 12px;
    font-weight: 600;
  }
  td {
    padding: 7px 12px;
    border-bottom: 1px solid #dfe6e9;
  }
  tr:nth-child(even) td { background: #f8f9fa; }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-top: 8px;
  }
  .kpi-card {
    background: #f8f9fa;
    border: 1px solid #dfe6e9;
    border-radius: 8px;
    padding: 14px 16px;
    text-align: center;
  }
  .kpi-card .value {
    font-size: 26px;
    font-weight: 700;
    color: #6c5ce7;
  }
  .kpi-card .label {
    font-size: 12px;
    color: #636e72;
    margin-top: 4px;
  }
  .burnout-bar-container {
    display: flex;
    gap: 16px;
    margin-top: 8px;
  }
  .burnout-item {
    flex: 1;
    background: #f8f9fa;
    border: 1px solid #dfe6e9;
    border-radius: 8px;
    padding: 14px 16px;
    text-align: center;
  }
  .burnout-item .count {
    font-size: 24px;
    font-weight: 700;
  }
  .burnout-item .level {
    font-size: 12px;
    color: #636e72;
    margin-top: 4px;
  }
  .burnout-high .count { color: #d63031; }
  .burnout-medium .count { color: #fdcb6e; }
  .burnout-low .count { color: #00b894; }
  .rec-list {
    list-style: none;
    padding: 0;
    margin-top: 8px;
  }
  .rec-list li {
    padding: 8px 14px;
    margin-bottom: 6px;
    background: #f8f9fa;
    border-left: 3px solid #6c5ce7;
    border-radius: 4px;
    font-size: 13px;
  }
  .jira-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-top: 8px;
  }
  .jira-card {
    background: #f8f9fa;
    border: 1px solid #dfe6e9;
    border-radius: 8px;
    padding: 14px 16px;
    text-align: center;
  }
  .jira-card .value {
    font-size: 22px;
    font-weight: 700;
    color: #2d3436;
  }
  .jira-card .label {
    font-size: 12px;
    color: #636e72;
    margin-top: 4px;
  }
  .footer {
    margin-top: 40px;
    padding-top: 12px;
    border-top: 1px solid #dfe6e9;
    text-align: center;
    font-size: 11px;
    color: #b2bec3;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>AI Workforce Analytics — Executive Report</h1>
      <p>Generated: ${generated_at}</p>
    </div>
    <div class="logo-placeholder">Company<br/>Logo</div>
  </div>

  <div class="section">
    <div class="section-title">KPI Summary</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="value">${total_employees}</div>
        <div class="label">Total Employees</div>
      </div>
      <div class="kpi-card">
        <div class="value">${productivity.average}%</div>
        <div class="label">Avg Productivity</div>
      </div>
      <div class="kpi-card">
        <div class="value">${workload.avg_hours}h</div>
        <div class="label">Avg Work Hours</div>
      </div>
      <div class="kpi-card">
        <div class="value">${workload.avg_overtime}h</div>
        <div class="label">Avg Overtime</div>
      </div>
    </div>
    <table style="margin-top:14px;">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Max Productivity</td><td>${productivity.max}%</td></tr>
        <tr><td>Min Productivity</td><td>${productivity.min}%</td></tr>
        <tr><td>Employees Above 80%</td><td>${productivity.above_80}</td></tr>
        <tr><td>Employees Below 50%</td><td>${productivity.below_50}</td></tr>
        <tr><td>Max Overtime</td><td>${workload.max_overtime}h</td></tr>
        <tr><td>Employees with Overtime</td><td>${workload.overtime_employees}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Burnout Breakdown</div>
    <div class="burnout-bar-container">
      <div class="burnout-item burnout-high">
        <div class="count">${burnout.High || 0}</div>
        <div class="level">High Risk</div>
      </div>
      <div class="burnout-item burnout-medium">
        <div class="count">${burnout.Medium || 0}</div>
        <div class="level">Medium Risk</div>
      </div>
      <div class="burnout-item burnout-low">
        <div class="count">${burnout.Low || 0}</div>
        <div class="level">Low Risk</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Top 5 Performers</div>
    <table>
      <thead>
        <tr><th>#</th><th>Name</th><th>Productivity</th><th>Project</th></tr>
      </thead>
      <tbody>${topRows || '<tr><td colspan="4" style="text-align:center;color:#b2bec3;">No data</td></tr>'}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Bottom 5 — Needs Improvement</div>
    <table>
      <thead>
        <tr><th>#</th><th>Name</th><th>Productivity</th><th>Project</th></tr>
      </thead>
      <tbody>${bottomRows || '<tr><td colspan="4" style="text-align:center;color:#b2bec3;">No data</td></tr>'}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Jira Integration Summary</div>
    <div class="jira-grid">
      <div class="jira-card">
        <div class="value">${jira.total_synced_records}</div>
        <div class="label">Total Synced Records</div>
      </div>
      <div class="jira-card">
        <div class="value">${jira.last_sync || 'N/A'}</div>
        <div class="label">Last Sync Date</div>
      </div>
      <div class="jira-card">
        <div class="value" style="text-transform:capitalize;">${jira.last_status || 'N/A'}</div>
        <div class="label">Sync Status</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">AI Recommendations</div>
    <ul class="rec-list">${recItems || '<li>No recommendations available.</li>'}</ul>
  </div>

  <div class="footer">
    AI Workforce Analytics • Confidential • ${generated_at}
  </div>
</body>
</html>`;
};

const ExecutiveReportButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/executive-report`);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (!data.success || !data.report) {
        throw new Error('Invalid report data received from server.');
      }

      const html = buildReportHTML(data.report);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        notification.error({
          message: 'Pop-up Blocked',
          description:
            'Please allow pop-ups for this site to generate the report.',
        });
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (err) {
      notification.error({
        message: 'Report Generation Failed',
        description:
          err.message || 'An unexpected error occurred while generating the report.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="header-nav-btn"
      icon={loading ? <i className="fa-solid fa-spinner fa-spin" spin ></i> : <i className="fa-solid fa-file-pdf"></i>}
      onClick={handleGenerateReport}
      loading={false}
      disabled={loading}
    >
      Report
    </Button>
  );
};

export default ExecutiveReportButton;
