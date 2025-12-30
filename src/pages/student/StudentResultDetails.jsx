import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Maximize2,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react";
import { Container, Card, Form, Button, Badge } from "react-bootstrap";

// --- MOCK DATA FOR A COMPLETED EXAM ---
const MOCK_RESULT_DETAIL = {
  id: 101,
  testName: "React.js Proficiency Assessment",
  totalObtained: 21.00,
  totalMax: 40.00,
  questions: [
    // --- RADIO SECTION ---
    { 
      id: "q1", 
      type: "radio", 
      question: "What is the primary purpose of React?", 
      options: ["To build mobile apps", "To manage state in applications", "To build user interfaces", "To handle server-side operations"],
      userAnswer: "To manage state in applications",
      correctAnswer: "To build user interfaces",
      obtained: 0,
      total: 10
    },
    { 
      id: "q2", 
      type: "radio", 
      question: "Which method is used to create components in React?", 
      options: ["createComponent", "createElement", "renderComponent", "buildComponent"],
      userAnswer: "createElement",
      correctAnswer: "createElement",
      obtained: 10,
      total: 10
    },
    
    // --- OPEN END SECTION ---
    { 
      id: "q3", 
      type: "open end", 
      question: "Briefly explain the concept of Virtual DOM.", 
      userAnswer: "It is a lightweight copy of the real DOM...",
      obtained: 5,
      total: 10
    },
    { 
      id: "q4", 
      type: "open end", 
      question: "What is the difference between state and props?", 
      userAnswer: "No answer provided", 
      obtained: 0,
      total: 10
    },

    // --- CHECKBOX SECTION ---
    { 
      id: "q5", 
      type: "checkbox", 
      question: "Which hooks are used for performance optimization?", 
      options: ["useMemo", "useCallback", "useEffect", "useState"],
      userAnswer: ["useMemo", "useCallback"],
      correctAnswer: ["useMemo", "useCallback"],
      obtained: 10,
      total: 10
    }
  ]
};

const StudentResultDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    // Simulate API Fetch
    setTimeout(() => setResultData(MOCK_RESULT_DETAIL), 500); 
  }, [id]);

  if (!resultData) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  // Group questions by type logic
  const groupedQuestions = resultData.questions.reduce((groups, question) => {
    const typeLabel = question.type === "open end" ? "Descriptive Questions" 
                    : question.type === "checkbox" ? "Multiple Selection" 
                    : "Multiple Choice";
    if (!groups[typeLabel]) groups[typeLabel] = [];
    groups[typeLabel].push(question);
    return groups;
  }, {});

  // Helper to determine status color
  const getScoreColor = (obtained, total) => {
      if (obtained === total) return "success";
      if (obtained === 0) return "danger";
      return "warning";
  };

  return (
    <div className="min-vh-100 bg-light pb-5">
      
      {/* --- STICKY HEADER --- */}
      <div 
        className="text-white shadow sticky-top" 
        style={{ backgroundColor: "#1C437F", zIndex: 1020 }}
      >
        <Container fluid className="py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            
            {/* Left: Back & Title */}
            <div className="d-flex align-items-center gap-3">
               <Button 
                  variant="link" 
                  className="text-white p-0 text-decoration-none d-flex align-items-center gap-2" 
                  onClick={() => navigate(-1)}
               >
                  <ArrowLeft size={20} />
                  <span className="d-none d-md-inline">Back</span>
               </Button>
               <div className="vr bg-white opacity-50 mx-2" style={{ height: '24px' }}></div>
               <h5 className="fw-bold m-0 text-truncate" style={{ maxWidth: '300px' }}>
                  {resultData.testName}
               </h5>
            </div>
            
            {/* Right: Score Display */}
            <div className="d-flex align-items-center gap-4">
               <div className="text-end">
                  <small className="opacity-75 d-block text-uppercase fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Total Score</small>
                  <span className="fw-bold fs-4">
                    {resultData.totalObtained.toFixed(1)} <span className="fs-6 opacity-75">/ {resultData.totalMax.toFixed(1)}</span>
                  </span>
               </div>
               <div className="bg-white bg-opacity-10 p-2 rounded-circle cursor-pointer hover-bg-opacity-20 transition">
                  <Maximize2 size={20} className="text-white" />
               </div>
            </div>
          </div>
        </Container>
      </div>

      {/* --- MAIN CONTENT --- */}
      <Container className="py-5" style={{ maxWidth: "900px" }}>
        
        {Object.entries(groupedQuestions).map(([sectionTitle, questions], sIdx) => (
          <div key={sectionTitle} className="mb-5">
            
            {/* Section Header */}
            <div className="d-flex align-items-center mb-3">
                <div className="bg-primary" style={{ width: "4px", height: "24px", borderRadius: "4px" }}></div>
                <h5 className="fw-bold text-dark ms-2 mb-0">{sectionTitle}</h5>
                <Badge bg="light" text="secondary" className="ms-3 border">
                    {questions.length} Questions
                </Badge>
            </div>
            
            {/* Questions Card */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
               <Card.Body className="p-0">
                  {questions.map((q, qIdx) => {
                    const isLast = qIdx === questions.length - 1;
                    const scoreColor = getScoreColor(q.obtained, q.total);

                    return (
                        <div key={q.id} className={`p-4 bg-white ${!isLast ? 'border-bottom' : ''}`}>
                        
                        {/* Question Row */}
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                            <div className="d-flex gap-3">
                                <span className="fw-bold text-muted bg-light rounded px-2 py-1 h-100" style={{ fontSize: "0.9rem" }}>
                                    {String(qIdx + 1).padStart(2, '0')}
                                </span>
                                <h6 className="fw-bold text-dark lh-base mb-0 pt-1">
                                    {q.question}
                                </h6>
                            </div>
                            
                            {/* Score Badge */}
                            <Badge bg={`${scoreColor}-subtle`} text={scoreColor} className="px-3 py-2 border border-0">
                                {q.obtained} / {q.total}
                            </Badge>
                        </div>

                        {/* --- READ ONLY ANSWERS --- */}
                        <div className="ps-md-5 ms-md-2">
                            
                            {/* 1. RADIO (Single Choice) */}
                            {q.type === "radio" && (
                                <div className="d-flex flex-column gap-2">
                                {q.options.map((opt) => {
                                    const isSelected = q.userAnswer === opt;
                                    const isCorrect = q.correctAnswer === opt; // If you have this data
                                    
                                    // Visual Logic
                                    let itemClass = "border-transparent bg-transparent";
                                    let icon = null;

                                    if (isSelected) {
                                        itemClass = "border-primary bg-primary bg-opacity-10 fw-bold text-primary";
                                        icon = <CheckCircle size={16} className="text-primary" />;
                                        if(q.obtained === 0) { // If wrong
                                            itemClass = "border-danger bg-danger bg-opacity-10 fw-bold text-danger";
                                            icon = <XCircle size={16} className="text-danger" />;
                                        }
                                    }

                                    return (
                                        <div 
                                            key={opt} 
                                            className={`d-flex align-items-center justify-content-between p-2 rounded border ${itemClass}`}
                                        >
                                            <Form.Check 
                                                type="radio"
                                                id={`${q.id}-${opt}`}
                                                label={opt}
                                                checked={isSelected}
                                                disabled
                                                className="mb-0 w-100 custom-disabled-check"
                                                style={{ opacity: 1, cursor: "default" }}
                                            />
                                            {icon}
                                        </div>
                                    );
                                })}
                                </div>
                            )}

                            {/* 2. CHECKBOX (Multiple Choice) */}
                            {q.type === "checkbox" && (
                                <div className="d-flex flex-column gap-2">
                                {q.options.map((opt) => {
                                    const isSelected = q.userAnswer?.includes(opt);
                                    
                                    let itemClass = isSelected 
                                        ? "bg-primary bg-opacity-10 border-primary fw-bold text-primary" 
                                        : "bg-light border-light text-muted";

                                    return (
                                        <div key={opt} className={`p-2 rounded border ${itemClass}`}>
                                            <Form.Check 
                                                type="checkbox"
                                                id={`${q.id}-${opt}`}
                                                label={opt}
                                                checked={isSelected}
                                                disabled
                                                className="mb-0 custom-disabled-check"
                                                style={{ opacity: 1 }}
                                            />
                                        </div>
                                    );
                                })}
                                </div>
                            )}

                            {/* 3. TEXT AREA (Open End) */}
                            {q.type === "open end" && (
                                <div className="bg-light p-3 rounded-3 border text-secondary fst-italic mt-2">
                                    <div className="d-flex align-items-start gap-2">
                                        <HelpCircle size={16} className="mt-1 text-muted" />
                                        <span>{q.userAnswer || "No answer provided"}</span>
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

        {/* Footer Action */}
        <div className="text-center mt-5">
           <p className="text-muted mb-3">End of Results</p>
           <Button variant="outline-primary" className="px-4 rounded-pill" onClick={() => navigate(-1)}>
              Go Back to Dashboard
           </Button>
        </div>

      </Container>
      
      {/* Custom Styles for Disabled Inputs */}
      <style>
        {`
            .custom-disabled-check .form-check-input:disabled {
                opacity: 1 !important;
                background-color: transparent; 
                border-color: currentColor; 
            }
            .custom-disabled-check .form-check-input:disabled:checked {
                background-color: currentColor;
            }
        `}
      </style>
    </div>
  );
};

export default StudentResultDetails;