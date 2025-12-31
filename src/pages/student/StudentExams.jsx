import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, Clock, Calendar, PlayCircle, 
  CheckCircle, AlertCircle, School
} from "lucide-react";
import { Card, Table, Button, Badge, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance"; 
import toast from 'react-hot-toast';

const StudentExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch exams on component mount
  useEffect(() => {
    fetchMyExams();
    
    // Update time every minute to keep statuses accurate for the UI
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Fetches assigned exams from the backend.
   * Based on the Enrollment model to find classes the student belongs to.
   */
  const fetchMyExams = async () => {
    try {
      setIsLoading(true);
      // Calls router.get('/my-exams', protect, getMyExams);
      const res = await axiosInstance.get('/student/my-exams');
      if (res.data.success) {
        setExams(res.data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logic to determine the visual status of an exam based on the time window
   * and the student's attempt history.
   */
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

    // Active window and not yet attempted
    if (currentTime >= start && currentTime <= end && exam.isExamContinue) {
      return { status: "ACTIVE", label: "Attempt Now", variant: "primary", icon: PlayCircle };
    }

    // Default to paused if time window is valid but isExamContinue is false
    return { status: "PAUSED", label: "Paused", variant: "warning", icon: AlertCircle };
  };

  const handleAttempt = (examId) => {
    // Navigates to the intro page for the specific exam
    navigate(`/student/exam/${examId}/intro`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

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
              {exams.length > 0 ? (
                exams.map((exam) => {
                  const { status, label, variant, icon: Icon } = getExamStatus(exam);
                  
                  return (
                    <tr key={exam.assignmentId || exam.id}>
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

                      {/* Time Limit from Exam Model */}
                      <td>
                        <Badge bg="light" className="text-dark border fw-normal px-2 py-1">
                           <Clock size={12} className="me-1 mb-1" />
                           {exam.timeLimit} mins
                        </Badge>
                      </td>

                      {/* Start/End Windows from AssignedExam Model */}
                      <td>
                         <div className="d-flex flex-column small text-muted">
                            <div>Start: {formatDate(exam.startDate)}</div>
                            <div>End: {formatDate(exam.endDate)}</div>
                         </div>
                      </td>

                      {/* Action Button: Dynamic based on status */}
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
                    No exams assigned to you yet. Check your class enrollment.
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