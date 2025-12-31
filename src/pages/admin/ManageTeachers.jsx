import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Badge, Card, Row, Col, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  UserCog, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Mail, 
  KeyRound,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import toast from 'react-hot-toast';
import axiosInstance from "../../api/axiosInstance";

// --- ZOD SCHEMAS ---

// Base Schema
const baseSchema = z.object({
  firstName: z.string().min(2, { message: "First Name required" }),
  lastName: z.string().min(2, { message: "Last Name required" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.literal("teacher"), 
});

// Create Schema (Includes Password)
const createTeacherSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, { message: "Min 8 chars" })
    .regex(/[A-Z]/, { message: "Needs uppercase" })
    .regex(/[a-z]/, { message: "Needs lowercase" })
    .regex(/[0-9]/, { message: "Needs number" })
    .regex(/[\W_]/, { message: "Needs symbol" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

// Edit Schema (No Password required)
const editTeacherSchema = baseSchema;

const ManageTeachers = () => {
  // --- STATE ---
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5); // ✅ Added Rows Per Page

  // --- FORM HOOK ---
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditing ? editTeacherSchema : createTeacherSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "teacher",
      password: "",
      confirmPassword: ""
    }
  });

  // --- API CALLS ---

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeachers(currentPage, searchTerm, itemsPerPage);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, itemsPerPage]);

  const fetchTeachers = async (page, search, limit) => {
    try {
      // ✅ Fetching users with role='teacher'
      const res = await axiosInstance.get('/users', { 
        params: {
          role: 'teacher', 
          paginate: true,
          page: page,
          limit: limit,
          search: search
        }
      });

      if (res.data.success) {
        const data = res.data.data;
        if (data.data) {
           setTeachers(data.data);
           setTotalPages(data.totalPages);
           setTotalDocs(data.total);
        } else {
           setTeachers([]);
           setTotalDocs(0);
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load teachers"); 
    }
  };

  // --- HANDLERS ---

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLimitChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleShow = (teacher = null) => {
    if (teacher) {
      setIsEditing(true);
      setCurrentId(teacher._id); // Use _id from MongoDB
      setValue("firstName", teacher.firstName);
      setValue("lastName", teacher.lastName);
      setValue("email", teacher.email);
      setValue("role", "teacher");
    } else {
      setIsEditing(false);
      setCurrentId(null);
      reset({ 
        firstName: "",
        lastName: "",
        email: "",
        role: "teacher",
        password: "",
        confirmPassword: ""
      }); 
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    reset(); 
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher account?")) {
      try {
        await axiosInstance.delete(`/users/${id}`);
        toast.success("Teacher deleted successfully");
        fetchTeachers(currentPage, searchTerm, itemsPerPage);
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: "teacher"
      };

      if (isEditing) {
        // ✅ UPDATE (PUT)
        await axiosInstance.put(`/users/${currentId}`, payload);
        toast.success("Teacher updated successfully");
        fetchTeachers(currentPage, searchTerm, itemsPerPage);
      } else {
        // ✅ CREATE (POST)
        payload.password = data.password; 
        
        await axiosInstance.post('/users', payload);
        toast.success("Teacher account created");
        
        // Fix: Manually fetch if state doesn't change
        if (currentPage === 1 && searchTerm === "") {
          fetchTeachers(1, "", itemsPerPage);
        } else {
          setCurrentPage(1);
          setSearchTerm("");
        }
      }
      handleClose();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination Handlers
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  return (
    <div className="container-fluid p-4">
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold" style={{ color: "#1C437F" }}>Manage Teachers</h3>
          <p className="text-muted mb-0">Create, edit, or remove teacher accounts.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => handleShow(null)}
          style={{ backgroundColor: "#1C437F", border: "none" }}
          className="d-flex align-items-center gap-2"
        >
          <PlusCircle size={18} />
          Add New Teacher
        </Button>
      </div>

      {/* --- CONTENT TABLE --- */}
      <Card className="border-0 shadow-sm rounded-4">
        
        {/* Search Bar */}
        <Card.Header className="bg-white border-bottom-0 pt-4 px-4 pb-0">
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0 text-muted"><Search size={18}/></InputGroup.Text>
                <Form.Control 
                  type="text"
                  placeholder="Search teachers..."
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
                <th className="py-3 ps-4">Name</th>
                <th className="py-3">Email</th>
                <th className="py-3">Role</th>
                <th className="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((item) => (
                  <tr key={item._id}>
                    <td className="ps-4 fw-semibold text-dark">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-light p-2 rounded-circle">
                          <UserCog size={18} className="text-primary" />
                        </div>
                        {item.firstName} {item.lastName}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Mail size={16} />
                        {item.email}
                      </div>
                    </td>
                    <td>
                      <Badge bg="success" className="fw-normal px-3 bg-opacity-75">
                        Teacher
                      </Badge>
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
                  <td colSpan="4" className="text-center py-5 text-muted">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination Footer */}
          {totalDocs > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top rounded-bottom-4 flex-wrap gap-3">
              <div className="text-muted small ps-2">
                 Showing <strong>{teachers.length}</strong> of <strong>{totalDocs}</strong> results
              </div>
              
              <div className="d-flex align-items-center gap-3">
                {/* Rows Per Page */}
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
                  </Form.Select>
                </div>

                <div className="d-flex align-items-center gap-2 pe-2">
                  <Button variant="white" size="sm" className="border bg-white" disabled={currentPage === 1} onClick={handlePrevPage}>
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-muted small px-2">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
                  <Button variant="white" size="sm" className="border bg-white" disabled={currentPage === totalPages} onClick={handleNextPage}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}

        </Card.Body>
      </Card>

      {/* --- MODAL (CREATE / EDIT) --- */}
      <Modal show={showModal} onHide={handleClose} centered backdrop="static">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: "#1C437F" }}>
            {isEditing ? "Edit Teacher Details" : "Create Teacher Account"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Row 1: Names */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label className="fw-semibold">First Name</Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">Last Name</Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
              </Col>
            </Row>

            {/* Row 2: Email */}
            <div className="mb-3">
              <Form.Label className="fw-semibold">Email Address</Form.Label>
              <Form.Control 
                type="email"
                placeholder="teacher@school.edu"
                {...register("email")}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </div>

            {/* Hidden Role Input */}
            <input type="hidden" {...register("role")} />

            {/* Password Fields - ONLY SHOW IF NOT EDITING */}
            {!isEditing && (
              <div className="p-3 bg-light rounded border mt-4">
                <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                    <KeyRound size={18} />
                    <span className="fw-bold">Security Credentials</span>
                </div>
                
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className="fw-semibold small">Password</Form.Label>
                    <Form.Control 
                      type="password"
                      placeholder="••••••"
                      {...register("password")}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                  </Col>

                  <Col md={6}>
                    <Form.Label className="fw-semibold small">Confirm Password</Form.Label>
                    <Form.Control 
                      type="password"
                      placeholder="••••••"
                      {...register("confirmPassword")}
                      isInvalid={!!errors.confirmPassword}
                    />
                    <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
                  </Col>
                  
                  <Col xs={12}>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      * Must contain: 8+ chars, uppercase, lowercase, number, symbol.
                    </small>
                  </Col>
                </Row>
              </div>
            )}

            {/* Modal Actions */}
            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={handleClose} disabled={isLoading} style={{ backgroundColor: "#A0AAB5", border: "none" }}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading} style={{ backgroundColor: "#1C437F", border: "none" }}>
                    {isLoading ? "Saving..." : (isEditing ? "Update Account" : "Create Account")}
                </Button>
            </div>

          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageTeachers;