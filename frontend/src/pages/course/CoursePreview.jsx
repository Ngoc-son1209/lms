import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { courseService } from "../../api/course.service";
import Feedback from "./Feedback";
import Forum from "./forum";
import { Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import { MessageSquare, BookOpen } from "lucide-react";

export default function CoursePreview() {
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
                    setCourse(res.data || res); // compatible with both service shapes
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

    // Normalize potential YouTube IDs/URLs to a valid URL ReactPlayer can play
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

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error || !course) return <div className="text-center text-red-500 py-10">Can not load course.</div>;

    return (
        <div className="min-h-screen py-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-4 rounded-lg shadow-2xl transition-all duration-200 hover:shadow-lg"
                    >
                        <FontAwesomeIcon icon={faBackward} />
                        Back
                    </button>
                    <div className="flex-1 mx-6">
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 rounded-xl p-3 text-center shadow">
                            <h3 className="text-xl md:text-2xl font-bold text-white italic">
                                {course.course_name}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-6">
                    <ReactPlayer
                        ref={playerRef}
                        url={videoUrl}
                        controls
                        width="100%"
                        height="480px"
                        onError={(e) => console.error("ReactPlayer error:", e, videoUrl)}
                        config={{ file: { attributes: { crossOrigin: "anonymous" } }, youtube: { playerVars: { rel: 0 } } }}
                        className="rounded-xl bg-neutral shadow p-2"
                    />

                    <div className="mt-8 bg-white shadow-2xl rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h4 className="text-lg font-semibold text-neutral">Description</h4>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                            onClick={() => setIsDiscussionOpen(true)}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Discussion
                        </button>
                    </div>

                    <div className="mt-10">
                        <Feedback courseid={course.course_id} />
                    </div>

                    <Modal
                        title={<div className="font-semibold">Discussion Forum</div>}
                        open={isDiscussionOpen}
                        onCancel={() => setIsDiscussionOpen(false)}
                        footer={null}
                        width={800}
                    >
                        <Forum courseId={id} />
                    </Modal>
                </div>
            </div>
        </div>
    );
}

