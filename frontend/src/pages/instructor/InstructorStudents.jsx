import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { adminService } from "../../api/admin.service";
import { authService } from "../../api/auth.service";
import { Card, Table, message, Progress } from "antd";
import SearchFilter from "../../Components/common/SearchFilter";
import { progressService } from "../../api/progress.service";

export default function InstructorStudents() {
    const [courses, setCourses] = useState([]);
    // selected course id is kept in filters.courseId
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [students, setStudents] = useState([]);
    const [rows, setRows] = useState([]);
    const [filters, setFilters] = useState({ keyword: "", courseId: "" });

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const load = async () => {
            setLoadingCourses(true);
            const res = await adminService.getMyCourses();
            if (res.success) setCourses(res.data || []);
            else message.error(res.error || "Không tải được khóa học");
            setLoadingCourses(false);
        };
        load();
    }, []);

    const myCourses = useMemo(() => {
        const email = currentUser?.email;
        if (!email) return courses;
        const mine = (courses || []).filter((c) => String(c.instructor || "").toLowerCase() === String(email).toLowerCase());
        return mine.length > 0 ? mine : courses;
    }, [courses, currentUser]);

    useEffect(() => {
        const loadStudents = async () => {
            const selectedCourse = filters.courseId;
            if (!selectedCourse) return;
            setLoadingStudents(true);
            const res = await adminService.getStudentsByCourse(selectedCourse);
            if (res.success) {
                const base = res.data || [];
                const detailed = await Promise.all(
                    base.map(async (s) => {
                        try {
                            const d = await progressService.getProgressDetail(s.id, selectedCourse);
                            if (d.success) {
                                const played = d.data?.playedTime || 0;
                                const duration = d.data?.duration || 0;
                                const percent = duration > 0 ? Math.min(100, Math.ceil((played / duration) * 100)) : 0;
                                return { ...s, progressPercent: percent, score: d.data?.marks ?? null };
                            }
                        } catch (e) { }
                        return { ...s, progressPercent: 0, score: null };
                    })
                );
                setStudents(base);
                setRows(detailed);
            } else message.error(res.error || "Không tải được học viên");
            setLoadingStudents(false);
        };
        loadStudents();
    }, [filters.courseId]);

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
        { title: "Họ tên", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "mobileNumber", key: "mobileNumber", render: (v) => v || "N/A" },
        {
            title: "Progress",
            dataIndex: "progressPercent",
            key: "progressPercent",
            width: 160,
            render: (p) => (
                <div className="min-w-[140px]">
                    <Progress percent={p || 0} size="small" status={(p || 0) === 100 ? "success" : "active"} />
                </div>
            ),
        },
        { title: "Score", dataIndex: "score", key: "score", render: (v) => (v === null || v === undefined ? "N/A" : v) },
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

                    {/* Search bar with course select + keyword in one row */}
                    <Card className="shadow-xl mb-4">
                        <SearchFilter
                            fields={[
                                { type: "input", name: "keyword", label: "Tên/Email/SĐT", placeholder: "Tên/Email/SĐT" },
                                { type: "select", name: "courseId", label: "Chọn khóa học", placeholder: "Chọn khóa học", options: (myCourses || []).map((c) => ({ label: c.course_name, value: c.course_id })) }
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
                            pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `Total ${t} students` }}
                            scroll={{ x: 900 }}
                        />
                    </Card>
                </div>
            </main>
        </div>
    );
}

