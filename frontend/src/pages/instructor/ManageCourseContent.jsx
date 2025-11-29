import React, { useState } from "react";
import Navbar from "../../Components/common/Navbar";
import { courseService } from "../../api/course.service"; 

function ManageCourseContent() {
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [moduleName, setModuleName] = useState("");
  const [lessons, setLessons] = useState([]);

  // Tạo khóa học mới
  const handleCreateCourse = async () => {
    try {
      const res = await courseService.createCourse({
        title: courseName,
        description: courseDescription,
      });

      setSelectedCourseId(res.data.id);
      alert("Tạo khóa học thành công!");
    } catch (error) {
      alert("Lỗi khi tạo khóa học!");
    }
  };

  // Thêm module
  const handleAddModule = async () => {
    try {
      const res = await courseService.addModule(selectedCourseId, {
        name: moduleName,
      });

      setModules([...modules, res.data]);
      alert("Thêm module thành công!");
    } catch (error) {
      alert("Lỗi khi thêm module!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quản lý nội dung khóa học</h1>

        {/* Tạo khóa học */}
        {!selectedCourseId && (
          <div className="p-5 bg-white rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Tạo khóa học</h2>

            <input
              type="text"
              placeholder="Tên khóa học"
              className="border p-2 w-full mb-3"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />

            <textarea
              placeholder="Mô tả khóa học"
              className="border p-2 w-full mb-3"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
            />

            <button
              onClick={handleCreateCourse}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Tạo khóa học
            </button>
          </div>
        )}

        {/* Thêm Module */}
        {selectedCourseId && (
          <div className="p-5 bg-white rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Thêm Module</h2>

            <input
              type="text"
              placeholder="Tên Module"
              className="border p-2 w-full mb-3"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
            />

            <button
              onClick={handleAddModule}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Thêm Module
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default ManageCourseContent;
