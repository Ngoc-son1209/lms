import { Modal, Form, Input, InputNumber, message, Select, Spin } from "antd";
import { useState, useEffect } from "react";
import { adminService } from "../../api/admin.service";
import { authService } from "../../api/auth.service";

const { TextArea } = Input;

function CourseModal({ isOpen, onClose, onSuccess, courseId = null, mode = "add" }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  const isEditMode = mode === "edit" || courseId !== null;
  const currentUser = authService.getCurrentUser();
  const isInstructorRole = currentUser?.role === "ROLE_INSTRUCTOR";
  const isAdminRole = currentUser?.role === "ROLE_ADMIN";
  const modalTitle = isEditMode ? "Edit Course" : "Add New Course";
  const submitButtonText = isEditMode ? "Update Course" : "Add Course";
  const loadingText = isEditMode ? "Updating..." : "Adding...";

  useEffect(() => {
    const init = async () => {
      if (isOpen && isAdminRole) {
        setLoadingInstructors(true);
        try {
          const res = await adminService.getApprovedInstructors();
          if (res.success) setInstructors(res.data || []);
        } finally {
          setLoadingInstructors(false);
        }
      }
      if (isOpen && isEditMode && courseId) {
        fetchCourseData();
      } else if (isOpen && !isEditMode) {
        form.resetFields();
        // If instructor, prefill instructor name (fallback to email)
        if (isInstructorRole && (currentUser?.name || currentUser?.email)) {
          form.setFieldsValue({ instructor: currentUser.name || currentUser.email });
        }
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
          instructor: result.data.instructor,
          instructorId: result.data.instructorId,
          price: result.data.price,
          description: result.data.description,
          y_link: result.data.y_link,
          p_link: result.data.p_link,
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
      let result;
      if (isEditMode) {
        const editData = {
          course_name: values.course_name,
          instructor: values.instructor,
          instructorId: values.instructorId,
          price: values.price,
          description: values.description,
          y_link: values.y_link,
          p_link: values.p_link,
        };
        // For admin, ensure display instructor name is set from selection
        if (isAdminRole && values.instructorId) {
          const picked = (instructors || []).find((i) => i.userId === values.instructorId);
          if (picked) editData.instructor = picked.fullName || picked.email;
        }
        result = await adminService.updateCourse(courseId, editData);
      } else {
        const addData = {
          course_name: values.course_name,
          instructor: values.instructor,
          instructorId: values.instructorId,
          price: values.price,
          description: values.description,
          y_link: values.y_link,
          p_link: values.p_link,
        };
        // Set display name based on role
        if (isInstructorRole && (currentUser?.name || currentUser?.email)) {
          addData.instructor = currentUser.name || currentUser.email;
        }
        if (isAdminRole && values.instructorId) {
          const picked = (instructors || []).find((i) => i.userId === values.instructorId);
          if (picked) addData.instructor = picked.fullName || picked.email;
        }
        result = await adminService.createCourse(addData);
      }

      if (result.success) {
        message.success(isEditMode ? "Course updated successfully!" : "Course added successfully!");
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
            instructor: "",
            instructorId: undefined,
            price: 0,
            description: "",
            y_link: "",
            p_link: "",
          }}
        >
          <Form.Item
            label="Course Name"
            name="course_name"
            rules={[
              { required: true, message: "Course name is required" },
              { min: 3, message: "Course name must be at least 3 characters" },
              { max: 100, message: "Course name cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>

          {/* Admin can assign an instructor */}
          {isAdminRole && (
            <Form.Item
              label="Instructor"
              name="instructorId"
              rules={[{ required: true, message: "Please select an instructor" }]}
            >
              <Select
                placeholder="Select instructor"
                loading={loadingInstructors}
                options={(instructors || []).map((ins) => ({
                  value: ins.userId,
                  label: `${ins.fullName || ins.email} - ${ins.email}`,
                }))}
                showSearch
                optionFilterProp="label"
                onChange={(val) => {
                  const picked = (instructors || []).find((i) => i.userId === val);
                  if (picked) {
                    form.setFieldsValue({ instructor: picked.fullName || picked.email });
                  }
                }}
              />
            </Form.Item>
          )}



          <Form.Item
            label="Price"
            name="price"
            rules={[
              { required: true, message: "Price is required" },
              { type: "number", min: 0, message: "Price must be a positive number" },
            ]}
          >
            <InputNumber
              placeholder="Enter price"
              className="w-full"
              min={0}
              step={0.01}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Description is required" },
              { min: 10, message: "Description must be at least 10 characters" },
              { max: 500, message: "Description cannot exceed 500 characters" },
            ]}
          >
            <TextArea rows={4} placeholder="Enter course description" showCount maxLength={500} />
          </Form.Item>

          <Form.Item
            label="Video Link"
            name="y_link"
            rules={[
              { required: true, message: "Video link is required" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="https://example.com/video" />
          </Form.Item>

          <Form.Item
            label="Image Link"
            name="p_link"
            rules={[
              { required: true, message: "Image link is required" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="https://example.com/image.jpg" />
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
