import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  HelpCircle, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileText
} from "lucide-react";
import { Card, Table, Button, Form, Badge, Row, Col, InputGroup } from "react-bootstrap";

// --- MOCK DATA ---
// In a real app, this would come from your API
const SUBJECT_LIST = [
  { id: "1", name: "General Knowledge" },
  { id: "2", name: "Mathematics" },
  { id: "3", name: "Logical Reasoning" },
  { id: "4", name: "English Communication" },
  { id: "5", name: "React.js" },
  { id: "6", name: "Node.js" },
  { id: "7", name: "Database Management" }
];

const MOCK_EXAMS = [
  { id: 101, testName: "Mid-Term React Assessment", timeLimit: 45, subjectId: "5", totalQuestions: 15 },
  { id: 102, testName: "Backend Fundamentals", timeLimit: 60, subjectId: "6", totalQuestions: 20 },
  { id: 103, testName: "General Aptitude Test", timeLimit: 30, subjectId: "3", totalQuestions: 10 },
  { id: 104, testName: "English Grammar Basics", timeLimit: 40, subjectId: "4", totalQuestions: 25 },
  { id: 105, testName: "Advanced Calculus", timeLimit: 90, subjectId: "2", totalQuestions: 12 },
  { id: 106, testName: "SQL & NoSQL Queries", timeLimit: 50, subjectId: "7", totalQuestions: 18 },
  { id: 107, testName: "Current Affairs 2024", timeLimit: 20, subjectId: "1", totalQuestions: 30 },
];

const ExamList = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [exams, setExams] = useState(MOCK_EXAMS);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // --- HANDLERS ---
  
  const handleNavigateCreate = () => {
    navigate("/exam/create"); 
  };

  const handleEdit = (id) => {
    // Navigate to Create page with ID query param
    navigate(`/exam/create?id=${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      setExams((prev) => prev.filter((exam) => exam.id !== id));
    }
  };

  const getSubjectName = (id) => {
    const sub = SUBJECT_LIST.find(s => s.id === id);
    return sub ? sub.name : "Unknown";
  };

  // --- FILTERING & PAGINATION LOGIC ---

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.testName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === "" || exam.subjectId === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [exams, searchQuery, selectedSubject]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, itemsPerPage]);


  return (
    <div className="container-fluid p-4">
      
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold" style={{ color: "#1C437F" }}>Exam Management</h3>
          <p className="text-muted mb-0">View, manage, and create new tests.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleNavigateCreate}
          style={{ backgroundColor: "#1C437F", border: "none" }}
          className="d-flex align-items-center gap-2 px-4 py-2"
        >
          <PlusCircle size={18} />
          Create New Exam
        </Button>
      </div>

      {/* --- FILTERS & CONTROLS --- */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            
            {/* Search */}
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search by test name..." 
                  className="bg-light border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>

            {/* Subject Filter */}
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Filter size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Select 
                  className="bg-light border-start-0 shadow-none"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {SUBJECT_LIST.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>

            {/* Items Per Page (Right Aligned) */}
            <Col md={5} className="d-flex justify-content-md-end justify-content-start align-items-center gap-2">
              <span className="text-muted small">Rows per page:</span>
              <Form.Select 
                size="sm" 
                style={{ width: "80px" }}
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* --- DATA TABLE --- */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Test Name</th>
                <th className="py-3">Subject</th>
                <th className="py-3">Time Limit</th>
                <th className="py-3">Total Questions</th>
                <th className="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((exam) => (
                  <tr key={exam.id}>
                    {/* Test Name */}
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                          <FileText size={20} />
                        </div>
                        <span className="fw-semibold text-dark">{exam.testName}</span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td>
                      <Badge bg="light" className="text-dark border px-3 py-2 fw-normal">
                        {getSubjectName(exam.subjectId)}
                      </Badge>
                    </td>

                    {/* Time Limit */}
                    <td>
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <Clock size={16} />
                        <span>{exam.timeLimit} mins</span>
                      </div>
                    </td>

                    {/* Total Questions */}
                    <td>
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <HelpCircle size={16} />
                        <span>{exam.totalQuestions} Questions</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-end pe-4">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="me-2 text-primary hover-shadow"
                        onClick={() => handleEdit(exam.id)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="text-danger hover-shadow"
                        onClick={() => handleDelete(exam.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                       <FileText size={40} className="text-muted opacity-25 mb-2" />
                       <p>No exams found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>

        {/* --- PAGINATION FOOTER --- */}
        {filteredExams.length > 0 && (
          <Card.Footer className="bg-white border-0 py-3">
             <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredExams.length)}</strong> of <strong>{filteredExams.length}</strong>
                </span>

                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft size={16} /> Previous
                  </Button>
                  
                  {/* Page Numbers (Simple) */}
                  {[...Array(totalPages)].map((_, idx) => (
                    <Button
                      key={idx + 1}
                      variant={currentPage === idx + 1 ? "primary" : "outline-light"}
                      className={currentPage === idx + 1 ? "text-white" : "text-dark border"}
                      size="sm"
                      onClick={() => setCurrentPage(idx + 1)}
                      style={{ 
                         backgroundColor: currentPage === idx + 1 ? "#1C437F" : "white",
                         borderColor: currentPage === idx + 1 ? "#1C437F" : "#dee2e6"
                      }}
                    >
                      {idx + 1}
                    </Button>
                  ))}

                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </div>
             </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default ExamList;