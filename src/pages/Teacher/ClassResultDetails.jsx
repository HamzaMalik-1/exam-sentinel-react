import React, { useState, useMemo, useEffect } from "react";
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
import { Card, Table, Form, Badge, InputGroup, Row, Col, Button, ProgressBar, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";
import toast from 'react-hot-toast';

const ClassResultDetails = () => {
  const { resultId } = useParams(); // This is the Exam ID from the URL
  const navigate = useNavigate();

  // --- STATE ---
  const [data, setData] = useState({ meta: {}, students: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchDetailedResults = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get(`/teacher/class-results/${resultId}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching detailed results:", error);
        toast.error("Failed to load class result details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetailedResults();
  }, [resultId]);

  // --- LOGIC ---
  const filteredStudents = useMemo(() => {
    return (data.students || []).filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data.students]);

  // Dynamic Statistics Calculation
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const passed = filteredStudents.filter(s => s.status === "Passed").length;
    const failed = total - passed;
    const avg = total > 0 
      ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.percentage, 0) / total) 
      : 0;
    return { total, passed, failed, avg };
  }, [filteredStudents]);

  const getVariant = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "primary";
    return "danger";
  };

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="container-fluid p-4">
      
      {/* --- HEADER --- */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button 
          variant="light" 
          className="rounded-circle shadow-sm border" 
          style={{ width: "40px", height: "40px", padding: 0 }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} className="text-secondary" />
        </Button>
        <div>
          <h3 className="fw-bold m-0" style={{ color: "#1C437F" }}>{data.meta.className} Results</h3>
          <p className="text-muted m-0 small">
            {data.meta.testName} • Held on {data.meta.date}
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
                <h6 className="text-muted mb-0 small">Total Students</h6>
                <h4 className="fw-bold mb-0">{stats.total}</h4>
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
                <h6 className="text-muted mb-0 small">Passed</h6>
                <h4 className="fw-bold mb-0">{stats.passed}</h4>
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
                <h6 className="text-muted mb-0 small">Failed</h6>
                <h4 className="fw-bold mb-0">{stats.failed}</h4>
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
                <h6 className="text-muted mb-0 small">Class Average</h6>
                <h4 className="fw-bold mb-0">{stats.avg}%</h4>
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
            <div style={{ maxWidth: "300px", width: "100%" }}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search by name..." 
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
                <th className="py-3 ps-4">Student Name</th>
                <th className="py-3">Marks Obtained</th>
                <th className="py-3">Percentage</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => navigate(`/student/results/${student.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                         <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary fw-bold" style={{width: '32px', height: '32px', fontSize: '12px'}}>
                            {student.name.charAt(0)}
                         </div>
                         <span className="fw-semibold text-dark">{student.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{student.obtained}</span> 
                      <span className="text-muted small"> / {data.meta.totalMarks}</span>
                    </td>
                    <td style={{ width: "20%" }}>
                       <div className="d-flex align-items-center gap-2">
                          <ProgressBar 
                              now={student.percentage} 
                              variant={getVariant(student.percentage)} 
                              style={{ height: "6px", width: "100px", borderRadius: "10px" }} 
                          />
                          <span className="small fw-bold">{student.percentage}%</span>
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
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="d-flex align-items-center gap-2 ms-auto"
                        onClick={(e) => {
                           e.stopPropagation(); // Prevent double trigger with row click
                           navigate(`/student/results/${student.id}`);
                        }}
                      >
                        <Eye size={16} /> View Paper
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
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