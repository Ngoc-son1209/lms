// ✅ /src/pages/dashBoard/DPayments.jsx
import React, { useEffect, useState } from "react";
import { Button, Descriptions, Modal, Select, Table, Tag, Typography, message } from "antd";
import { adminPaymentService } from "../../api/admin.payment.service";
import { exportService } from "../../api/export.service";

const { Title } = Typography;

function DPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [detailModal, setDetailModal] = useState({ open: false, paymentId: null });
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadPayments = async (st) => {
    setLoading(true);
    try {
      const res = await adminPaymentService.listPayments(st);
      setPayments(res?.data || []);
    } catch (err) {
      console.error("Error loading payments:", err);
      message.error("Không tải được danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const openDetail = async (paymentId) => {
    setDetailModal({ open: true, paymentId });
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await adminPaymentService.getPaymentDetail(paymentId);
      setDetail(res?.data || null);
    } catch (e) {
      message.error(e?.response?.data?.message || "Không tải được chi tiết hóa đơn");
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s) =>
        s === "PAID" ? (
          <Tag color="green">PAID</Tag>
        ) : s === "PENDING" ? (
          <Tag color="orange">PENDING</Tag>
        ) : (
          <Tag color="red">FAILED</Tag>
        ),
    },
    { title: "Course ID", dataIndex: "courseId", key: "courseId" },
    { title: "User ID", dataIndex: "userId", key: "userId" },
    {
      title: "Amount (VND)",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      render: (v) => (v != null ? Number(v).toLocaleString() : "-")
    },
    { title: "vnpTxnRef", dataIndex: "vnpTxnRef", key: "vnpTxnRef" },
    { title: "Order Info", dataIndex: "orderInfo", key: "orderInfo" },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_, r) => (
        <Button size="small" onClick={() => openDetail(r.id)}>Chi tiết</Button>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <Title level={3} className="!mb-0 !text-gray-800">Quản lý hóa đơn</Title>
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onChange={(v) => {
              setStatus(v);
              loadPayments(v);
            }}
            style={{ width: 180 }}
            placeholder="Lọc theo trạng thái"
            allowClear
            options={[
              { value: "PAID", label: "PAID" },
              { value: "PENDING", label: "PENDING" },
              { value: "FAILED", label: "FAILED" },
            ]}
          />
          <Button onClick={() => exportService.exportPayments()}>Xuất Excel</Button>
          <Button onClick={() => loadPayments(status)}>Refresh</Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={payments}
        rowKey={(r) => r.id}
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title="Chi tiết hóa đơn"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, paymentId: null })}
        footer={null}
        width={820}
      >
        <Descriptions bordered size="small" column={2} loading={detailLoading}>
          <Descriptions.Item label="Payment ID" span={2}>{detail?.id || "-"}</Descriptions.Item>
          <Descriptions.Item label="Status">{detail?.status || "-"}</Descriptions.Item>
          <Descriptions.Item label="Amount">{detail?.amount != null ? Number(detail.amount).toLocaleString() : "-"}</Descriptions.Item>
          <Descriptions.Item label="Course">{detail?.courseName || detail?.courseId || "-"}</Descriptions.Item>
          <Descriptions.Item label="User">{detail?.userName || detail?.userId || "-"}</Descriptions.Item>
          <Descriptions.Item label="User Email" span={2}>{detail?.userEmail || "-"}</Descriptions.Item>
          <Descriptions.Item label="vnpTxnRef" span={2}>{detail?.vnpTxnRef || "-"}</Descriptions.Item>
          <Descriptions.Item label="Order Info" span={2}>{detail?.orderInfo || "-"}</Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
}

export default DPayments;
