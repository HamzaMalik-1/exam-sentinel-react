import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Layout & Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateExam from './pages/Teacher/CreateExam';

import ExamList from './pages/Teacher/ExamList';
// import ExamResults from './pages/Teacher/ExamResults';
import ClassResultDetails from './pages/Teacher/ClassResultDetails';
import ExamResults from './pages/Teacher/ExamResults';
import AssignExam from './pages/Teacher/AssignExam';
import ManageClasses from './pages/admin/ManageClasses';
import ManageTeachers from './pages/admin/ManageTeachers';
import StudentExams from './pages/student/StudentExams';
import ExamIntro from './pages/student/ExamIntro';
import TakeExam from './pages/student/TakeExam';
// import TeacherDashboard from './pages/TeacherDashboard';
// import CreateExam from './pages/CreateExam';

// Placeholder Pages (Until we build them)
const StudentDashboard = () => <div className="card-box"><h2 className="text-title">Student Dashboard</h2></div>;
const ExamPage = () => <div className="card-box"><h2 className="text-title">Exam Interface</h2></div>;

function App() {
  // Theme Initialization
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <BrowserRouter>
      <Routes>
        
        {/* WRAPPER ROUTE: Applies Layout to everything inside */}
        <Route element={<Layout theme={theme} toggleTheme={toggleTheme} />}>
          
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/admin/classes" element={<ManageClasses />} />
          <Route path="/admin/teachers" element={<ManageTeachers />} />
          {/* TEACHER ROUTES */}
          {/* <Route path="/teacher" element={<TeacherDashboard />} /> */}
          <Route path="/exam/create" element={<CreateExam />} />
          <Route path="/teacher/exams" element={<ExamList />} />
          <Route path="/teacher/result" element={<ExamResults />} />
          <Route path="/teacher/assign" element={<AssignExam />} />
          <Route path="/teacher/result/:resultId" element={<ClassResultDetails />} />

          
          {/* STUDENT ROUTES */}
          {/* <Route path="/student" element={<StudentDashboard />} /> */}
          {/* <Route path="/exam/:id" element={<ExamPage />} /> */}
          
<Route path="/student/exam/:id/intro" element={<ExamIntro />} />
<Route path="/student/exams" element={<StudentExams />} />
<Route path="/student/exam/:id/start" element={<TakeExam />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;