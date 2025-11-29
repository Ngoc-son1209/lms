import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";

function InstructorDashboard() {
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Khóa học của bạn</h2>
            <p className="text-gray-600">
              Quản lý danh sách khóa học bạn đã tạo.
            </p>
            <Link
              to="/instructor/course-content"
              className="mt-4 inline-block bg-blue-600 px-4 py-2 text-white rounded"
            >
              Quản lý khóa học
            </Link>
          </div>

          <div className="p-5 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Thống kê</h2>
            <p className="text-gray-600">
              Hiển thị số lượng học viên, tiến độ,...
            </p>
          </div>

          <div className="p-5 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Thông báo</h2>
            <p className="text-gray-600">
              Các cập nhật hệ thống hoặc yêu cầu phê duyệt.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default InstructorDashboard;
