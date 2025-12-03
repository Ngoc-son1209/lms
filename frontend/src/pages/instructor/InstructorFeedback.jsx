import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { adminService } from "../../api/admin.service";
import { authService } from "../../api/auth.service";
import { Card, Select, List, message } from "antd";

export default function InstructorFeedback() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);

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
        const loadFeedback = async () => {
            if (!selectedCourse) return;
            setLoadingFeedback(true);
            const res = await adminService.getFeedbacks(selectedCourse);
            if (res.success) setFeedbacks(res.data || []);
            else message.error(res.error || "Không tải được feedback");
            setLoadingFeedback(false);
        };
        loadFeedback();
    }, [selectedCourse]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">Feedback khóa học</h1>

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

                    <Card loading={loadingFeedback}>
                        <List
                            dataSource={feedbacks}
                            locale={{ emptyText: "Chưa có feedback" }}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<span className="font-medium">Nhận xét</span>}
                                        description={<span>{item.comment}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>
            </main>
        </div>
    );
}

