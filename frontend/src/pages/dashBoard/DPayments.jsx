// ✅ /src/pages/dashBoard/DPayments.jsx
import React, { useEffect, useState } from "react";
import { paymentService } from "../../api/payment.service";
import { Table, Tag } from "antd";

function DPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const res = await paymentService.getAllPayments();
        if (res && res.length > 0) setPayments(res);
      } catch (err) {
        console.error("Error loading payments:", err);
      }
    };
    loadPayments();
  }, []);

  const columns = [
    { title: "User ID", dataIndex: "userId", key: "userId" },
    { title: "Course ID", dataIndex: "courseId", key: "courseId" },
    { title: "Amount (VND)", dataIndex: "amount", key: "amount", render: (v) => v.toLocaleString() },
    { title: "Order Info", dataIndex: "orderInfo", key: "orderInfo" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "PAID" ? (
          <Tag color="green">PAID</Tag>
        ) : status === "PENDING" ? (
          <Tag color="orange">PENDING</Tag>
        ) : (
          <Tag color="red">FAILED</Tag>
        ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Payments Management</h2>
      <Table
        columns={columns}
        dataSource={payments}
        rowKey={(r) => r.id}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
}

export default DPayments;
