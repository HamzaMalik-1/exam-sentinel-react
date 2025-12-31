import React, { useState, useEffect } from "react";
import { 
  PlusCircle, Search, Filter, Edit2, Trash2, 
  ChevronLeft, ChevronRight, School, FileText
} from "lucide-react";
import { Card, Table, Button, Form, Badge, Row, Col, InputGroup, Modal } from "react-bootstrap";
import toast from 'react-hot-toast';
import axiosInstance from "../../api/axiosInstance";

const AssignExam = () => {
  // --- STATE ---
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    classId: "",
    testId: "",
    startDate: "",
    endDate: ""
  });

  // --- API CALLS ---

  // Fetch Dropdowns (Classes and Exams)
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [classRes, testRes] = await Promise.all([
          axiosInstance.get('/dropdown/classes'), 
          axiosInstance.get('/exams') 
        ]);
        
        // Match the backend "label/value" format for classes
        if (classRes.data.success) setClasses(classRes.data.data);
        
        if (testRes.data.success) {
            // Handle both paginated and flat array responses
            const examData = testRes.data.data.data || testRes.data.data;
            setTests(examData);
        }
      } catch (error) {
        console.error("Dropdown Load Error:", error);
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch Assignments with search, class filter, and pagination
  useEffect(() => {
    fetchAssignments();
  }, [searchQuery, filterClass, currentPage, itemsPerPage]);

  const fetchAssignments = async () => {
    if (!localStorage.getItem("token")) return;

    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/assign-exam', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          // ✅ Clean up: only send search if it has a value
          search: searchQuery.trim() !== "" ? searchQuery : undefined,
          classId: filterClass !== "" ? filterClass : undefined 
        }
      });
      
      if (res.data.success) {
        const { data, totalPages, total } = res.data.data;
        setAssignments(data);
        setTotalPages(totalPages || 1);
        setTotalDocs(total || 0);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error("Failed to load assigned exams");
      }
    } finally {
      setIsLoading(false);
    }
  };  

  // --- HANDLERS ---

  const handleShow = (item = null) => {
    if (item) {
      setIsEditing(true);
      setFormData({
        id: item._id,
        classId: item.classId?._id || item.classId,
        testId: item.examId?._id || item.examId,
        // Conversion to "YYYY-MM-DDTHH:MM" for datetime-local input
        startDate: new Date(item.startTime).toISOString().slice(0, 16),
        endDate: new Date(item.endTime).toISOString().slice(0, 16)
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, classId: "", testId: "", startDate: "", endDate: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.classId || !formData.testId || !formData.startDate || !formData.endDate) {
      return toast.error("All fields are required.");
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        return toast.error("Schedule error: End time must be after start time.");
    }

    const payload = {
      classId: formData.classId,
      examId: formData.testId,
      startTime: formData.startDate,
      endTime: formData.endDate
    };

    try {
      if (isEditing) {
        await axiosInstance.put(`/assign-exam/${formData.id}`, payload);
        toast.success("Assignment updated successfully");
      } else {
        await axiosInstance.post('/assign-exam', payload);
        toast.success("Exam assigned successfully");
      }
      setShowModal(false);
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to unassign this exam?")) {
      try {
        await axiosInstance.delete(`/assign-exam/${id}`);
        toast.success("Assignment removed");
        fetchAssignments();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid p-4">
      {/* HEADER */}
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
          <PlusCircle size={18} /> Assign New Exam
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search test..." 
                  className="bg-light border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <Filter size={18} />
                </InputGroup.Text>
                <Form.Select 
                  className="bg-light border-start-0 shadow-none"
                  value={filterClass}
                  onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* DATA TABLE */}
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
              {!isLoading ? (
                assignments.map((item) => (
                  <tr key={item._id}>
                    <td className="ps-4">
                       <div className="d-flex align-items-center gap-2 text-dark">
                          <School size={18} className="text-muted" />
                          <span className="fw-semibold">{item.classId?.className}</span>
                       </div>
                    </td>
                    <td>
                        <Badge bg="light" className="text-dark border px-2 py-1 fw-normal">
                           {item.examId?.subjectId?.name || "General"}
                        </Badge>
                    </td>
                    <td>
                        <div className="d-flex align-items-center gap-2">
                            <FileText size={16} className="text-primary" />
                            {item.examId?.title}
                        </div>
                    </td>
                    <td>
                        <div className="d-flex flex-column small text-muted">
                           <div className="d-flex align-items-center gap-1">
                              <span className="text-success fw-bold">Start:</span> {formatDate(item.startTime)}
                           </div>
                           <div className="d-flex align-items-center gap-1">
                              <span className="text-danger fw-bold">End:</span> {formatDate(item.endTime)}
                           </div>
                        </div>
                    </td>
                    <td className="text-end pe-4">
                      <Button variant="light" size="sm" className="me-2 text-primary border" onClick={() => handleShow(item)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="light" size="sm" className="text-danger border" onClick={() => handleDelete(item._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading assigned exams...
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        {totalDocs > 0 && (
          <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
            <span className="text-muted small">Total: {totalDocs}</span>
            <div className="d-flex gap-2">
              <Button variant="light" size="sm" className="border" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></Button>
              <span className="align-self-center small">Page {currentPage} of {totalPages}</span>
              <Button variant="light" size="sm" className="border" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* ASSIGN MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: "#1C437F" }}>
            {isEditing ? "Edit Assignment" : "Assign Exam"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Select Class *</Form.Label>
                    <Form.Select 
                      value={formData.classId} 
                      onChange={(e) => setFormData({...formData, classId: e.target.value})}
                    >
                        <option value="">-- Choose Class --</option>
                        {classes.map(cls => (
                          <option key={cls.value} value={cls.value}>{cls.label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Select Exam / Test *</Form.Label>
                    <Form.Select 
                      value={formData.testId} 
                      onChange={(e) => setFormData({...formData, testId: e.target.value})}
                    >
                        <option value="">-- Choose Test --</option>
                        {tests.map(test => (
                          <option key={test._id} value={test._id}>{test.title}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small">Start Date & Time *</Form.Label>
                            <Form.Control 
                              type="datetime-local" 
                              value={formData.startDate} 
                              onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small">End Date & Time *</Form.Label>
                            <Form.Control 
                              type="datetime-local" 
                              value={formData.endDate} 
                              onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{ backgroundColor: "#A0AAB5", border: "none" }}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} style={{ backgroundColor: "#1C437F", border: "none" }}>
            {isEditing ? "Update Schedule" : "Confirm Assignment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignExam;