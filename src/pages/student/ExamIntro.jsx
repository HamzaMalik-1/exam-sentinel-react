import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Clock, HelpCircle, AlertTriangle, User, Briefcase
} from "lucide-react";
import { Card, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";
import toast from 'react-hot-toast';

const ExamIntro = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ HARD-CODED GUIDELINES
  const HARD_CODED_GUIDELINES = [
    "Make sure you have a stable internet connection.",
    "Do not refresh the browser during the test.",
    "You can navigate between questions freely.",
    "Test will auto-submit when time expires.",
    "Do not switch tabs or windows."
  ];

  useEffect(() => {
    fetchExamInfo();
  }, [id]);

  const fetchExamInfo = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/student/exam-info/${id}`);
      if (res.data.success) {
        setExamData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching exam info:", error);
      toast.error("Failed to load exam details.");
      navigate("/student/exams"); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    navigate(`/student/exam/${id}/start`); 
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container style={{ maxWidth: "900px" }}>
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-2">Welcome to Your Technical Assessment</h2>
          <p className="text-muted">Please review the test details and instructions before beginning.</p>
          
          <div className="d-inline-flex align-items-center gap-2 bg-white px-4 py-2 rounded-pill shadow-sm mt-3">
            <div className="bg-light p-1 rounded-circle">
                <User size={20} className="text-primary" />
            </div>
            <span className="fw-semibold text-dark">{examData.studentName}</span> 
          </div>
        </div>

        {/* --- CARD 1: TEST INFORMATION --- */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
             <div className="d-flex align-items-center gap-2 text-primary">
                <Briefcase size={20} />
                <h5 className="fw-bold mb-0">Test Information</h5>
             </div>
          </Card.Header>
          <Card.Body className="px-4 pb-4">
             <div className="mt-2">
                <h4 className="fw-bold text-dark mb-1">{examData.title}</h4>
                <p className="text-muted mb-0">{examData.subject}</p>
             </div>
          </Card.Body>
        </Card>

        {/* --- CARD 2: INSTRUCTIONS --- */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
             <div className="d-flex align-items-center gap-2 text-primary">
                <AlertTriangle size={20} />
                <h5 className="fw-bold mb-0">Test Instructions</h5>
             </div>
          </Card.Header>
          <Card.Body className="p-4">
             <Row className="g-3 mb-4">
                <Col md={6}>
                   <div className="p-3 rounded-3" style={{ backgroundColor: "#F8F9FA", border: "1px solid #E9ECEF" }}>
                      <div className="d-flex align-items-center gap-3">
                         <div className="p-2 rounded-circle bg-primary text-white">
                            <Clock size={24} />
                         </div>
                         <div>
                            <h6 className="text-muted mb-0 small text-uppercase fw-bold">Time Limit</h6>
                            <h4 className="fw-bold mb-0 text-dark">{examData.timeLimit} <span className="fs-6 fw-normal text-muted">mins</span></h4>
                         </div>
                      </div>
                   </div>
                </Col>
                <Col md={6}>
                   <div className="p-3 rounded-3" style={{ backgroundColor: "#F8F9FA", border: "1px solid #E9ECEF" }}>
                      <div className="d-flex align-items-center gap-3">
                         <div className="p-2 rounded-circle bg-primary text-white">
                            <HelpCircle size={24} />
                         </div>
                         <div>
                            <h6 className="text-muted mb-0 small text-uppercase fw-bold">Total Questions</h6>
                            <h4 className="fw-bold mb-0 text-dark">{examData.totalQuestions}</h4>
                         </div>
                      </div>
                   </div>
                </Col>
             </Row>

             <h6 className="fw-bold mb-3">Important Guidelines</h6>
             <div className="text-secondary mb-0">
                <ul className="list-unstyled">
                  {HARD_CODED_GUIDELINES.map((guideline, index) => (
                    <li key={index} className="d-flex align-items-start gap-2 mb-2">
                      <div className="mt-2 bg-secondary rounded-circle" style={{ width: "6px", height: "6px", minWidth: "6px" }}></div>
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
             </div>
          </Card.Body>
        </Card>

        {/* --- FOOTER: START ACTION --- */}
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
           <Card.Body>
              <h4 className="fw-bold mb-2">Ready to Begin?</h4>
              <p className="text-muted mb-4">Once you start, the timer cannot be paused.</p>
              
              <Button 
                size="lg" 
                className="px-5 py-2 fw-bold shadow-sm text-white"
                style={{ backgroundColor: "#1C437F", borderColor: "#1C437F" }}
                onClick={handleStart}
              >
                Start Assessment
              </Button>
           </Card.Body>
        </Card>

      </Container>
    </div>
  );
};

export default ExamIntro;