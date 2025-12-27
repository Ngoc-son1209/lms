import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Avatar,
  Tag,
  message,
  Descriptions,
  Row,
  Col,
  Card
} from "antd";
import { EyeOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import { adminService } from "../../api/admin.service";
import SearchFilter from "../../Components/common/SearchFilter";
import { exportService } from "../../api/export.service";

const { Option } = Select;

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm] = Form.useForm();

  // simple search only
  const [filters, setFilters] = useState({ keyword: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudents();
      if (res.success) {
        setUsers(res.data || []);
      } else {
        message.error("Không thể tải danh sách học viên");
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setViewModalVisible(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      username: user.username,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      isActive: user.isActive,
      dob: user.dob,
      gender: user.gender,
      location: user.location,
      profession: user.profession,
      linkedin_url: user.linkedin_url,
      github_url: user.github_url,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    console.log("🧾 Sending to backend:", values);
    try {
      const res = await adminService.updateUser(selectedUser.id, values);
      if (res.success) {
        message.success("Cập nhật học viên thành công");
        setEditModalVisible(false);
        fetchUsers(); // Refresh the users list
      } else {
        message.error("Cập nhật học viên thất bại");
      }
    } catch (error) {
      message.error("Error updating user");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    // {
    //   title: "Avatar",
    //   dataIndex: "profileImage",
    //   key: "avatar",
    //   width: 80,
    //   render: (profileImage, record) => (
    //     <Avatar
    //       size={40}
    //       src={profileImage ? `data:image/jpeg;base64,${profileImage}` : null}
    //       icon={<UserOutlined />}
    //     />
    //   ),
    // },
    {
      title: "Họ tên",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Số điện thoại",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      render: (phone) => phone || "N/A",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "ADMIN" ? "red" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "enabled",
      key: "enabled",
      render: (enabled) => (
        <Tag color={enabled ? "green" : "red"}>
          {enabled ? "Đã kích hoạt" : "Chưa kích hoạt"}
        </Tag>
      ),
    },
    {
      title: "Nghề nghiệp",
      dataIndex: "profession",
      key: "profession",
      render: (profession) => profession || "N/A",
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          >
            Xem
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const filteredUsers = useMemo(() => {
    const kw = (filters.keyword || "").toLowerCase().trim();
    if (!kw) return users;
    return (users || []).filter((u) =>
      [u.username, u.email, u.mobileNumber]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(kw))
    );
  }, [users, filters]);

  return (
    <>
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý học viên</h1>
            <p className="text-slate-600">Xem và quản lý danh sách học viên</p>
          </div>
          <Button onClick={() => exportService.exportStudents()}>Xuất Excel</Button>
        </div>
      </div>

      <Card className="shadow-xl mb-4">
        <SearchFilter
          fields={[{ type: "input", name: "keyword", label: "Tên/Email/SĐT", placeholder: "Tên/Email/SĐT" }]}
          initialValues={filters}
          onChange={setFilters}
          debounce={250}
        />
      </Card>

      <Card className="shadow-xl">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* View User Modal */}
      <Modal
        title="Chi tiết học viên"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedUser && (
          <div>
            <Row gutter={24} className="mb-4">
              <Col span={6}>
                <div className="text-center">
                  <Avatar
                    size={80}
                    src={
                      selectedUser.profileImage
                        ? `data:image/jpeg;base64,${selectedUser.profileImage}`
                        : null
                    }
                    icon={<UserOutlined />}
                  />
                  <div className="mt-2">
                    <Tag
                      color={selectedUser.enabled ? "green" : "red"}
                      className="mb-2"
                    >
                      {selectedUser.enabled ? "Hoạt động" : "Ngừng hoạt động"}
                    </Tag>
                    <br />
                    <Tag color={selectedUser.role === "ADMIN" ? "red" : "blue"}>
                      {selectedUser.role}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={18}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Họ tên" span={1}>
                    {selectedUser.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email" span={1}>
                    {selectedUser.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại" span={1}>
                    {selectedUser.mobileNumber || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày sinh" span={1}>
                    {selectedUser.dob || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới tính" span={1}>
                    {selectedUser.gender || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={1}>
                    {selectedUser.location || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nghề nghiệp" span={2}>
                    {selectedUser.profession || "N/A"}
                  </Descriptions.Item>
                  {/* <Descriptions.Item label="LinkedIn" span={1}>
                    {selectedUser.linkedin_url ? (
                      <a
                        href={selectedUser.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Profile
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="GitHub" span={1}>
                    {selectedUser.github_url ? (
                      <a
                        href={selectedUser.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Profile
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </Descriptions.Item> */}
                  <Descriptions.Item label="Ngày đăng ký" span={1}>
                    {formatDate(selectedUser.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối" span={1}>
                    {formatDate(selectedUser.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Sửa học viên"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ tên"
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Vui lòng nhập email hợp lệ!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số điện thoại" name="mobileNumber">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày sinh" name="dob">
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Vai trò" name="role">
                <Select>
                  <Option value="USER">USER</Option>
                  <Option value="ADMIN">ADMIN</Option>
                  <Option value="INSTRUCTOR">INSTRUCTOR</Option>
                </Select>
              </Form.Item>
            </Col>
            {/* <Col span={8}>
              <Form.Item label="Status" name="isActive">
                <Select>
                  <Option value={true}>Active</Option>
                  <Option value={false}>Inactive</Option>
                </Select>
              </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item label="Giới tính" name="gender">
                <Select placeholder="Chọn giới tính">
                  <Option value="Male">Nam</Option>
                  <Option value="Female">Nữ</Option>
                  <Option value="Other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Địa chỉ" name="location">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nghề nghiệp" name="profession">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="LinkedIn URL"
                name="linkedin_url"
                rules={[{ type: "url", message: "Please enter a valid URL!" }]}
              >
                <Input placeholder="https://linkedin.com/in/username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="GitHub URL"
                name="github_url"
                rules={[{ type: "url", message: "Please enter a valid URL!" }]}
              >
                <Input placeholder="https://github.com/username" />
              </Form.Item>
            </Col>
          </Row> */}

          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                Đóng
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Users;