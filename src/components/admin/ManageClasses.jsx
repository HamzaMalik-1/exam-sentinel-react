import React, { useState } from "react";
import { Modal, Button, Form, Table, Badge, Card, Row, Col } from "react-bootstrap";
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  School, 
  User, 
  BookOpen // Added Icon for Subject
} from "lucide-react";

// --- MOCK DATA ---
const MOCK_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Computer Science",
  "Biology",
  "History"
];

const MOCK_TEACHERS = [
  { id: 101, name: "Mr. Sarah Jenkins", specialization: "Mathematics" },
  { id: 102, name: "Ms. Emily Blunt", specialization: "Physics" },
  { id: 103, name: "Mr. John Doe", specialization: "Chemistry" },
  { id: 104, name: "Mrs. Linda Green", specialization: "English" },
];

const MOCK_CLASSES = [
  { id: 1, className: "Grade 10", section: "A", subject: "Mathematics", teacherId: 101 },
  { id: 2, className: "Grade 10", section: "B", subject: "Physics", teacherId: 102 },
  { id: 3, className: "Grade 11", section: "Science", subject: "Chemistry", teacherId: null },
];

const ManageClasses = () => {
  // --- STATE ---
  const [classes, setClasses] = useState(MOCK_CLASSES);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    className: "",
    section: "",
    subject: "", // Added subject state
    teacherId: ""
  });

  // --- HANDLERS ---

  const handleShow = (classItem = null) => {
    if (classItem) {
      // Edit Mode
      setIsEditing(true);
      setFormData({
        id: classItem.id,
        className: classItem.className,
        section: classItem.section,
        subject: classItem.subject || "", // Load existing subject
        teacherId: classItem.teacherId || ""
      });
    } else {
      // Add Mode
      setIsEditing(false);
      setFormData({ id: null, className: "", section: "", subject: "", teacherId: "" });
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      setClasses(classes.filter((c) => c.id !== id));
    }
  };

  const handleSave = () => {
    // Basic Validation
    if (!formData.className || !formData.section || !formData.subject) {
      alert("Class Name, Section, and Subject are required.");
      return;
    }

    if (isEditing) {
      // Update Logic
      setClasses((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? { 
                ...item, 
                className: formData.className, 
                section: formData.section, 
                subject: formData.subject, // Save Subject
                teacherId: formData.teacherId ? parseInt(formData.teacherId) : null 
              }
            : item
        )
      );
    } else {
      // Create Logic
      const newClass = {
        id: Date.now(), 
        className: formData.className,
        section: formData.section,
        subject: formData.subject, // Save Subject
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null
      };
      setClasses([...classes, newClass]);
    }
    handleClose();
  };

  const getTeacherName = (id) => {
    const teacher = MOCK_TEACHERS.find((t) => t.id === id);
    return teacher ? teacher.name : "Unassigned";
  };

  return (
    <div className="container-fluid p-4">
      {/* --- HEADER --- */}
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

      {/* --- CONTENT TABLE --- */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
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
                  <tr key={item.id}>
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
                    {/* Display Subject */}
                    <td>
                      <div className="d-flex align-items-center gap-2 text-dark">
                        <BookOpen size={16} className="text-muted" />
                        {item.subject}
                      </div>
                    </td>
                    <td>
                      {item.teacherId ? (
                        <div className="d-flex align-items-center gap-2 text-dark">
                          <User size={16} className="text-muted" />
                          {getTeacherName(item.teacherId)}
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
                    No classes found. Click "Add New Class" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- MODAL (CREATE / EDIT) --- */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: "#1C437F" }}>
            {isEditing ? "Edit Class" : "Add New Class"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              {/* Class Name */}
              <Col md={12}>
                <Form.Label className="fw-semibold">Class Name <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g. Grade 10, Physics 101"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                />
              </Col>

              {/* Section */}
              <Col md={12}>
                <Form.Label className="fw-semibold">Section / Group <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g. A, Morning, Boys"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </Col>

              {/* NEW: Subject Dropdown */}
              <Col md={12}>
                <Form.Label className="fw-semibold">Subject <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="">-- Select Subject --</option>
                  {MOCK_SUBJECTS.map((sub, index) => (
                    <option key={index} value={sub}>
                      {sub}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              {/* Assign Teacher Dropdown */}
              <Col md={12}>
                <Form.Label className="fw-semibold">Assign Teacher</Form.Label>
                <Form.Select 
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">-- Select Teacher --</option>
                  {MOCK_TEACHERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization})
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  You can assign a teacher later if needed.
                </Form.Text>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: "#A0AAB5", border: "none" }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} style={{ backgroundColor: "#1C437F", border: "none" }}>
            {isEditing ? "Update Class" : "Create Class"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageClasses;