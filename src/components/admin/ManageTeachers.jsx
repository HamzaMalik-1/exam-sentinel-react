import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Badge, Card, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  UserCog, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Mail, 
  KeyRound 
} from "lucide-react";

// --- MOCK DATA ---
const MOCK_TEACHERS = [
  { id: 1, firstName: "Sarah", lastName: "Jenkins", email: "sarah.j@school.edu", role: "teacher" },
  { id: 2, firstName: "Emily", lastName: "Blunt", email: "emily.b@school.edu", role: "teacher" },
  { id: 3, firstName: "John", lastName: "Doe", email: "john.d@school.edu", role: "teacher" },
];

// --- ZOD SCHEMAS ---

// Base Schema (Shared attributes)
const baseSchema = z.object({
  firstName: z.string().min(2, { message: "First Name required" }),
  lastName: z.string().min(2, { message: "Last Name required" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.literal("teacher"), // Fixed role
});

// Create Schema (Includes Password Validation)
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
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // --- FORM HOOK ---
  // We dynamically switch resolvers based on isEditing state
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

  // --- HANDLERS ---

  const handleShow = (teacher = null) => {
    if (teacher) {
      // Edit Mode
      setIsEditing(true);
      setCurrentId(teacher.id);
      // Pre-fill form
      setValue("firstName", teacher.firstName);
      setValue("lastName", teacher.lastName);
      setValue("email", teacher.email);
      setValue("role", "teacher");
    } else {
      // Add Mode
      setIsEditing(false);
      setCurrentId(null);
      reset({ // Clear form
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
    reset(); // Reset form validation state on close
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher account?")) {
      setTeachers(teachers.filter((t) => t.id !== id));
    }
  };

  const onSubmit = (data) => {
    if (isEditing) {
      // Update Logic
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === currentId
            ? { ...t, firstName: data.firstName, lastName: data.lastName, email: data.email }
            : t
        )
      );
    } else {
      // Create Logic
      const newTeacher = {
        id: Date.now(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: "teacher",
        // Note: In a real app, you'd hash the password here or send it to backend
      };
      setTeachers([...teachers, newTeacher]);
    }
    handleClose();
  };

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
        <Card.Body className="p-0">
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
                  <tr key={item.id}>
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
                        onClick={() => handleDelete(item.id)}
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
                  
                  {/* Password Hint */}
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
                <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: "#A0AAB5", border: "none" }}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" style={{ backgroundColor: "#1C437F", border: "none" }}>
                    {isEditing ? "Update Account" : "Create Account"}
                </Button>
            </div>

          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageTeachers;