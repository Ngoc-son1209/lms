import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faBookOpen,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import imgHero from "../../assets/images/home-banner.png";
import Chatbot from "../../Components/chat/Chatbot"; // ✅ import chatbot

function Home() {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false); // ✅ bật/tắt chatbot

  return (
    <div className="bg-white text-gray-800 relative">
      <Navbar page="home" />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-16 gap-10">
        {/* Left Text */}
        <div className="md:w-1/2 space-y-6 text-center md:text-left">
          <span className="bg-green-100 text-green-700 font-semibold px-4 py-1 rounded-full text-sm inline-block">
            Ưu đãi 30% cho học viên mới 🎉
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug">
            Chinh phục ngoại ngữ cùng{" "}
            <span className="text-blue-600">chuyên gia</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Học trực tuyến 1-1 với giáo viên bản ngữ, lộ trình cá nhân hoá và
            linh hoạt phù hợp với mục tiêu của bạn.
          </p>

          {/* ✅ Nút tư vấn khóa học giữa màn hình */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {showChat ? "Đóng Chatbot" : "💬 Tư vấn khóa học"}
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2">
          <img
            src={imgHero}
            alt="Learning Online"
            className="rounded-2xl shadow-lg w-full object-cover"
          />
        </div>
      </section>

      {/* Trusted by Section */}
      <section className="text-center py-10 bg-gray-50">
        <p className="text-sm text-gray-600 mb-4">
          Được tin tưởng bởi hơn 5.000+ học viên và đối tác
        </p>
        <div className="flex justify-center gap-8 flex-wrap opacity-80 text-gray-500 font-semibold">
          <span>Vinschool</span>
          <span>Ocean Edu</span>
          <span>Language Link</span>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h3 className="text-blue-600 font-semibold text-sm uppercase">
            KHÓA HỌC NỔI BẬT
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Chương trình học đa dạng
          </h2>
          <p className="text-gray-600 mt-3">
            Từ cơ bản đến nâng cao — phù hợp mọi trình độ và mục tiêu của bạn.
          </p>
        </div>

        {/* Grid of courses */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: faComments,
              title: "Tiếng Anh giao tiếp",
              desc: "Luyện nói 1-1 với giáo viên bản ngữ, cải thiện phát âm và phản xạ nhanh.",
            },
            {
              icon: faUserGraduate,
              title: "Luyện thi IELTS/TOEIC",
              desc: "Giáo trình chuẩn quốc tế, giảng viên giàu kinh nghiệm luyện thi.",
            },
            {
              icon: faBookOpen,
              title: "Tiếng Trung HSK",
              desc: "Khoá học toàn diện HSK 1–6, luyện nghe, nói, đọc, viết cùng giáo viên bản xứ.",
            },
            {
              icon: faBookOpen,
              title: "Tiếng Nhật JLPT",
              desc: "Lộ trình học JLPT N5–N1 giúp bạn tự tin đạt chứng chỉ quốc tế.",
            },
            {
              icon: faBookOpen,
              title: "Tiếng Hàn TOPIK",
              desc: "Khoá học luyện thi TOPIK, chinh phục tiếng Hàn cùng giảng viên bản ngữ.",
            },
            {
              icon: faBookOpen,
              title: "Tiếng Anh doanh nghiệp",
              desc: "Phát triển kỹ năng giao tiếp, đàm phán và thuyết trình trong môi trường quốc tế.",
            },
          ].map((course, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <FontAwesomeIcon
                  icon={course.icon}
                  className="text-blue-500 text-2xl"
                />
                <h3 className="text-lg font-semibold">{course.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{course.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* ✅ Chatbot hiển thị khi bật */}
      {showChat && <Chatbot />}
    </div>
  );
}

export default Home;
