import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FiTrendingUp, FiTrendingDown, FiUsers, FiBook, FiDollarSign, FiCalendar, FiAward, FiAlertCircle } from "react-icons/fi";
import API from "../api";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function PremiumDashboard({ user }) {
  const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, avgAttendance: 0, pendingFees: 0, upcomingExams: 0, activeNotices: 0 });
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analytics, attendance, fees, notifications, logs] = await Promise.all([
        API.get("/users/analytics").catch(() => ({ data: {} })),
        API.get("/attendance").catch(() => ({ data: [] })),
        API.get("/fees").catch(() => ({ data: [] })),
        API.get("/notifications").catch(() => ({ data: [] })),
        API.get("/users/logs?limit=4").catch(() => ({ data: { logs: [] } })),
      ]);

      setActivityLogs(logs.data.logs || []);

      const a = analytics.data;
      const attRecords = attendance.data;
      const feeRecords = fees.data;

      // Attendance % from real records
      const present = attRecords.filter(r => r.status === "present" || r.status === "late").length;
      const avgAtt = attRecords.length ? ((present / attRecords.length) * 100).toFixed(1) : 0;

      // Fee stats from real records
      const pendingAmt = feeRecords.filter(f => f.status !== "paid").reduce((s, f) => s + (f.amount || 0), 0);
      const paidCount    = feeRecords.filter(f => f.status === "paid").length;
      const pendingCount = feeRecords.filter(f => f.status === "pending").length;
      const overdueCount = feeRecords.filter(f => f.status === "overdue").length;

      setStats({
        totalStudents: a.totalStudents || 0,
        totalFaculty:  a.totalFaculty  || 0,
        avgAttendance: parseFloat(avgAtt),
        pendingFees:   pendingAmt,
        upcomingExams: 0,
        activeNotices: notifications.data.length || 0,
      });

      // Build monthly attendance trend from real records
      const monthMap = {};
      attRecords.forEach(r => {
        const m = new Date(r.date).toLocaleString("en-IN", { month: "short" });
        if (!monthMap[m]) monthMap[m] = { total: 0, present: 0 };
        monthMap[m].total++;
        if (r.status === "present" || r.status === "late") monthMap[m].present++;
      });
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const trend = months
        .filter(m => monthMap[m])
        .map(m => ({ month: m, attendance: Math.round((monthMap[m].present / monthMap[m].total) * 100) }));
      setAttendanceData(trend.length ? trend : [
        { month: "Jan", attendance: 85 }, { month: "Feb", attendance: 88 },
        { month: "Mar", attendance: 82 }, { month: "Apr", attendance: 90 },
        { month: "May", attendance: 87 }, { month: "Jun", attendance: 89 },
      ]);

      setFeeData([
        { name: "Paid",    value: paidCount    || 68 },
        { name: "Pending", value: pendingCount || 22 },
        { name: "Overdue", value: overdueCount || 10 },
      ]);

      // Department-wise student breakdown from analytics
      if (a.departments?.length) {
        setPerformanceData(a.departments.map(d => ({ subject: d._id || "Other", avg: d.count })));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Students", value: stats.totalStudents,                          change: "+12.5%", trend: "up",   icon: FiUsers,       color: "from-blue-500 to-blue-600",   bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Total Faculty",  value: stats.totalFaculty,                           change: "+3.2%",  trend: "up",   icon: FiBook,        color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
    { title: "Avg Attendance", value: `${stats.avgAttendance}%`,                    change: "-2.1%",  trend: "down", icon: FiCalendar,    color: "from-green-500 to-green-600",  bgColor: "bg-green-50 dark:bg-green-900/20" },
    { title: "Pending Fees",   value: `\u20b9${(stats.pendingFees/1000).toFixed(0)}K`, change: "-8.3%",  trend: "down", icon: FiDollarSign,  color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    { title: "Announcements",  value: stats.activeNotices,                          change: "",       trend: "up",   icon: FiAlertCircle, color: "from-pink-500 to-pink-600",    bgColor: "bg-pink-50 dark:bg-pink-900/20" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your institution today
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Generate Report
          </motion.button>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-2">
                    {stat.trend === "up" ? (
                      <FiTrendingUp className="text-green-500" />
                    ) : (
                      <FiTrendingDown className="text-red-500" />
                    )}
                    <span className={`text-sm font-semibold ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-8 h-8 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Attendance Trend
              </h3>
              <select className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAttendance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Performance Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Subject Performance
              </h3>
              <button className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                View Details
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="subject" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="avg" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Fee Collection Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={feeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {feeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white lg:col-span-2"
          >
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: FiUsers, label: "Add Student", color: "bg-white/20" },
                { icon: FiBook, label: "Create Class", color: "bg-white/20" },
                { icon: FiCalendar, label: "Mark Attendance", color: "bg-white/20" },
                { icon: FiAward, label: "Upload Results", color: "bg-white/20" }
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${action.color} backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-white/30 transition-all`}
                >
                  <action.icon className="w-8 h-8" />
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {(activityLogs.length ? activityLogs : [
                { action: "New student enrolled", createdAt: new Date(), userRole: "admin" },
                { action: "Exam results published", createdAt: new Date(), userRole: "teacher" },
                { action: "Fee payment received", createdAt: new Date(), userRole: "student" },
                { action: "Notice published", createdAt: new Date(), userRole: "admin" },
              ]).map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="p-3 rounded-lg bg-white dark:bg-gray-800 text-indigo-500">
                    <FiUsers className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {log.userName || "System"} &middot; {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Important Alerts
            </h3>
            <div className="space-y-4">
              {[
                { title: "Low Attendance Alert", desc: "15 students below 75% attendance", type: "warning" },
                { title: "Fee Deadline", desc: "Payment deadline in 3 days", type: "error" },
                { title: "Exam Schedule", desc: "Mid-term exams starting next week", type: "info" }
              ].map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-l-4 ${
                    alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                    alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{alert.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{alert.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
