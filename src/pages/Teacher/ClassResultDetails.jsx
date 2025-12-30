import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  User, 
  CheckCircle, 
  XCircle, 
  BarChart, 
  Eye 
} from "lucide-react";
import { Card, Table, Form, Badge, InputGroup, Row, Col, Button, ProgressBar } from "react-bootstrap";

// --- MOCK DATA (Simulating Backend) ---
// In a real app, you would fetch this based on 'resultId'
const MOCK_EXAM_META = {
  1: { className: "Grade 10 - A", testName: "Mid-Term Mathematics", date: "2024-10-15", totalMarks: 100 },
  2: { className: "Grade 10 - B", testName: "Mid-Term Mathematics", date: "2024-10-15", totalMarks: 100 },
};

const MOCK_STUDENTS_DATA = [
  { id: 101, rollNo: "R-001", name: "Ali Khan", obtained: 85, status: "Passed" },
  { id: 102, rollNo: "R-002", name: "Sara Ahmed", obtained: 92, status: "Passed" },
  { id: 103, rollNo: "R-003", name: "John Smith", obtained: 45, status: "Failed" },
  { id: 104, rollNo: "R-004", name: "Maria Garcia", obtained: 78, status: "Passed" },
  { id: 105, rollNo: "R-005", name: "Ahmed Raza", obtained: 60, status: "Passed" },
  { id: 106, rollNo: "R-006", name: "Fatima Noor", obtained: 30, status: "Failed" },
  { id: 107, rollNo: "R-007", name: "Bilal Hassam", obtained: 88, status: "Passed" },
];

const ClassResultDetails = () => {
  const { resultId } = useParams(); // Get ID from URL
  const navigate = useNavigate();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");

  // Get Meta Data (Fallbacks if ID not found in mock)
  const examInfo = MOCK_EXAM_META[resultId] || { 
    className: "Unknown Class", 
    testName: "Unknown Test", 
    date: "N/A", 
    totalMarks: 100 
  };

  // --- LOGIC ---
  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS_DATA.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate Stats
  const totalStudents = filteredStudents.length;
  const passedCount = filteredStudents.filter(s => s.status === "Passed").length;
  const failedCount = totalStudents - passedCount;
  const avgScore = totalStudents > 0 
    ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.obtained, 0) / totalStudents) 
    : 0;

  const getPercentage = (obtained) => {
    return Math.round((obtained / examInfo.totalMarks) * 100);
  };

  const getVariant = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "primary";
    return "danger";
  };

  return (
    <div className="container-fluid p-4">
      
      {/* --- HEADER --- */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button 
          variant="light" 
          className="rounded-circle shadow-sm border" 
          style={{ width: "40px", height: "40px", padding: 0 }}
          onClick={() => navigate(-1)} // Go Back
        >
          <ArrowLeft size={20} className="text-secondary" />
        </Button>
        <div>
          <h3 className="fw-bold m-0" style={{ color: "#1C437F" }}>{examInfo.className} Results</h3>
          <p className="text-muted m-0 small">
            {examInfo.testName} • Held on {examInfo.date}
          </p>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                <User size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0">Total Students</h6>
                <h4 className="fw-bold mb-0">{totalStudents}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success">
                <CheckCircle size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0">Passed</h6>
                <h4 className="fw-bold mb-0">{passedCount}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-danger bg-opacity-10 text-danger">
                <XCircle size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0">Failed</h6>
                <h4 className="fw-bold mb-0">{failedCount}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-info bg-opacity-10 text-info">
                <BarChart size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0">Class Average</h6>
                <h4 className="fw-bold mb-0">{avgScore}%</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- STUDENT LIST TABLE --- */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h5 className="fw-bold mb-0">Student List</h5>
            
            {/* Search Bar */}
            <div style={{ maxWidth: "300px", width: "100%" }}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search student..." 
                  className="bg-light border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <Table hover responsive className="align-middle mt-3">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Roll No</th>
                <th className="py-3">Student Name</th>
                <th className="py-3">Marks Obtained</th>
                <th className="py-3">Percentage</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const percentage = getPercentage(student.obtained);
                  return (
                    <tr key={student.id}>
                      <td className="ps-4 fw-medium text-muted">{student.rollNo}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                           <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary fw-bold" style={{width: '32px', height: '32px', fontSize: '12px'}}>
                              {student.name.charAt(0)}
                           </div>
                           <span className="fw-semibold text-dark">{student.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{student.obtained}</span> 
                        <span className="text-muted small"> / {examInfo.totalMarks}</span>
                      </td>
                      <td style={{ width: "20%" }}>
                         <div className="d-flex align-items-center gap-2">
                            <ProgressBar 
                                now={percentage} 
                                variant={getVariant(percentage)} 
                                style={{ height: "6px", width: "100px", borderRadius: "10px" }} 
                            />
                            <span className="small fw-bold">{percentage}%</span>
                         </div>
                      </td>
                      <td>
                        <Badge 
                          bg={student.status === "Passed" ? "success" : "danger"} 
                          className="px-3 py-2 fw-normal bg-opacity-75"
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td className="text-end pe-4">
                        <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 ms-auto">
                          <Eye size={16} /> View Paper
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No students found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ClassResultDetails;