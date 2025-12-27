import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Tag, Typography, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faList, faCheck } from "@fortawesome/free-solid-svg-icons";
import { questionService } from "../../api/question.service";
import { adminService } from "../../api/admin.service";
import SearchFilter from "../../Components/common/SearchFilter";

const { Title } = Typography;

export default function InstructorCourseQuestions() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ keyword: "" });

  // # NOTE: Instructor view: highlight correct answer (no interaction)
  const selectedAnswers = useMemo(() => {
    const map = {};
    (questions || []).forEach((q) => {
      map[q.id] = q.answer;
    });
    return map;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const kw = (filters.keyword || "").toLowerCase().trim();
    if (!kw) return questions || [];

    return (questions || []).filter((q) =>
      [q.question, q.answer, q.option1, q.option2, q.option3, q.option4]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(kw))
    );
  }, [questions, filters]);

  const fetchData = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, qRes] = await Promise.all([
        adminService.getCourseById(courseId),
        questionService.getQuestionsByCourse(courseId),
      ]);

      if (courseRes?.success) setCourseName(courseRes.data?.course_name || "");
      if (qRes?.success) setQuestions(qRes.data || []);
      else message.error(qRes.error || "Không tải được câu hỏi");
    } catch (e) {
      message.error("Không tải được câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="mx-auto px-6 max-w-7xl">
        {/* Header */}
        <Card className="mb-6 rounded-2xl shadow-sm border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                onClick={() => navigate(-1)}
                className="rounded-xl px-3 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back
              </Button>
              <div>
                <Title level={2} className="!mb-0 !text-gray-900">
                  <FontAwesomeIcon icon={faList} className="mr-3 text-emerald-600" />
                  Câu hỏi khóa học
                </Title>
                <div className="text-gray-600 text-sm">Khóa học: {courseName || courseId}</div>
              </div>
            </div>
            <Button onClick={fetchData}>Refresh</Button>
          </div>
        </Card>

        <Card className="shadow-xl mb-4">
          <SearchFilter
            fields={[{ type: "input", name: "keyword", label: "Từ khóa", placeholder: "Tìm câu hỏi/đáp án" }]}
            initialValues={filters}
            onChange={setFilters}
            debounce={250}
          />
        </Card>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải câu hỏi...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {(filteredQuestions || []).map((q, idx) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-emerald-100 border-b border-emerald-200 p-4 text-start">
                  <h3 className="text-lg font-semibold">
                    Câu {idx + 1}: {q.question}
                  </h3>
                </div>

                <div className="p-6 space-y-3">
                  {[q.option1, q.option2, q.option3, q.option4].map((opt, optionIndex) => {
                    const isCorrect = selectedAnswers[q.id] === opt;
                    return (
                      <div
                        key={`${q.id}-${optionIndex}`}
                        className={`flex items-center p-3 rounded-xl border-2 transition-all duration-200 ${isCorrect
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-gray-50 border-transparent"
                          }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${isCorrect ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}
                        >
                          {isCorrect && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
                        </div>
                        <div className="flex-1 text-gray-800 font-medium break-words">{opt}</div>
                        {isCorrect && <Tag color="green">Đáp án đúng</Tag>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
