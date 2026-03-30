# 📁 PROJECT FOLDER STRUCTURE

```
cgu-portal/
│
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── redis.js                 # Redis configuration
│   │   ├── cloudinary.js            # File upload config
│   │   └── constants.js             # App constants
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── student.controller.js
│   │   ├── faculty.controller.js
│   │   ├── department.controller.js
│   │   ├── course.controller.js
│   │   ├── class.controller.js
│   │   ├── attendance.controller.js
│   │   ├── examination.controller.js
│   │   ├── result.controller.js
│   │   ├── assignment.controller.js
│   │   ├── submission.controller.js
│   │   ├── fee.controller.js
│   │   ├── notice.controller.js
│   │   ├── timetable.controller.js
│   │   ├── leave.controller.js
│   │   ├── document.controller.js
│   │   ├── notification.controller.js
│   │   ├── chat.controller.js
│   │   ├── ai.controller.js
│   │   ├── analytics.controller.js
│   │   └── report.controller.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Course.js
│   │   ├── Class.js
│   │   ├── Attendance.js
│   │   ├── Examination.js
│   │   ├── Result.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   ├── Fee.js
│   │   ├── Notice.js
│   │   ├── Timetable.js
│   │   ├── LeaveRequest.js
│   │   ├── Document.js
│   │   ├── Notification.js
│   │   ├── ChatMessage.js
│   │   ├── ActivityLog.js
│   │   └── AIAnalytics.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── student.routes.js
│   │   ├── faculty.routes.js
│   │   ├── department.routes.js
│   │   ├── course.routes.js
│   │   ├── class.routes.js
│   │   ├── attendance.routes.js
│   │   ├── examination.routes.js
│   │   ├── result.routes.js
│   │   ├── assignment.routes.js
│   │   ├── submission.routes.js
│   │   ├── fee.routes.js
│   │   ├── notice.routes.js
│   │   ├── timetable.routes.js
│   │   ├── leave.routes.js
│   │   ├── document.routes.js
│   │   ├── notification.routes.js
│   │   ├── chat.routes.js
│   │   ├── ai.routes.js
│   │   ├── analytics.routes.js
│   │   └── index.js                 # Route aggregator
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── role.middleware.js       # Role-based access
│   │   ├── validate.middleware.js   # Request validation
│   │   ├── upload.middleware.js     # File upload handling
│   │   ├── rateLimit.middleware.js  # Rate limiting
│   │   ├── error.middleware.js      # Error handling
│   │   └── logger.middleware.js     # Request logging
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── email.service.js         # Email notifications
│   │   ├── sms.service.js           # SMS notifications
│   │   ├── notification.service.js  # Push notifications
│   │   ├── ai.service.js            # AI/ML services
│   │   ├── analytics.service.js     # Analytics engine
│   │   ├── timetable.service.js     # Timetable generator
│   │   ├── report.service.js        # Report generation
│   │   ├── payment.service.js       # Payment gateway
│   │   └── storage.service.js       # File storage
│   │
│   ├── utils/
│   │   ├── apiResponse.js           # Standard API responses
│   │   ├── apiError.js              # Error classes
│   │   ├── asyncHandler.js          # Async error wrapper
│   │   ├── validators.js            # Input validators
│   │   ├── helpers.js               # Helper functions
│   │   ├── encryption.js            # Encryption utilities
│   │   └── logger.js                # Winston logger
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── attendance.validator.js
│   │   └── ...
│   │
│   ├── jobs/
│   │   ├── attendance.job.js        # Scheduled jobs
│   │   ├── notification.job.js
│   │   ├── backup.job.js
│   │   └── analytics.job.js
│   │
│   ├── socket/
│   │   ├── index.js                 # Socket.io setup
│   │   ├── handlers/
│   │   │   ├── chat.handler.js
│   │   │   ├── notification.handler.js
│   │   │   └── presence.handler.js
│   │   └── middleware/
│   │       └── auth.socket.js
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                    # Entry point
│   └── app.js                       # Express app setup
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   └── assets/
│   │       ├── images/
│   │       └── icons/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── Tabs.jsx
│   │   │   │   ├── Tooltip.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── MobileNav.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── QuickActions.jsx
│   │   │   │   ├── RecentActivity.jsx
│   │   │   │   ├── UpcomingEvents.jsx
│   │   │   │   └── PerformanceChart.jsx
│   │   │   │
│   │   │   ├── charts/
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   ├── AreaChart.jsx
│   │   │   │   └── RadarChart.jsx
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── StudentForm.jsx
│   │   │   │   ├── FacultyForm.jsx
│   │   │   │   ├── AttendanceForm.jsx
│   │   │   │   ├── ExamForm.jsx
│   │   │   │   └── AssignmentForm.jsx
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── ThemeToggle.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   ├── Calendar.jsx
│   │   │   │   ├── ChatWidget.jsx
│   │   │   │   ├── AIAssistant.jsx
│   │   │   │   └── FileUpload.jsx
│   │   │   │
│   │   │   └── animations/
│   │   │       ├── FadeIn.jsx
│   │   │       ├── SlideIn.jsx
│   │   │       └── PageTransition.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   └── FacultyDashboard.jsx
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── StudentList.jsx
│   │   │   │   ├── StudentProfile.jsx
│   │   │   │   ├── StudentAttendance.jsx
│   │   │   │   ├── StudentResults.jsx
│   │   │   │   └── StudentFees.jsx
│   │   │   │
│   │   │   ├── faculty/
│   │   │   │   ├── FacultyList.jsx
│   │   │   │   ├── FacultyProfile.jsx
│   │   │   │   ├── MyClasses.jsx
│   │   │   │   └── Workload.jsx
│   │   │   │
│   │   │   ├── academic/
│   │   │   │   ├── Courses.jsx
│   │   │   │   ├── Classes.jsx
│   │   │   │   ├── Timetable.jsx
│   │   │   │   ├── Attendance.jsx
│   │   │   │   ├── Assignments.jsx
│   │   │   │   ├── Examinations.jsx
│   │   │   │   └── Results.jsx
│   │   │   │
│   │   │   ├── finance/
│   │   │   │   ├── FeeManagement.jsx
│   │   │   │   ├── FeeCollection.jsx
│   │   │   │   ├── PaymentHistory.jsx
│   │   │   │   └── FeeReports.jsx
│   │   │   │
│   │   │   ├── communication/
│   │   │   │   ├── Notices.jsx
│   │   │   │   ├── Notifications.jsx
│   │   │   │   ├── Chat.jsx
│   │   │   │   └── Announcements.jsx
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── DocumentVault.jsx
│   │   │   │   ├── UploadDocument.jsx
│   │   │   │   └── VerifyDocument.jsx
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── AttendanceAnalytics.jsx
│   │   │   │   ├── PerformanceAnalytics.jsx
│   │   │   │   ├── FeeAnalytics.jsx
│   │   │   │   └── PredictiveAnalytics.jsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── Security.jsx
│   │   │   │   ├── Preferences.jsx
│   │   │   │   └── SystemSettings.jsx
│   │   │   │
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useSocket.js
│   │   │   ├── useNotification.js
│   │   │   ├── useTheme.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useLocalStorage.js
│   │   │   └── usePagination.js
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── SocketContext.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── auth.service.js
│   │   │   ├── student.service.js
│   │   │   ├── faculty.service.js
│   │   │   ├── attendance.service.js
│   │   │   ├── exam.service.js
│   │   │   ├── fee.service.js
│   │   │   ├── notice.service.js
│   │   │   ├── chat.service.js
│   │   │   └── socket.service.js
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   └── storage.js
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css            # Tailwind imports
│   │   │   ├── animations.css
│   │   │   └── custom.css
│   │   │
│   │   ├── routes/
│   │   │   ├── index.jsx            # Route configuration
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── setupTests.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── USER_MANUAL.md
│   └── ARCHITECTURE.md
│
├── scripts/
│   ├── seed.js                      # Database seeding
│   ├── migrate.js                   # Database migrations
│   └── backup.js                    # Backup scripts
│
├── .gitignore
├── README.md
├── docker-compose.yml
└── package.json
```

## Key Design Principles

### Backend
- **Modular Architecture**: Each module is independent and reusable
- **Service Layer**: Business logic separated from controllers
- **Middleware Pipeline**: Authentication, validation, error handling
- **Job Scheduling**: Background tasks for notifications, analytics
- **Real-time Communication**: Socket.io for live updates

### Frontend
- **Component-Based**: Reusable, atomic components
- **Feature-First Structure**: Organized by features, not file types
- **Custom Hooks**: Reusable logic extraction
- **Context API**: Global state management
- **Lazy Loading**: Code splitting for performance

### Best Practices
- Environment-based configuration
- Comprehensive error handling
- Input validation at all levels
- Security middleware (helmet, cors, rate limiting)
- Logging and monitoring
- Automated testing
- CI/CD ready structure
