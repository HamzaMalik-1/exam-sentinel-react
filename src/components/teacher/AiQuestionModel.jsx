import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
// import { useDispatch } from "react-redux";
// import toast from "react-hot-toast";
import StarIcon from "../../assets/teacher/star.svg";

const AiQuestionModal = ({
  show,
  setShow,
  generateAIQuestion, // Redux action
  questionLimit,      // Default limit from parent
  companyId,
  handleAddQuestion,
  description,        // Description from parent
  setDescription,
  section,            // Subject Name
  sectionId,          // Subject ID
  setLoading,
}) => {
  // const dispatch = useDispatch();
  
  // --- Local State ---
  const [localDescription, setLocalDescription] = useState("");
  const [localLimit, setLocalLimit] = useState(5);
  const [questionType, setQuestionType] = useState("Radio"); // Default type

  // --- Effect: Sync props to local state ---
  useEffect(() => {
    setLocalDescription(description || "");
    setLocalLimit(questionLimit || 5);
  }, [description, questionLimit]);

  // Logic: If parent provided a description, we lock this field.
  const isDescriptionLocked = !!(description && description.trim().length > 0);

  const handleClose = () => {
    setShow(false);
  };

  const handleGenerate = async () => {
    if (!localDescription.trim()) {
      // toast.error("Please enter a description or topic for the AI.");
      return;
    }

    // Update parent description state if it wasn't locked
    if (!isDescriptionLocked && setDescription) {
      setDescription(localDescription);
    }

    // Prepare Payload with NEW local values
    const payload = {
      companyId: companyId,
      limit: localLimit,      
      type: questionType,     // 'Radio', 'Checkbox', or 'Open end'
      section: section, 
      description: localDescription,
    };

    console.log("Generating with payload:", payload);

    try {
      handleClose(); 
      setLoading(true);

      // --- SIMULATED DISPATCH (Replace with your actual dispatch) ---
      // const response = await dispatch(generateAIQuestion(payload));
      
      // MOCK RESPONSE FOR DEMO - Remove in production
      const response = { success: true, data: [] }; 

      if (response && response.success) {
        // Logic to add questions (uncomment when integrating)
        /* response.data.forEach((q) => {
          handleAddQuestion({
            selectionId: sectionId,
            question: q.question,
            answer: q.answer,
            questionType: questionType, 
            options: q.options,
          });
        });
        */
      } 
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2" style={{ color: "#1C437F" }}>
          <img src={StarIcon} alt="AI" width="24" />
          Generate with AI
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-4">
        
        {/* --- Controls Row --- */}
        <div className="p-3 bg-light rounded border mb-4">
            <div className="mb-2">
                <strong>Target Subject: </strong>
                <span className="text-primary fw-bold">{section || "General"}</span>
            </div>

            <Row className="g-3">
                {/* Question Limit Input */}
                <Col md={6}>
                    <Form.Label className="fw-semibold small">Number of Questions</Form.Label>
                    <Form.Control 
                        type="number" 
                        min="1" 
                        max="20"
                        value={localLimit}
                        onChange={(e) => setLocalLimit(parseInt(e.target.value) || 0)}
                    />
                </Col>

                {/* Question Type Select - UPDATED */}
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

        {/* --- Description Input --- */}
        <div className="mb-3">
          <Form.Label className="fw-semibold">
            Description / Prompt <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="e.g. Create intermediate level questions..."
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            disabled={isDescriptionLocked} 
            style={{ 
                resize: "none", 
                backgroundColor: isDescriptionLocked ? "#e9ecef" : "#fff" 
            }}
          />
          <Form.Text className="text-muted">
            {isDescriptionLocked 
                ? "Description is locked based on the test settings." 
                : "The more specific your description, the better the questions will be."}
          </Form.Text>
        </div>

        {/* --- Footer Buttons --- */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            style={{ backgroundColor: "#A0AAB5", border: "none" }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGenerate}
            style={{ backgroundColor: "#1C437F", border: "none" }}
            className="d-flex align-items-center gap-2"
          >
            <img src={StarIcon} alt="" width="16" style={{ filter: "brightness(0) invert(1)" }}/>
            Generate Questions
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AiQuestionModal;