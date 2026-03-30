require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const users = [
  // Admin
  { name: "Admin User",           email: "admin@college.edu",      password: "admin123",   role: "admin",   department: "Administration" },

  // ── Computer Science ──
  { name: "Dr. Anita Singh",      email: "anita@college.edu",      password: "teacher123", role: "teacher", subject: "Data Structures",        designation: "Professor",           department: "Computer Science", experience: 14, isHOD: true,  phone: "919876543201" },
  { name: "Prof. Rahul Verma",    email: "rahul.v@college.edu",    password: "teacher123", role: "teacher", subject: "Operating Systems",       designation: "Associate Professor", department: "Computer Science", experience: 9,  phone: "919876543202" },
  { name: "Ms. Pooja Iyer",       email: "pooja@college.edu",      password: "teacher123", role: "teacher", subject: "Web Technologies",        designation: "Assistant Professor", department: "Computer Science", experience: 4,  phone: "919876543203" },
  { name: "Mr. Karan Mehta",      email: "karan@college.edu",      password: "teacher123", role: "teacher", subject: "Machine Learning",        designation: "Assistant Professor", department: "Computer Science", experience: 5,  phone: "919876543204" },

  // ── Electronics & Communication ──
  { name: "Dr. Suresh Nair",      email: "suresh@college.edu",     password: "teacher123", role: "teacher", subject: "VLSI Design",             designation: "Professor",           department: "Electronics",      experience: 16, isHOD: true,  phone: "919876543205" },
  { name: "Prof. Meena Pillai",   email: "meena@college.edu",      password: "teacher123", role: "teacher", subject: "Signal Processing",       designation: "Associate Professor", department: "Electronics",      experience: 10, phone: "919876543206" },
  { name: "Mr. Arun Krishnan",    email: "arun@college.edu",       password: "teacher123", role: "teacher", subject: "Embedded Systems",        designation: "Assistant Professor", department: "Electronics",      experience: 6,  phone: "919876543207" },
  { name: "Ms. Divya Menon",      email: "divya@college.edu",      password: "teacher123", role: "teacher", subject: "Communication Systems",   designation: "Assistant Professor", department: "Electronics",      experience: 3,  phone: "919876543208" },

  // ── Mechanical Engineering ──
  { name: "Dr. Vikram Joshi",     email: "vikram@college.edu",     password: "teacher123", role: "teacher", subject: "Thermodynamics",          designation: "Professor",           department: "Mechanical",       experience: 18, isHOD: true,  phone: "919876543209" },
  { name: "Prof. Sunita Rao",     email: "sunita@college.edu",     password: "teacher123", role: "teacher", subject: "Fluid Mechanics",         designation: "Associate Professor", department: "Mechanical",       experience: 11, phone: "919876543210" },
  { name: "Mr. Deepak Tiwari",    email: "deepak@college.edu",     password: "teacher123", role: "teacher", subject: "Manufacturing Processes", designation: "Assistant Professor", department: "Mechanical",       experience: 7,  phone: "919876543211" },
  { name: "Ms. Kavita Desai",     email: "kavita@college.edu",     password: "teacher123", role: "teacher", subject: "CAD/CAM",                 designation: "Assistant Professor", department: "Mechanical",       experience: 4,  phone: "919876543212" },

  // ── Civil Engineering ──
  { name: "Dr. Priya Sharma",     email: "priya@college.edu",      password: "teacher123", role: "teacher", subject: "Structural Analysis",     designation: "Professor",           department: "Civil",            experience: 13, isHOD: true,  phone: "919876543213" },
  { name: "Prof. Amit Gupta",     email: "amit@college.edu",       password: "teacher123", role: "teacher", subject: "Geotechnical Engg.",      designation: "Associate Professor", department: "Civil",            experience: 8,  phone: "919876543214" },
  { name: "Mr. Rohit Pandey",     email: "rohit@college.edu",      password: "teacher123", role: "teacher", subject: "Environmental Engg.",     designation: "Assistant Professor", department: "Civil",            experience: 5,  phone: "919876543215" },
  { name: "Ms. Neha Kulkarni",    email: "neha@college.edu",       password: "teacher123", role: "teacher", subject: "Transportation Engg.",    designation: "Assistant Professor", department: "Civil",            experience: 3,  phone: "919876543216" },

  // ── Electrical Engineering ──
  { name: "Dr. Rajesh Patil",     email: "rajesh@college.edu",     password: "teacher123", role: "teacher", subject: "Power Systems",           designation: "Professor",           department: "Electrical",       experience: 15, isHOD: true,  phone: "919876543217" },
  { name: "Prof. Shalini Dubey",  email: "shalini@college.edu",    password: "teacher123", role: "teacher", subject: "Control Systems",         designation: "Associate Professor", department: "Electrical",       experience: 9,  phone: "919876543218" },
  { name: "Mr. Nitin Bhatt",      email: "nitin@college.edu",      password: "teacher123", role: "teacher", subject: "Electric Machines",       designation: "Assistant Professor", department: "Electrical",       experience: 6,  phone: "919876543219" },
  { name: "Ms. Ritu Agarwal",     email: "ritu@college.edu",       password: "teacher123", role: "teacher", subject: "Power Electronics",       designation: "Assistant Professor", department: "Electrical",       experience: 4,  phone: "919876543220" },

  // Students
  { name: "Jane Student",  email: "student@college.edu", password: "student123", role: "student", class: "CS-3A",  rollNo: "CS001", department: "Computer Science", semester: 3, batch: "2022-26", feeStatus: "pending" },
  { name: "Arjun Patel",   email: "arjun@college.edu",   password: "student123", role: "student", class: "CS-3A",  rollNo: "CS002", department: "Computer Science", semester: 3, batch: "2022-26", feeStatus: "paid"    },
  { name: "Sneha Reddy",   email: "sneha@college.edu",   password: "student123", role: "student", class: "CS-3B",  rollNo: "CS003", department: "Computer Science", semester: 3, batch: "2022-26", feeStatus: "overdue" },
  { name: "Rahul Verma",   email: "rahul@college.edu",   password: "student123", role: "student", class: "ECE-2A", rollNo: "EC001", department: "Electronics",      semester: 2, batch: "2023-27", feeStatus: "paid"    },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) { console.log(`⏭  Skipped (exists): ${u.email}`); continue; }
    const user = new User({ ...u, password: await bcrypt.hash(u.password, 12) });
    await user.save(); // triggers pre-save permission assignment
    console.log(`✅ Created: ${u.email} [${u.role}]`);
  }

  console.log("\n🎓 Seed complete! Login credentials:");
  console.log("  Admin:   admin@college.edu    / admin123");
  console.log("  Teacher: anita@college.edu    / teacher123  (CS HOD)");
  console.log("  Teacher: suresh@college.edu   / teacher123  (ECE HOD)");
  console.log("  Teacher: vikram@college.edu   / teacher123  (ME HOD)");
  console.log("  Teacher: priya@college.edu    / teacher123  (Civil HOD)");
  console.log("  Teacher: rajesh@college.edu   / teacher123  (EE HOD)");
  console.log("  Student: student@college.edu  / student123");

  mongoose.disconnect();
})();
