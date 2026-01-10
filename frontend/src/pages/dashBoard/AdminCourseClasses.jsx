import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button, message } from "antd";
import { adminService } from "../../api/admin.service";
import Navbar from "../../Components/common/Navbar";

export default function AdminCourseClasses() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getClassesByCourse(courseId);
      if (res.success) setClasses(res.data || []);
      else message.error(res.error || "Could not fetch classes");
    } catch (e) {
      message.error("Could not fetch classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId]);

  const columns = [
    { title: "Tên lớp", dataIndex: "name", key: "name" },
    { title: "Giảng viên", dataIndex: "instructorName", key: "instructorName", render: (v) => v || "N/A" },
    { title: "Sĩ số", key: "size", render: (_, r) => `${r.currentStudentCount ?? 0}/${r.capacity ?? '∞'}` },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp học</h1>
              <p className="text-slate-600">Lớp học của khóa học: {courseId}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate(-1)}>Back</Button>
              {/* TODO: Add Create Class modal later */}
              {/* <Button type="primary" onClick={() => setOpenCreate(true)}>Add Class</Button> */}
            </div>
          </div>

          <Card className="shadow-xl">
            <Table
              columns={columns}
              dataSource={classes}
              rowKey={(r) => r.id}
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}

