import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { courseService } from "../../api/course.service";
import SideBar from "./SideBar";
import Feedback from "../course/Feedback";
import Forum from "../course/forum";
import { Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import { MessageSquare, BookOpen } from "lucide-react";

export default function AdminCoursePreview() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const playerRef = useRef(null);
    const navigate = useNavigate();
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await courseService.getCourseById(id);
                if (res.success !== false) {
                    setCourse(res.data || res);
                } else {
                    setError(true);
                }
            } catch (e) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const getYouTubeId = (input) => {
        if (!input) return null;
        const str = String(input).trim();
        const idOnly = /^[a-zA-Z0-9_-]{11}$/;
        if (idOnly.test(str)) return str;
        const reg = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const m = str.match(reg);
        return m ? m[1] : null;
    };

    const videoUrl = useMemo(() => {
        const y = course?.y_link;
        if (!y) return null;
        const ytId = getYouTubeId(y);
        if (ytId) return `https://www.youtube.com/watch?v=${ytId}`;
        return y;
    }, [course?.y_link]);

    const handleSideSelect = (key) => {
        // Preserve AdminDashboard layout: set target tab and navigate to /admin
        try { localStorage.setItem('adminActiveTab', key); } catch (e) { }
        navigate('/admin', { replace: true });
    };

    return (
        <div className="flex min-h-screen">
            <SideBar current={"courses"} onSelect={handleSideSelect} />
            <section className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
                <main className="p-8 max-w-6xl mx-auto">
                    {/* Header same layout as user preview */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => {
                                try { localStorage.setItem("adminActiveTab", "courses"); } catch (e) { }
                                navigate("/admin", { replace: true });
                            }}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-4 rounded-lg shadow-2xl transition-all duration-200 hover:shadow-lg"
                        >
                            <FontAwesomeIcon icon={faBackward} />
                            Back
                        </button>
                        <div className="flex-1 mx-6">
                            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 rounded-xl p-3 text-center shadow">
                                <h3 className="text-xl md:text-2xl font-bold text-white italic">{course?.course_name || "Course Preview"}</h3>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : error || !course ? (
                        <div className="text-center text-red-500 py-10">Không thể tải khóa học.</div>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl shadow p-4 mb-6">
                                <ReactPlayer
                                    ref={playerRef}
                                    url={videoUrl}
                                    controls
                                    width="100%"
                                    height="480px"
                                    onError={(e) => console.error("ReactPlayer error:", e, videoUrl)}
                                    config={{ file: { attributes: { crossOrigin: "anonymous" } }, youtube: { playerVars: { rel: 0 } } }}
                                    className="rounded-lg bg-neutral"
                                />
                            </div>

                            {/* Description section (same as user) */}
                            <div className="mt-8 bg-white shadow-2xl rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    <h4 className="text-lg font-semibold text-neutral">Mô tả</h4>
                                </div>
                                <p className="text left text-gray-700 whitespace-pre-wrap">{course.description}</p>
                            </div>

                            {/* Discussion button (same layout as user) */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                                    onClick={() => setIsDiscussionOpen(true)}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Diễn đàn
                                </button>
                            </div>

                            {/* Feedback list (same as user) */}
                            <div className="mt-10">
                                <Feedback courseid={course.course_id} />
                            </div>

                            {/* Forum modal */}
                            <Modal
                                title={<div className="font-semibold">Diễn đàn</div>}
                                open={isDiscussionOpen}
                                onCancel={() => setIsDiscussionOpen(false)}
                                footer={null}
                                width={800}
                            >
                                <Forum courseId={id} />
                            </Modal>
                        </>
                    )}
                </main>
            </section>
        </div>
    );
}
