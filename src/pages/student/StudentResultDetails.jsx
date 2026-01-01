import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  BarChart3,
  Percent,
  Clock,
  BookOpen,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { 
  Container, Card, Form, Button, Badge, 
  Spinner, Row, Col, ProgressBar, 
  Accordion, Tooltip, OverlayTrigger
} from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";
import toast from 'react-hot-toast';

const StudentResultDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

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

  // Calculate statistics
  const calculateStats = () => {
    if (!resultData?.responses) return null;
    
    const totalQuestions = resultData.responses.length;
    const correctAnswers = resultData.responses.filter(q => q.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    return { totalQuestions, correctAnswers, incorrectAnswers, accuracy };
  };

  const stats = calculateStats();

  // Categorize questions by type
  const categorizeQuestions = () => {
    const categories = {
      multipleChoice: [],
      multipleSelect: [],
      descriptive: []
    };

    resultData?.responses?.forEach(resp => {
      if (resp.type === "radio") {
        categories.multipleChoice.push(resp);
      } else if (resp.type === "checkbox") {
        categories.multipleSelect.push(resp);
      } else if (resp.type === "open end") {
        categories.descriptive.push(resp);
      }
    });

    return categories;
  };

  const categories = categorizeQuestions();

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "danger";
  };

  const getScoreVariant = (isCorrect) => {
    return isCorrect ? "success" : "danger";
  };

  const getQuestionTypeIcon = (type) => {
    switch(type) {
      case "radio": return <BookOpen size={14} className="me-1" />;
      case "checkbox": return <BarChart3 size={14} className="me-1" />;
      case "open end": return <HelpCircle size={14} className="me-1" />;
      default: return null;
    }
  };

  const renderAnswerIndicator = (resp) => {
    if (!resp.options || resp.options.length === 0) {
      return (
        <Badge bg={resp.isCorrect ? "success" : "danger"} className="ms-2">
          {resp.isCorrect ? "Correct" : "Incorrect"}
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading detailed results...</p>
      </div>
    </div>
  );

  if (!resultData) return (
    <div className="text-center p-5">
      <AlertCircle size={48} className="text-muted mb-3" />
      <h5 className="text-muted">No result data found</h5>
      <Button variant="outline-primary" onClick={handleGoBack}>
        Go Back
      </Button>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom sticky-top" style={{ zIndex: 1020 }}>
        <Container className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <Button 
                variant="outline-primary" 
                onClick={handleGoBack}
                className="d-flex align-items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </Button>
              <div className="vr"></div>
              <div>
                <h4 className="fw-bold mb-0">{resultData.exam?.title || "Assessment"}</h4>
                <small className="text-muted">
                  {resultData.className} • {resultData.exam?.subject || "Subject"}
                </small>
              </div>
            </div>
            <div className="text-end">
              <Badge bg={getScoreColor(resultData.percentage)} className="px-3 py-2 fs-5">
                <Percent size={16} className="me-1" />
                {resultData.percentage?.toFixed(1)}%
              </Badge>
              <div className="text-muted small mt-1">
                Score: {resultData.obtainedMarks}/{resultData.totalMarks}
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Stats Overview */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <Award size={32} className="text-primary mb-2" />
                <h3 className="fw-bold">{stats?.correctAnswers || 0}</h3>
                <p className="text-muted mb-0">Correct Answers</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <XCircle size={32} className="text-danger mb-2" />
                <h3 className="fw-bold">{stats?.incorrectAnswers || 0}</h3>
                <p className="text-muted mb-0">Incorrect Answers</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <BarChart3 size={32} className="text-warning mb-2" />
                <h3 className="fw-bold">{stats?.accuracy?.toFixed(1)}%</h3>
                <p className="text-muted mb-0">Accuracy</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <TrendingUp size={32} className="text-success mb-2" />
                <h3 className="fw-bold">{resultData.status}</h3>
                <p className="text-muted mb-0">Status</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Progress Bar */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-semibold">Overall Performance</span>
              <span className="fw-bold">{resultData.percentage?.toFixed(1)}%</span>
            </div>
            <ProgressBar 
              now={resultData.percentage} 
              variant={getScoreColor(resultData.percentage)}
              className="rounded-pill"
              style={{ height: "10px" }}
            />
            <div className="d-flex justify-content-between mt-2">
              <small className="text-muted">0%</small>
              <small className="text-muted">50%</small>
              <small className="text-muted">100%</small>
            </div>
          </Card.Body>
        </Card>

        {/* Question Types Navigation */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          <Button
            variant={activeSection === "overview" ? "primary" : "outline-primary"}
            onClick={() => setActiveSection("overview")}
            className="rounded-pill"
          >
            All Questions ({resultData.responses?.length || 0})
          </Button>
          {categories.multipleChoice.length > 0 && (
            <Button
              variant={activeSection === "mcq" ? "primary" : "outline-primary"}
              onClick={() => setActiveSection("mcq")}
              className="rounded-pill"
            >
              Multiple Choice ({categories.multipleChoice.length})
            </Button>
          )}
          {categories.multipleSelect.length > 0 && (
            <Button
              variant={activeSection === "msq" ? "primary" : "outline-primary"}
              onClick={() => setActiveSection("msq")}
              className="rounded-pill"
            >
              Multiple Select ({categories.multipleSelect.length})
            </Button>
          )}
          {categories.descriptive.length > 0 && (
            <Button
              variant={activeSection === "descriptive" ? "primary" : "outline-primary"}
              onClick={() => setActiveSection("descriptive")}
              className="rounded-pill"
            >
              Descriptive ({categories.descriptive.length})
            </Button>
          )}
        </div>

        {/* Questions Section */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {(activeSection === "overview" 
              ? resultData.responses 
              : categories[activeSection === "mcq" ? "multipleChoice" : 
                          activeSection === "msq" ? "multipleSelect" : "descriptive"]
            )?.map((resp, index) => (
              <div 
                key={resp._id || index} 
                className={`p-4 ${index > 0 ? 'border-top' : ''}`}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <Badge 
                      bg="light" 
                      text="dark" 
                      className="px-3 py-2 border"
                    >
                      Q{index + 1}
                    </Badge>
                    <div>
                      <h6 className="fw-bold mb-1">{resp.questionText}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="light" text="dark" className="border">
                          {getQuestionTypeIcon(resp.type)}
                          {resp.type === "radio" ? "MCQ" : 
                           resp.type === "checkbox" ? "MSQ" : 
                           "Descriptive"}
                        </Badge>
                        {renderAnswerIndicator(resp)}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    bg={getScoreVariant(resp.isCorrect)} 
                    className="px-3 py-2"
                  >
                    {resp.obtainedMarks}/{1}
                  </Badge>
                </div>

                {/* Options for MCQs */}
                {resp.options && resp.options.length > 0 && (
                  <div className="ms-4">
                    <p className="text-muted small mb-2">Options:</p>
                    <div className="d-flex flex-column gap-2">
                      {resp.options.map((option, optIndex) => {
                        const isSelected = Array.isArray(resp.userAnswer) 
                          ? resp.userAnswer.includes(option) 
                          : resp.userAnswer === option;
                        const isCorrect = Array.isArray(resp.correctAnswer) 
                          ? resp.correctAnswer.includes(option) 
                          : resp.correctAnswer === option;
                        
                        return (
                          <div 
                            key={optIndex}
                            className={`d-flex align-items-center p-3 rounded border ${
                              isCorrect ? 'border-success bg-success bg-opacity-10' :
                              isSelected && !isCorrect ? 'border-danger bg-danger bg-opacity-10' :
                              'border-light bg-light'
                            }`}
                          >
                            <Form.Check 
                              type={resp.type === "checkbox" ? "checkbox" : "radio"}
                              checked={isSelected}
                              disabled
                              className="me-3"
                            />
                            <span className="flex-grow-1">{option}</span>
                            {isCorrect && (
                              <CheckCircle size={18} className="text-success" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle size={18} className="text-danger" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* User Answer and Correct Answer */}
                <Row className="mt-3 ms-2">
                  <Col md={6}>
                    <Card className="border h-100">
                      <Card.Body>
                        <Card.Subtitle className="text-muted small mb-2">
                          Your Answer
                        </Card.Subtitle>
                        <p className={`mb-0 ${!resp.userAnswer ? 'text-muted fst-italic' : ''}`}>
                          {resp.userAnswer || "No answer provided"}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className={`border ${resp.isCorrect ? 'border-success' : 'border-warning'} h-100`}>
                      <Card.Body>
                        <Card.Subtitle className="text-muted small mb-2">
                          {resp.isCorrect ? "Correct Answer ✓" : "Expected Answer"}
                        </Card.Subtitle>
                        <p className="mb-0 fw-semibold">
                          {resp.correctAnswer || "Not available"}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Feedback */}
                {!resp.isCorrect && resp.type === "open end" && (
                  <div className="mt-3 ms-2">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          AI has evaluated your answer against expected criteria
                        </Tooltip>
                      }
                    >
                      <Badge bg="info" className="mb-2">
                        <AlertCircle size={12} className="me-1" />
                        AI Graded Response
                      </Badge>
                    </OverlayTrigger>
                  </div>
                )}
              </div>
            ))}
          </Card.Body>
        </Card>

        {/* Summary Card */}
        <Card className="border-0 shadow-sm mt-4" bg="light">
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6 className="fw-bold mb-3">Performance Summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Questions:</span>
                  <span className="fw-bold">{stats?.totalQuestions || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Correct Answers:</span>
                  <span className="fw-bold text-success">{stats?.correctAnswers || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Incorrect Answers:</span>
                  <span className="fw-bold text-danger">{stats?.incorrectAnswers || 0}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Accuracy:</span>
                  <span className="fw-bold">{stats?.accuracy?.toFixed(1)}%</span>
                </div>
              </Col>
              <Col md={6} className="d-flex align-items-center">
                <div className="text-center w-100">
                  <div className="display-4 fw-bold text-primary">
                    {resultData.percentage?.toFixed(1)}%
                  </div>
                  <p className="text-muted mb-0">Final Score</p>
                  <Badge bg={getScoreColor(resultData.percentage)} className="mt-2">
                    {resultData.status}
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button 
            variant="outline-primary" 
            onClick={handleGoBack}
            className="px-4"
          >
            Back to Results
          </Button>
          <Button 
            variant="primary"
            onClick={() => window.print()}
            className="px-4"
          >
            Download Report
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default StudentResultDetails;