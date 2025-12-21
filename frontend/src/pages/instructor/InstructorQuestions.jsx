import React, { useEffect, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { adminService } from "../../api/admin.service";
import { questionService } from "../../api/question.service";
import { Select, Card, message, Table, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faList } from "@fortawesome/free-solid-svg-icons";

export default function InstructorQuestions() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await adminService.getAllCourses();
            if (res.success) {
                setCourses(res.data || []);
            } else {
                message.error(res.error || "Không tải được danh sách khóa học");
            }
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!selectedCourse) {
                setQuestions([]);
                return;
            }
            setLoadingQuestions(true);
            try {
                const result = await questionService.getQuestionsByCourse(selectedCourse);
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
        fetchQuestions();
    }, [selectedCourse]);

    const columns = [
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            key: 'question',
            width: '50%',
        },
        {
            title: 'Câu trả lời đúng',
            dataIndex: 'answer',
            key: 'answer',
            width: '50%',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <Card className="mb-6 rounded-2xl shadow-sm border-gray-100">
                        <div className="flex items-center justify-between">
                            {selectedCourse && (
                                <Button
                                    type="text"
                                    onClick={() => setSelectedCourse(null)}
                                    className="rounded-xl px-3 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    Quay lại
                                </Button>
                            )}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">Danh sách câu hỏi</h1>
                                <p className="text-slate-600">Xem câu hỏi theo khóa học</p>
                            </div>
                        </div>
                    </Card>

                    {!selectedCourse ? (
                        <Card className="mb-4">
                            <div className="mb-2 font-medium">Chọn khóa học</div>
                            <Select
                                loading={loading}
                                value={selectedCourse || undefined}
                                onChange={setSelectedCourse}
                                placeholder="Chọn khóa học"
                                options={courses.map((c) => ({ value: c.course_id, label: c.course_name }))}
                                style={{ width: 400 }}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Card>
                    ) : (
                        <Card className="rounded-2xl shadow-sm border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    <FontAwesomeIcon icon={faList} className="mr-2 text-green-600" />
                                    Danh sách câu hỏi ({questions.length})
                                </h3>
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
                    )}
                </div>
            </main>
        </div>
    );
}

