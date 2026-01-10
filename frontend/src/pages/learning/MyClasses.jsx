import React, { useEffect, useState } from "react";
import { Card, message, Table, Tag } from "antd";
import Navbar from "../../Components/common/Navbar";
import { learningService } from "../../api/learning.service";

export default function MyClasses() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  const fetchMyClasses = async () => {
    setLoading(true);
    try {
      const res = await learningService.getMyClasses();
      if (res?.success) {
        setClasses(res.data || []);
      } else {
        message.error(res?.error || "Không tải được danh sách lớp của bạn");
      }
    } catch (e) {
      message.error("Không tải được danh sách lớp của bạn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const columns = [
    {
      title: "Lớp",
      dataIndex: "name",
      key: "name",
      render: (v, r) => (
        <div>
          <div className="font-semibold text-gray-900">{v || "N/A"}</div>
          {r.code ? <div className="text-xs text-gray-500">{r.code}</div> : null}
        </div>
      ),
    },
    {
      title: "Khóa học",
      key: "course",
      render: (_, r) => r.course?.course_name || r.course?.name || r.courseName || "N/A",
    },
    {
      title: "Giảng viên phụ trách",
      dataIndex: "instructorName",
      key: "instructorName",
      render: (v, r) => v || r.instructor?.name || r.instructor?.username || "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (v) => {
        const s = (v || "").toString().toUpperCase();
        if (!s) return <Tag>UNKNOWN</Tag>;
        if (s === "ACTIVE") return <Tag color="green">ACTIVE</Tag>;
        if (s === "CLOSED") return <Tag color="red">CLOSED</Tag>;
        if (s === "DRAFT") return <Tag color="gold">DRAFT</Tag>;
        return <Tag>{s}</Tag>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar page="my-classes" />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Lớp học của tôi</h1>
            <p className="text-slate-600">Danh sách lớp bạn đang theo học</p>
          </div>

          <Card className="shadow-xl">
            <Table
              columns={columns}
              dataSource={classes}
              rowKey={(r) => r.id || `${r.classSectionId || ""}-${r.courseId || ""}-${r.name || ""}`}
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}

