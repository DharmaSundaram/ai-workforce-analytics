import React from "react";
import { Card, Row, Col, Skeleton } from "antd";

export function SkeletonKPIs() {
  return (
    <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col xs={24} sm={12} md={8} lg={4} key={i}>
          <Card
            className="kpi-card glass-card"
            bordered={false}
            style={{ minHeight: 130 }}
          >
            <Skeleton
              active
              paragraph={{ rows: 1, width: "60%" }}
              title={{ width: "40%" }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export function SkeletonCharts() {
  return (
    <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
      <Col xs={24} lg={8}>
        <Card className="chart-card glass-card" bordered={false}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card className="chart-card glass-card" bordered={false}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Col>
      <Col xs={24} lg={6}>
        <Card className="glass-card" bordered={false}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      </Col>
    </Row>
  );
}

export function SkeletonTable() {
  return (
    <Card className="table-card glass-card" bordered={false} style={{ marginBottom: 28 }}>
      <div style={{ padding: "24px" }}>
        <Skeleton active title={{ width: "30%" }} paragraph={false} />
        <div style={{ marginTop: 20 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 16,
                alignItems: "center",
              }}
            >
              <Skeleton.Avatar active size="small" />
              <Skeleton
                active
                paragraph={false}
                title={{ width: `${70 + Math.random() * 30}%` }}
                style={{ flex: 1 }}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
