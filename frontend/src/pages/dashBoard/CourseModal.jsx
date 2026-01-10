import { Modal, Form, Input, InputNumber, message, DatePicker } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { adminService } from "../../api/admin.service";

const { TextArea } = Input;

function CourseModal({ isOpen, onClose, onSuccess, courseId = null, mode = "add" }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const isEditMode = mode === "edit" || courseId !== null;
  const modalTitle = isEditMode ? "Sửa khóa học" : "Thêm khóa học";
  const submitButtonText = isEditMode ? "Cập nhật khóa học" : "Thêm khóa học";
  const loadingText = isEditMode ? "Đang cập nhật..." : "Đang thêm...";

  useEffect(() => {
    const init = async () => {
      if (isOpen && isEditMode && courseId) {
        fetchCourseData();
      } else if (isOpen && !isEditMode) {
        form.resetFields();
      }
    };
    init();
  }, [isOpen, courseId, isEditMode]);

  const fetchCourseData = async () => {
    setFetchingData(true);
    try {
      const result = await adminService.getCourseById(courseId);
      if (result.success) {
        const formData = {
          course_name: result.data.course_name,
          price: result.data.price,
          description: result.data.description,
          y_link: result.data.y_link,
          p_link: result.data.p_link,
          startAt: result.data.startAt ? dayjs(result.data.startAt) : null,
          endAt: result.data.endAt ? dayjs(result.data.endAt) : null,
        };
        form.setFieldsValue(formData);
      } else {
        message.error(result.error);
        onClose();
      }
    } catch {
      message.error("Failed to fetch course data");
      onClose();
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        course_name: values.course_name,
        price: values.price,
        description: values.description,
        y_link: values.y_link,
        p_link: values.p_link,
        startAt: values.startAt ? values.startAt.format('YYYY-MM-DD') : null,
        endAt: values.endAt ? values.endAt.format('YYYY-MM-DD') : null,
      };
      const result = isEditMode
        ? await adminService.updateCourse(courseId, payload)
        : await adminService.createCourse(payload);

      if (result.success) {
        message.success(isEditMode ? "Cập nhật khóa học thành công!" : "Thêm khóa học thành công!");
        form.resetFields();
        onClose();
        onSuccess?.();
      } else {
        message.error(result.error);
      }
    } catch {
      message.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="custom-modal"
      destroyOnClose
    >
      {fetchingData ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          <span className="ml-3 text-gray-600">Loading course data...</span>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-2 space-y-4"
          initialValues={{
            course_name: "",
            price: 0,
            description: "",
            y_link: "",
            p_link: "",
            startAt: null,
            endAt: null,
          }}
        >
          <Form.Item
            label="Tên khóa học"
            name="course_name"
            rules={[
              { required: true, message: "Tên khóa học là bắt buộc" },
              { min: 3, message: "Tên khóa học phải có ít nhất 3 ký tự" },
              { max: 100, message: "Tên khóa học không được vượt quá 100 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên khóa học" />
          </Form.Item>

          <Form.Item
            label="Giá khóa học"
            name="price"
            rules={[
              { required: true, message: "Giá khóa học là bắt buộc" },
              { type: "number", min: 0, message: "Giá khóa học phải là một số" },
            ]}
          >
            <InputNumber
              placeholder="Nhập giá khóa học"
              className="w-full"
              min={0}
              step={0.01}
              formatter={(value) =>
                `${value} VNĐ`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\VNĐ\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: "Mô tả là bắt buộc" },
              { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
              { max: 500, message: "Mô tả không được vượt quá 500 ký tự" },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả khóa học" showCount maxLength={500} />
          </Form.Item>

          <Form.Item
            label="Video Link"
            name="y_link"
            rules={[
              { required: true, message: "Video link là bắt buộc" },
              { type: "url", message: "Vui lòng nhập một URL hợp lệ" },
            ]}
          >
            <Input placeholder="https://example.com/video" />
          </Form.Item>

          <Form.Item
            label="Image Link"
            name="p_link"
            rules={[
              { required: true, message: "Image link là bắt buộc" },
              { type: "url", message: "Vui lòng nhập một URL hợp lệ" },
            ]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item label="Ngày bắt đầu" name="startAt" rules={[{ required: false }, ({ getFieldValue }) => ({ validator(_, value) { const end = getFieldValue('endAt'); if (!value || !end) return Promise.resolve(); return end.isAfter(value, 'day') ? Promise.resolve() : Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu')); } })]}>
            <DatePicker className="w-full" placeholder="Chọn ngày bắt đầu" />
          </Form.Item>

          <Form.Item label="Ngày kết thúc" name="endAt" rules={[{ required: false }, ({ getFieldValue }) => ({ validator(_, value) { const start = getFieldValue('startAt'); if (!value || !start) return Promise.resolve(); return value.isAfter(start, 'day') ? Promise.resolve() : Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu')); } })]}>
            <DatePicker className="w-full" placeholder="Chọn ngày kết thúc" />
          </Form.Item>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[140px] flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {loadingText}
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </Form>
      )}
    </Modal>
  );
}

export default CourseModal;
