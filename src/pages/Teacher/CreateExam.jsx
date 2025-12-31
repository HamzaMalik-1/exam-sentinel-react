import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from 'react-hot-toast';
import axiosInstance from "../../api/axiosInstance";

// --- Assets ---
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
import { Button, Form, InputGroup } from "react-bootstrap";

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
  const examId = searchParams.get("id");

  // --- LOCAL STATE ---
  const [questionsList, setQuestionsList] = useState([]);
  const [subjects, setSubjects] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Modal States
  const [questionModal, setQuestionModal] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);

  // --- REACT HOOK FORM ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  // --- API: FETCH INITIAL DATA ---
  useEffect(() => {
    fetchInitialData();
  }, [examId]);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Subjects for Dropdown
      const subRes = await axiosInstance.get('/dropdown/subjects');
      if (subRes.data.success) setSubjects(subRes.data.data);

      // 2. If Editing, Fetch Exam Data
      if (examId) {
        setLoading(true);
        const examRes = await axiosInstance.get(`/exams/${examId}`);
        if (examRes.data.success) {
          const exam = examRes.data.data;
          
          // Map Backend 'title' to Frontend 'testName'
          reset({
            testName: exam.title || "", 
            timeLimit: exam.timeLimit,
            description: exam.description || "",
            subjectId: exam.subjectId?._id || exam.subjectId || "",
          });
          
          const mappedQuestions = (exam.questions || []).map(q => ({
            ...q,
            answer: q.correctAnswer || q.answer 
          }));
          setQuestionsList(mappedQuestions);
        }
      }
    } catch (error) {
      console.error("Initialization Error:", error);
      toast.error("Failed to load exam data");
    } finally {
      setLoading(false);
    }
  };

  // --- QUESTION HANDLERS ---
  const handleAddQuestion = (data) => {
    const newQuestionObj = {
      question: data.question,
      answer: data.answer || data.correctAnswer, 
      type: data.questionType?.toLowerCase() || "radio",
      options: data.options || [],
    };
    setQuestionsList((prev) => [...prev, newQuestionObj]);
  };

  const handleDeleteQuestion = (qIdx) => {
    setQuestionsList((prev) => prev.filter((_, index) => index !== qIdx));
  };

  const handleEditSubmit = (data) => {
    setQuestionsList((prev) => {
      const updatedQs = [...prev];
      updatedQs[data.index] = {
        question: data.question,
        type: data.questionType?.toLowerCase() || "radio",
        options: data.options,
        answer: data.answer || data.correctAnswer,
      };
      return updatedQs;
    });
    setEditQuestion(null);
  };

  // --- FINAL FORM SUBMISSION ---
  const onSubmit = async (data) => {
    if (questionsList.length === 0) {
      return toast.error("Please add at least one question to the exam.");
    }

    // 1. Get Token and Decode User ID
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Session expired. Please log in again.");

    let userId = "";
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = JSON.parse(window.atob(payloadBase64));
      userId = decodedJson.id; 
    } catch (e) {
      return toast.error("Authentication error. Please re-login.");
    }

    // 2. Prepare Payload for Mongoose Schema
    const payload = {
      testName: data.testName,           // Controller expects 'testName'
      subject: data.subjectId,           // Controller expects 'subject'
      timeLimit: Number(data.timeLimit),
      description: data.description || "",
      createdBy: userId, 
      questions: questionsList.map((q) => ({
        question: q.question,
        type: q.type,
        // Split options string into array if it's not already
        options: typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : q.options,
        correctAnswer: q.answer || "No answer provided", 
      })),
    };

    setLoading(true);
    try {
      if (examId) {
        await axiosInstance.put(`/exams/${examId}`, payload);
        toast.success("Exam updated successfully");
      } else {
        await axiosInstance.post('/exams', payload);
        toast.success("Exam created successfully");
      }
      navigate("/teacher/exams");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save exam");
    } finally {
      setLoading(false);
    }
  };

  const groupedQuestions = questionsList.reduce((acc, question, index) => {
    const typeLabel = question.type 
      ? question.type.charAt(0).toUpperCase() + question.type.slice(1) 
      : "General";
    if (!acc[typeLabel]) acc[typeLabel] = [];
    acc[typeLabel].push({ ...question, originalIndex: index });
    return acc;
  }, {});

  return (
    <>
      <BackModel
        show={showBackModal}
        setShow={setShowBackModal}
        text={"You haven’t saved. If you go back now, your changes will be lost."}
        navigationUrl={"/teacher/exams"}
        img={BackModalIcon}
        alt="Back"
      />

      <ManualQuestionModal
        show={questionModal}
        setShow={setQuestionModal}
        handleAddQuestion={handleAddQuestion}
        editQuestion={editQuestion}
        setEditQuestion={setEditQuestion}
        onEditSubmit={handleEditSubmit}
      />

      <AiQuestionModal
        show={aiModal}
        setShow={setAiModal}
        handleAddQuestion={handleAddQuestion}
        description={descriptionValue}
        setDescription={(val) => setValue("description", val)}
        section={subjects.find(s => s.value === selectedSubjectId)?.label || ""}
        setLoading={setLoading}
      />

      <div className="container-fluid p-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9">
            
            <div className="text-center mb-4">
              <h4 className="fw-bold" style={{ color: "#1C437F" }}>
                {examId ? "Edit Examination" : "Create New Examination"}
              </h4>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-4">
                <div className="col-md-6">
                  <Form.Label className="fw-semibold">Test Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    className={`p-2 default-input-field ${errors.testName ? 'is-invalid' : ''}`}
                    placeholder="Enter Title"
                    {...register("testName")}
                  />
                  {errors.testName && <small className="text-danger">{errors.testName.message}</small>}
                </div>

                <div className="col-md-6">
                  <Form.Label className="fw-semibold">Time Limit <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      className={`p-2 default-input-field ${errors.timeLimit ? 'is-invalid' : ''}`}
                      placeholder="Enter"
                      {...register("timeLimit")}
                    />
                    <InputGroup.Text className="bg-light">mins</InputGroup.Text>
                  </InputGroup>
                  {errors.timeLimit && <small className="text-danger">{errors.timeLimit.message}</small>}
                </div>

                <div className="col-md-6">
                  <Form.Label className="fw-semibold">Subject <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    className={`p-2 default-input-field ${errors.subjectId ? 'is-invalid' : ''}`}
                    {...register("subjectId")}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.value} value={sub.value}>{sub.label}</option>
                    ))}
                  </Form.Select>
                  {errors.subjectId && <small className="text-danger">{errors.subjectId.message}</small>}
                </div>

                <div className="col-12">
                  <Form.Label className="fw-semibold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    className="p-2 default-input-field"
                    rows={3}
                    placeholder="Enter Description"
                    {...register("description")}
                    style={{ resize: "none" }}
                  />
                </div>
              </div>
            </Form>

            <div className="card mt-5 border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h4 className="fw-bold" style={{ color: "#1C437F" }}>Examination Questions</h4>
                </div>

                {questionsList.length === 0 ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <img src={EmptyStateIllustration} alt="No Questions" className="mb-4" style={{ maxWidth: "120px" }} />
                    <div className="d-flex gap-3 flex-wrap justify-content-center">
                      <Button variant="outline-primary" className="d-flex align-items-center gap-2 px-4 py-2" onClick={() => setQuestionModal(true)} style={{ color: "#1C437F", borderColor: "#1C437F" }}>
                        <img src={NoteIcon} alt="" width="18" /> Add Manually
                      </Button>
                      <Button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2" onClick={() => setAiModal(true)} style={{ backgroundColor: "#1C437F", border: "none" }}>
                        <img src={StarIcon} alt="" width="18" /> Generate with AI
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-100">
                    {Object.entries(groupedQuestions).map(([type, questions]) => (
                      <div key={type} className="mb-4">
                        <h6 className="fw-bold px-2 py-1 mb-2 text-uppercase" style={{ color: "#1C437F", borderBottom: "2px solid #f0f0f0" }}>{type}</h6>
                        {questions.map((q, localIndex) => (
                          <div key={q.originalIndex} className="p-3 border-bottom d-flex justify-content-between align-items-start">
                            <div className="d-flex gap-2">
                              <span className="fw-bold text-secondary">{localIndex + 1}.</span>
                              <div>
                                <span className="text-break d-block">{q.question}</span>
                              </div>
                            </div>
                            <div className="d-flex gap-3">
                              <img src={EditIcon} className="cursor-pointer" width="18" alt="Edit" onClick={() => { setEditQuestion({...q, index: q.originalIndex}); setQuestionModal(true); }} />
                              <img src={DeleteIcon} className="cursor-pointer" width="18" alt="Delete" onClick={() => handleDeleteQuestion(q.originalIndex)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="d-flex gap-3 flex-wrap justify-content-center mt-5">
                        <Button variant="outline-secondary" className="px-4 py-2" onClick={() => setQuestionModal(true)}>+ Add More</Button>
                        <Button className="px-4 py-2" onClick={() => setAiModal(true)} style={{ backgroundColor: "#1C437F", border: "none" }}><img src={StarIcon} alt="" width="18" className="me-2" /> AI Assistant</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-5 mb-5">
              <Button variant="secondary" className="px-5 py-2" onClick={() => setShowBackModal(true)} style={{ backgroundColor: "#A0AAB5", border: "none" }}>Cancel</Button>
              <Button className="btn btn-primary px-5 py-2" onClick={handleSubmit(onSubmit)} disabled={loading} style={{ backgroundColor: "#1C437F", border: "none" }}>
                {loading ? "Processing..." : (examId ? "Update Exam" : "Publish Exam")}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateExam;