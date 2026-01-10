import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { adminService } from "../../api/admin.service";
import { authService } from "../../api/auth.service";
import { Card, Table, message, Progress } from "antd";
import SearchFilter from "../../Components/common/SearchFilter";

export default function InstructorStudents() {
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [rows, setRows] = useState([]);
    const [filters, setFilters] = useState({ keyword: "", courseId: "", classSectionId: "" });

    const currentUser = authService.getCurrentUser();

    // Load courses on mount
    useEffect(() => {
        const load = async () => {
            setLoadingCourses(true);
            const res = await adminService.getAllCourses();
            if (res.success) setCourses(res.data || []);
            else message.error(res.error || "Không tải được khóa học");
            setLoadingCourses(false);
        };
        load();
    }, []);

    // Load classes when course changes
    useEffect(() => {
        const loadClasses = async () => {
            if (!filters.courseId) {
                setClasses([]);
                return;
            }
            setLoadingClasses(true);
            const res = await adminService.getInstructorClasses(filters.courseId);
            if (res.success) setClasses(res.data || []);
            else message.error(res.error || "Không tải được danh sách lớp");
            setLoadingClasses(false);
        };
        loadClasses();
    }, [filters.courseId]);

    // Load students when filters change
    useEffect(() => {
        const loadStudents = async () => {
            setLoadingStudents(true);
            const res = await adminService.getInstructorStudents(filters.courseId, filters.classSectionId);
            if (res.success) {
                setRows(res.data || []);
            } else {
                message.error(res.error || "Không tải được học viên");
            }
            setLoadingStudents(false);
        };
        loadStudents();
    }, [filters.courseId, filters.classSectionId]);

    const filteredRows = useMemo(() => {
        const kw = (filters.keyword || "").toLowerCase().trim();
        if (!kw) return rows;
        return (rows || []).filter((r) =>
            [r.username, r.email, r.mobileNumber]
                .filter(Boolean)
                .some((x) => String(x).toLowerCase().includes(kw))
        );
    }, [rows, filters]);

    const columns = [
        { title: "Họ tên", dataIndex: "username", key: "username", width: 150 },
        { title: "Email", dataIndex: "email", key: "email", width: 200 },
        { title: "Số điện thoại", dataIndex: "mobileNumber", key: "mobileNumber", width: 130, render: (v) => v || "N/A" },
        { title: "Lớp", dataIndex: "className", key: "className", width: 120, render: (v) => v || "N/A" },
        { title: "Mã lớp", dataIndex: "classCode", key: "classCode", width: 100, render: (v) => v || "N/A" },
        { title: "Khóa học", dataIndex: "courseName", key: "courseName", width: 180 },
        {
            title: "Tiến độ",
            dataIndex: "progressPercent",
            key: "progressPercent",
            width: 140,
            render: (p) => (
                <div className="min-w-[120px]">
                    <Progress percent={p || 0} size="small" status={(p || 0) === 100 ? "success" : "active"} />
                </div>
            ),
        },
        { title: "Điểm", dataIndex: "score", key: "score", width: 80, render: (v) => (v === null || v === undefined ? "N/A" : v) },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar page="instructor-students" />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
                        <p className="text-slate-600">View and manage students by course</p>
                    </div>

                    {/* Search bar with course select, class select + keyword */}
                    <Card className="shadow-xl mb-4">
                        <SearchFilter
                            fields={[
                                { type: "input", name: "keyword", label: "Tên/Email/SĐT", placeholder: "Tìm kiếm học viên..." },
                                {
                                    type: "select",
                                    name: "courseId",
                                    label: "Khóa học",
                                    placeholder: "Chọn khóa học",
                                    options: (courses || []).map((c) => ({ label: c.course_name, value: c.course_id })),
                                    allowClear: true
                                },
                                {
                                    type: "select",
                                    name: "classSectionId",
                                    label: "Lớp học",
                                    placeholder: "Chọn lớp học",
                                    options: (classes || []).map((c) => ({ label: `${c.name} (${c.code || 'N/A'})`, value: c.id })),
                                    allowClear: true,
                                    disabled: !filters.courseId
                                }
                            ]}
                            initialValues={filters}
                            onChange={setFilters}
                            debounce={250}
                        />
                    </Card>

                    <Card className="shadow-xl">
                        <Table
                            columns={columns}
                            dataSource={filteredRows}
                            rowKey={(r) => r.id}
                            loading={loadingStudents}
                            pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `Tổng ${t} học viên` }}
                            scroll={{ x: 1200 }}
                        />
                    </Card>
                </div>
            </main>
        </div>
    );
}

