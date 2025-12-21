import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  message,
  Row,
  Col,
  Divider,
  Table,
  Modal,
  Popconfirm
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle,
  faArrowLeft,
  faPlus,
  faEdit,
  faTrash,
  faList
} from '@fortawesome/free-solid-svg-icons';
import { EditOutlined, RestOutlined } from "@ant-design/icons";
import { adminService } from '../../api/admin.service';
import { questionService } from '../../api/question.service';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function AddQuestion({ courseId, onBack }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false); // New state for Add Modal
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchQuestions();
  }, [courseId]);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const result = await questionService.getQuestionsByCourse(courseId);
      if (result.success) {
        setQuestions(result.data);
      } else {
        message.error(result.error || 'Lỗi khi lấy câu hỏi');
      }
    } catch (error) {
      message.error('Lỗi khi lấy câu hỏi');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getActualAnswerValue = (values, selectedAnswer) => {
    const answerMap = {
      'option1': values.option1,
      'option2': values.option2,
      'option3': values.option3,
      'option4': values.option4
    };
    return answerMap[selectedAnswer];
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const actualAnswerValue = getActualAnswerValue(values, values.answer);

      const questionData = {
        question: values.question,
        option1: values.option1,
        option2: values.option2,
        option3: values.option3,
        option4: values.option4,
        answer: actualAnswerValue,
        courseId: courseId
      };

      const result = await adminService.createQuestion(questionData);

      if (result.success) {
        message.success('Thêm câu hỏi thành công!');
        form.resetFields();
        setIsAddModalVisible(false);
        fetchQuestions();
      } else {
        message.error(result.error || 'Lỗi khi thêm câu hỏi');
      }
    } catch (error) {
      message.error('Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);

    let selectedAnswer = 'option1';
    if (question.answer === question.option1) selectedAnswer = 'option1';
    else if (question.answer === question.option2) selectedAnswer = 'option2';
    else if (question.answer === question.option3) selectedAnswer = 'option3';
    else if (question.answer === question.option4) selectedAnswer = 'option4';

    editForm.setFieldsValue({
      question: question.question,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      answer: selectedAnswer
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    if (!editingQuestion) return;

    try {
      const actualAnswerValue = getActualAnswerValue(values, values.answer);

      const questionData = {
        question: values.question,
        option1: values.option1,
        option2: values.option2,
        option3: values.option3,
        option4: values.option4,
        answer: actualAnswerValue,
        courseId: courseId
      };

      const result = await adminService.updateQuestion(editingQuestion.id, questionData);

      if (result.success) {
        message.success('Câu hỏi đã được cập nhật thành công!');
        setIsEditModalVisible(false);
        setEditingQuestion(null);
        editForm.resetFields();
        fetchQuestions();
      } else {
        message.error(result.error || 'Lỗi khi cập nhật câu hỏi');
      }
    } catch (error) {
      message.error('Lỗi không xác định');
    }
  };

  const handleDelete = async (questionId) => {
    try {
      const result = await adminService.deleteQuestion(questionId);
      if (result.success) {
        message.success('Câu hỏi đã được xóa thành công!');
        fetchQuestions();
      } else {
        message.error(result.error || 'Lỗi khi xóa câu hỏi');
      }
    } catch (error) {
      message.error('Lỗi không xác định');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const columns = [
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
      width: '85%',
      render: (text) => (
        <div>
          <Text ellipsis={{ tooltip: text }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Câu trả lời',
      dataIndex: 'answer',
      key: 'answer',
      width: '85%',
      render: (text) => (
        <div>
          <Text ellipsis={{ tooltip: text }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          > Sửa
          </Button>
          <Popconfirm
            title="Xóa câu hỏi"
            description="Bạn có chắc chắn muốn xóa câu hỏi này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger icon={<RestOutlined />}
              size="small"
            > Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const QuestionForm = ({ form, onFinish, loading, submitText, initialValues }) => (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      size="large"
      className="space-y-4"
      initialValues={initialValues}
    >
      <Form.Item
        label="Câu hỏi"
        name="question"
        rules={[
          { required: true, message: 'Vui lòng nhập câu hỏi' },
          { min: 10, message: 'Câu hỏi phải có ít nhất 10 ký tự' },
          { max: 500, message: 'Câu hỏi không được vượt quá 500 ký tự' }
        ]}
      >
        <TextArea
          placeholder="Nhập câu hỏi của bạn ở đây..."
          rows={3}
          className="rounded-lg"
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Option A"
            name="option1"
            rules={[
              { required: true, message: 'Option A là bắt buộc' },
              { max: 200, message: 'Option không được vượt quá 200 ký tự' }
            ]}
          >
            <Input placeholder="Nhập option A" className="rounded-lg" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Option B"
            name="option2"
            rules={[
              { required: true, message: 'Option B là bắt buộc' },
              { max: 200, message: 'Option không được vượt quá 200 ký tự' }
            ]}
          >
            <Input placeholder="Nhập option B" className="rounded-lg" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Option C"
            name="option3"
            rules={[
              { required: true, message: 'Option C là bắt buộc' },
              { max: 200, message: 'Option không được vượt quá 200 ký tự' }
            ]}
          >
            <Input placeholder="Nhập option C" className="rounded-lg" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Option D"
            name="option4"
            rules={[
              { required: true, message: 'Option D là bắt buộc' },
              { max: 200, message: 'Option không được vượt quá 200 ký tự' }
            ]}
          >
            <Input placeholder="Nhập option D" className="rounded-lg" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Câu trả lời đúng"
        name="answer"
        rules={[{ required: true, message: 'Vui lòng chọn câu trả lời đúng' }]}
      >
        <Select placeholder="Chọn câu trả lời đúng" className="rounded-lg">
          <Option value="option1">Option A</Option>
          <Option value="option2">Option B</Option>
          <Option value="option3">Option C</Option>
          <Option value="option4">Option D</Option>
        </Select>
      </Form.Item>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={() => {
            if (submitText.includes('Add')) {
              setIsAddModalVisible(false);
            } else {
              setIsEditModalVisible(false);
              setEditingQuestion(null);
              editForm.resetFields();
            }
          }}
          className="rounded-lg px-6"
        >
          Hủy
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6"
        >
          {/* <FontAwesomeIcon icon={faPlus} className="mr-2" /> */}
          {submitText}
        </Button>
      </div>
    </Form>
  );

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
                  <FontAwesomeIcon icon={faQuestionCircle} className="mr-3 text-blue-600" />
                  Quản lý câu hỏi
                </Title>
              </div>
            </div>
            {/* Add Question Button */}
            <Button
              type="primary"
              size="large"
              onClick={() => setIsAddModalVisible(true)}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 h-12 font-semibold"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Thêm câu hỏi
            </Button>
          </div>
        </Card>

        {/* Questions List - Now Full Width */}
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <Title level={3} className="!mb-0 !text-gray-800">
              <FontAwesomeIcon icon={faList} className="mr-2 text-green-600" />
              Danh sách câu hỏi ({questions.length})
            </Title>
          </div>

          <Table
            columns={columns}
            dataSource={questions}
            rowKey="id"
            loading={loadingQuestions}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              className: "mt-4"
            }}
            className="rounded-lg border border-gray-200"
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Add Question Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faPlus} className="text-blue-600" />
              <span>Thêm câu hỏi</span>
            </div>
          }
          open={isAddModalVisible}
          onCancel={() => {
            setIsAddModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
          className="rounded-2xl"
        >
          <QuestionForm
            form={form}
            onFinish={handleSubmit}
            loading={loading}
            submitText={loading ? 'Thêm câu hỏi...' : 'Thêm câu hỏi'}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faEdit} className="text-blue-600" />
              <span>Cập nhật câu hỏi</span>
            </div>
          }
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setEditingQuestion(null);
            editForm.resetFields();
          }}
          footer={null}
          width={800}
          className="rounded-2xl"
        >
          <QuestionForm
            form={editForm}
            onFinish={handleEditSubmit}
            loading={false}
            submitText="Cập nhật"
          />
        </Modal>
      </div>
    </div>
  );
}

export default AddQuestion;