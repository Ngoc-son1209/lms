import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, message, Modal, Select, Table, Tag, Typography } from "antd";
import { adminClassStudentsService } from "../../api/admin.classStudents.service";
import { adminService } from "../../api/admin.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faUsers } from "@fortawesome/free-solid-svg-icons";

const { Title } = Typography;

export default function AdminClassStudentsPanel({ courseId, classSection, onBack }) {
  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [courseName, setCourseName] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addUserId, setAddUserId] = useState(null);

  const [moveModal, setMoveModal] = useState({ open: false, userId: null, toClassSectionId: null });
  const [classes, setClasses] = useState([]);

  const classSectionId = classSection?.id;

  const fetchAll = async () => {
    if (!classSectionId) return;
    setLoading(true);
    try {
      const [studentsRes, pendingRes, classesRes, courseRes] = await Promise.all([
        adminClassStudentsService.listStudentsInClass(classSectionId),
        adminClassStudentsService.listUnassigned(courseId),
        adminService.getClassesByCourse(courseId),
        adminService.getCourseById(courseId),
      ]);

      if (studentsRes?.data) setStudents(studentsRes.data);
      if (pendingRes?.data) setPending(pendingRes.data);
      if (classesRes?.success) setClasses(classesRes.data || []);
      if (courseRes?.success) setCourseName(courseRes.data?.course_name || "");
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classSectionId]);

  const filteredStudents = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return students;
    return students.filter((u) =>
      (u.username || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s) ||
      (u.mobileNumber || "").toLowerCase().includes(s)
    );
  }, [students, search]);

  const openAdd = () => {
    setAddUserId(null);
    setIsAddOpen(true);
  };

  const handleAdd = async () => {
    if (!addUserId) {
      message.warning("Chọn học viên");
      return;
    }
    try {
      const res = await adminClassStudentsService.assignStudentToClass(classSectionId, addUserId);
      // BE trả ApiResponse { message, data, timestamp } (không có field success)
      // Thành công khi HTTP 200 và không throw vào catch
      message.success("Đã thêm học viên vào lớp");
      setIsAddOpen(false);
      await fetchAll();
    } catch (e) {
      message.error(e?.response?.data?.message || "Thêm học viên thất bại");
    }
  };

  const openMove = (userId) => {
    setMoveModal({ open: true, userId, toClassSectionId: null });
  };

  const handleMove = async () => {
    if (!moveModal.toClassSectionId) {
      message.warning("Chọn lớp đích");
      return;
    }
    try {
      const res = await adminClassStudentsService.moveStudent(
        classSectionId,
        moveModal.userId,
        moveModal.toClassSectionId
      );
      // BE trả ApiResponse { message, data, timestamp } (không có field success)
      // Thành công khi HTTP 200 và không throw vào catch
      message.success("Đã chuyển lớp");
      setMoveModal({ open: false, userId: null, toClassSectionId: null });
      await fetchAll();
    } catch (e) {
      message.error(e?.response?.data?.message || "Chuyển lớp thất bại");
    }
  };

  const columns = [
    { title: "Tên", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "mobileNumber", key: "mobileNumber", render: (v) => v || "-" },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      render: (_, r) => (
        <Button onClick={() => openMove(r.userId)} size="small">Chuyển lớp</Button>
      )
    }
  ];

  const pendingColumns = [
    { title: "Tên", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "mobileNumber", key: "mobileNumber", render: (v) => v || "-" },
    {
      title: "Trạng thái",
      key: "st",
      render: () => <Tag color="orange">Chưa có lớp</Tag>
    },
    {
      title: "",
      key: "action",
      render: (_, r) => (
        <Button type="primary" size="small" onClick={() => { setIsAddOpen(true); setAddUserId(r.userId); }}>
          Thêm vào lớp này
        </Button>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="mb-6 rounded-2xl shadow-sm border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              onClick={onBack}
              className="rounded-xl px-3 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </Button>
            <div>
              <Title level={2} className="!mb-0 !text-gray-900">
                <FontAwesomeIcon icon={faUsers} className="mr-3 text-blue-600" />
                Quản lý học viên
              </Title>
              <div className="text-gray-600 text-sm">
                Lớp: {classSection?.name} • Khóa học: {courseName || courseId}
              </div>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 h-12 font-semibold"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Thêm học viên
          </Button>
        </div>
      </Card>

      <Card className="mb-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <Title level={4} className="!mb-0">Danh sách học viên trong lớp ({students.length})</Title>
          <Input
            placeholder="Tìm theo tên/email/sđt"
            style={{ maxWidth: 320 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table
          rowKey={(r) => r.userId}
          dataSource={filteredStudents}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card className="rounded-2xl">
        <Title level={4}>Học viên đã enroll nhưng chưa có lớp ({pending.length})</Title>
        <Table
          rowKey={(r) => `${r.userId}-${r.courseId}`}
          dataSource={pending}
          columns={pendingColumns}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Thêm học viên vào lớp"
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        onOk={handleAdd}
        okText="Thêm"
      >
        <div className="mb-2 text-gray-600 text-sm">
          Chọn học viên để thêm vào lớp này. Nếu học viên chưa enroll khóa học, hệ thống sẽ enroll hộ.
        </div>
        <Select
          className="w-full"
          value={addUserId}
          onChange={setAddUserId}
          placeholder="Chọn học viên"
          showSearch
          optionFilterProp="label"
          options={pending.map((p) => ({ value: p.userId, label: `${p.username} - ${p.email}` }))}
        />
      </Modal>

      <Modal
        title="Chuyển học viên sang lớp khác"
        open={moveModal.open}
        onCancel={() => setMoveModal({ open: false, userId: null, toClassSectionId: null })}
        onOk={handleMove}
        okText="Chuyển"
      >
        <div className="mb-2 text-gray-600 text-sm">
          Không cho chuyển nếu lớp đích đã đủ sĩ số.
        </div>
        <Select
          className="w-full"
          value={moveModal.toClassSectionId}
          onChange={(v) => setMoveModal((s) => ({ ...s, toClassSectionId: v }))}
          placeholder="Chọn lớp đích"
          options={classes
            .filter((c) => c.id !== classSectionId)
            .map((c) => ({ value: c.id, label: `${c.name} (${c.currentStudentCount ?? 0}/${c.capacity ?? "∞"})` }))}
          showSearch
          optionFilterProp="label"
        />
      </Modal>
    </div>
  );
}
