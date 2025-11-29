import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import img from "../../assets/images/logo.jpg"; // Logo Ocean Edu Online

function Footer() {
  const listItemClasses =
    "hover:text-white cursor-pointer transition-colors duration-200";
  const socialLinkClasses =
    "w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-white transition duration-300";

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-8 text-left">
        {/* Cột 1: Logo + mô tả */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center mb-4">
            <img
              src={img}
              alt="Ocean Edu Online Logo"
              className="h-10 w-10 rounded-full object-contain bg-white p-1 shadow-md mr-2"
            />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Ocean Edu Online
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-justify max-w-[280px]">
            Nền tảng học ngoại ngữ trực tuyến hàng đầu Việt Nam.
          </p>
        </div>

        {/* Cột 2: Khóa học */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Khóa học</h3>
          <ul className="space-y-2 text-sm">
            <li className={listItemClasses}>Tiếng Anh giao tiếp</li>
            <li className={listItemClasses}>Luyện thi IELTS</li>
            <li className={listItemClasses}>Tiếng Trung HSK</li>
            <li className={listItemClasses}>Tiếng Nhật JLPT</li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Hỗ trợ</h3>
          <ul className="space-y-2 text-sm">
            <li className={listItemClasses}>Về chúng tôi</li>
            <li className={listItemClasses}>Liên hệ</li>
            <li className={listItemClasses}>Câu hỏi thường gặp</li>
            <li className={listItemClasses}>Chính sách bảo mật</li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Liên hệ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-medium text-white">Email:</span>{" "}
              <a
                href="mailto:info@oceaneduonline.vn"
                className="hover:text-white transition-colors"
              >
                info@oceaneduonline.vn
              </a>
            </li>
            <li>
              <span className="font-medium text-white">Hotline:</span> 1900 xxxx
            </li>
          </ul>

          {/* Mạng xã hội */}
          <div className="flex space-x-3 mt-4">
            <a
              href="#"
              className={`${socialLinkClasses} hover:bg-blue-600`}
              aria-label="Facebook"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a
              href="#"
              className={`${socialLinkClasses} hover:bg-pink-500`}
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Ocean Edu Online. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
}

export default Footer;
