import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
// Import các component auth
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Course from './pages/course/course';
import Courses from './pages/course/Courses';
import Profile from './pages/profile/profile';
import Learnings from './pages/learning/learnings';
import Home from './pages/landing/Home';
import DUsers from './pages/dashBoard/DUsers';
import DCourses from './pages/dashBoard/DCourses';
import Assessment from './pages/assessment/Assessment';
import ErrorPage from './pages/error/ErrorPage';
import AddQuestions from './pages/dashBoard/AddQuestions';
import Performance from './pages/profile/Performance';
import certificate from './pages/assessment/certificate';
import Forum from './pages/course/forum';
import AdminDashboard from './pages/dashBoard/AdminDashboard';
// Import các Component mới cho quản lý nội dung
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import ManageCourseContent from './pages/instructor/ManageCourseContent';
import AdminInstructorManagement from './pages/dashBoard/AdminInstructorManagement';
// Instructor management pages
import InstructorCourses from './pages/instructor/InstructorCourses';
import InstructorQuestions from './pages/instructor/InstructorQuestions';
import InstructorStudents from './pages/instructor/InstructorStudents';
import InstructorFeedback from './pages/instructor/InstructorFeedback';

// Import các component bảo vệ Route
import { AdminRoute, UserRoute, InstructorRoute } from "./Components/common/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* ======================= Authentication Routes ======================= */}
          <Route path='/login' Component={Login}></Route>
          <Route path='/register' Component={Register}></Route>
          <Route path='/forgot-password' Component={ForgotPassword}></Route>
          <Route path='/reset-password' Component={ResetPassword}></Route>

          {/* ======================= Public & User Routes ======================= */}
          <Route path='/' Component={Home}></Route>
          <Route path='/courses' Component={Courses}></Route>
          <Route path='/course/:id' Component={Course}></Route>
          <Route path='/discussion/:id' Component={Forum}></Route>

          <Route path='/profile' Component={Profile}></Route>
          <Route path='/Learnings' Component={Learnings}></Route>
          <Route path='/Performance' Component={Performance} />

          {/* Course-specific actions (Assessment & Certificate) */}
          <Route path='/assessment/:id' Component={Assessment}></Route>
          <Route path='/certificate/:courseId' Component={certificate}></Route>

          {/* ======================= INSTRUCTOR Routes (Mới) ======================= */}
          <Route
            path="/instructor/dashboard"
            element={
              <InstructorRoute>
                <InstructorDashboard /> {/* Xem/Tạo khóa học */}
              </InstructorRoute>
            }
          />
          <Route
            path="/instructor/course/:courseId/manage"
            element={
              <InstructorRoute>
                <ManageCourseContent /> {/* Quản lý Modules, Lessons, Quizzes */}
              </InstructorRoute>
            }
          />
          {/* Instructor management pages */}
          <Route
            path="/instructor/courses"
            element={
              <InstructorRoute>
                <InstructorCourses />
              </InstructorRoute>
            }
          />
          <Route
            path="/instructor/questions"
            element={
              <InstructorRoute>
                <InstructorQuestions />
              </InstructorRoute>
            }
          />
          <Route
            path="/instructor/students"
            element={
              <InstructorRoute>
                <InstructorStudents />
              </InstructorRoute>
            }
          />
          <Route
            path="/instructor/feedback"
            element={
              <InstructorRoute>
                <InstructorFeedback />
              </InstructorRoute>
            }
          />

          {/* ======================= ADMIN Routes (Mới & Cũ) ======================= */}
          {/* Cần đảm bảo AdminDashboard chỉ render 1 lần duy nhất */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          {/* Quản lý Users và Courses (DUsers và DCourses cũ của bạn) */}
          <Route path='/Dcourses' element={<AdminRoute><DCourses /></AdminRoute>}></Route>
          <Route path='/Dusers' element={<AdminRoute><DUsers /></AdminRoute>}></Route>

          {/* Admin Quản lý Instructors (Mới) */}
          <Route path='/admin/instructors' element={<AdminRoute><AdminInstructorManagement /></AdminRoute>}></Route>

          {/* Admin AddQuestions (Dường như là một phần của Dashboard) */}
          <Route path="/addquestions/:id" element={<AdminRoute><AddQuestions /></AdminRoute>} />

          {/* ======================= Error Route ======================= */}
          <Route path='*' Component={ErrorPage}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;