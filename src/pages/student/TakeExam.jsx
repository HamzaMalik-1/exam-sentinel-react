import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Timer, CheckCircle, AlertTriangle } from "lucide-react";
import { Container, Row, Col, Card, Button, Form, Modal, Spinner } from "react-bootstrap";
import toast from 'react-hot-toast';
import axiosInstance from "../../api/axiosInstance";

const TakeExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const answersRef = useRef({});
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get(`/student/take-exam/${id}`);
        if (res.data.success) {
          setExamData(res.data.data);
          setTimeLeft(res.data.data.duration * 60);
        }
      } catch (error) {
        toast.error("Failed to load exam details");
        navigate("/student/exams");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [id, navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isSubmitted && examData) {
        toast.error("Tab switch detected! Your exam is being submitted automatically.");
        handleSubmitExam(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
    };
  }, [isSubmitted, examData]);

  useEffect(() => {
    if (isSubmitted || !examData) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted, examData]);

  const handleTimeUp = () => {
    setIsTimeUp(true);
    handleSubmitExam(true);
  };

  const handleAnswerChange = (qId, type, value, isChecked = false) => {
    setAnswers((prev) => {
      if (type === "checkbox") {
        const currentAnswers = prev[qId] || [];
        if (isChecked) {
          return { ...prev, [qId]: [...currentAnswers, value] };
        } else {
          return { ...prev, [qId]: currentAnswers.filter((item) => item !== value) };
        }
      }
      return { ...prev, [qId]: value };
    });
  };

  const handleSubmitExam = async (autoSubmit = false) => {
    if (isSubmitted) return;
    try {
      const payload = {
        examId: id,
        classId: examData.classId, 
        answers: autoSubmit ? answersRef.current : answers 
      };
      const res = await axiosInstance.post('/student/submit-exam', payload);
      if (res.data.success) {
        setIsSubmitted(true);
        setShowSubmitModal(false);
        if (autoSubmit) {
          toast.error("Automated submission successful.");
        } else {
          toast.success("Assessment submitted successfully!");
        }
        navigate("/student/exams");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error(error.response?.data?.message || "Submission failed.");
    }
  };

  const formatTime = (seconds) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const getTimerColor = () => timeLeft < 300 ? "#dc3545" : timeLeft < 900 ? "#ffc107" : "#FF8D28";

  if (isLoading) return <div className="text-center p-5 mt-5"><Spinner animation="border" variant="primary" /></div>;
  if (!examData) return null;

  const groupedQuestions = examData.questions.reduce((groups, question) => {
    const typeLabel = question.type === "open end" ? "Descriptive Questions" 
                    : question.type === "checkbox" ? "Multiple Selection" 
                    : "Multiple Choice";
    if (!groups[typeLabel]) groups[typeLabel] = [];
    groups[typeLabel].push(question);
    return groups;
  }, {});

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <style>{`
        .custom-option {
          transition: all 0.2s ease-in-out;
          border: 2px solid #e9ecef;
          cursor: pointer;
        }
        .custom-option:hover {
          background-color: #f8f9fa;
        }
        .option-selected {
          border-color: #1C437F !important;
          background-color: #eef2f7 !important;
          color: #1C437F !important;
          font-weight: 600;
        }
        /* Make the radio/checkbox larger and darker */
        .form-check-input {
          width: 1.2em;
          height: 1.2em;
          border: 2px solid #adb5bd;
          cursor: pointer;
        }
        .form-check-input:checked {
          background-color: #1C437F;
          border-color: #1C437F;
        }
      `}</style>

      <div className="bg-white shadow-sm sticky-top" style={{ zIndex: 1020 }}>
        <Container fluid className="py-2 px-4">
          <Row className="align-items-center">
            <Col md={4} className="d-flex align-items-center gap-3">
              <div className="bg-light rounded-circle p-2 text-primary border"><User size={24} /></div>
              <div>
                 <h6 className="fw-bold m-0 text-primary">{examData.studentName}</h6>
                 <small className="text-muted">{examData.title}</small>
              </div>
            </Col>
            <Col md={4} className="d-flex justify-content-end offset-md-4">
               <div className="px-4 py-2 rounded-pill d-flex align-items-center gap-2 text-white shadow" style={{ backgroundColor: getTimerColor() }}>
                  <Timer size={20} /><span className="fw-bold fs-5">{formatTime(timeLeft)}</span>
               </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4 flex-grow-1" style={{ maxWidth: "900px" }}>
        {Object.entries(groupedQuestions).map(([sectionTitle, questions], sIdx) => (
          <div key={sectionTitle} className="mb-5">
            <h5 className="fw-bold text-uppercase mb-3 ps-2" style={{ borderLeft: "4px solid #1C437F", color: "#1C437F" }}>{sectionTitle}</h5>
            {questions.map((q, qIdx) => {
              const qKey = q.id || q._id;
              return (
                <Card key={qKey} className="border-0 shadow-sm rounded-4 mb-3">
                  <Card.Body className="p-4">
                    <h6 className="fw-semibold mb-4 lh-base">
                      <span className="text-muted me-2">{sIdx + 1}.{qIdx + 1}</span>
                      {q.question}
                    </h6>
                    
                    {/* RADIO BUTTONS */}
                    {q.type === "radio" && q.options.map((opt, idx) => {
                      const isSelected = answers[qKey] === opt;
                      return (
                        <div key={idx} className={`p-3 rounded-3 mb-2 custom-option ${isSelected ? 'option-selected' : ''}`}>
                          <Form.Check 
                            type="radio" 
                            id={`radio-${qKey}-${idx}`} 
                            label={opt} 
                            name={`q-${qKey}`} 
                            checked={isSelected} 
                            onChange={() => handleAnswerChange(qKey, "radio", opt)} 
                          />
                        </div>
                      );
                    })}

                    {/* CHECKBOXES */}
                    {q.type === "checkbox" && q.options.map((opt, idx) => {
                      const isSelected = answers[qKey]?.includes(opt);
                      return (
                        <div key={idx} className={`p-3 rounded-3 mb-2 custom-option ${isSelected ? 'option-selected' : ''}`}>
                          <Form.Check 
                            type="checkbox" 
                            id={`check-${qKey}-${idx}`} 
                            label={opt} 
                            name={`q-${qKey}-${idx}`} 
                            checked={isSelected || false} 
                            onChange={(e) => handleAnswerChange(qKey, "checkbox", opt, e.target.checked)} 
                          />
                        </div>
                      );
                    })}

                    {/* DESCRIPTIVE */}
                    {q.type === "open end" && (
                      <Form.Control 
                        as="textarea" 
                        rows={4} 
                        className="rounded-3 border-2"
                        value={answers[qKey] || ""} 
                        onChange={(e) => handleAnswerChange(qKey, "open end", e.target.value)} 
                        placeholder="Type your detailed answer here..."
                      />
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        ))}
        <div className="text-end py-4">
           <Button size="lg" className="px-5 py-2 shadow fw-bold border-0" style={{ backgroundColor: "#1C437F" }} onClick={() => setShowSubmitModal(true)}>Submit Assessment</Button>
        </div>
      </Container>

      {/* Confirmation Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Body className="text-center p-5">
          <CheckCircle size={60} className="text-primary mb-3" />
          <h4 className="fw-bold">Submit Assessment?</h4>
          <p className="text-muted">Are you sure? You cannot change answers after submission.</p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="light" className="px-4" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button style={{ backgroundColor: "#1C437F" }} className="text-white px-4 border-0" onClick={() => handleSubmitExam(false)}>Yes, Submit</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Auto-Submit Modal */}
      <Modal show={isTimeUp} backdrop="static" keyboard={false} centered>
        <Modal.Body className="text-center p-5">
          <AlertTriangle size={60} className="text-danger mb-3" />
          <h4 className="fw-bold">Time's Up!</h4>
          <p className="text-muted">Your exam time has expired. Your answers are being submitted automatically.</p>
          <Button style={{ backgroundColor: "#1C437F" }} className="text-white px-5 border-0" onClick={() => navigate("/student/exams")}>Return to Exams</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TakeExam;