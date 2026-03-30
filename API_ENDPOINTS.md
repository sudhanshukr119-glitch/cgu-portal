# 🚀 API ENDPOINT STRUCTURE

## Base URL: `/api/v1`

## Authentication Endpoints

### POST `/auth/register`
- Register new user (admin only)
- Body: `{ name, email, password, role, ...profileData }`
- Response: `{ user, token }`

### POST `/auth/login`
- Login user
- Body: `{ email, password }`
- Response: `{ user, token, refreshToken }`

### POST `/auth/refresh`
- Refresh access token
- Body: `{ refreshToken }`
- Response: `{ token }`

### POST `/auth/logout`
- Logout user
- Headers: `Authorization: Bearer <token>`

### POST `/auth/forgot-password`
- Request password reset
- Body: `{ email }`

### POST `/auth/reset-password/:token`
- Reset password
- Body: `{ password }`

---

## User Management

### GET `/users`
- Get all users (admin only)
- Query: `?role=student&department=xyz&page=1&limit=20`

### GET `/users/:id`
- Get user by ID
- Auth: Admin or self

### PUT `/users/:id`
- Update user profile
- Auth: Admin or self

### DELETE `/users/:id`
- Soft delete user (admin only)

### GET `/users/:id/analytics`
- Get user analytics (attendance, performance)

### POST `/users/bulk-upload`
- Bulk upload users via CSV (admin only)

---

## Student Management

### GET `/students`
- Get all students
- Query: `?department=xyz&semester=3&section=A`

### GET `/students/:id/profile`
- Get complete student profile

### GET `/students/:id/academic-history`
- Get academic records

### GET `/students/:id/attendance-summary`
- Get attendance summary

### GET `/students/:id/fee-status`
- Get fee payment status

### PUT `/students/:id/promote`
- Promote student to next semester (admin)

---

## Faculty Management

### GET `/faculty`
- Get all faculty members
- Query: `?department=xyz`

### GET `/faculty/:id/classes`
- Get classes assigned to faculty

### GET `/faculty/:id/workload`
- Get faculty workload analytics

### POST `/faculty/:id/assign-class`
- Assign class to faculty (admin)

---

## Department Management

### GET `/departments`
- Get all departments

### POST `/departments`
- Create department (admin only)

### PUT `/departments/:id`
- Update department

### DELETE `/departments/:id`
- Delete department (admin only)

---

## Course Management

### GET `/courses`
- Get all courses
- Query: `?department=xyz&semester=3`

### POST `/courses`
- Create course (admin only)

### PUT `/courses/:id`
- Update course

### DELETE `/courses/:id`
- Delete course

### GET `/courses/:id/enrolled-students`
- Get students enrolled in course

---

## Class Management

### GET `/classes`
- Get all classes
- Query: `?faculty=xyz&semester=3`

### POST `/classes`
- Create class (admin only)

### PUT `/classes/:id`
- Update class

### POST `/classes/:id/enroll`
- Enroll students in class
- Body: `{ studentIds: [] }`

### DELETE `/classes/:id/unenroll/:studentId`
- Remove student from class

---

## Attendance Management

### GET `/attendance`
- Get attendance records
- Query: `?class=xyz&date=2024-01-15`

### POST `/attendance`
- Mark attendance (faculty only)
- Body: `{ classId, date, records: [{ student, status }] }`

### PUT `/attendance/:id`
- Update attendance record

### GET `/attendance/student/:studentId`
- Get student attendance summary
- Query: `?startDate=2024-01-01&endDate=2024-06-30`

### GET `/attendance/class/:classId/report`
- Generate class attendance report

### GET `/attendance/defaulters`
- Get students with low attendance (< 75%)

---

## Examination Management

### GET `/examinations`
- Get all examinations
- Query: `?course=xyz&type=mid-term&status=scheduled`

### POST `/examinations`
- Create examination (admin/faculty)

### PUT `/examinations/:id`
- Update examination

### DELETE `/examinations/:id`
- Cancel examination

### GET `/examinations/:id/students`
- Get students enrolled for exam

### POST `/examinations/:id/schedule`
- Schedule examination

---

## Results Management

### GET `/results`
- Get results
- Query: `?examination=xyz&student=abc`

### POST `/results`
- Upload results (faculty only)
- Body: `{ examinationId, results: [{ student, marks }] }`

### PUT `/results/:id`
- Update result

### POST `/results/:id/publish`
- Publish result (admin only)

### GET `/results/student/:studentId`
- Get student result history

### GET `/results/examination/:examId/analytics`
- Get exam analytics (avg, highest, lowest, distribution)

### GET `/results/student/:studentId/transcript`
- Generate student transcript

---

## Assignment Management

### GET `/assignments`
- Get assignments
- Query: `?class=xyz&status=active`

### POST `/assignments`
- Create assignment (faculty only)

### PUT `/assignments/:id`
- Update assignment

### DELETE `/assignments/:id`
- Delete assignment

### GET `/assignments/:id/submissions`
- Get all submissions for assignment

---

## Submission Management

### GET `/submissions`
- Get submissions
- Query: `?assignment=xyz&student=abc`

### POST `/submissions`
- Submit assignment (student only)

### PUT `/submissions/:id`
- Update submission (before deadline)

### POST `/submissions/:id/grade`
- Grade submission (faculty only)
- Body: `{ marks, feedback }`

---

## Fee Management

### GET `/fees`
- Get fee records
- Query: `?student=xyz&status=pending`

### POST `/fees`
- Create fee record (admin only)

### PUT `/fees/:id`
- Update fee record

### POST `/fees/:id/pay`
- Record payment
- Body: `{ amount, paymentMethod, transactionId }`

### GET `/fees/student/:studentId/summary`
- Get student fee summary

### GET `/fees/defaulters`
- Get students with pending fees

### POST `/fees/send-reminder`
- Send fee reminder notifications

---

## Notice Management

### GET `/notices`
- Get all notices
- Query: `?type=academic&isActive=true`

### POST `/notices`
- Create notice (admin/faculty)

### PUT `/notices/:id`
- Update notice

### DELETE `/notices/:id`
- Delete notice

### POST `/notices/:id/publish`
- Publish notice

### GET `/notices/:id/views`
- Get notice view analytics

---

## Timetable Management

### GET `/timetables`
- Get timetables
- Query: `?department=xyz&semester=3&section=A`

### POST `/timetables`
- Create timetable (admin only)

### PUT `/timetables/:id`
- Update timetable

### POST `/timetables/generate`
- AI-powered timetable generation
- Body: `{ department, semester, constraints }`

### GET `/timetables/:id/conflicts`
- Check for scheduling conflicts

---

## Leave Management

### GET `/leaves`
- Get leave requests
- Query: `?user=xyz&status=pending`

### POST `/leaves`
- Apply for leave

### PUT `/leaves/:id`
- Update leave request

### POST `/leaves/:id/approve`
- Approve leave (admin/hod)

### POST `/leaves/:id/reject`
- Reject leave
- Body: `{ remarks }`

### GET `/leaves/user/:userId/balance`
- Get leave balance

---

## Document Management

### GET `/documents`
- Get documents
- Query: `?user=xyz&type=certificate`

### POST `/documents/upload`
- Upload document
- Body: FormData with file

### GET `/documents/:id/download`
- Download document

### DELETE `/documents/:id`
- Delete document

### POST `/documents/:id/verify`
- Verify document (admin only)

---

## Notification Management

### GET `/notifications`
- Get user notifications
- Query: `?isRead=false&page=1`

### PUT `/notifications/:id/read`
- Mark notification as read

### PUT `/notifications/read-all`
- Mark all as read

### DELETE `/notifications/:id`
- Delete notification

### POST `/notifications/send`
- Send notification (admin only)
- Body: `{ recipients, title, message, type }`

---

## Chat Management

### GET `/chat/conversations`
- Get user conversations

### GET `/chat/:userId/messages`
- Get messages with specific user
- Query: `?page=1&limit=50`

### POST `/chat/send`
- Send message
- Body: `{ recipient, message, attachments }`

### PUT `/chat/:messageId/read`
- Mark message as read

### DELETE `/chat/:messageId`
- Delete message

---

## AI & Analytics

### POST `/ai/chatbot`
- AI chatbot query
- Body: `{ query, context }`
- Response: `{ answer, suggestions }`

### GET `/ai/predict-attendance/:studentId`
- Predict attendance risk

### GET `/ai/predict-performance/:studentId`
- Predict academic performance

### POST `/ai/generate-timetable`
- AI-powered timetable generation

### GET `/ai/recommendations/:studentId`
- Get personalized recommendations

---

## Analytics & Reports

### GET `/analytics/dashboard`
- Get dashboard analytics
- Query: `?role=admin&period=month`

### GET `/analytics/attendance`
- Attendance analytics
- Query: `?department=xyz&startDate=2024-01-01`

### GET `/analytics/performance`
- Performance analytics

### GET `/analytics/fees`
- Fee collection analytics

### POST `/reports/generate`
- Generate custom report
- Body: `{ type, filters, format }`

### GET `/reports/:id/download`
- Download generated report

---

## Activity Logs

### GET `/logs`
- Get activity logs (admin only)
- Query: `?user=xyz&action=login&startDate=2024-01-01`

### GET `/logs/export`
- Export logs to CSV

---

## System Settings

### GET `/settings`
- Get system settings (admin only)

### PUT `/settings`
- Update system settings

### POST `/settings/backup`
- Create database backup

### POST `/settings/restore`
- Restore from backup

---

## WebSocket Events (Real-time)

### Connection: `ws://localhost:5000`

**Events:**
- `notification:new` - New notification received
- `message:new` - New chat message
- `attendance:marked` - Attendance marked
- `result:published` - Result published
- `notice:published` - New notice published
- `user:online` - User came online
- `user:offline` - User went offline

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error
