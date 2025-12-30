import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// --- Assets ---
import BackButton from "../../assets/teacher/backModalIcon.svg";
import EmptyStateIllustration from "../../assets/teacher/testQuestion.svg";
import NoteIcon from "../../assets/teacher/note.svg";
import StarIcon from "../../assets/teacher/star.svg";
import EditIcon from "../../assets/teacher/edit.svg";
import DeleteIcon from "../../assets/teacher/delete.svg";
import BackModalIcon from "../../assets/teacher/backModalIcon.svg";

// --- Components ---
import ManualQuestionModal from "../../components/teacher/ManualQuestionModal";
import AiQuestionModal from "../../components/teacher/AiQuestionModel";
import BackModel from "../../components/teacher/BackModel";

// --- VALIDATION SCHEMA ---
const examSchema = z.object({
  testName: z.string().min(3, { message: "Test Name is required (min 3 chars)" }),
  timeLimit: z.coerce.number().min(1, { message: "Time limit must be at least 1 min" }),
  description: z.string().optional(),
  subjectId: z.string().min(1, { message: "Please select a subject" }),
});

const CreateExam = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobTestId = searchParams.get("id");

  // --- LOCAL STATE ---
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [questionModal, setQuestionModal] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);

  // Logic States
  const [questionLimit, setQuestionLimit] = useState(10);
  const [editQuestion, setEditQuestion] = useState(null);

  // --- REACT HOOK FORM ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: {
      testName: "",
      timeLimit: "",
      description: "",
      subjectId: "",
    },
  });

  const descriptionValue = watch("description");
  const selectedSubjectId = watch("subjectId");

  const subjectList = [
    { id: 1, name: "General Knowledge" },
    { id: 2, name: "Mathematics" },
    { id: 3, name: "Logical Reasoning" },
    { id: 4, name: "English Communication" },
    { id: 5, name: "React.js" },
    { id: 6, name: "Node.js" },
    { id: 7, name: "Database Management" }
  ];

  // --- QUESTION HANDLERS ---
  const handleAddQuestion = (data) => {
    setQuestionsList((prevList) => {
      const newQuestionObj = {
        question: data.question,
        answer: data.answer,
        type: data.questionType?.toLowerCase() || "open end",
        options: data.options || "",
      };
      return [...prevList, newQuestionObj];
    });
  };

  const handleDeleteQuestion = (qIdx) => {
    setQuestionsList((prev) => {
      const updatedQs = [...prev];
      updatedQs.splice(qIdx, 1);
      return updatedQs;
    });
  };

  const handleEditSubmit = (data) => {
    setQuestionsList((prev) => {
      const updatedQs = [...prev];
      updatedQs[data.index] = {
        question: data.question,
        questionType: data.questionType,
        options: data.options,
        answer: data.answer,
      };
      return updatedQs;
    });
    setEditQuestion(null);
  };

  // --- FORM SUBMISSION ---
  const onSubmit = async (data) => {
    const payload = {
      id: jobTestId || null,
      testFormTitle: data.testName,
      description: data.description,
      timeLimit: data.timeLimit,
      subjectId: data.subjectId,
      questionsList: questionsList.map((q) => ({
          question_id: q.id || null,
          question: q.question,
          type: q.type,
          options: q.options,
          answer: q.answer,
      })),
    };

    console.log("Submitting Payload:", payload);

    try {
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  // --- DATA GROUPING LOGIC ---
  // We group questions by type, but preserve the 'originalIndex' 
  // so we can still delete/edit the correct item in the main 'questionsList' array.
  const groupedQuestions = questionsList.reduce((acc, question, index) => {
    // Capitalize type for display (e.g. "radio" -> "Radio")
    const typeLabel = question.type 
      ? question.type.charAt(0).toUpperCase() + question.type.slice(1) 
      : "General";
      
    if (!acc[typeLabel]) {
      acc[typeLabel] = [];
    }
    acc[typeLabel].push({ ...question, originalIndex: index });
    return acc;
  }, {});


  return (
    <>
      {/* --- MODALS --- */}
      <BackModel
        show={showBackModal}
        setShow={setShowBackModal}
        text={"You haven’t saved. If you go back now, your changes will be lost."}
        navigationUrl={"/admin/job-tests"}
        img={BackModalIcon}
        alt="Back"
      />

      <ManualQuestionModal
        show={questionModal}
        setShow={setQuestionModal}
        handleAddQuestion={handleAddQuestion}
        secId={null} 
        setSecId={() => {}} 
        editQuestion={editQuestion}
        setEditQuestion={setEditQuestion}
        onEditSubmit={handleEditSubmit}
      />

      <AiQuestionModal
        show={aiModal}
        setShow={setAiModal}
        questionLimit={questionLimit}
        handleAddQuestion={handleAddQuestion}
        description={descriptionValue}
        setDescription={(val) => setValue("description", val)}
        section={subjectList.find(s => s.id.toString() === selectedSubjectId)?.name || ""}
        setLoading={setLoading}
      />

      {/* --- PAGE CONTENT --- */}
      <div className="container-fluid p-4">
        
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9">
            
            {/* --- SECTION 1: TEST INFORMATION --- */}
            <div className="text-center mb-4">
              <h4 className="fw-bold" style={{ color: "#1C437F" }}>Test Information</h4>
            </div>

            <form>
              <div className="row g-4">
                {/* Test Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Test Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control p-2 default-input-field"
                    placeholder="Enter Title"
                    {...register("testName")}
                  />
                  {errors.testName && <small className="text-danger">{errors.testName.message}</small>}
                </div>

                {/* Time Limit */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Time Limit <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control p-2 default-input-field"
                      placeholder="Enter"
                      {...register("timeLimit")}
                      min="0"
                    />
                    <span className="input-group-text bg-light text-secondary">mins</span>
                  </div>
                  {errors.timeLimit && <small className="text-danger">{errors.timeLimit.message}</small>}
                </div>

                {/* Subject Dropdown */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Subject <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-select p-2 default-input-field"
                    {...register("subjectId")}
                  >
                    <option value="">Select Subject</option>
                    {subjectList.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                  {errors.subjectId && <small className="text-danger">{errors.subjectId.message}</small>}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control p-2 default-input-field"
                    rows={4}
                    placeholder="Enter Description"
                    {...register("description")}
                    style={{ resize: "none" }}
                  />
                </div>
              </div>
            </form>

            {/* --- SECTION 2: TEST QUESTIONS --- */}
            <div className="card mt-5 border-0 shadow-sm rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h4 className="fw-bold" style={{ color: "#1C437F" }}>Test Questions</h4>
                </div>

                {questionsList.length === 0 ? (
                  /* --- EMPTY STATE --- */
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <img 
                      src={EmptyStateIllustration} 
                      alt="No Questions" 
                      className="mb-4" 
                      style={{ maxWidth: "120px" }}
                    />
                    
                    <div className="d-flex gap-3 flex-wrap justify-content-center">
                      <button
                        className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-2 fw-medium"
                        style={{ borderColor: "#1C437F", color: "#1C437F" }}
                        onClick={() => {
                          setEditQuestion(null);
                          setQuestionModal(true);
                        }}
                      >
                        <img src={NoteIcon} alt="" width="18" />
                        Add Questions Manually
                      </button>

                      <button
                        className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-medium"
                        style={{ backgroundColor: "#1C437F", borderColor: "#1C437F" }}
                        onClick={() => {
                          setQuestionLimit(10);
                          setAiModal(true);
                        }}
                      >
                        <img src={StarIcon} alt="" width="18" />
                        Generate Questions with AI
                      </button>
                    </div>
                  </div>
                ) : (
                  /* --- POPULATED LIST (GROUPED BY TYPE) --- */
                  <div className="w-100">
                      <div className="bg-white">
                        {Object.entries(groupedQuestions).map(([type, questions]) => (
                          <div key={type} className="mb-4">
                            
                            {/* Group Header (e.g., Radio, Check Box) */}
                            <h6 className="fw-bold px-2 py-1 mb-2 text-uppercase" style={{ color: "#1C437F", borderBottom: "2px solid #f0f0f0" }}>
                              {type}
                            </h6>

                            {/* Questions in this Group */}
                            {questions.map((q, localIndex) => (
                              <div key={q.originalIndex} className="p-3 border-bottom d-flex justify-content-between align-items-start hover-bg-gray">
                                <div className="d-flex gap-2">
                                  {/* Numbering resets per group (1, 2, 3...) */}
                                  <span className="fw-bold text-secondary">{localIndex + 1}.</span>
                                  <span className="text-break">{q.question}</span>
                                </div>
                                <div className="d-flex gap-3">
                                  <img 
                                    src={EditIcon} 
                                    className="cursor-pointer" 
                                    width="18" 
                                    alt="Edit"
                                    onClick={() => {
                                      // We use q.originalIndex to reference the actual item in the main state
                                      setEditQuestion({...q, index: q.originalIndex});
                                      setQuestionModal(true);
                                    }}
                                  />
                                  <img 
                                    src={DeleteIcon} 
                                    className="cursor-pointer" 
                                    width="18" 
                                    alt="Delete"
                                    // We use q.originalIndex to delete the correct item
                                    onClick={() => handleDeleteQuestion(q.originalIndex)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="d-flex gap-3 flex-wrap justify-content-center mt-5">
                        <button
                          className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-2 fw-medium"
                          style={{ borderColor: "#1C437F", color: "#1C437F" }}
                          onClick={() => {
                            setEditQuestion(null);
                            setQuestionModal(true);
                          }}
                        >
                          <img src={NoteIcon} alt="" width="18" />
                          Add More Manually
                        </button>
                         <button
                            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-medium"
                            style={{ backgroundColor: "#1C437F", borderColor: "#1C437F" }}
                            onClick={() => {
                              setQuestionLimit(10);
                              setAiModal(true);
                            }}
                          >
                            <img src={StarIcon} alt="" width="18" />
                            Generate with AI
                          </button>
                      </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- 3. FOOTER ACTIONS --- */}
            <div className="d-flex justify-content-end gap-3 mt-5 mb-5">
              <button
                className="btn btn-secondary px-5 py-2 border-0"
                style={{ backgroundColor: "#A0AAB5" }}
                onClick={() => setShowBackModal(true)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-5 py-2 border-0"
                style={{ backgroundColor: "#1C437F" }}
                onClick={handleSubmit(onSubmit)}
              >
                {jobTestId ? "Update" : "Save"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateExam;