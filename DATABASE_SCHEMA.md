# 🗄️ DATABASE SCHEMA DESIGN

## Collections Overview

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum["admin", "faculty", "student"],
  avatar: String (URL),
  phone: String,
  dateOfBirth: Date,
  gender: Enum["male", "female", "other"],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  
  // Student-specific
  studentId: String (unique, indexed),
  rollNo: String,
  department: ObjectId (ref: Department),
  semester: Number,
  batch: String,
  section: String,
  admissionDate: Date,
  parentContact: {
    fatherName: String,
    motherName: String,
    guardianPhone: String,
    guardianEmail: String
  },
  
  // Faculty-specific
  facultyId: String (unique, indexed),
  designation: String,
  qualification: String,
  specialization: String,
  joiningDate: Date,
  experience: Number,
  
  // Common
  isActive: Boolean (default: true),
  lastLogin: Date,
  preferences: {
    theme: Enum["light", "dark"],
    notifications: Boolean,
    language: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Departments Collection
```javascript
{
  _id: ObjectId,
  name: String (unique),
  code: String (unique),
  hod: ObjectId (ref: Users),
  description: String,
  establishedYear: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Courses Collection
```javascript
{
  _id: ObjectId,
  name: String,
  code: String (unique, indexed),
  department: ObjectId (ref: Department),
  credits: Number,
  semester: Number,
  type: Enum["theory", "practical", "elective"],
  syllabus: String (URL),
  description: String,
  prerequisites: [ObjectId] (ref: Courses),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Classes Collection
```javascript
{
  _id: ObjectId,
  course: ObjectId (ref: Courses),
  faculty: ObjectId (ref: Users),
  semester: Number,
  section: String,
  academicYear: String,
  schedule: [{
    day: Enum["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    startTime: String,
    endTime: String,
    room: String
  }],
  students: [ObjectId] (ref: Users),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Attendance Collection
```javascript
{
  _id: ObjectId,
  class: ObjectId (ref: Classes),
  date: Date (indexed),
  faculty: ObjectId (ref: Users),
  records: [{
    student: ObjectId (ref: Users),
    status: Enum["present", "absent", "late", "excused"],
    markedAt: Date,
    remarks: String
  }],
  totalClasses: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Examinations Collection
```javascript
{
  _id: ObjectId,
  name: String,
  type: Enum["mid-term", "end-term", "quiz", "assignment"],
  course: ObjectId (ref: Courses),
  class: ObjectId (ref: Classes),
  date: Date,
  startTime: String,
  endTime: String,
  duration: Number (minutes),
  totalMarks: Number,
  passingMarks: Number,
  room: String,
  instructions: String,
  status: Enum["scheduled", "ongoing", "completed", "cancelled"],
  createdBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Results Collection
```javascript
{
  _id: ObjectId,
  examination: ObjectId (ref: Examinations),
  student: ObjectId (ref: Users),
  marksObtained: Number,
  totalMarks: Number,
  percentage: Number,
  grade: String,
  remarks: String,
  isPublished: Boolean,
  publishedAt: Date,
  evaluatedBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Assignments Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  course: ObjectId (ref: Courses),
  class: ObjectId (ref: Classes),
  faculty: ObjectId (ref: Users),
  dueDate: Date,
  maxMarks: Number,
  attachments: [String] (URLs),
  instructions: String,
  submissionType: Enum["file", "text", "link"],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Submissions Collection
```javascript
{
  _id: ObjectId,
  assignment: ObjectId (ref: Assignments),
  student: ObjectId (ref: Users),
  content: String,
  attachments: [String] (URLs),
  submittedAt: Date,
  isLate: Boolean,
  marks: Number,
  feedback: String,
  status: Enum["submitted", "graded", "returned"],
  gradedBy: ObjectId (ref: Users),
  gradedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 10. Fees Collection
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: Users),
  academicYear: String,
  semester: Number,
  feeType: Enum["tuition", "hostel", "library", "exam", "other"],
  amount: Number,
  dueDate: Date,
  status: Enum["pending", "paid", "overdue", "waived"],
  paymentDate: Date,
  paymentMethod: Enum["cash", "card", "upi", "netbanking"],
  transactionId: String,
  receipt: String (URL),
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 11. Notices Collection
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  type: Enum["general", "academic", "exam", "event", "urgent"],
  priority: Enum["low", "medium", "high", "critical"],
  targetAudience: [Enum["all", "students", "faculty", "admin"]],
  department: ObjectId (ref: Department),
  attachments: [String] (URLs),
  publishedBy: ObjectId (ref: Users),
  publishDate: Date,
  expiryDate: Date,
  isActive: Boolean,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 12. Timetables Collection
```javascript
{
  _id: ObjectId,
  academicYear: String,
  semester: Number,
  department: ObjectId (ref: Department),
  section: String,
  schedule: [{
    day: String,
    slots: [{
      startTime: String,
      endTime: String,
      course: ObjectId (ref: Courses),
      faculty: ObjectId (ref: Users),
      room: String,
      type: Enum["lecture", "lab", "tutorial"]
    }]
  }],
  isActive: Boolean,
  generatedBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### 13. LeaveRequests Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Users),
  leaveType: Enum["sick", "casual", "emergency", "academic"],
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  reason: String,
  attachments: [String] (URLs),
  status: Enum["pending", "approved", "rejected"],
  approvedBy: ObjectId (ref: Users),
  approvalDate: Date,
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 14. Documents Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Users),
  title: String,
  type: Enum["certificate", "marksheet", "id-card", "transcript", "other"],
  fileUrl: String,
  fileSize: Number,
  mimeType: String,
  isVerified: Boolean,
  verifiedBy: ObjectId (ref: Users),
  verifiedAt: Date,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### 15. Notifications Collection
```javascript
{
  _id: ObjectId,
  recipient: ObjectId (ref: Users),
  title: String,
  message: String,
  type: Enum["info", "warning", "success", "error"],
  category: Enum["attendance", "exam", "fee", "assignment", "notice", "system"],
  isRead: Boolean,
  readAt: Date,
  actionUrl: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### 16. ChatMessages Collection
```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: Users),
  recipient: ObjectId (ref: Users),
  message: String,
  attachments: [String] (URLs),
  isRead: Boolean,
  readAt: Date,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 17. ActivityLogs Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Users),
  action: String,
  module: String,
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

### 18. AIAnalytics Collection
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: Users),
  analysisType: Enum["attendance", "performance", "behavior"],
  predictions: {
    attendanceRisk: Number (0-100),
    performanceTrend: String,
    recommendations: [String]
  },
  dataPoints: Object,
  generatedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes for Performance

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ studentId: 1 }, { sparse: true, unique: true })
db.users.createIndex({ facultyId: 1 }, { sparse: true, unique: true })
db.users.createIndex({ role: 1, isActive: 1 })

// Attendance
db.attendance.createIndex({ class: 1, date: -1 })
db.attendance.createIndex({ "records.student": 1 })

// Results
db.results.createIndex({ student: 1, examination: 1 })
db.results.createIndex({ examination: 1, isPublished: 1 })

// Notifications
db.notifications.createIndex({ recipient: 1, isRead: 1, createdAt: -1 })

// Activity Logs
db.activityLogs.createIndex({ user: 1, timestamp: -1 })
db.activityLogs.createIndex({ timestamp: -1 })
```
