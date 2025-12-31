import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Maximize2,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react";
import { Container, Card, Form, Button, Badge, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";
import toast from 'react-hot-toast';

const StudentResultDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fixed Navigation Logic
  const handleGoBack = () => {
    // Check if the role is stored as a plain string "teacher" or "student"
    const role = localStorage.getItem("userRole"); 
    
    if (role === "teacher") {
      navigate(-1); // Go back to the Class Results table
    } else {
      navigate("/student/results"); // Go back to student's My Results
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
      console.error("Error fetching result details:", error);
      toast.error("Failed to load detailed report.");
      handleGoBack(); // Fallback navigation on error
    } finally {
      setIsLoading(false);
    }
  };

  const groupedQuestions = (resultData?.questions || resultData?.responses || []).reduce((groups, resp) => {
    const typeLabel = resp.type === "open end" ? "Descriptive Questions" 
                    : resp.type === "checkbox" ? "Multiple Selection" 
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
               <h5 className="fw-bold m-0 text-truncate">{resultData.testName || resultData.exam?.title}</h5>
            </div>
            <div className="text-end">
               <small className="opacity-75 d-block text-uppercase fw-semibold" style={{ fontSize: "0.7rem" }}>Total Score</small>
               <span className="fw-bold fs-4">
                 {(resultData.totalObtained || resultData.obtainedMarks || 0).toFixed(1)} 
                 <span className="fs-6 opacity-75"> / {(resultData.totalMax || resultData.totalMarks || 0).toFixed(1)}</span>
               </span>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-5" style={{ maxWidth: "900px" }}>
        {Object.entries(groupedQuestions).map(([sectionTitle, questions]) => (
          <div key={sectionTitle} className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <div className="bg-primary" style={{ width: "4px", height: "24px", borderRadius: "4px" }}></div>
                <h5 className="fw-bold text-dark ms-2 mb-0">{sectionTitle}</h5>
                <Badge bg="light" text="secondary" className="ms-3 border">{questions.length} Questions</Badge>
            </div>
            
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                  {questions.map((resp, idx) => {
                    const scoreColor = getScoreColor(resp.obtained || resp.obtainedMarks, resp.total || 10);
                    return (
                        <div key={resp._id || idx} className="p-4 bg-white border-bottom">
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                                <h6 className="fw-bold text-dark lh-base mb-0 pt-1">
                                    <span className="text-muted me-2">{String(idx + 1).padStart(2, '0')}</span>
                                    {resp.question || resp.questionText}
                                </h6>
                                <Badge bg={`${scoreColor}-subtle`} text={scoreColor} className="px-3 py-2 border-0">
                                    {resp.obtained ?? resp.obtainedMarks} / {resp.total || 10}
                                </Badge>
                            </div>

                            <div className="ps-md-5 ms-md-2">
                                {(resp.type === "radio" || resp.type === "Multiple Choice") && (
                                    <div className="d-flex flex-column gap-2">
                                        {resp.options?.map(opt => {
                                            const isSelected = resp.userAnswer === opt;
                                            const isCorrect = resp.obtained > 0 || resp.isCorrect;
                                            const isWrong = isSelected && !isCorrect;
                                            return (
                                                <div key={opt} className={`d-flex align-items-center justify-content-between p-2 rounded border ${isSelected ? (isWrong ? 'bg-danger bg-opacity-10 border-danger text-danger' : 'bg-primary bg-opacity-10 border-primary text-primary') : 'border-transparent'}`}>
                                                    <Form.Check type="radio" label={opt} checked={isSelected} disabled className="mb-0 custom-disabled-check" />
                                                    {isSelected && (isWrong ? <XCircle size={16} /> : <CheckCircle size={16} />)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {resp.type === "open end" && (
                                    <div className="bg-light p-3 rounded-3 border text-secondary fst-italic mt-2">
                                        <div className="d-flex align-items-start gap-2">
                                            <HelpCircle size={16} className="mt-1 text-muted" />
                                            <span>{resp.userAnswer || "No answer provided"}</span>
                                        </div>
                                    </div>
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
          <Button variant="outline-primary" className="px-4 rounded-pill" onClick={handleGoBack}>
            Go Back
          </Button>
        </div>
      </Container>
      
      <style>{`
          .custom-disabled-check .form-check-input:disabled {
              opacity: 1 !important;
              cursor: default;
          }
      `}</style>
    </div>
  );
};

export default StudentResultDetails;