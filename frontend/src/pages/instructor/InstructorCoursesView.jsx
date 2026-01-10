import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faEye, faList } from "@fortawesome/free-solid-svg-icons";
import { message, Card } from "antd";
import { adminService } from "../../api/admin.service";
import SearchFilter from "../../Components/common/SearchFilter";

function InstructorCoursesView() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ keyword: "" });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const result = await adminService.getAllCoursesWithCount();
            if (result.success) {
                setCourses(result.data);
            } else {
                message.error(result.error);
            }
        } catch {
            message.error("Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    // Apply keyword filter
    const filteredCourses = courses.filter((c) => {
        const kw = (filters.keyword || "").toLowerCase().trim();
        if (!kw) return true;
        return [c.course_name, c.description]
            .filter(Boolean)
            .some((x) => String(x).toLowerCase().includes(kw));
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Danh sách khóa học</h1>
                            <p className="text-gray-600">Xem thông tin các khóa học</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <Card className="shadow-xl mb-4">
                        <SearchFilter
                            fields={[{ type: "input", name: "keyword", label: "Tìm kiếm", placeholder: "Tên khóa học" }]}
                            initialValues={filters}
                            onChange={setFilters}
                            debounce={250}
                        />
                    </Card>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="mt-4 text-gray-600 font-medium">Đang tải khóa học...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faBookOpen} className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có khóa học</h3>
                            <p className="text-gray-500 mb-8 max-w-md">
                                Hiện tại chưa có khóa học nào trong hệ thống.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredCourses.map((course) => (
                                <div key={course.course_id} className="group bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
                                    <div className="p-6 flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-bold text-gray-900 truncate">{course.course_name}</h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                {course.instructor && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="text-sm text-gray-600">Giảng viên:</span>
                                                        <span className="text-sm font-medium text-gray-900">{course.instructor}</span>
                                                    </div>
                                                )}
                                                {course.price && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm text-gray-600">Giá:</span>
                                                        <span className="text-lg font-bold text-green-600">{course.price} VND</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <span className="text-sm text-gray-600">Học viên:</span>
                                                    <span className="text-sm font-medium text-gray-900">{course.studentCount ?? 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-2 ml-6">
                                            <button
                                                onClick={() => navigate(`/instructor/course/${course.course_id}/preview`)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="text-sm" />
                                                Xem chi tiết
                                            </button>

                                            <button
                                                onClick={() => navigate(`/instructor/course/${course.course_id}/questions`)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <FontAwesomeIcon icon={faList} className="text-sm" />
                                                Xem câu hỏi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InstructorCoursesView;

