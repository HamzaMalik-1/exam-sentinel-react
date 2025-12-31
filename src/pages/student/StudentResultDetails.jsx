import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  HelpCircle,
  Info
} from "lucide-react";
import { Container, Card, Form, Button, Badge, Spinner, Row, Col } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";
import toast from 'react-hot-toast';

const StudentResultDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleGoBack = () => {
    const role = localStorage.getItem("userRole"); 
    if (role === "teacher") {
      navigate(-1);
    } else {
      navigate("/student/results");
    }
  };

  useEffect(() => {
    fetchResultDetails();
  }, [id]);

  const fetchResultDetails = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/student/results/${id}`);
      if (res.data.success) {
        setResultData(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load detailed report.");
      handleGoBack();
    } finally {
      setIsLoading(false);
    }
  };

  const groupedQuestions = (resultData?.responses || []).reduce((groups, resp) => {
    const typeLabel = resp.questionType === "open end" || (!resp.options && resp.userAnswer) ? "Descriptive Questions" 
                    : resp.options?.length > 0 && resp.type === "checkbox" ? "Multiple Selection" 
                    : "Multiple Choice";
    if (!groups[typeLabel]) groups[typeLabel] = [];
    groups[typeLabel].push(resp);
    return groups;
  }, {});

  const getScoreColor = (obtained, total) => {
      if (obtained >= total && total > 0) return "success"; 
      if (obtained === 0) return "danger";                  
      return "warning";                                     
  };

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
    </div>
  );

  if (!resultData) return <div className="text-center p-5">No result data found.</div>;

  return (
    <div className="min-vh-100 bg-light pb-5">
      {/* Sticky Header */}
      <div className="text-white shadow sticky-top" style={{ backgroundColor: "#1C437F", zIndex: 1020 }}>
        <Container fluid className="py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
               <Button variant="link" className="text-white p-0 text-decoration-none d-flex align-items-center gap-2" onClick={handleGoBack}>
                  <ArrowLeft size={20} /> <span className="d-none d-md-inline">Back</span>
               </Button>
               <div className="vr bg-white opacity-50 mx-2" style={{ height: '24px' }}></div>
               <h5 className="fw-bold m-0 text-truncate">{resultData.exam?.title || "Assessment Report"}</h5>
            </div>
            <div className="text-end">
               <small className="opacity-75 d-block text-uppercase fw-semibold" style={{ fontSize: "0.7rem" }}>Total Score</small>
               <span className="fw-bold fs-4">
                 {(resultData.obtainedMarks || 0).toFixed(1)} 
                 <span className="fs-6 opacity-75"> / {(resultData.totalMarks || 0).toFixed(1)}</span>
               </span>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-5" style={{ maxWidth: "900px" }}>
        {Object.entries(groupedQuestions).map(([sectionTitle, questions]) => (
          <div key={sectionTitle} className="mb-5">
            <h5 className="fw-bold text-dark mb-3 ps-2" style={{ borderLeft: "4px solid #1C437F" }}>{sectionTitle}</h5>
            
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                  {questions.map((resp, idx) => {
                    const scoreColor = getScoreColor(resp.obtainedMarks, 1); // Assuming 1 mark per question
                    
                    return (
                        <div key={resp._id || idx} className="p-4 bg-white border-bottom">
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                                <h6 className="fw-bold text-dark lh-base mb-0 pt-1">
                                    <span className="text-muted me-2">{String(idx + 1).padStart(2, '0')}</span>
                                    {resp.questionText}
                                </h6>
                                <Badge bg={`${scoreColor}-subtle`} text={scoreColor} className="px-3 py-2 border-0">
                                    {resp.obtainedMarks} / 1
                                </Badge>
                            </div>

                            <div className="ps-md-5 ms-md-2">
                                {/* Logic for Multiple Choice / Selection */}
                                {resp.options && resp.options.length > 0 ? (
                                    <div className="d-flex flex-column gap-2">
                                        {resp.options.map(opt => {
                                            const isSelected = Array.isArray(resp.userAnswer) ? resp.userAnswer.includes(opt) : resp.userAnswer === opt;
                                            const isCorrect = Array.isArray(resp.correctAnswer) ? resp.correctAnswer.includes(opt) : resp.correctAnswer === opt;
                                            
                                            let variantClass = "border-light bg-light text-muted";
                                            if (isCorrect) variantClass = "border-success bg-success bg-opacity-10 text-success fw-bold";
                                            if (isSelected && !isCorrect) variantClass = "border-danger bg-danger bg-opacity-10 text-danger";

                                            return (
                                                <div key={opt} className={`d-flex align-items-center justify-content-between p-2 rounded border ${variantClass}`}>
                                                    <Form.Check 
                                                      type={resp.type === "checkbox" ? "checkbox" : "radio"} 
                                                      label={opt} 
                                                      checked={isSelected} 
                                                      disabled 
                                                      className="mb-0 custom-disabled-check" 
                                                    />
                                                    {isCorrect && <CheckCircle size={16} className="text-success" />}
                                                    {isSelected && !isCorrect && <XCircle size={16} className="text-danger" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Logic for Descriptive (AI Checked) */
                                    <Row className="g-3 mt-1">
                                        <Col md={6}>
                                            <div className="p-3 rounded-3 border bg-white h-100">
                                                <small className="text-uppercase fw-bold text-muted d-block mb-2">Your Answer</small>
                                                <p className="mb-0 small text-dark fst-italic">"{resp.userAnswer || "No answer provided"}"</p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="p-3 rounded-3 border border-success bg-success bg-opacity-10 h-100">
                                                <small className="text-uppercase fw-bold text-success d-block mb-2">AI Suggested Correct Answer</small>
                                                <p className="mb-0 small text-success fw-semibold">{resp.correctAnswer || "Suggested answer not available."}</p>
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                            </div>
                        </div>
                    );
                  })}
                </Card.Body>
            </Card>
          </div>
        ))}
        <div className="text-center mt-5">
          <Button variant="primary" className="px-5 py-2 rounded-pill fw-bold shadow-sm" style={{ backgroundColor: "#1C437F" }} onClick={handleGoBack}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
      
      <style>{`
          .custom-disabled-check .form-check-input:disabled {
              opacity: 1 !important;
              cursor: default;
          }
          .bg-success-subtle { background-color: #d1e7dd !important; }
          .bg-danger-subtle { background-color: #f8d7da !important; }
          .bg-warning-subtle { background-color: #fff3cd !important; }
          .text-success { color: #0f5132 !important; }
          .text-danger { color: #842029 !important; }
          .text-warning { color: #664d03 !important; }
      `}</style>
    </div>
  );
};

export default StudentResultDetails;