import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, message } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faBriefcase
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faLinkedin
} from "@fortawesome/free-brands-svg-icons";
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const EditProfileModal = ({ visible, onCancel, userDetails, onUpdate, isInstructor = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userDetails) {
      form.setFieldsValue({
        username: userDetails.username,
        email: userDetails.email,
        mobileNumber: userDetails.mobileNumber,
        dob: userDetails.dob ? moment(userDetails.dob) : null,
        gender: userDetails.gender,
        location: userDetails.location,
        profession: userDetails.profession,
        linkedin_url: userDetails.linkedin_url,
        github_url: userDetails.github_url,
        // Instructor-only fields
        expertise: userDetails.expertise,
        bio: userDetails.bio,
      });
    }
  }, [visible, userDetails, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
      };

      const success = await onUpdate(formattedValues);

      if (success) {
        message.success('Cập nhật hồ sơ thành công!');
        onCancel();
      } else {
        message.error('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const validateURL = (_, value) => {
    if (!value) return Promise.resolve();

    try {
      new URL(value);
      return Promise.resolve();
    } catch {
      return Promise.reject(new Error('Vui lòng nhập một URL hợp lệ'));
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faUser} style={{ color: '#4f46e5' }} />
          <span>Sửa hồ sơ</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: '16px' }}
      >
        {/* Basic Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="username"
            label="Họ tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên!' },
              { min: 3, message: 'Họ tên phải có ít nhất 3 ký tự!' },
            ]}
          >
            <Input
              prefix={<FontAwesomeIcon icon={faUser} style={{ color: '#9ca3af' }} />}
              placeholder="Nhập họ tên"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input
              prefix={<FontAwesomeIcon icon={faEnvelope} style={{ color: '#9ca3af' }} />}
              placeholder="Email không thể được thay đổi"
              size="large"
              disabled
            />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="mobileNumber"
            label="Số điện thoại"
            rules={[
              { pattern: /^[0-9+\-\s()]+$/, message: 'Vui lòng nhập một số điện thoại hợp lệ!' },
            ]}
          >
            <Input
              prefix={<FontAwesomeIcon icon={faPhone} style={{ color: '#9ca3af' }} />}
              placeholder="Nhập số điện thoại"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="dob"
            label="Ngày sinh"
          >
            <DatePicker
              placeholder="Chọn ngày sinh"
              size="large"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > moment().endOf('day')}
            />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="gender"
            label="Giới tính"
          >
            <Select
              placeholder="Chọn giới tính"
              size="large"
              allowClear
            >
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="Địa chỉ"
          >
            <Input
              prefix={<FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#9ca3af' }} />}
              placeholder="Nhập địa chỉ"
              size="large"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="profession"
          label="Nghề nghiệp"
          style={{ marginBottom: '16px' }}
        >
          <Input
            prefix={<FontAwesomeIcon icon={faBriefcase} style={{ color: '#9ca3af' }} />}
            placeholder="Nhập nghề nghiệp"
            size="large"
          />
        </Form.Item>

        {/* Instructor-only section */}
        {isInstructor && (
          <div style={{
            border: '1px solid #eef2ff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            background: '#fafbff'
          }}>
            <div style={{ fontWeight: 600, color: '#4338ca', marginBottom: 12 }}>Thông tin giảng viên</div>

            <Form.Item
              name="expertise"
              label="Chuyên môn"
              rules={[{ required: true, message: 'Please enter your expertise!' }]}
            >
              <Input
                prefix={<FontAwesomeIcon icon={faBriefcase} style={{ color: '#9ca3af' }} />}
                placeholder="Ví dụ: Java, Spring Boot, Microservices"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="bio"
              label="Giới thiệu"
              rules={[{ min: 20, message: 'Bio should be at least 20 characters!' }]}
            >
              <TextArea rows={4} placeholder="Giới thiệu bản thân, kinh nghiệm, thành tựu..." />
            </Form.Item>
          </div>
        )}

        {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="linkedin_url"
            label="LinkedIn URL"
            rules={[
              { validator: validateURL },
            ]}
          >
            <Input
              prefix={<FontAwesomeIcon icon={faLinkedin} style={{ color: '#9ca3af' }} />}
              placeholder="https://linkedin.com/in/username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="github_url"
            label="GitHub URL"
            rules={[
              { validator: validateURL },
            ]}
          >
            <Input
              prefix={<FontAwesomeIcon icon={faGithub} style={{ color: '#9ca3af' }} />}
              placeholder="https://github.com/username"
              size="large"
            />
          </Form.Item>
        </div> */}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <Button
            onClick={onCancel}
            size="large"
            style={{ minWidth: '100px' }}
          >
            Đóng
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              minWidth: '140px'
            }}
          >
            Cập nhật hồ sơ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
