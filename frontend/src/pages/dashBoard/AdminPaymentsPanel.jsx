import React, { useEffect, useState } from "react";
import { Card, Input, Select, Table, Tag, Typography, message } from "antd";
import { adminPaymentService } from "../../api/admin.payment.service";

const { Title } = Typography;

export default function AdminPaymentsPanel() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({ status: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminPaymentService.listPayments(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );
      if (res?.data) setPayments(res.data);
      else message.error(res?.message || "Không tải được danh sách hóa đơn");
    } catch (e) {
      message.error("Không tải được danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  const columns = [
    { title: "Payment ID", dataIndex: "id", key: "id", ellipsis: true },
    { title: "User ID", dataIndex: "userId", key: "userId", ellipsis: true },
    { title: "Course ID", dataIndex: "courseId", key: "courseId", ellipsis: true },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v) => (v ?? 0).toLocaleString(),
    },
    { title: "TxnRef", dataIndex: "vnpTxnRef", key: "vnpTxnRef", ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) =>
        s === "PAID" ? (
          <Tag color="green">PAID</Tag>
        ) : s === "PENDING" ? (
          <Tag color="orange">PENDING</Tag>
        ) : (
          <Tag color="red">FAILED</Tag>
        ),
    },
    { title: "Order Info", dataIndex: "orderInfo", key: "orderInfo", ellipsis: true },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <Title level={3} className="!mb-0">Quản lý thanh toán</Title>
          <div className="flex gap-2">
            <Select
              style={{ width: 160 }}
              value={filters.status}
              onChange={(v) => setFilters((s) => ({ ...s, status: v }))}
              allowClear
              placeholder="Trạng thái"
              options={[
                { value: "PAID", label: "PAID" },
                { value: "PENDING", label: "PENDING" },
                { value: "FAILED", label: "FAILED" },
              ]}
            />
            <Input.Search
              placeholder="Filter userId/courseId (tạm thời)"
              style={{ width: 280 }}
              onSearch={() => fetchData()}
            />
          </div>
        </div>

        <Table
          className="mt-4"
          rowKey={(r) => r.id}
          dataSource={payments}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

