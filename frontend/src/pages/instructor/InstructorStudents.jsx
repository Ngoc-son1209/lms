import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { adminService } from "../../api/admin.service";
import { authService } from "../../api/auth.service";
import { Card, Select, Table, message } from "antd";

export default function InstructorStudents() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [students, setStudents] = useState([]);

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
            if (!selectedCourse) return;
            setLoadingStudents(true);
            const res = await adminService.getStudentsByCourse(selectedCourse);
            if (res.success) setStudents(res.data || []);
            else message.error(res.error || "Không tải được học viên");
            setLoadingStudents(false);
        };
        loadStudents();
    }, [selectedCourse]);

    const columns = [
        { title: "Họ tên", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "mobileNumber", key: "mobileNumber", render: (v) => v || "N/A" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar page="instructor-students" />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">Học viên theo khóa</h1>
                    <Card className="mb-4">
                        <div className="mb-2 font-medium">Chọn khóa học</div>
                        <Select
                            loading={loadingCourses}
                            value={selectedCourse || undefined}
                            onChange={setSelectedCourse}
                            placeholder="Chọn khóa học"
                            options={myCourses.map((c) => ({ value: c.course_id, label: c.course_name }))}
                            style={{ width: 400 }}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Card>

                    <Card>
                        <Table
                            columns={columns}
                            dataSource={students}
                            rowKey={(r) => r.id}
                            loading={loadingStudents}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </div>
            </main>
        </div>
    );
}

