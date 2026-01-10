import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faChalkboardUser, faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../api/auth.service";

function Navbar(props) {
  const value = props.page;
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const role = currentUser?.role;
  const isAuthenticated = !!currentUser?.token;
  const isInstructor = role === "ROLE_INSTRUCTOR";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogOut = async () => {
    await authService.logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const renderUserLinks = () => (
    <>
      {value === "home" ? (
        <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
          <Link
            to={"/"}
            className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400"
          >
            Trang chủ
          </Link>
        </li>
      ) : (
        <li className="list-none ml-5">
          <Link
            to={"/"}
            className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400"
          >
            Trang chủ
          </Link>
        </li>
      )}

      {value === "courses" ? (
        <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
          <Link
            to={"/courses"}
            className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400"
          >
            Khóa học
          </Link>
        </li>
      ) : (
        <li className="list-none ml-5">
          <Link
            to={"/courses"}
            className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400"
          >
            Khóa học
          </Link>
        </li>
      )}

      {isAuthenticated && (
        <>


          {value === "learnings" ? (
            <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
              <Link
                to={"/learnings"}
                className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400"
              >
                Học tập
                <FontAwesomeIcon icon={faChalkboardUser} className="ml-1" />
              </Link>
            </li>
          ) : (
            <li className="list-none ml-5">
              <Link
                to={"/learnings"}
                className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400"
              >
                Học tập
                <FontAwesomeIcon icon={faChalkboardUser} className="ml-1" />
              </Link>
            </li>
          )}

          {value === "my-classes" ? (
            <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
              <Link
                to={"/my-classes"}
                className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400"
              >
                Lớp học
                <FontAwesomeIcon icon={faChalkboardTeacher} className="ml-1" />
              </Link>
            </li>
          ) : (
            <li className="list-none ml-5">
              <Link
                to={"/my-classes"}
                className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400"
              >
                Lớp học
                <FontAwesomeIcon icon={faChalkboardTeacher} className="ml-1" />
              </Link>
            </li>
          )}

          {value === "profile" ? (
            <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
              <Link
                to={"/profile"}
                className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400"
              >
                Hồ sơ
                <FontAwesomeIcon icon={faUser} className="ml-1" />
              </Link>
            </li>
          ) : (
            <li className="list-none ml-5">
              <Link
                to={"/profile"}
                className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400"
              >
                Hồ sơ
                <FontAwesomeIcon icon={faUser} className="ml-1" />
              </Link>
            </li>
          )}
        </>
      )}
    </>
  );

  const renderInstructorLinks = () => (
    <>
      {/* Home Link */}
      {value === "home" ? (
        <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
          <Link to={"/"} className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400">
            Trang chủ
          </Link>
        </li>
      ) : (
        <li className="list-none ml-5">
          <Link to={"/"} className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400">
            Trang chủ
          </Link>
        </li>
      )}

      {/* Courses Link */}
      {value === "instructor-courses" ? (
        <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
          <Link to={"/instructor/courses"} className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400">
            Khóa học
          </Link>
        </li>
      ) : (
        <li className="list-none ml-5">
          <Link to={"/instructor/courses"} className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400">
            Khóa học
          </Link>
        </li>
      )}

      {/* Classes Link */}
      {value === "instructor-classes" ? (
        <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
          <Link to={"/instructor/classes"} className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400">
            Lớp học
          </Link>
        </li>
      ) : (
        <li className="list-none ml-5">
          <Link to={"/instructor/classes"} className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400">
            Lớp học
          </Link>
        </li>
      )}

      {/* Students Link */}
      {value === "instructor-students" ? (
        <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
          <Link to={"/instructor/students"} className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400">
            Học viên
          </Link>
        </li>
      ) : (
        <li className="list-none ml-5">
          <Link to={"/instructor/students"} className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400">
            Học viên
          </Link>
        </li>
      )}

      {/* Profile Link */}
      {value === "profile" ? (
        <li className="list-none ml-5 rounded-[5px] bg-gradient-to-r from-blue-600 to-purple-600">
          <Link to={"/profile"} className="no-underline text-white text-[17px] font-bold transition-all duration-300 ease-in-out px-[10px] py-[2px] block hover:text-yellow-400">
            Hồ sơ
            <FontAwesomeIcon icon={faUser} className="ml-1" />
          </Link>
        </li>
      ) : (
        <li className="list-none ml-5">
          <Link to={"/profile"} className="no-underline text-[rgb(21,21,100)] text-[17px] font-bold transition-all duration-300 ease-in-out hover:text-yellow-400">
            Hồ sơ
            <FontAwesomeIcon icon={faUser} className="ml-1" />
          </Link>
        </li>
      )}
    </>
  );

  return (
    <div>
      <nav className="bg-white w-full flex flex-row justify-between items-center px-[4vw] shadow-[2px_2px_10px_rgba(0,0,0,0.15)] z-[999]">
        <div className="flex items-center justify-center">
          <img src={logo} alt="" className="w-[300px] h-[65px] cursor-pointer" />
        </div>
        <div className="flex">
          <div id="menu-btn" className="hidden">
            <div className="menu-dash" onClick={toggleMobileMenu}>
              &#9776;
            </div>
          </div>
          <i id="menu-close" className="fas fa-times hidden" onClick={closeMobileMenu}></i>

          <ul className={`flex justify-end items-center ${isMobileMenuOpen ? "active" : ""}`}>
            {isMobileMenuOpen && (
              <li className="close-button">
                <button onClick={closeMobileMenu}>X</button>
              </li>
            )}

            {/* Links theo vai trò */}
            {isInstructor ? renderInstructorLinks() : renderUserLinks()}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <li className="list-none ml-5">
                <button
                  onClick={handleLogOut}
                  className="w-[120px] h-[35px] p-[1px] mb-[1px] bg-[#0047ca] border-none rounded-lg text-[rgb(250,250,250)] text-[15px] font-medium cursor-pointer transition-all duration-300 ease-in-out hover:bg-[#002c5fe1]"
                >
                  Đăng xuất
                </button>
              </li>
            ) : (
              <li className="list-none ml-5">
                <button
                  onClick={() => navigate("/login")}
                  className="w-[120px] h-[35px] p-[1px] mb-[1px] bg-[#0047ca] border-none rounded-lg text-[rgb(250,250,250)] text-[15px] font-medium cursor-pointer transition-all duration-300 ease-in-out hover:bg-[#002c5fe1]"
                >
                  Đăng nhập
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
