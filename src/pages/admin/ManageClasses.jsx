import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Badge, Card, Row, Col, InputGroup } from "react-bootstrap";
import { 
  PlusCircle, 
  Trash2, 
  Edit2, 
  School, 
  User, 
  BookOpen,
  ChevronLeft, 
  ChevronRight,
  Search 
} from "lucide-react";
import toast from 'react-hot-toast';
import axiosInstance from "../../api/axiosInstance";

const ManageClasses = () => {
  // --- STATE ---
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // ✅ Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [itemsPerPage, setItemsPerPage] = useState(5); // ✅ New State for Limit

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    className: "",
    section: "",
    subject: "",
    teacherId: ""
  });

  // ✅ 1. Fetch Dropdowns once
  useEffect(() => {
    fetchDropdowns();
  }, []);

  // ✅ 2. Fetch Classes when Page, Search OR Limit changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClasses(currentPage, searchTerm, itemsPerPage);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, itemsPerPage]); // ✅ Added itemsPerPage dependency

  const fetchClasses = async (page, search, limit) => {
    try {
      const res = await axiosInstance.get('/classes', {
        params: {
          paginate: true,
          page: page,
          limit: limit, // ✅ Use dynamic limit
          search: search 
        }
      });

      if (res.data.success) {
        const responseData = res.data.data;
        
        if (responseData.data && Array.isArray(responseData.data)) {
            setClasses(responseData.data);
            setTotalPages(responseData.totalPages);
            setTotalDocs(responseData.total);
        } else {
            setClasses([]); 
            setTotalDocs(0);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [subRes, teachRes] = await Promise.all([
        axiosInstance.get('/dropdown/subjects'),
        axiosInstance.get('/dropdown/teachers')
      ]);
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (teachRes.data.success) setTeachers(teachRes.data.data);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };

  // --- HANDLERS ---

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  // ✅ Handle "Rows Per Page" Change
  const handleLimitChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to page 1 when changing limit
  };

  const handleShow = (item = null) => {
    if (item) {
      const foundSubject = subjects.find(sub => sub.label === item.subjectName);
      setFormData({
        id: item._id,
        className: item.className,
        section: item.section,
        subject: foundSubject ? foundSubject.value : "",
        teacherId: item.teacher ? item.teacher._id : ""
      });
    } else {
      setFormData({ id: null, className: "", section: "", subject: "", teacherId: "" });
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await axiosInstance.delete(`/classes/${id}`);
        toast.success("Class deleted successfully");
        fetchClasses(currentPage, searchTerm, itemsPerPage); 
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.className || !formData.section || !formData.subject) {
      toast.error("Class Name, Section, and Subject are required.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        className: formData.className,
        section: formData.section,
        subject: formData.subject,
        teacher: formData.teacherId || null
      };

      if (formData.id) {
        await axiosInstance.put(`/classes/${formData.id}`, payload);
        toast.success("Class updated successfully");
        fetchClasses(currentPage, searchTerm, itemsPerPage);
      } else {
        await axiosInstance.post('/classes', payload);
        toast.success("Class created successfully");
        
        if (currentPage === 1 && searchTerm === "") {
             fetchClasses(1, "", itemsPerPage);
        } else {
             setCurrentPage(1); 
             setSearchTerm(""); 
        }
      }
      
      handleClose();

    } catch (error) {
      console.error("Save Error:", error);
      const msg = error.response?.data?.message || "Failed to save class";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold" style={{ color: "#1C437F" }}>Manage Classes</h3>
          <p className="text-muted mb-0">Create classes, assign subjects and teachers.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => handleShow(null)}
          style={{ backgroundColor: "#1C437F", border: "none" }}
          className="d-flex align-items-center gap-2"
        >
          <PlusCircle size={18} />
          Add New Class
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-4">
        
        {/* SEARCH BAR HEADER */}
        <Card.Header className="bg-white border-bottom-0 pt-4 px-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control 
                  type="text"
                  placeholder="Search by Class Name or Section..."
                  className="bg-light border-start-0 ps-0 focus-ring-none"
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ boxShadow: 'none' }}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0 mt-3">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Class Name</th>
                <th className="py-3">Section</th>
                <th className="py-3">Subject</th>
                <th className="py-3">Assigned Teacher</th>
                <th className="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length > 0 ? (
                classes.map((item) => (
                  <tr key={item._id}>
                    <td className="ps-4 fw-semibold text-dark">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-light p-2 rounded-circle">
                          <School size={18} className="text-primary" />
                        </div>
                        {item.className}
                      </div>
                    </td>
                    <td>
                      <Badge bg="info" className="fw-normal px-3 text-dark bg-opacity-25 border border-info">
                        {item.section}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-dark">
                        <BookOpen size={16} className="text-muted" />
                        {item.subjectName || "Unknown"}
                      </div>
                    </td>
                    <td>
                      {item.teacher ? (
                        <div className="d-flex align-items-center gap-2 text-dark">
                          <User size={16} className="text-muted" />
                          {item.teacherName}
                        </div>
                      ) : (
                        <span className="text-muted fst-italic small">No Teacher Assigned</span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="me-2 text-primary"
                        onClick={() => handleShow(item)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="text-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    {searchTerm ? "No classes match your search." : "No classes found. Click \"Add New Class\" to start."}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* PAGINATION FOOTER */}
          {totalDocs > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top rounded-bottom-4 flex-wrap gap-3">
              <div className="text-muted small ps-2">
                Showing <strong>{classes.length}</strong> of <strong>{totalDocs}</strong> results
              </div>
              
              <div className="d-flex align-items-center gap-3">
                
                {/* ✅ Rows Per Page Selector */}
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Rows per page:</span>
                  <Form.Select 
                    size="sm" 
                    value={itemsPerPage} 
                    onChange={handleLimitChange}
                    style={{ width: '70px', cursor: 'pointer' }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </Form.Select>
                </div>

                <div className="d-flex align-items-center gap-2 pe-2">
                  <Button 
                    variant="white" 
                    size="sm" 
                    className="border bg-white"
                    disabled={currentPage === 1}
                    onClick={handlePrevPage}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-muted small px-2">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <Button 
                    variant="white" 
                    size="sm" 
                    className="border bg-white"
                    disabled={currentPage === totalPages}
                    onClick={handleNextPage}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: "#1C437F" }}>
            {formData.id ? "Edit Class" : "Add New Class"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="fw-semibold">Class Name <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold">Section / Group <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold">Subject <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold">Assign Teacher</Form.Label>
                <Form.Select 
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading} style={{ backgroundColor: "#1C437F", border: "none" }}>
            {isLoading ? "Saving..." : (formData.id ? "Update Class" : "Create Class")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageClasses;