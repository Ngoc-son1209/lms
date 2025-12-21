import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag, Typography } from "antd";
import { adminService } from "../../api/admin.service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faList } from '@fortawesome/free-solid-svg-icons';
import { RestOutlined, EditOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function AdminCourseClassesPanel({ courseId, onBack }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchClasses = async () => {
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

  const fetchInstructors = async () => {
    setLoadingInstructors(true);
    try {
      const res = await adminService.getApprovedInstructors();
      if (res.success) setInstructors(res.data || []);
    } catch { }
    setLoadingInstructors(false);
  };

  useEffect(() => {
    if (courseId) fetchClasses();
  }, [courseId]);

  const openCreate = () => {
    form.resetFields();
    setIsCreateOpen(true);
    fetchInstructors();
  };

  const openEdit = (record) => {
    setEditRecord(record);
    editForm.setFieldsValue({
      name: record.name,
      code: record.code || undefined,
      instructorId: record.instructorId || undefined,
      capacity: record.capacity || undefined,
      status: record.status || "ACTIVE",
    });
    setIsEditOpen(true);
    fetchInstructors();
  };

  const handleCreate = async (values) => {
    const payload = {
      courseId,
      name: values.name,
      code: values.code,
      instructorId: values.instructorId,
      capacity: values.capacity,
      status: values.status || "ACTIVE",
    };
    const res = await adminService.createClassSection(payload);
    if (res.success) {
      message.success("Class created");
      setIsCreateOpen(false);
      fetchClasses();
    } else message.error(res.error || "Create failed");
  };

  const handleUpdate = async (values) => {
    const payload = {
      courseId,
      name: values.name,
      code: values.code,
      instructorId: values.instructorId,
      capacity: values.capacity,
      status: values.status || "ACTIVE",
    };
    const res = await adminService.updateClassSection(editRecord.id, payload);
    if (res.success) {
      message.success("Class updated");
      setIsEditOpen(false);
      setEditRecord(null);
      fetchClasses();
    } else message.error(res.error || "Update failed");
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: "Delete Class",
      content: `Are you sure you want to delete class \"${record.name}\"?`,
      okType: "danger",
      onOk: async () => {
        const res = await adminService.deleteClassSection(record.id);
        if (res.success) {
          message.success("Class deleted");
          fetchClasses();
        } else message.error(res.error || "Delete failed");
      },
    });
  };

  const columns = [
    { title: "Tên lớp", dataIndex: "name", key: "name" },
    { title: "Giảng viên", dataIndex: "instructorName", key: "instructorName", render: (v) => v || "N/A" },
    { title: "Sĩ số", key: "size", render: (_, r) => `${r.currentStudentCount ?? 0}/${r.capacity ?? '∞'}` },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (s) => <Tag color={s === 'ACTIVE' ? 'green' : s === 'INACTIVE' ? 'orange' : 'default'}>{s}</Tag> },
    {
      title: "Hành động",
      key: "actions",
      width: 180,
      render: (_, r) => (
        <div className="flex gap-2">
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} >Sửa</Button>
          <Button size="small" danger icon={<RestOutlined />} onClick={() => handleDelete(r)} className="hover:bg-red-50">Xóa</Button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header - match AddQuestions style */}
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
                <FontAwesomeIcon icon={faList} className="mr-3 text-blue-600" />
                Quản lý lớp học
              </Title>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 h-12 font-semibold"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Thêm lớp học
          </Button>
        </div>
      </Card>

      {/* List card - match Questions list card */}
      <Card className="rounded-2xl shadow-sm border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <Title level={3} className="!mb-0 !text-gray-800">
            <FontAwesomeIcon icon={faList} className="mr-2 text-green-600" />
            Danh sách lớp học ({classes.length})
          </Title>
        </div>

        <Table
          columns={columns}
          dataSource={classes}
          rowKey={(r) => r.id}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false, className: "mt-4" }}
          className="rounded-lg border border-gray-200"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faPlus} className="text-blue-600" />
            <span>Thêm lớp học</span>
          </div>
        }
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        footer={null}
        width={720}
        className="rounded-2xl"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="Tên lớp" name="name" rules={[{ required: true, message: "Class name is required" }]}>
            <Input placeholder="Nhập tên lớp" />
          </Form.Item>
          <Form.Item label="Mã lớp" name="code">
            <Input placeholder="Mã lớp (tùy chọn)" />
          </Form.Item>
          <Form.Item label="Giảng viên" name="instructorId">
            <Select
              loading={loadingInstructors}
              allowClear
              placeholder="Chọn giảng viên"
              options={(instructors || []).map((i) => ({ value: i.userId, label: `${i.fullName || i.email} - ${i.email}` }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Sĩ số tối đa" name="capacity" rules={[{ type: "number", min: 0, message: "Must be >= 0" }]}>
            <InputNumber className="w-full" min={0} placeholder="Max students (optional)" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" initialValue="ACTIVE">
            <Select options={[{ value: "ACTIVE", label: "ACTIVE" }, { value: "INACTIVE", label: "INACTIVE" }, { value: "ARCHIVED", label: "ARCHIVED" }]} />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button onClick={() => setIsCreateOpen(false)} className="rounded-lg px-6">Đóng</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6">Tạo lớp mới</Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faList} className="text-blue-600" />
            <span>Sửa thông tin lớp học</span>
          </div>
        }
        open={isEditOpen}
        onCancel={() => { setIsEditOpen(false); setEditRecord(null); }}
        footer={null}
        width={720}
        className="rounded-2xl"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="Tên lớp" name="name" rules={[{ required: true, message: "Tên lớp là bắt buộc" }]}>
            <Input placeholder="Nhập tên lớp" />
          </Form.Item>
          <Form.Item label="Mã lớp" name="code">
            <Input placeholder="Mã lớp (tùy chọn)" />
          </Form.Item>
          <Form.Item label="Giảng viên" name="instructorId">
            <Select
              loading={loadingInstructors}
              allowClear
              placeholder="Chọn giảng viên"
              options={(instructors || []).map((i) => ({ value: i.userId, label: `${i.fullName || i.email} - ${i.email}` }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Sĩ số tối đa" name="capacity" rules={[{ type: "number", min: 0, message: "Must be >= 0" }]}>
            <InputNumber className="w-full" min={0} placeholder="Max students (optional)" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" initialValue="ACTIVE">
            <Select options={[{ value: "ACTIVE", label: "ACTIVE" }, { value: "INACTIVE", label: "INACTIVE" }, { value: "ARCHIVED", label: "ARCHIVED" }]} />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button onClick={() => { setIsEditOpen(false); setEditRecord(null); }} className="rounded-lg px-6">Đóng</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6">Cập nhật</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
