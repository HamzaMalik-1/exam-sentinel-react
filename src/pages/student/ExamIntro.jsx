import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Clock, 
  HelpCircle, 
  Wifi, 
  AlertTriangle, 
  MousePointer, 
  Timer,
  User,
  Briefcase
} from "lucide-react";
import { Card, Button, Container, Row, Col, Badge } from "react-bootstrap";

// --- MOCK DATA ---
// Simulating data you might fetch using the 'id' from the URL
const MOCK_EXAM_DETAILS = {
  101: {
    testName: "Mid-Term Mathematics",
    subject: "Mathematics",
    studentName: "Ali Khan", // In real app, get from Auth Context
    
    timeLimit: 60,
    totalQuestions: 25,
    instructions: [
      "Make sure you have a stable internet connection.",
      "Do not refresh the browser during the test.",
      "You can navigate between questions freely.",
      "Test will auto-submit when time expires.",
      "Do not switch tabs or windows."
    ]
  },
  102: {
    testName: "Physics Fundamentals",
    subject: "Physics",
    studentName: "Ali Khan",
    
    timeLimit: 45,
    totalQuestions: 20,
    instructions: [
        "Make sure you have a stable internet connection.",
        "Do not refresh the browser during the test.",
        "You can navigate between questions freely.",
        "Test will auto-submit when time expires."
      ]
  }
};

const ExamIntro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    const data = MOCK_EXAM_DETAILS[id];
    if (data) {
      setExamData(data);
    } else {
      // Fallback or redirect if invalid ID
      setExamData(MOCK_EXAM_DETAILS[101]); 
    }
  }, [id]);

  if (!examData) return <div className="p-5 text-center">Loading assessment details...</div>;

  const handleStart = () => {
    // Navigate to the actual Exam Interface (Page 1 of questions)
    navigate(`/student/exam/${id}/start`); 
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container style={{ maxWidth: "900px" }}>
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-5">
          {/* Logo Placeholder */}
          <h2 className="fw-bold mb-2">Welcome to Your Technical Assessment</h2>
          <p className="text-muted">Please review the test details and instructions before beginning.</p>
          
          {/* User Badge */}
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
                <h4 className="fw-bold text-dark mb-1">{examData.testName}</h4>
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
             
             {/* Info Boxes */}
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

             {/* Guidelines List */}
             <h6 className="fw-bold mb-3">Important Guidelines</h6>
             <ul className="list-unstyled text-secondary mb-0">
                {examData.instructions.map((inst, idx) => (
                    <li key={idx} className="d-flex align-items-start gap-2 mb-2">
                        <div className="mt-1 bg-secondary rounded-circle" style={{ width: "6px", height: "6px", minWidth: "6px" }}></div>
                        <span>{inst}</span>
                    </li>
                ))}
             </ul>
          </Card.Body>
        </Card>

        {/* --- FOOTER: START ACTION --- */}
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
           <Card.Body>
              <h4 className="fw-bold mb-2">Ready to Begin?</h4>
              <p className="text-muted mb-4">Once you start, the timer cannot be paused.</p>
              
              <Button 
                size="lg" 
                className="px-5 py-2 fw-bold shadow-sm"
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