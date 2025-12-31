import React, { useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// --- Validation Schema ---
const questionSchema = z.object({
  questionType: z.string().min(1, "Please select a type"),
  question: z.string().min(5, "Question must be at least 5 characters"),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
}).superRefine((data, ctx) => {
  if (["Radio", "Checkbox"].includes(data.questionType)) {
    if (!data.optionA || data.optionA.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Option A is required",
        path: ["optionA"],
      });
    }
    if (!data.optionB || data.optionB.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Option B is required",
        path: ["optionB"],
      });
    }
  }
});

const ManualQuestionModal = ({
  show,
  setShow,
  handleAddQuestion,
  editQuestion,
  setEditQuestion,
  onEditSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionType: "Radio",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
    },
  });

  const questionType = watch("questionType");

  // --- Effect: Handle Edit Mode ---
  useEffect(() => {
    if (show) {
      if (editQuestion) {
        setValue("question", editQuestion.question);
        
        // --- FIX: TYPE MATCHING LOGIC ---
        // 1. Normalize the type from backend/state to lowercase
        const incomingType = (editQuestion.questionType || editQuestion.type || "").toLowerCase();
        
        // 2. Map it to your specific <option> values ("Radio", "Checkbox", "Open end")
        let matchedType = "Radio"; // Default fallback
        if (incomingType.includes("checkbox")) {
          matchedType = "Checkbox";
        } else if (incomingType.includes("open")) {
          matchedType = "Open end";
        } else if (incomingType.includes("radio") || incomingType.includes("multiple")) {
          matchedType = "Radio";
        }
        
        setValue("questionType", matchedType);

        // --- Handle Options ---
        const opts = editQuestion.options 
          ? (Array.isArray(editQuestion.options) 
              ? editQuestion.options 
              : editQuestion.options.split(',').map(s => s.trim())) 
          : [];
          
        setValue("optionA", opts[0] || "");
        setValue("optionB", opts[1] || "");
        setValue("optionC", opts[2] || "");
        setValue("optionD", opts[3] || "");
      } else {
        reset({
          questionType: "Radio",
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
        });
      }
    }
  }, [show, editQuestion, setValue, reset]);

  const handleClose = () => {
    setShow(false);
    setEditQuestion(null);
    reset();
  };

  const onSubmit = (data) => {
    const combinedOptions = [data.optionA, data.optionB, data.optionC, data.optionD]
      .filter(opt => opt && opt.trim() !== "")
      .join(", ");

    const payload = {
      question: data.question,
      questionType: data.questionType,
      options: combinedOptions,
    };

    if (editQuestion) {
      onEditSubmit({ ...payload, index: editQuestion.index });
    } else {
      handleAddQuestion(payload);
    }
    
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" contentClassName="rounded-4 border-0">
      <Modal.Header className="px-4 border-0" style={{ backgroundColor: "#1C437F", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}>
        <Modal.Title className="text-white fs-5 fw-semibold">
          {editQuestion ? "Edit Question" : "Add Question"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 mb-3">
            <div className="p-4 rounded-3 mb-3" style={{ border: "1px solid #E3E3E3" }}>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <Form.Label className="fw-semibold">
                    Question Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select 
                    {...register("questionType")} 
                    className="form-control default-input-field shadow-none"
                  >
                    <option value="Radio">Radio</option>
                    <option value="Checkbox">Checkbox</option>
                    <option value="Open end">Open end</option>
                  </Form.Select>
                </div>
                
                <div className="col-md-8">
                  <Form.Label className="fw-semibold">
                    Question <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your question"
                    className={`form-control default-input-field shadow-none ${errors.question ? 'is-invalid' : ''}`}
                    {...register("question")}
                  />
                  {errors.question && <div className="text-danger fs-13 mt-1">{errors.question.message}</div>}
                </div>
              </div>

              {questionType !== "Open end" && (
                <div className="row g-3">
                   <div className="col-md-3">
                      <Form.Label className="fw-semibold">Option A<span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        placeholder="Enter option" 
                        {...register("optionA")} 
                        className={`form-control default-input-field shadow-none ${errors.optionA ? 'is-invalid' : ''}`} 
                      />
                      {errors.optionA && <div className="text-danger fs-13 mt-1">{errors.optionA.message}</div>}
                   </div>
                   <div className="col-md-3">
                      <Form.Label className="fw-semibold">Option B<span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        placeholder="Enter option" 
                        {...register("optionB")} 
                        className={`form-control default-input-field shadow-none ${errors.optionB ? 'is-invalid' : ''}`} 
                      />
                      {errors.optionB && <div className="text-danger fs-13 mt-1">{errors.optionB.message}</div>}
                   </div>
                   <div className="col-md-3">
                      <Form.Label className="fw-semibold">Option C</Form.Label>
                      <Form.Control 
                        placeholder="Enter option" 
                        {...register("optionC")} 
                        className="form-control default-input-field shadow-none" 
                      />
                   </div>
                   <div className="col-md-3">
                      <Form.Label className="fw-semibold">Option D</Form.Label>
                      <Form.Control 
                        placeholder="Enter option" 
                        {...register("optionD")} 
                        className="form-control default-input-field shadow-none" 
                      />
                   </div>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button
                type="button"
                className="btn btn-secondary px-5 py-2 border-0"
                style={{ backgroundColor: "#A0AAB5" }}
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 py-2 border-0"
                style={{ backgroundColor: "#1C437F" }}
              >
                {editQuestion ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ManualQuestionModal;