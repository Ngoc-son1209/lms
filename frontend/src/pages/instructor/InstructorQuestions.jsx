import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { adminService } from "../../api/admin.service";
import AddQuestion from "../dashBoard/AddQuestions";
import { Select, Card, message } from "antd";
import { authService } from "../../api/auth.service";

export default function InstructorQuestions() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(false);

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await adminService.getMyCourses();
            if (res.success) {
                setCourses(res.data || []);
            } else {
                message.error(res.error || "Không tải được danh sách khóa học");
            }
            setLoading(false);
        };
        load();
    }, []);

    const myCourses = useMemo(() => {
        if (!courses) return [];
        const email = currentUser?.email;
        if (!email) return courses;
        // Lọc theo email nếu dữ liệu khớp, nếu không thì trả tất cả
        const mine = (courses || []).filter((c) => String(c.instructor || "").toLowerCase() === String(email).toLowerCase());
        return mine.length > 0 ? mine : courses;
    }, [courses, currentUser]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">Quản lý câu hỏi</h1>

                    {!selectedCourse ? (
                        <Card className="mb-4">
                            <div className="mb-2 font-medium">Chọn khóa học</div>
                            <Select
                                loading={loading}
                                value={selectedCourse || undefined}
                                onChange={setSelectedCourse}
                                placeholder="Chọn khóa học"
                                options={myCourses.map((c) => ({ value: c.course_id, label: c.course_name }))}
                                style={{ width: 400 }}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Card>
                    ) : null}

                    {selectedCourse ? (
                        <AddQuestion
                            courseId={selectedCourse}
                            onBack={() => setSelectedCourse(null)}
                        />
                    ) : null}
                </div>
            </main>
        </div>
    );
}

