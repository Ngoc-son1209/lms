import img1 from "../../assets/images/user.png";
import { authService } from "../../api/auth.service";

function SideBar({ current, onSelect }) {
  const menuItems = [
    { key: "dashboard", label: "Tổng quan", icon: "bx bxs-dashboard" },
    { key: "user", label: "Học viên", icon: "bx bxs-group" },
    { key: "courses", label: "Khóa học", icon: "bx bxs-book" },
    { key: "instructors", label: "Giảng viên", icon: "bx bxs-user-voice" },
  ];

  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <div className="bg-white shadow-lg flex flex-col p-4 px-6 w-64 shrink-0 h-screen sticky top-0 overflow-x-hidden">
      <div
        className="flex items-center gap-3 px-3 py-5 border-b border-gray-200 cursor-pointer"
        onClick={() => onSelect("dashboard")}
      >
        <img src={img1} alt="Admin Logo" className="w-10 h-10 rounded-full" />
        <span className="text-lg font-semibold text-blue-900 whitespace-nowrap">LMS Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden mt-6 px-3">
        <ul className="flex flex-col">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => onSelect(item.key)}
                className={`w-full flex items-center gap-3 p-3 transition-colors rounded-lg mb-3 text-left ${current === item.key
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <i className={`${item.icon} text-lg`} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-3 pb-2 pt-1 border-t border-gray-200 overflow-x-hidden">
        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 font-medium transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default SideBar;
