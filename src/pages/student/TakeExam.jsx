import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Clock, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Timer
} from "lucide-react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
// import { toast } from "react-hot-toast"; 

// --- MOCK DATA ---
const MOCK_EXAM_DATA = {
  id: 101,
  title: "Mid-Term React Assessment",
  duration: 60, // minutes
  studentName: "Ali Khan",
  studentId: "ST-2024-001",
  logoUrl: "https://via.placeholder.com/150",
  questions: [
    { id: "q1", type: "radio", question: "What is the primary purpose of React?", options: ["To build mobile apps", "To build user interfaces", "To manage databases"] },
    { id: "q2", type: "radio", question: "Which hook is used for side effects?", options: ["useState", "useEffect", "useReducer"] },
    { id: "q3", type: "checkbox", question: "Select features of React.", options: ["Virtual DOM", "Two-way binding", "Component-based", "MVC Pattern"] },
    { id: "q4", type: "checkbox", question: "Which of these are valid React Hooks?", options: ["useHistory", "useState", "useFetch", "useContext"] },
    { id: "q5", type: "open end", question: "Explain the Virtual DOM in one sentence." },
    { id: "q6", type: "open end", question: "What is the difference between Props and State?" }
  ]
};

const TakeExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- STATE ---
  const [timeLeft, setTimeLeft] = useState(MOCK_EXAM_DATA.duration * 60); 
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- GROUP QUESTIONS BY TYPE ---
  const groupedQuestions = MOCK_EXAM_DATA.questions.reduce((groups, question) => {
    const typeLabel = question.type === "open end" ? "Descriptive Questions" 
                    : question.type === "checkbox" ? "Multiple Selection" 
                    : "Multiple Choice";
    
    if (!groups[typeLabel]) groups[typeLabel] = [];
    groups[typeLabel].push(question);
    return groups;
  }, {});

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isSubmitted) return;

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted]);

  // --- HANDLERS ---
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
      } else {
        return { ...prev, [qId]: value };
      }
    });
  };

  const handleSubmitExam = (autoSubmit = false) => {
    setIsSubmitted(true);
    setShowSubmitModal(false);
    
    const payload = {
      examId: id,
      studentId: MOCK_EXAM_DATA.studentId,
      timeTaken: MOCK_EXAM_DATA.duration * 60 - timeLeft,
      answers: answers
    };

    console.log("Submitting Payload:", payload);

    if (autoSubmit) {
       // logic
    } else {
       // logic
    }
  };

  // --- FORMATTERS ---
  const formatTime = (seconds) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 300) return "#dc3545"; 
    if (timeLeft < 900) return "#ffc107"; 
    return "#FF8D28"; 
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      
      {/* --- STICKY HEADER --- */}
      {/* 1. position: 'sticky' -> Sticks to top of scroll container 
          2. top: 0 -> Sticks exactly at the top
          3. zIndex: 100 -> Floats above question cards
      */}
      <div className="bg-white shadow-sm w-75" style={{ position: 'fixed', top: 75, zIndex: 100 }}>
        <Container fluid className="py-2 px-4">
          <Row className="align-items-center">
            {/* Left: User Info */}
            <Col md={4} className="d-flex align-items-center gap-3">
              <div className="bg-light rounded-circle p-2 text-primary border">
                 <User size={24} />
              </div>
              <div style={{ lineHeight: "1.2" }}>
                 <h6 className="fw-bold m-0 text-primary">{MOCK_EXAM_DATA.studentName}</h6>
                 <small className="text-muted">{MOCK_EXAM_DATA.title}</small>
                 <div className="d-flex align-items-center gap-3 mt-1 small text-secondary">
                    <span><Calendar size={12} /> {new Date().toLocaleDateString()}</span>
                    <span><Clock size={12} /> {MOCK_EXAM_DATA.duration} mins</span>
                 </div>
              </div>
            </Col>

            {/* Center: Placeholder */}
            <Col md={4} className="text-center d-none d-md-block">
            </Col>

            {/* Right: Timer */}
            <Col md={4} className="d-flex justify-content-end">
               <div 
                 className="px-4 py-2 rounded-pill d-flex align-items-center gap-2 text-white shadow"
                 style={{ backgroundColor: getTimerColor(), transition: "background 0.5s" }}
               >
                  <Timer size={20} />
                  <span className="fw-bold fs-5" style={{ minWidth: "60px", textAlign: "center" }}>
                    {formatTime(timeLeft)}
                  </span>
               </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* --- EXAM BODY --- */}
      {/* Removed the large marginTop. Sticky header takes up its own space now. */}
      <Container className="py-4 flex-grow-1" style={{ maxWidth: "900px" }}>
        
        {Object.entries(groupedQuestions).map(([sectionTitle, questions], sIdx) => (
          <div key={sectionTitle} className="mb-5">
            <h5 className="fw-bold text-uppercase mb-3 ps-2" style={{ borderLeft: "4px solid #1C437F", color: "#1C437F" }}>
               {sectionTitle}
            </h5>

            {questions.map((q, qIdx) => (
              <Card key={q.id} className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body className="p-4">
                  
                  <h6 className="fw-semibold mb-3 lh-base">
                    <span className="text-muted me-2">{sIdx + 1}.{qIdx + 1}</span> 
                    {q.question}
                  </h6>

                  {/* INPUTS */}
                  {q.type === "radio" && (
                    <div className="d-flex flex-column gap-2 ms-3">
                      {q.options.map((opt) => (
                        <Form.Check 
                          key={opt}
                          type="radio"
                          id={`${q.id}-${opt}`}
                          label={opt}
                          name={q.id}
                          className="custom-radio"
                          checked={answers[q.id] === opt}
                          onChange={(e) => handleAnswerChange(q.id, "radio", opt)}
                        />
                      ))}
                    </div>
                  )}

                  {q.type === "checkbox" && (
                    <div className="d-flex flex-column gap-2 ms-3">
                      {q.options.map((opt) => (
                        <Form.Check 
                          key={opt}
                          type="checkbox"
                          id={`${q.id}-${opt}`}
                          label={opt}
                          name={q.id}
                          checked={answers[q.id]?.includes(opt) || false}
                          onChange={(e) => handleAnswerChange(q.id, "checkbox", opt, e.target.checked)}
                        />
                      ))}
                    </div>
                  )}

                  {q.type === "open end" && (
                     <Form.Control 
                        as="textarea"
                        rows={3}
                        placeholder="Type your answer here..."
                        className="bg-light border-0"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, "open end", e.target.value)}
                     />
                  )}

                </Card.Body>
              </Card>
            ))}
          </div>
        ))}

        {/* SUBMIT BUTTON */}
        <div className="text-end py-4">
           <Button 
             size="lg"
             className="px-5 py-2 shadow fw-bold"
             style={{ backgroundColor: "#1C437F", borderColor: "#1C437F" }}
             onClick={() => setShowSubmitModal(true)}
           >
             Submit Assessment
           </Button>
        </div>

      </Container>

      {/* --- CONFIRMATION MODAL --- */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
         <Modal.Body className="text-center p-5">
            <div className="mb-3 text-primary">
               <CheckCircle size={60} />
            </div>
            <h4 className="fw-bold mb-3">Submit Assessment?</h4>
            <p className="text-muted mb-4">
              Are you sure you want to finish? You cannot change your answers after submitting.
            </p>
            <div className="d-flex justify-content-center gap-3">
               <Button variant="light" className="px-4" onClick={() => setShowSubmitModal(false)}>
                 Cancel
               </Button>
               <Button 
                 className="px-4 text-white" 
                 style={{ backgroundColor: "#1C437F" }}
                 onClick={() => handleSubmitExam(false)}
               >
                 Yes, Submit
               </Button>
            </div>
         </Modal.Body>
      </Modal>

      {/* --- TIME UP MODAL --- */}
      <Modal show={isTimeUp} backdrop="static" keyboard={false} centered>
         <Modal.Body className="text-center p-5">
            <div className="mb-3 text-danger">
               <AlertTriangle size={60} />
            </div>
            <h4 className="fw-bold mb-3">Time's Up!</h4>
            <p className="text-muted mb-4">
              Your exam time has expired. Your answers have been automatically submitted.
            </p>
            <Button 
               className="px-5 text-white" 
               style={{ backgroundColor: "#1C437F" }}
               onClick={() => navigate("/student/dashboard")}
            >
               Return to Dashboard
            </Button>
         </Modal.Body>
      </Modal>

    </div>
  );
};

export default TakeExam;