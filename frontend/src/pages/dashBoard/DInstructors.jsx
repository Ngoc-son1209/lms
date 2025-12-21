import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Modal,
  Button,
  Space,
  Tag,
  Descriptions,
  message,
  Card,
  Tabs,
  Form,
  Input,
  Select,
} from "antd";
import { EyeOutlined, CheckCircleOutlined, EditOutlined, StopOutlined, RestOutlined } from "@ant-design/icons";
import { adminService } from "../../api/admin.service";
import SearchFilter from "../../Components/common/SearchFilter";

const { TextArea } = Input;

// Map trạng thái → màu + text tiếng Việt
const STATUS_UI = {
  PENDING: { color: "gold", text: "Chờ duyệt" },
  APPROVED: { color: "green", text: "Đã duyệt" },
  REJECTED: { color: "red", text: "Từ chối" },
  RESIGNED: { color: "default", text: "Đã nghỉ" },
};

function DInstructors() {
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [loadingResigned, setLoadingResigned] = useState(false);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [resigned, setResigned] = useState([]);
  const [activeKey, setActiveKey] = useState("approved");

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editForm] = Form.useForm();

  // Search/filter state (dùng chung cho cả 3 tab)
  const [filters, setFilters] = useState({
    keyword: "",
    gender: undefined,
    emailVerified: undefined, // true/false
  });

  const loadPending = async () => {
    setLoadingPending(true);
    try {
      const res = await adminService.getPendingInstructors();
      if (res.success) setPending(res.data || []);
      else message.error(res.error || "Không thể tải danh sách chờ duyệt");
    } catch (e) {
      message.error("Lỗi khi tải danh sách chờ duyệt");
    } finally {
      setLoadingPending(false);
    }
  };

  const loadApproved = async () => {
    setLoadingApproved(true);
    try {
      const res = await adminService.getApprovedInstructors();
      if (res.success) setApproved(res.data || []);
      else message.error(res.error || "Không thể tải danh sách đã duyệt");
    } catch (e) {
      message.error("Lỗi khi tải danh sách đã duyệt");
    } finally {
      setLoadingApproved(false);
    }
  };

  const loadResigned = async () => {
    setLoadingResigned(true);
    try {
      const res = await adminService.getResignedInstructors();
      if (res.success) setResigned(res.data || []);
      else message.error(res.error || "Không thể tải danh sách đã nghỉ");
    } catch (e) {
      message.error("Lỗi khi tải danh sách đã nghỉ");
    } finally {
      setLoadingResigned(false);
    }
  };

  useEffect(() => {
    loadPending();
    loadApproved();
    loadResigned();
  }, []);

  const handleView = (ins) => {
    setSelected(ins);
    setViewModalVisible(true);
  };

  const handleOpenEdit = (ins) => {
    setSelected(ins);
    editForm.setFieldsValue({
      fullName: ins.fullName,
      expertise: ins.expertise,
      bio: ins.bio,
      mobileNumber: ins.mobileNumber,
      dob: ins.dob,
      gender: ins.gender,
      location: ins.location,
      profession: ins.profession,
    });
    setEditModalVisible(true);
  };

  const submitEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const res = await adminService.updateInstructor(selected.id, values);
      if (res.success) {
        message.success("Cập nhật giảng viên thành công");
        setEditModalVisible(false);
        await Promise.all([loadPending(), loadApproved(), loadResigned()]);
      } else {
        message.error(res.error || "Cập nhật thất bại");
      }
    } catch (e) {
      // bỏ qua lỗi validate
    }
  };

  const handleApprove = (ins) => {
    Modal.confirm({
      title: "Duyệt giảng viên",
      content: `Bạn có chắc muốn duyệt giảng viên \"${ins.fullName}\"?`,
      okText: "Duyệt",
      cancelText: "Hủy",
      okButtonProps: { type: "primary" },
      onOk: async () => {
        const res = await adminService.approveInstructor(ins.id);
        if (res.success) {
          message.success("Đã duyệt giảng viên thành công");
          await Promise.all([loadPending(), loadApproved(), loadResigned()]);
        } else {
          message.error(res.error || "Duyệt thất bại");
        }
      },
    });
  };

  const handleOpenReject = (ins) => {
    setSelected(ins);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    const res = await adminService.rejectInstructor(selected.id, rejectReason.trim());
    if (res.success) {
      message.success("Đã từ chối giảng viên");
      setRejectModalVisible(false);
      await Promise.all([loadPending(), loadApproved(), loadResigned()]);
    } else {
      message.error(res.error || "Từ chối thất bại");
    }
  };

  const handleResign = (ins) => {
    Modal.confirm({
      title: "Đánh dấu giảng viên đã nghỉ",
      icon: <RestOutlined />,
      content: `Bạn có chắc đánh dấu \"${ins.fullName}\" là ĐÃ NGHỈ? Tài khoản sẽ bị hạ quyền giảng viên.`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        const res = await adminService.resignInstructor(ins.id);
        if (res.success) {
          message.success("Đã đánh dấu giảng viên đã nghỉ");
          await Promise.all([loadPending(), loadApproved(), loadResigned()]);
        } else {
          message.error(res.error || "Thao tác thất bại");
        }
      },
    });
  };

  const buildColumns = (opts = { approveReject: false, allowResign: false }) => [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
    },
    {
      title: "Chuyên môn",
      dataIndex: "expertise",
      key: "expertise",
      render: (exp) => (exp ? <Tag color="blue">{exp}</Tag> : "N/A"),
    },
    {
      title: "SĐT",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      render: (v) => v || "N/A",
    },
    {
      title: "Xác thực Email",
      dataIndex: "emailVerified",
      key: "emailVerified",
      render: (v) => (
        <Tag color={v ? "green" : "red"}>{v ? "Đã xác thực" : "Chưa xác thực"}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => (
        <Tag color={STATUS_UI[v]?.color || "default"}>{STATUS_UI[v]?.text || v}</Tag>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? new Date(date).toLocaleString() : "N/A"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 260,
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost icon={<EyeOutlined />} size="small" onClick={() => handleView(record)}>
            Xem
          </Button>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleOpenEdit(record)}>
            Sửa
          </Button>
          {opts.approveReject && (
            <>
              <Button type="primary" icon={<CheckCircleOutlined />} size="small" onClick={() => handleApprove(record)}>
                Duyệt
              </Button>
              <Button danger icon={<StopOutlined />} size="small" onClick={() => handleOpenReject(record)}>
                Từ chối
              </Button>
            </>
          )}
          {opts.allowResign && (
            <Button danger icon={<RestOutlined />} size="small" onClick={() => handleResign(record)}>
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Apply local filters
  const applyFilter = (rows) => {
    const kw = (filters.keyword || "").toLowerCase().trim();
    return (rows || []).filter((r) => {
      const okKw = kw
        ? [r.fullName, r.email, r.expertise, r.mobileNumber]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(kw))
        : true;
      const okGender = filters.gender ? r.gender === filters.gender : true;
      const okVerified =
        typeof filters.emailVerified === "boolean"
          ? r.emailVerified === filters.emailVerified
          : true;
      return okKw && okGender && okVerified;
    });
  };

  const columnsPending = useMemo(() => buildColumns({ approveReject: true }), []);
  const columnsApproved = useMemo(() => buildColumns({ allowResign: true }), []);
  const columnsResigned = useMemo(() => buildColumns({ approveReject: false, allowResign: false }), []);

  const filteredPending = useMemo(() => applyFilter(pending), [pending, filters]);
  const filteredApproved = useMemo(() => applyFilter(approved), [approved, filters]);
  const filteredResigned = useMemo(() => applyFilter(resigned), [resigned, filters]);

  const filterFields = [
    { type: "input", name: "keyword", label: "Từ khóa", placeholder: "Tên/Email/Chuyên môn/SĐT" },
    {
      type: "select",
      name: "gender",
      label: "Giới tính",
      placeholder: "Chọn giới tính",
      options: [
        { label: "Nam", value: "Male" },
        { label: "Nữ", value: "Female" },
        { label: "Khác", value: "Other" },
        { label: "Không muốn nói", value: "Prefer not to say" },
      ],
    },
    {
      type: "select",
      name: "emailVerified",
      label: "Xác thực email",
      placeholder: "Chọn xác thực email",
      options: [
        { label: "Đã xác thực", value: true },
        { label: "Chưa xác thực", value: false },
      ],
    },
  ];

  const items = [
    {
      key: "approved",
      label: "Đã duyệt",
      children: (
        <Table
          columns={columnsApproved}
          dataSource={filteredApproved}
          loading={loadingApproved}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `Tổng ${t} giảng viên` }}
          scroll={{ x: 1000 }}
        />
      ),
    },
    {
      key: "pending",
      label: "Chờ duyệt",
      children: (
        <Table
          columns={columnsPending}
          dataSource={filteredPending}
          loading={loadingPending}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `Tổng ${t} giảng viên` }}
          scroll={{ x: 1000 }}
        />
      ),
    },
    {
      key: "resigned",
      label: "Đã nghỉ",
      children: (
        <Table
          columns={columnsResigned}
          dataSource={filteredResigned}
          loading={loadingResigned}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `Tổng ${t} giảng viên` }}
          scroll={{ x: 1000 }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Instructors Management</h1>
        <p className="text-slate-600">Manage and review instructors</p>
      </div>

      <Card className="shadow-xl mb-4">
        <SearchFilter fields={filterFields} initialValues={filters} onChange={setFilters} debounce={300} />
      </Card>

      <Card className="shadow-xl">
        <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />
      </Card>

      {/* View Modal */}
      <Modal
        title="Chi tiết giảng viên"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[<Button key="close" onClick={() => setViewModalVisible(false)}>Đóng</Button>]}
        width={700}
      >
        {selected && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Họ tên">{selected.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selected.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selected.mobileNumber || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{selected.gender || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">{selected.dob || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{selected.location || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Nghề nghiệp">{selected.profession || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Chuyên môn">{selected.expertise || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Email đã xác thực">
              <Tag color={selected.emailVerified ? "green" : "red"}>{selected.emailVerified ? "Đã xác thực" : "Chưa xác thực"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={STATUS_UI[selected.status]?.color || "default"}>{STATUS_UI[selected.status]?.text || selected.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Bio" span={2}>{selected.bio || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Ngày đăng ký">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">{selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : "N/A"}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Sửa thông tin giảng viên"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={submitEdit}
        okText="Lưu"
        cancelText="Hủy"
        width={720}
      >
        <Form form={editForm} layout="vertical">
          {/* Row 1: Full Name & Email (email read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Email">
              <Input value={selected?.email} disabled />
            </Form.Item>
          </div>
          {/* Row 2: Phone & Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Số điện thoại" name="mobileNumber">
              <Input />
            </Form.Item>
            <Form.Item label="Ngày sinh" name="dob">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </div>
          {/* Row 3: Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Giới tính" name="gender">
              <Select
                options={[
                  { label: "Nam", value: "Male" },
                  { label: "Nữ", value: "Female" },
                  { label: "Khác", value: "Other" },
                  { label: "Không muốn nói", value: "Prefer not to say" },
                ]}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Nghề nghiệp" name="profession">
              <Input />
            </Form.Item>
          </div>
          {/* Row 4: Location & Profession */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Địa chỉ" name="location">
              <Input />
            </Form.Item>
            <Form.Item label="Chuyên môn" name="expertise" rules={[{ required: true, message: "Vui lòng nhập chuyên môn" }]}>
              <Input />
            </Form.Item>
          </div>
          {/* Row 5: Expertise & Bio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Form.Item label="Giới thiệu" name="bio">
              <TextArea rows={3} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối giảng viên"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={submitReject}
        okText="Từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
      >
        <p>Nhập lý do từ chối duyệt hồ sơ giảng viên:</p>
        <TextArea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
      </Modal>
    </>
  );
}

export default DInstructors;
