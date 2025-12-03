# PHÂN TÍCH TOÀN BỘ CẤU TRÚC FRONTEND - LMS SYSTEM

## 📁 CẤU TRÚC THƯ MỤC

```
frontend/src/
├── api/                          # API Services & HTTP Calls
│   ├── auth.service.js          # Authentication API
│   ├── course.service.js        # Course management API
│   ├── instructor.service.js    # Instructor API
│   ├── admin.service.js         # Admin API
│   ├── learning.service.js      # Learning/Enrollment API
│   ├── assessment.service.js    # Assessment/Quiz API
│   ├── performance.service.js   # Performance tracking API
│   ├── profile.service.js       # User profile API
│   ├── progress.service.js      # Progress tracking API
│   ├── question.service.js      # Question management API
│   ├── payment.service.js       # Payment API
│   ├── api.js                   # Axios instance with interceptors
│   └── constant.js              # API_BASE_URL = "http://localhost:8081"
│
├── Components/                   # Reusable Components
│   ├── common/
│   │   ├── Navbar.jsx           # Navigation bar (responsive, role-aware)
│   │   ├── Footer.jsx           # Footer component
│   │   ├── InputField.jsx       # Reusable input field with icons
│   │   ├── ProtectedRoute.jsx   # Route protection by role
│   │   └── SearchFilter.jsx     # Search & filter component
│   ├── chat/
│   │   └── Chatbot.jsx          # AI Chatbot for course consultation
│   └── css/
│       └── style.css            # Global styles
│
├── config/
│   └── axiosConfig.js           # Axios interceptor setup (accessToken)
│
├── contexts/
│   └── UserContext.jsx          # React Context for user state
│
├── pages/                        # Page Components (organized by feature)
│   ├── auth/
│   │   ├── login.jsx            # Login page
│   │   ├── register.jsx         # Registration page (User + Instructor)
│   │   ├── ForgotPassword.jsx   # Forgot password page
│   │   └── ResetPassword.jsx    # Reset password page
│   │
│   ├── landing/
│   │   └── Home.jsx             # Landing page with hero section
│   │
│   ├── course/
│   │   ├── Courses.jsx          # List all courses with filters
│   │   ├── course.jsx           # Single course detail page
│   │   ├── forum.jsx            # Discussion forum for course
│   │   └── Feedback.jsx         # Course feedback component
│   │
│   ├── learning/
│   │   └── learnings.jsx        # User's enrolled courses
│   │
│   ├── assessment/
│   │   ├── Assessment.jsx       # Quiz/Assessment page
│   │   └── certificate.jsx      # Certificate display
│   │
│   ├── profile/
│   │   ├── profile.jsx          # User profile page
│   │   ├── Performance.jsx      # Performance analytics
│   │   ├── EditProfileModal.jsx # Edit profile modal
│   │   └── ImgUpload.jsx        # Image upload component
│   │
│   ├── dashBoard/               # Admin Dashboard
│   │   ├── AdminDashboard.jsx   # Main admin dashboard
│   │   ├── Dashboard.jsx        # Dashboard stats
│   │   ├── DUsers.jsx           # User management
│   │   ├── DCourses.jsx         # Course management
│   │   ├── DInstructors.jsx     # Instructor management
│   │   ├── DPayments.jsx        # Payment tracking
│   │   ├── AddQuestions.jsx     # Add quiz questions
│   │   ├── SideBar.jsx          # Dashboard sidebar
│   │   ├── CourseModal.jsx      # Course creation modal
│   │   ├── DeleteModal.jsx      # Delete confirmation modal
│   │   └── AdminInstructorManagement.jsx # Instructor approval
│   │
│   ├── instructor/              # Instructor Dashboard
│   │   ├── InstructorDashboard.jsx      # Main instructor dashboard
│   │   ├── InstructorCourses.jsx        # Manage courses
│   │   ├── ManageCourseContent.jsx      # Manage modules/lessons
│   │   ├── InstructorQuestions.jsx      # Manage questions
│   │   ├── InstructorStudents.jsx       # View enrolled students
│   │   └── InstructorFeedback.jsx       # View student feedback
│   │
│   ├── payment/
│   │   └── PaymentSuccess.jsx   # Payment success page
│   │
│   └── error/
│       └── ErrorPage.jsx        # 404 error page
│
├── assets/
│   └── images/                  # Static images
│
├── App.js                       # Main app with routing
├── App.css                      # App styles
└── index.js                     # React entry point
```

---

## 🔐 SECURITY ARCHITECTURE

### 1. **Authentication System**

#### Login Flow:
```javascript
// auth.service.js - login()
1. POST /api/auth/login (email, password)
2. Backend returns: { token, email, name, id, role }
3. Store in localStorage:
   - token (JWT)
   - email
   - name
   - id
   - role (ROLE_ADMIN, ROLE_USER, ROLE_INSTRUCTOR)
4. Redirect based on role
```

#### Logout Flow:
```javascript
// auth.service.js - logout()
1. POST /api/auth/logout (with Bearer token)
2. Clear localStorage
3. Redirect to /login
```

### 2. **Token Management**

**Storage Location:** `localStorage`
- `token` - JWT token for API requests
- `email` - User email
- `name` - User full name
- `id` - User ID
- `role` - User role

**Token Usage in API Calls:**
```javascript
// api.js - Axios Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. **Role-Based Access Control (RBAC)**

#### Three Roles:
1. **ROLE_ADMIN** - Full system access
2. **ROLE_USER** - Student access
3. **ROLE_INSTRUCTOR** - Instructor access

#### Protected Routes Implementation:
```javascript
// ProtectedRoute.jsx

export const AdminRoute = ({ children }) => {
  const isAdmin = authService.isAdminAuthenticated();
  return isAdmin ? children : <Navigate to="/login" replace />;
};

export const UserRoute = ({ children }) => {
  const isUser = authService.isUserAuthenticated();
  return isUser ? children : <Navigate to="/login" replace />;
};

export const InstructorRoute = ({ children }) => {
  const isInstructor = authService.isInstructorAuthenticated();
  return isInstructor ? children : <Navigate to="/login" replace />;
};
```

#### Authentication Check Functions:
```javascript
// auth.service.js

function isAdminAuthenticated() {
  return !!localStorage.getItem("token") && 
         localStorage.getItem("role") === "ROLE_ADMIN";
}

function isUserAuthenticated() {
  return !!localStorage.getItem("token") && 
         localStorage.getItem("role") === "ROLE_USER";
}

function isInstructorAuthenticated() {
  return !!localStorage.getItem("token") && 
         localStorage.getItem("role") === "ROLE_INSTRUCTOR";
}
```

### 4. **Error Handling & Session Management**

```javascript
// api.js - Response Interceptor

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired - clear and redirect
      message.error("Session expired. Please log in again.");
      localStorage.clear();
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Permission denied
      message.error("You don't have permission for this action.");
    } else if (error.response?.status === 404) {
      // Resource not found
      message.error("Requested resource not found.");
    } else if (error.response?.status >= 500) {
      // Server error
      message.error("Server error. Please try again later.");
    }
    return Promise.reject(error);
  }
);
```

---

## 🛣️ ROUTING STRUCTURE

### **Public Routes** (No authentication required)
```
GET  /                          → Home page
GET  /login                     → Login page
GET  /register                  → Registration page
GET  /forgot-password           → Forgot password page
GET  /reset-password            → Reset password page
GET  /courses                   → Browse all courses
GET  /course/:id                → Course detail page
GET  /discussion/:id            → Course forum
```

### **Protected User Routes** (Requires ROLE_USER)
```
GET  /profile                   → User profile
GET  /learnings                 → Enrolled courses
GET  /Performance               → Performance analytics
GET  /assessment/:id            → Take quiz
GET  /certificate/:courseId     → View certificate
```

### **Protected Instructor Routes** (Requires ROLE_INSTRUCTOR)
```
GET  /instructor/dashboard              → Main dashboard
GET  /instructor/courses                → Manage courses
GET  /instructor/course/:courseId/manage → Manage course content
GET  /instructor/questions              → Manage questions
GET  /instructor/students               → View students
GET  /instructor/feedback               → View feedback
```

### **Protected Admin Routes** (Requires ROLE_ADMIN)
```
GET  /admin                             → Main admin dashboard
GET  /admin/instructors                 → Manage instructors
GET  /Dusers                            → Manage users
GET  /Dcourses                          → Manage courses
GET  /addquestions/:id                  → Add quiz questions
```

### **Error Route**
```
GET  *                          → 404 Error page
```

---

## 📊 STATE MANAGEMENT

### **UserContext** (React Context)
```javascript
// contexts/UserContext.jsx

const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: '',
    id: '',
    email: ''
  });

  const setUserInfo = (userInfo) => {
    setUser(userInfo);
  };

  return (
    <UserContext.Provider value={{ user, setUser: setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
```

**Usage in Components:**
```javascript
const { user, setUser } = useUserContext();
```

### **localStorage** (Persistent Storage)
```javascript
// After successful login
localStorage.setItem("token", jwtData.token);
localStorage.setItem("email", jwtData.email);
localStorage.setItem("name", jwtData.name);
localStorage.setItem("id", jwtData.id);
localStorage.setItem("role", jwtData.role);
```

---

## 🔌 API SERVICES OVERVIEW

### **1. auth.service.js** - Authentication
- `login(email, password)` → POST /api/auth/login
- `register(formData)` → POST /api/auth/register
- `forgotPassword(email)` → POST /api/auth/forgot-password
- `resetPassword(token, password)` → POST /api/auth/reset-password
- `logout()` → POST /api/auth/logout
- `getUserDetails(email)` → GET /api/users/details
- `isAdminAuthenticated()` → Check role
- `isUserAuthenticated()` → Check role
- `isInstructorAuthenticated()` → Check role
- `getCurrentUser()` → Get user from localStorage
- `getAuthHeader()` → Get Authorization header

### **2. course.service.js** - Course Management
- `getAllCourses()` → GET /api/courses
- `getCourseById(id)` → GET /api/courses/:id
- `createCourse(data)` → POST /api/courses
- `updateCourse(id, data)` → PUT /api/courses/:id
- `deleteCourse(id)` → DELETE /api/courses/:id

### **3. learning.service.js** - Enrollment & Learning
- `enrollCourse(userId, courseId)` → POST /api/learning/enroll
- `getEnrollments(userId)` → GET /api/learning/enrollments/:userId
- `getProgress(userId, courseId)` → GET /api/learning/progress

### **4. assessment.service.js** - Quizzes & Assessments
- `getAssessment(courseId)` → GET /api/assessment/:courseId
- `submitAssessment(data)` → POST /api/assessment/submit
- `getCertificate(courseId)` → GET /api/certificate/:courseId

### **5. instructor.service.js** - Instructor Management
- `registerInstructor(data)` → POST /api/instructor/register
- `getInstructorCourses(id)` → GET /api/instructor/courses/:id
- `createCourse(data)` → POST /api/instructor/courses
- `updateCourse(id, data)` → PUT /api/instructor/courses/:id

### **6. admin.service.js** - Admin Operations
- `getAllUsers()` → GET /api/admin/users
- `getAllCourses()` → GET /api/admin/courses
- `getAllInstructors()` → GET /api/admin/instructors
- `approveInstructor(id)` → PUT /api/admin/instructors/:id/approve
- `deleteUser(id)` → DELETE /api/admin/users/:id

### **7. Other Services**
- `performance.service.js` → Performance analytics
- `profile.service.js` → User profile management
- `progress.service.js` → Learning progress tracking
- `question.service.js` → Question management
- `payment.service.js` → Payment processing

---

## 🎨 COMPONENT HIERARCHY

### **Common Components**

#### **Navbar.jsx**
- Responsive navigation bar with mobile menu
- Shows different menu based on authentication status
- Role-aware (Admin, Instructor, User)
- Logout functionality

#### **Footer.jsx**
- Footer component with links

#### **InputField.jsx**
- Reusable input component with icon support
- Used in login, register, profile forms

#### **ProtectedRoute.jsx**
- Wraps routes to check authentication
- Redirects to /login if not authenticated
- Checks user role

#### **SearchFilter.jsx**
- Search and filter functionality for courses

### **Page Components**

#### **Authentication Pages**
- `login.jsx` - Email/password login with error handling
- `register.jsx` - User/Instructor registration with validation
- `ForgotPassword.jsx` - Email-based password reset
- `ResetPassword.jsx` - Reset password with token

#### **Course Pages**
- `Courses.jsx` - List courses with search, sort, filter
- `course.jsx` - Single course detail with enrollment
- `forum.jsx` - Discussion forum for course
- `Feedback.jsx` - Course feedback form

#### **Dashboard Pages**
- **Admin:** DUsers, DCourses, AdminDashboard, AdminInstructorManagement
- **Instructor:** InstructorDashboard, InstructorCourses, ManageCourseContent

#### **Profile Pages**
- `profile.jsx` - User profile with edit capability
- `Performance.jsx` - Performance analytics and statistics

---

## 🔄 DATA FLOW

### **Login Flow**
```
User Input → login.jsx → authService.login() → API Call
→ Store Token/Role in localStorage → UserContext.setUser()
→ Redirect based on role
```

### **Course Enrollment Flow**
```
User clicks Enroll → enrollCourse() → learningService.enrollCourse()
→ API Call → Success → Redirect to course page
```

### **Protected Route Flow**
```
User navigates to /admin → AdminRoute checks role
→ isAdminAuthenticated() checks localStorage
→ If valid → Render component, else → Redirect to /login
```

### **API Request Flow**
```
Component → Service function → api.js (axios instance)
→ Interceptor adds Bearer token → Backend API
→ Response interceptor handles errors → Return to component
```

---

## 🛡️ SECURITY BEST PRACTICES IMPLEMENTED

✅ **JWT Token Authentication**
- Token stored in localStorage
- Sent in Authorization header for all requests

✅ **Role-Based Access Control**
- Three distinct roles (Admin, User, Instructor)
- Protected routes check role before rendering

✅ **Session Management**
- Auto logout on 401 (Unauthorized)
- Clear localStorage on logout

✅ **Error Handling**
- Specific error messages for different HTTP status codes
- User-friendly error notifications

✅ **Input Validation**
- Frontend validation on registration form
- Email format validation
- Password strength requirements (8-25 characters)
- Phone number validation

✅ **Secure Password Reset**
- Token-based password reset
- Email verification required

---

## ⚠️ POTENTIAL SECURITY CONCERNS & IMPROVEMENTS

### **Current Issues:**

1. **localStorage Token Storage**
   - Vulnerable to XSS attacks
   - **Recommendation:** Use httpOnly cookies instead

2. **No Token Refresh Mechanism**
   - Token doesn't refresh automatically
   - **Recommendation:** Implement refresh token rotation

3. **No CSRF Protection**
   - **Recommendation:** Add CSRF tokens for state-changing requests

4. **Hardcoded API URL**
   - API_BASE_URL in constant.js is hardcoded
   - **Recommendation:** Use environment variables

5. **No Rate Limiting**
   - **Recommendation:** Implement rate limiting on frontend

6. **No Input Sanitization**
   - **Recommendation:** Sanitize user inputs to prevent XSS

---

## 📱 RESPONSIVE DESIGN

- **Navbar:** Mobile menu toggle with hamburger icon
- **Forms:** Responsive grid layouts (1 col mobile, 2 col tablet, 3 col desktop)
- **Courses Grid:** Responsive grid (sm:grid-cols-2, lg:grid-cols-3)
- **Tailwind CSS:** Used for responsive styling

---

## 🎯 KEY FEATURES

1. **Multi-role System** - Admin, Instructor, User
2. **Course Management** - Create, update, delete courses
3. **Student Enrollment** - Browse and enroll in courses
4. **Assessment System** - Quizzes and tests
5. **Certificate Generation** - Upon course completion
6. **Performance Tracking** - Analytics and progress
7. **Discussion Forum** - Course-specific discussions
8. **Instructor Management** - Approve/manage instructors
9. **Payment Integration** - Course payment processing
10. **AI Chatbot** - Course consultation

---

## 🚀 DEPLOYMENT CONSIDERATIONS

1. **Environment Variables**
   - API_BASE_URL should be from .env file
   - Different URLs for dev/staging/production

2. **Build Optimization**
   - Code splitting for large components
   - Lazy loading for routes

3. **Security Headers**
   - Content-Security-Policy
   - X-Frame-Options
   - X-Content-Type-Options

4. **HTTPS Only**
   - All API calls should use HTTPS
   - Secure cookies with HttpOnly flag

---

## 📝 SUMMARY

The LMS frontend is a comprehensive React application with:
- ✅ Robust authentication and authorization
- ✅ Role-based access control
- ✅ Multiple dashboards for different user types
- ✅ Course management and enrollment
- ✅ Assessment and certification system
- ✅ Performance tracking and analytics
- ✅ Responsive design
- ✅ Error handling and session management

The architecture follows React best practices with component reusability, context for state management, and service-based API calls.

