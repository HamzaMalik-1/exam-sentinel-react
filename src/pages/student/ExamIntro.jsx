import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Clock, HelpCircle, AlertTriangle, User, Briefcase, ShieldAlert, CheckCircle, RefreshCw
} from "lucide-react";
import { Card, Button, Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";
import toast from 'react-hot-toast';

const ExamIntro = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ UI State for real-time feedback
  const [extensionsDetected, setExtensionsDetected] = useState(false);
  const [detectedList, setDetectedList] = useState([]);
  const [isChecking, setIsChecking] = useState(true);
  
  const observerRef = useRef(null);

  const HARD_CODED_GUIDELINES = [
    "Make sure you have a stable internet connection.",
    "Do not refresh the browser during the test.",
    "Extensions/Plugins must be disabled for security.",
    "Test will auto-submit when time expires.",
    "Do not switch tabs or windows."
  ];

  // 1. Define Rules globally for reuse in both Interval and handleStart
  const EXTENSION_RULES = [
    { 
      name: "Grammarly", 
      selector: 'grammarly-desktop-integration, grammarly-extension, grammarly-popups, [data-grammarly-shadow-root="true"]' 
    },
    { 
      name: "AI/ChatGPT Assistant", 
      selector: '.ai-assistant, [id*="ai-sidebar"], [class*="chatgpt"], #chatgpt-helper, sidebar-main' 
    },
    { 
      name: "LanguageTool", 
      selector: 'lt-highlighter, lt-mirror, lt-div, .lt-toolbar' 
    },
    { 
      name: "Screen Recorder", 
      selector: '[id*="nimbus"], [id*="loom-companion"], .screen-record-status, loom-container' 
    }
  ];

  // 2. The Core Detection Logic (Returns boolean for synchronous checks)
  const runSecurityScan = () => {
    let found = [];
    
    // Layer A: Check DOM Elements for fingerprints
    EXTENSION_RULES.forEach(rule => {
      if (document.querySelector(rule.selector)) {
        found.push(rule.name);
      }
    });

    // Layer B: Check Body Attributes (Crucial for catching Grammarly Desktop)
    const body = document.body;
    if (
        body.hasAttribute('data-gr-ext-installed') || 
        body.hasAttribute('data-new-gr-c-s-check-loaded') ||
        body.hasAttribute('data-gr-ext-disabled') ||
        body.classList.contains('gr-contextmenu')
    ) {
        if (!found.includes("Grammarly")) found.push("Grammarly");
    }

    // Layer C: Update States for UI feedback
    const isIllegal = found.length > 0;
    setExtensionsDetected(isIllegal);
    setDetectedList([...new Set(found)]);
    setIsChecking(false);

    return isIllegal;
  };

  useEffect(() => {
    fetchExamInfo();
    runSecurityScan();

    // ✅ RECURRING CHECK: Runs every 1 second
    // Ensures that re-enabling an extension locks the UI almost instantly
    const scannerId = setInterval(() => {
        runSecurityScan();
    }, 1000);

    // ✅ REAL-TIME MONITORING: Reacts to DOM injections
    observerRef.current = new MutationObserver(() => {
      runSecurityScan();
    });

    observerRef.current.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      clearInterval(scannerId);
    };
  }, [id]);

  const fetchExamInfo = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/student/exam-info/${id}`);
      if (res.data.success) {
        setExamData(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load exam details.");
      navigate("/student/exams"); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    // ✅ HARD SYNC CHECK: Final gatekeeper
    // Executes a fresh scan at the exact millisecond of the click
    const isSecurityViolation = runSecurityScan();

    if (isSecurityViolation) {
      toast.error(`Security Violation! Disable: ${detectedList.join(", ")}`);
      return;
    }

    // Only proceed if the environment is strictly clean
    navigate(`/student/exam/${id}/start`); 
  };

  if (isLoading) return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container style={{ maxWidth: "900px" }}>
        
        {/* ✅ THE BAIT: These force Grammarly/AI to "wake up" and inject code */}
        <div style={{ position: 'absolute', opacity: 0, height: 0, overflow: 'hidden' }}>
            <textarea defaultValue="Triggering extension scan..." />
            <input type="text" defaultValue="Security verification..." />
        </div>

        {/* --- SECURITY STATUS ALERT --- */}
        <Alert variant={extensionsDetected ? "danger" : "success"} className="mb-4 shadow-sm border-0 rounded-4">
          <div className="d-flex align-items-center gap-3">
            {extensionsDetected ? <ShieldAlert size={32} /> : <CheckCircle size={32} />}
            <div className="flex-grow-1">
              <Alert.Heading className="fs-5 mb-1 fw-bold">
                {extensionsDetected ? "Security Violation: Prohibited Tools" : "Environment Verified"}
              </Alert.Heading>
              <p className="mb-0 small">
                {extensionsDetected 
                  ? `Detected: ${detectedList.join(", ")}. Disable these extensions to continue.` 
                  : "No prohibited extensions detected. System is secure for assessment."}
              </p>
            </div>
            {extensionsDetected && (
                <Button variant="danger" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw size={14} className="me-1" /> Rescan Now
                </Button>
            )}
          </div>
        </Alert>

        <div className="text-center mb-5">
          <h2 className="fw-bold mb-2">Technical Assessment</h2>
          <div className="d-inline-flex align-items-center gap-2 bg-white px-4 py-2 rounded-pill shadow-sm mt-3">
            <User size={20} className="text-primary" />
            <span className="fw-semibold text-dark">{examData.studentName}</span> 
          </div>
        </div>

        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
             <div className="d-flex align-items-center gap-2 text-primary">
                <Briefcase size={20} />
                <h5 className="fw-bold mb-0">Test Details</h5>
             </div>
          </Card.Header>
          <Card.Body className="px-4 pb-4">
             <div className="mt-2">
                <h4 className="fw-bold text-dark mb-1">{examData.title}</h4>
                <p className="text-muted mb-0">{examData.subject}</p>
             </div>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4">
             <Row className="g-3 mb-4">
                <Col md={6}>
                   <div className="p-3 rounded-3 bg-light border">
                      <div className="d-flex align-items-center gap-3">
                         <div className="p-2 rounded-circle bg-primary text-white"><Clock size={24} /></div>
                         <div>
                            <h6 className="text-muted mb-0 small text-uppercase fw-bold">Time Limit</h6>
                            <h4 className="fw-bold mb-0 text-dark">{examData.timeLimit} mins</h4>
                         </div>
                      </div>
                   </div>
                </Col>
                <Col md={6}>
                   <div className="p-3 rounded-3 bg-light border">
                      <div className="d-flex align-items-center gap-3">
                         <div className="p-2 rounded-circle bg-primary text-white"><HelpCircle size={24} /></div>
                         <div>
                            <h6 className="text-muted mb-0 small text-uppercase fw-bold">Questions</h6>
                            <h4 className="fw-bold mb-0 text-dark">{examData.totalQuestions}</h4>
                         </div>
                      </div>
                   </div>
                </Col>
             </Row>

             <h6 className="fw-bold mb-3">Guidelines</h6>
             <ul className="list-unstyled text-secondary">
                {HARD_CODED_GUIDELINES.map((guideline, index) => (
                  <li key={index} className="d-flex align-items-start gap-2 mb-2">
                    <div className="mt-2 bg-secondary rounded-circle" style={{ width: "6px", height: "6px", minWidth: "6px" }}></div>
                    <span>{guideline}</span>
                  </li>
                ))}
             </ul>
          </Card.Body>
        </Card>

        {/* --- DYNAMIC START BUTTON --- */}
        <Card className={`border-0 shadow-sm rounded-4 text-center py-5 ${extensionsDetected ? 'bg-light' : 'bg-white'}`}>
            <Card.Body>
              <h4 className="fw-bold mb-2">Ready to Begin?</h4>
              <p className="text-muted mb-4">
                {extensionsDetected 
                    ? "The assessment is locked. Please turn off extensions to proceed." 
                    : "Once started, the timer cannot be paused."}
              </p>
              
              <Button 
                size="lg" 
                className="px-5 py-2 fw-bold shadow-sm"
                variant={extensionsDetected ? "secondary" : "primary"}
                style={{ 
                    backgroundColor: !extensionsDetected ? "#1C437F" : "#6c757d", 
                    borderColor: !extensionsDetected ? "#1C437F" : "#6c757d",
                    cursor: extensionsDetected ? "not-allowed" : "pointer"
                }}
                onClick={handleStart}
                disabled={extensionsDetected || isChecking}
              >
                {isChecking ? "Scanning..." : extensionsDetected ? "Security Block" : "Start Assessment"}
              </Button>
            </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ExamIntro;