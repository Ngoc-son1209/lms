import React, { useEffect, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { adminService } from "../../api/admin.service";
import { Card, Table, message, Modal, Progress } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChalkboardTeacher, faBook, faUser } from "@fortawesome/free-solid-svg-icons";

export default function InstructorClasses() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            // Get all classes of instructor (without courseId filter)
            const result = await adminService.getInstructorClasses(null);
            if (result.success) {
                setClasses(result.data || []);
            } else {
                message.error(result.error || "Không tải được danh sách lớp");
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách lớp");
        } finally {
            setLoading(false);
        }
    };

    const handleViewStudents = async (classItem) => {
        setSelectedClass(classItem);
        setIsModalVisible(true);
        setLoadingStudents(true);

        try {
            // Get students by classSectionId
            const result = await adminService.getInstructorStudents(null, classItem.id);
            if (result.success) {
                setStudents(result.data || []);
            } else {
                message.error(result.error || "Không tải được danh sách học viên");
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách học viên");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedClass(null);
        setStudents([]);
    };

    const studentColumns = [
        {
            title: "Họ tên",
            dataIndex: "username",
            key: "username",
            width: 180,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 200,
        },
        {
            title: "Số điện thoại",
            dataIndex: "mobileNumber",
            key: "mobileNumber",
            width: 130,
            render: (v) => v || "N/A",
        },
        {
            title: "Tiến độ",
            dataIndex: "progressPercent",
            key: "progressPercent",
            width: 140,
            render: (p) => (
                <div className="min-w-[120px]">
                    <Progress
                        percent={p || 0}
                        size="small"
                        status={p === 100 ? "success" : "active"}
                    />
                </div>
            ),
        },
        {
            title: "Điểm",
            dataIndex: "score",
            key: "score",
            width: 80,
            render: (v) => (v === null || v === undefined ? "N/A" : v),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar page="instructor-classes" />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp học</h1>
                        <p className="text-slate-600">Danh sách các lớp bạn phụ trách</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="mt-4 text-gray-600 font-medium">Đang tải danh sách lớp...</p>
                        </div>
                    ) : classes.length === 0 ? (
                        <Card className="text-center py-12">
                            <div className="flex flex-col items-center">
                                <FontAwesomeIcon
                                    icon={faChalkboardTeacher}
                                    className="text-6xl text-gray-300 mb-4"
                                />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    Chưa có lớp học
                                </h3>
                                <p className="text-gray-500">
                                    Bạn chưa được phân công phụ trách lớp nào
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {classes.map((classItem) => (
                                <Card
                                    key={classItem.id}
                                    className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                                <FontAwesomeIcon
                                                    icon={faChalkboardTeacher}
                                                    className="text-white text-xl"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 grid grid-cols-1 gap-2">
                                                {/* Tên lớp */}
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {classItem.name}
                                                    </h3>
                                                    {classItem.code && (
                                                        <span className="text-sm font-normal text-gray-500">
                                                            ({classItem.code})
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Thông tin chi tiết */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {/* Khóa học */}
                                                    <div className="flex items-center gap-2">
                                                        <FontAwesomeIcon
                                                            icon={faBook}
                                                            className="text-green-600"
                                                        />
                                                        <span className="text-sm text-gray-600">
                                                            Khóa học:
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {classItem.course?.course_name || "N/A"}
                                                        </span>
                                                    </div>

                                                    {/* Giảng viên */}
                                                    <div className="flex items-center gap-2">
                                                        <FontAwesomeIcon
                                                            icon={faUser}
                                                            className="text-blue-600"
                                                        />
                                                        <span className="text-sm text-gray-600">
                                                            Giảng viên:
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {classItem.instructorName || "N/A"}
                                                        </span>
                                                    </div>

                                                    {/* Sĩ số */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                        <span className="text-sm text-gray-600">
                                                            Sĩ số:
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {classItem.currentStudentCount || 0}
                                                            {classItem.capacity && ` / ${classItem.capacity}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Button */}
                                        <div className="ml-6">
                                            <button
                                                onClick={() => handleViewStudents(classItem)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                                Xem học viên
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Modal hiển thị danh sách học viên */}
                    <Modal
                        title={
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faChalkboardTeacher}
                                    className="text-blue-600"
                                />
                                <div>
                                    <div className="text-lg font-bold">
                                        Danh sách học viên - {selectedClass?.name}
                                    </div>
                                    {selectedClass?.course && (
                                        <div className="text-sm font-normal text-gray-500">
                                            Khóa học: {selectedClass.course.course_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        }
                        open={isModalVisible}
                        onCancel={handleCloseModal}
                        footer={null}
                        width={1000}
                        className="rounded-2xl"
                    >
                        <Table
                            columns={studentColumns}
                            dataSource={students}
                            rowKey="id"
                            loading={loadingStudents}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} học viên`,
                            }}
                            scroll={{ x: 800 }}
                        />
                    </Modal>
                </div>
            </main>
        </div>
    );
}

