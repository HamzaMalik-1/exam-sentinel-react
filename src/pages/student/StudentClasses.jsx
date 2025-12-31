import React, { useState, useEffect } from "react";
import { School, PlusCircle, CheckCircle, Info } from "lucide-react";
import { Card, Table, Button, Modal, Form, Badge, Spinner } from "react-bootstrap";
import toast from 'react-hot-toast';
import axiosInstance from "../../api/axiosInstance";

const StudentClasses = () => {
  const [enrollments, setEnrollments] = useState([]); 
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchAvailableClasses();
  }, []);

  /**
   * Fetches the student's current profile and active enrollments
   */
  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/student/profile'); 
      if (res.data.success) {
        setEnrollments(res.data.data.enrollments || []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load your enrollment status");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches all classes for the registration dropdown
   * Updated to use the /getAllClasses route
   */
  const fetchAvailableClasses = async () => {
    try {
      // ✅ Updated endpoint to match your new route
      const res = await axiosInstance.get('/dropdown/getAllClasses');
      if (res.data.success) {
        // Since the backend now returns a mapped array: { label, value }
        const rawData = res.data.data;
        setAvailableClasses(Array.isArray(rawData) ? rawData : []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Could not load available class list");
    }
  };

  /**
   * Handles the registration of a student into a selected class
   */
  const handleRegisterClass = async () => {
    if (!selectedClass) return toast.error("Please select a class");

    try {
      const res = await axiosInstance.post('/student/register-class', { classId: selectedClass });
      if (res.data.success) {
        toast.success("Successfully registered in class!");
        setShowModal(false);
        setSelectedClass(""); 
        fetchProfile(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading enrollment details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold" style={{ color: "#1C437F" }}>My Class Registration</h3>
          <p className="text-muted mb-0">Manage your enrollment in academic classes.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: "#1C437F", border: "none" }}
          className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
        >
          <PlusCircle size={18} /> Join New Class
        </Button>
      </div>

      {/* ENROLLMENT TABLE */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Class Name</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-end pe-4">Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length > 0 ? (
                enrollments.map((enroll) => (
                  <tr key={enroll._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2 text-dark">
                        <div className="bg-light p-2 rounded-circle text-primary">
                          <School size={18} />
                        </div>
                        <span className="fw-semibold">
                          {enroll.classId?.className || "Unknown Class"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge bg="success" className="d-flex align-items-center gap-1 w-fit px-3 py-2 fw-medium">
                        <CheckCircle size={14} /> Active
                      </Badge>
                    </td>
                    <td className="text-end pe-4">
                      <span className="text-muted small">
                        {new Date(enroll.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-5 text-muted">
                    <Info size={40} className="mb-2 opacity-25" />
                    <p>No active registrations found. Please join a class to see your exams.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* REGISTRATION MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: "#1C437F" }}>Join a Class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Available Classes</Form.Label>
              <Form.Select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="shadow-none border-2"
              >
                <option value="">-- Select Class --</option>
                {availableClasses.map(cls => (
                  /* ✅ Backend now returns standard { label, value }
                    label: "Class Name - Teacher Name"
                    value: _id
                  */
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted mt-2 d-block">
                <Info size={14} className="me-1" />
                Select the class and teacher assigned to you.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowModal(false)} className="px-4">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRegisterClass}
            style={{ backgroundColor: "#1C437F", border: "none" }}
            className="px-4"
          >
            Confirm Registration
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentClasses;