// components/teacher/AiQuestionModal.js
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import StarIcon from "../../assets/teacher/star.svg";
import axiosInstance from "../../api/axiosInstance";

const AiQuestionModal = ({
  show,
  setShow,
  handleAddQuestion,
  description,
  setDescription,
  section, // Subject Name
  setLoading,
}) => {
  const [localDescription, setLocalDescription] = useState("");
  const [localLimit, setLocalLimit] = useState(5);
  const [questionType, setQuestionType] = useState("Radio");

  useEffect(() => {
    setLocalDescription(description || "");
  }, [description, show]);

  const isDescriptionLocked = !!(description && description.trim().length > 0);

  const handleClose = () => setShow(false);

  const handleGenerate = async () => {
    if (!localDescription.trim()) {
      toast.error("Please enter a description or topic.");
      return;
    }

    const payload = {
      limit: localLimit,
      type: questionType,
      subject: section || "General",
      description: localDescription,
    };

    try {
      setLoading(true);
      handleClose();

      const response = await axiosInstance.post('/exams/generate-ai', payload);

      if (response.data.success) {
        const questions = response.data.data;
        
        questions.forEach((q) => {
          handleAddQuestion({
            question: q.question,
            answer: q.answer,
            questionType: questionType, 
            options: q.options.join(", "), // Convert array back to comma-string for your form logic
          });
        });
        
        toast.success(`Successfully generated ${questions.length} questions!`);
        if (!isDescriptionLocked) setDescription(localDescription);
      } 
    } catch (error) {
      toast.error(error.response?.data?.message || "AI Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2" style={{ color: "#1C437F" }}>
          <img src={StarIcon} alt="AI" width="24" /> Generate with AI
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-4">
        <div className="p-3 bg-light rounded border mb-4">
            <div className="mb-2">
                <strong>Target Subject: </strong>
                <span className="text-primary fw-bold">{section || "General"}</span>
            </div>
            <Row className="g-3">
                <Col md={6}>
                    <Form.Label className="fw-semibold small">Number of Questions</Form.Label>
                    <Form.Control 
                        type="number" min="1" max="20"
                        value={localLimit}
                        onChange={(e) => setLocalLimit(parseInt(e.target.value) || 1)}
                    />
                </Col>
                <Col md={6}>
                    <Form.Label className="fw-semibold small">Question Type</Form.Label>
                    <Form.Select 
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                    >
                        <option value="Radio">Radio</option>
                        <option value="Checkbox">Checkbox</option>
                        <option value="Open end">Open end</option>
                    </Form.Select>
                </Col>
            </Row>
        </div>
        <div className="mb-3">
          <Form.Label className="fw-semibold">Description / Prompt <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea" rows={5}
            placeholder="e.g. Create intermediate level questions about financial accounting principles..."
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            disabled={isDescriptionLocked} 
            style={{ resize: "none", backgroundColor: isDescriptionLocked ? "#f8f9fa" : "#fff" }}
          />
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: "#A0AAB5", border: "none" }}>Cancel</Button>
          <Button variant="primary" onClick={handleGenerate} style={{ backgroundColor: "#1C437F", border: "none" }}>
            Generate Questions
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AiQuestionModal;