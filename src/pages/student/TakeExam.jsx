import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Timer, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { Container, Row, Col, Card, Button, Form, Modal, Spinner, Badge } from "react-bootstrap";
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
    // Passing true to indicate an automated submission
    handleSubmitExam(true);
  };

  const handleAnswerChange = (qId, type, value, isChecked = false) => {
    setAnswers((prev) => {
      if (type === "checkbox") {
        const currentAnswers = prev[qId] || [];
        return isChecked 
          ? { ...prev, [qId]: [...currentAnswers, value] }
          : { ...prev, [qId]: currentAnswers.filter((item) => item !== value) };
      }
      return { ...prev, [qId]: value };
    });
  };

  const handleSubmitExam = async (autoSubmit = false) => {
    // Prevent double submission
    if (isSubmitted) return;

    try {
      const payload = {
        examId: id,
        // ✅ Ensure classId is passed from the fetched examData to satisfy Result schema
        classId: examData.classId, 
        answers: answers
      };

      const res = await axiosInstance.post('/student/submit-exam', payload);

      if (res.data.success) {
        setIsSubmitted(true);
        setShowSubmitModal(false);
        toast.success("Assessment submitted successfully!");
        // Redirect back to list where status will now show "Completed"
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
      {/* --- STICKY HEADER --- */}
      <div className="bg-white shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 1020 }}>
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

      {/* --- QUESTION BODY --- */}
      <Container className="py-4 flex-grow-1" style={{ maxWidth: "900px" }}>
        {Object.entries(groupedQuestions).map(([sectionTitle, questions], sIdx) => (
          <div key={sectionTitle} className="mb-5">
            <h5 className="fw-bold text-uppercase mb-3 ps-2" style={{ borderLeft: "4px solid #1C437F", color: "#1C437F" }}>{sectionTitle}</h5>
            {questions.map((q, qIdx) => (
              <Card key={q.id} className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body className="p-4">
                  <h6 className="fw-semibold mb-3 lh-base">
                    <span className="text-muted me-2">{sIdx + 1}.{qIdx + 1}</span>
                    {q.question}
                  </h6>
                  {q.type === "radio" && q.options.map(opt => (
                    <Form.Check key={opt} type="radio" id={`${q.id}-${opt}`} label={opt} name={q.id} checked={answers[q.id] === opt} onChange={() => handleAnswerChange(q.id, "radio", opt)} />
                  ))}
                  {q.type === "checkbox" && q.options.map(opt => (
                    <Form.Check key={opt} type="checkbox" id={`${q.id}-${opt}`} label={opt} name={q.id} checked={answers[q.id]?.includes(opt) || false} onChange={(e) => handleAnswerChange(q.id, "checkbox", opt, e.target.checked)} />
                  ))}
                  {q.type === "open end" && <Form.Control as="textarea" rows={3} value={answers[q.id] || ""} onChange={(e) => handleAnswerChange(q.id, "open end", e.target.value)} />}
                </Card.Body>
              </Card>
            ))}
          </div>
        ))}
        <div className="text-end py-4">
           <Button size="lg" className="px-5 py-2 shadow fw-bold border-0" style={{ backgroundColor: "#1C437F" }} onClick={() => setShowSubmitModal(true)}>Submit Assessment</Button>
        </div>
      </Container>

      {/* --- CONFIRMATION MODAL --- */}
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

      {/* --- AUTO-SUBMIT / TIME UP MODAL --- */}
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