import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL as BACKEND_URL } from '../services/api';
import { Layout, Card, Table, Input, Button, Tag, notification } from 'antd';

import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Search } = Input;


const ACTION_TAG_COLORS = {
  login: 'green',
  logout: 'orange',
  upload: 'blue',
  register: 'purple',
};

const columns = [
  {
    title: 'User',
    dataIndex: 'user_email',
    key: 'user_email',
    ellipsis: true,
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (action) => {
      const color = ACTION_TAG_COLORS[action] || 'default';
      return <Tag color={color}>{action}</Tag>;
    },
  },
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
  },
  {
    title: 'IP Address',
    dataIndex: 'ip_address',
    key: 'ip_address',
  },
];

function AuditLogPage() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (search) {
        params.append('search', search);
      }
      const response = await fetch(`${BACKEND_URL}/api/audit-logs?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
        setTotal(data.total);
      } else {
        notification.error({ message: 'Failed to fetch audit logs' });
      }
    } catch (err) {
      notification.error({ message: 'Network error', description: err.message });
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (value) => {
    setPage(1);
    setSearch(value);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPerPage(pagination.pageSize);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all logs by requesting a large per_page
      const params = new URLSearchParams({
        page: '1',
        per_page: String(total || 10000),
      });
      if (search) {
        params.append('search', search);
      }
      const response = await fetch(`${BACKEND_URL}/api/audit-logs?${params.toString()}`);
      const data = await response.json();
      if (data.success && data.logs) {
        const csvHeaders = ['ID', 'User Email', 'Action', 'Timestamp', 'IP Address'];
        const csvRows = data.logs.map((log) =>
          [log.id, log.user_email, log.action, log.timestamp, log.ip_address]
            .map((field) => `"${String(field ?? '').replace(/"/g, '""')}"`)
            .join(',')
        );
        const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'audit_logs.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        notification.success({ message: 'CSV exported successfully' });
      } else {
        notification.error({ message: 'Failed to export logs' });
      }
    } catch (err) {
      notification.error({ message: 'Export failed', description: err.message });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            className="header-nav-btn"
            type="text"
            icon={<i className="fa-solid fa-circle"></i>}
            onClick={() => navigate('/dashboard')}
          />
          <i className="fa-solid fa-shield-halved" style={{ fontSize: 22, color: '#b388ff' }} ></i>
          <span style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Audit Logs</span>
        </div>
      </Header>

      <Content className="app-content">
        <Card className="glass-card" bordered={false}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Search
                placeholder="Search by action, email, or IP"
                allowClear
                enterButton={<i className="fa-solid fa-magnifying-glass"></i>}
                onSearch={handleSearch}
                style={{ width: 320 }}
              />
              <Tag
                color="purple"
                style={{ fontSize: 14, padding: '4px 12px', margin: 0 }}
              >
                Total: {total}
              </Tag>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                icon={<i className="fa-solid fa-circle"></i>}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<i className="fa-solid fa-circle"></i>}
                onClick={handleExportCSV}
                loading={exporting}
              >
                Export CSV
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={logs}
            rowKey="id"
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize: perPage,
              total: total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} logs`,
            }}
            style={{ background: 'transparent' }}
            rowClassName={() => 'audit-table-row'}
          />
        </Card>
      </Content>

      <style>{`
        .audit-table-row td {
          background: rgba(30, 30, 60, 0.5) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
          color: #e0e0e0 !important;
        }
        .audit-table-row:hover td {
          background: rgba(60, 50, 100, 0.6) !important;
        }
        .ant-table-thead > tr > th {
          background: rgba(40, 30, 80, 0.7) !important;
          color: #b388ff !important;
          border-bottom: 1px solid rgba(179, 136, 255, 0.2) !important;
        }
        .ant-pagination .ant-pagination-item a {
          color: #e0e0e0 !important;
        }
        .ant-pagination .ant-pagination-item-active {
          border-color: #b388ff !important;
        }
        .ant-pagination .ant-pagination-item-active a {
          color: #b388ff !important;
        }
      `}</style>
    </Layout>
  );
}

export default AuditLogPage;
