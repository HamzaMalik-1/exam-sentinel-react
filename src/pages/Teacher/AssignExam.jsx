import React, { useState, useMemo } from "react";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  School,
  FileText,
  ArrowRight
} from "lucide-react";
import { Card, Table, Button, Form, Badge, Row, Col, InputGroup, Modal } from "react-bootstrap";

// --- MOCK DATA ---
const MOCK_CLASSES = [
  { id: 1, name: "Grade 10 - A" },
  { id: 2, name: "Grade 10 - B" },
  { id: 3, name: "Grade 11 - Science" },
  { id: 4, name: "Grade 9 - C" }
];

const MOCK_TESTS = [
  { id: 101, name: "Mid-Term Mathematics", subject: "Mathematics" },
  { id: 102, name: "Physics Fundamentals", subject: "Physics" },
  { id: 103, name: "English Grammar", subject: "English" },
  { id: 104, name: "React Basics", subject: "Computer Science" }
];

const MOCK_ASSIGNMENTS = [
  { 
    id: 1, 
    classId: 1, 
    className: "Grade 10 - A",
    testId: 101, 
    testName: "Mid-Term Mathematics",
    subject: "Mathematics",
    startDate: "2024-12-01T09:00", 
    endDate: "2024-12-01T12:00" 
  },
  { 
    id: 2, 
    classId: 3, 
    className: "Grade 11 - Science",
    testId: 102, 
    testName: "Physics Fundamentals",
    subject: "Physics",
    startDate: "2024-12-05T10:00", 
    endDate: "2024-12-05T13:00" 
  },
  { 
    id: 3, 
    classId: 2, 
    className: "Grade 10 - B",
    testId: 101, 
    testName: "Mid-Term Mathematics",
    subject: "Mathematics",
    startDate: "2024-12-02T09:00", 
    endDate: "2024-12-02T12:00" 
  },
];

const AssignExam = () => {
  // --- STATE ---
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    classId: "",
    testId: "",
    startDate: "",
    endDate: ""
  });

  // --- HANDLERS ---

  const handleShow = (item = null) => {
    if (item) {
      setIsEditing(true);
      setFormData({
        id: item.id,
        classId: item.classId,
        testId: item.testId,
        startDate: item.startDate,
        endDate: item.endDate
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, classId: "", testId: "", startDate: "", endDate: "" });
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to unassign this exam? This will remove it from student dashboards.")) {
      setAssignments((prev) => prev.filter(a => a.id !== id));
    }
  };

  const handleSave = () => {
    // Basic Validation
    if (!formData.classId || !formData.testId || !formData.startDate || !formData.endDate) {
      alert("All fields are required.");
      return;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        alert("End Date must be after Start Date.");
        return;
    }

    // Get Names helper
    const selectedClass = MOCK_CLASSES.find(c => c.id == formData.classId);
    const selectedTest = MOCK_TESTS.find(t => t.id == formData.testId);

    const newItem = {
        id: isEditing ? formData.id : Date.now(),
        classId: parseInt(formData.classId),
        className: selectedClass?.name || "Unknown",
        testId: parseInt(formData.testId),
        testName: selectedTest?.name || "Unknown",
        subject: selectedTest?.subject || "General",
        startDate: formData.startDate,
        endDate: formData.endDate
    };

    if (isEditing) {
        setAssignments(prev => prev.map(item => item.id === formData.id ? newItem : item));
    } else {
        setAssignments([...assignments, newItem]);
    }
    handleClose();
  };

  // --- FILTERING & PAGINATION LOGIC ---
  const filteredData = useMemo(() => {
    return assignments.filter(item => {
        const matchesSearch = item.testName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = filterClass === "" || item.classId.toString() === filterClass;
        return matchesSearch && matchesClass;
    });
  }, [assignments, searchQuery, filterClass]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterClass, itemsPerPage]);

  // Helper to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid p-4">
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold" style={{ color: "#1C437F" }}>Assign Exams</h3>
          <p className="text-muted mb-0">Schedule tests for specific classes.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => handleShow(null)}
          style={{ backgroundColor: "#1C437F", border: "none" }}
          className="d-flex align-items-center gap-2 px-4 py-2"
        >
          <PlusCircle size={18} />
          Assign New Exam
        </Button>
      </div>

      {/* --- FILTERS --- */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search test or subject..." 
                  className="bg-light border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Filter size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Select 
                  className="bg-light border-start-0 shadow-none"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {MOCK_CLASSES.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
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
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* --- TABLE --- */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Class Name</th>
                <th className="py-3">Subject</th>
                <th className="py-3">Test Name</th>
                <th className="py-3">Schedule Window</th>
                <th className="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4">
                       <div className="d-flex align-items-center gap-2 text-dark">
                          <School size={18} className="text-muted" />
                          <span className="fw-semibold">{item.className}</span>
                       </div>
                    </td>
                    <td>
                        <Badge bg="light" className="text-dark border px-2 py-1 fw-normal">
                           {item.subject}
                        </Badge>
                    </td>
                    <td>
                        <div className="d-flex align-items-center gap-2">
                            <FileText size={16} className="text-primary" />
                            {item.testName}
                        </div>
                    </td>
                    <td>
                        <div className="d-flex flex-column small text-muted">
                           <div className="d-flex align-items-center gap-1">
                              <span className="text-success fw-bold" style={{width: '35px'}}>Start:</span> 
                              {formatDate(item.startDate)}
                           </div>
                           <div className="d-flex align-items-center gap-1">
                              <span className="text-danger fw-bold" style={{width: '35px'}}>End:</span> 
                              {formatDate(item.endDate)}
                           </div>
                        </div>
                    </td>
                    <td className="text-end pe-4">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="me-2 text-primary hover-shadow"
                        onClick={() => handleShow(item)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="text-danger hover-shadow"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No assigned exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        
        {/* --- PAGINATION --- */}
        {filteredData.length > 0 && (
          <Card.Footer className="bg-white border-0 py-3">
             <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)}</strong> of <strong>{filteredData.length}</strong>
                </span>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft size={16} />
                  </Button>
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
                    <ChevronRight size={16} />
                  </Button>
                </div>
             </div>
          </Card.Footer>
        )}
      </Card>

      {/* --- MODAL (CREATE/EDIT) --- */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: "#1C437F" }}>
            {isEditing ? "Edit Assignment" : "Assign Exam"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                {/* Select Class */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Select Class <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                        value={formData.classId}
                        onChange={(e) => setFormData({...formData, classId: e.target.value})}
                    >
                        <option value="">-- Choose Class --</option>
                        {MOCK_CLASSES.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* Select Test */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Select Exam / Test <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                        value={formData.testId}
                        onChange={(e) => setFormData({...formData, testId: e.target.value})}
                    >
                        <option value="">-- Choose Test --</option>
                        {MOCK_TESTS.map(test => (
                            <option key={test.id} value={test.id}>{test.name} ({test.subject})</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* Date Time Range */}
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Start Date & Time <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">End Date & Time <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <div className="bg-light p-2 rounded border border-warning d-flex align-items-start gap-2">
                    <Clock size={16} className="text-warning mt-1" />
                    <small className="text-muted">
                        Students will only be able to attempt this test within the selected time window.
                    </small>
                </div>
            </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: "#A0AAB5", border: "none" }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} style={{ backgroundColor: "#1C437F", border: "none" }}>
            {isEditing ? "Update Schedule" : "Confirm Assignment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignExam;