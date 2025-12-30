import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  PlayCircle, 
  CheckCircle, 
  AlertCircle,
  School
} from "lucide-react";
import { Card, Table, Button, Badge, Row, Col } from "react-bootstrap";

// --- MOCK DATA ---
const MOCK_STUDENT_EXAMS = [
  { 
    id: 101, 
    className: "Grade 10 - A", 
    testName: "Mid-Term Mathematics", 
    timeLimit: 60, // minutes
    startDate: "2023-12-30T09:00:00", // Past (Example)
    endDate: "2025-12-31T23:00:00",   // Future (Active Window)
    isExamContinue: true, 
    isAttempted: false 
  },
  { 
    id: 102, 
    className: "Grade 10 - A", 
    testName: "Physics Fundamentals", 
    timeLimit: 45, 
    startDate: "2025-01-01T10:00:00", // Future
    endDate: "2025-01-01T14:00:00", 
    isExamContinue: true, 
    isAttempted: false 
  },
  { 
    id: 103, 
    className: "Grade 10 - A", 
    testName: "English Grammar", 
    timeLimit: 30, 
    startDate: "2024-12-01T09:00:00", 
    endDate: "2024-12-05T12:00:00", // Past (Expired)
    isExamContinue: true, 
    isAttempted: false 
  },
  { 
    id: 104, 
    className: "Grade 10 - A", 
    testName: "Computer Science - React", 
    timeLimit: 90, 
    startDate: "2024-12-20T09:00:00", 
    endDate: "2025-12-30T12:00:00", 
    isExamContinue: true, 
    isAttempted: true // Already done
  },
];

const StudentExams = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute to keep statuses accurate
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- LOGIC: DETERMINE STATUS ---
  const getExamStatus = (exam) => {
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);

    if (exam.isAttempted) {
      return { status: "COMPLETED", label: "Completed", variant: "success", icon: CheckCircle };
    }

    if (currentTime < start) {
      return { status: "UPCOMING", label: "Upcoming", variant: "info", icon: Calendar };
    }

    if (currentTime > end) {
      return { status: "MISSED", label: "Expired", variant: "danger", icon: AlertCircle };
    }

    if (currentTime >= start && currentTime <= end && exam.isExamContinue) {
      return { status: "ACTIVE", label: "Attempt Now", variant: "primary", icon: PlayCircle };
    }

    // Fallback if examContinue is false but time is valid (e.g., paused by teacher)
    return { status: "PAUSED", label: "Paused", variant: "warning", icon: AlertCircle };
  };

  const handleAttempt = (examId) => {
    // Navigate to Introduction Page
    navigate(`/student/exam/${examId}/intro`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid p-4">
      
      {/* --- HEADER --- */}
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: "#1C437F" }}>My Exams</h3>
        <p className="text-muted mb-0">View your assigned tests and attempt active ones.</p>
      </div>

      {/* --- EXAM LIST --- */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Class</th>
                <th className="py-3">Test Name</th>
                <th className="py-3">Duration</th>
                <th className="py-3">Availability Window</th>
                <th className="py-3 text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STUDENT_EXAMS.length > 0 ? (
                MOCK_STUDENT_EXAMS.map((exam) => {
                  const { status, label, variant, icon: Icon } = getExamStatus(exam);
                  
                  return (
                    <tr key={exam.id}>
                      {/* Class Name */}
                      <td className="ps-4">
                         <div className="d-flex align-items-center gap-2 text-dark">
                            <div className="bg-light p-2 rounded-circle text-primary">
                                <School size={16} />
                            </div>
                            <span className="fw-semibold">{exam.className}</span>
                         </div>
                      </td>

                      {/* Test Name */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                            <BookOpen size={16} className="text-muted" />
                            <span className="fw-medium">{exam.testName}</span>
                        </div>
                      </td>

                      {/* Time Limit */}
                      <td>
                        <Badge bg="light" className="text-dark border fw-normal px-2 py-1">
                           <Clock size={12} className="me-1 mb-1" />
                           {exam.timeLimit} mins
                        </Badge>
                      </td>

                      {/* Date Window */}
                      <td>
                         <div className="d-flex flex-column small text-muted">
                            <div>Start: {formatDate(exam.startDate)}</div>
                            <div>End: {formatDate(exam.endDate)}</div>
                         </div>
                      </td>

                      {/* ACTION BUTTON */}
                      <td className="text-end pe-4">
                        {status === "ACTIVE" ? (
                          <Button 
                            variant={variant} 
                            size="sm" 
                            className="d-flex align-items-center gap-2 ms-auto px-3 fw-bold shadow-sm"
                            style={{ backgroundColor: "#1C437F", borderColor: "#1C437F" }}
                            onClick={() => handleAttempt(exam.id)}
                          >
                            <Icon size={16} />
                            {label}
                          </Button>
                        ) : (
                          <div className="d-flex justify-content-end">
                             <Badge 
                                bg={variant} 
                                className={`d-flex align-items-center gap-1 px-3 py-2 fw-medium bg-opacity-75`}
                             >
                                <Icon size={14} />
                                {label}
                             </Badge>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No exams assigned to you yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentExams;