import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  HelpCircle, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileText
} from "lucide-react";
import { Card, Table, Button, Form, Badge, Row, Col, InputGroup } from "react-bootstrap";
import toast from 'react-hot-toast';
import axiosInstance from "../../api/axiosInstance";

const ExamList = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // --- API CALLS ---

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axiosInstance.get('/dropdown/subjects');
        if (res.data.success) setSubjects(res.data.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExams();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedSubject, currentPage, itemsPerPage]);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/exams', {
        params: {
          paginate: true,
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          subject: selectedSubject !== "" ? selectedSubject : undefined
        }
      });

      if (res.data.success) {
        // Backend returns: { data: { data: [...], totalPages, total } }
        const { data, totalPages, total } = res.data.data;
        setExams(data);
        setTotalPages(totalPages);
        setTotalDocs(total);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  
  const handleNavigateCreate = () => {
    navigate("/exam/create"); 
  };

  const handleEdit = (id) => {
    navigate(`/exam/create?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        const res = await axiosInstance.delete(`/exams/${id}`);
        if (res.data.success) {
          toast.success("Exam deleted successfully");
          fetchExams();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold" style={{ color: "#1C437F" }}>Exam Management</h3>
          <p className="text-muted mb-0">View, manage, and create new tests.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleNavigateCreate}
          style={{ backgroundColor: "#1C437F", border: "none" }}
          className="d-flex align-items-center gap-2 px-4 py-2"
        >
          <PlusCircle size={18} />
          Create New Exam
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search by test name..." 
                  className="bg-light border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </InputGroup>
            </Col>

            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <Filter size={18} />
                </InputGroup.Text>
                <Form.Select 
                  className="bg-light border-start-0 shadow-none"
                  value={selectedSubject}
                  onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(sub => (
                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>

            <Col md={5} className="d-flex justify-content-md-end justify-content-start align-items-center gap-2">
              <span className="text-muted small">Rows per page:</span>
              <Form.Select 
                size="sm" 
                style={{ width: "80px" }}
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Test Name</th>
                <th className="py-3">Subject</th>
                <th className="py-3">Time Limit</th>
                <th className="py-3">Questions</th>
                <th className="py-3 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <tr key={exam._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                          <FileText size={20} />
                        </div>
                        {/* ✅ Corrected: Backend uses 'title' */}
                        <span className="fw-semibold text-dark">{exam.title}</span>
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" className="text-dark border px-3 py-2 fw-normal">
                        {/* ✅ Corrected: Populated data is in subjectId.name */}
                        {exam.subjectId?.name || "Unassigned"}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <Clock size={16} />
                        <span>{exam.timeLimit} mins</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <HelpCircle size={16} />
                        {/* ✅ Corrected: Count array length if totalQuestions not provided */}
                        <span>{exam.totalQuestions || exam.questions?.length || 0}</span>
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <Button variant="light" size="sm" className="me-2 text-primary border" onClick={() => handleEdit(exam._id)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="light" size="sm" className="text-danger border" onClick={() => handleDelete(exam._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                       <FileText size={40} className="text-muted opacity-25 mb-2" />
                       <p>{isLoading ? "Loading exams..." : "No exams found matching your filters."}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>

        {totalDocs > 0 && (
          <Card.Footer className="bg-white border-0 py-3">
             <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small ps-2">
                  Showing <strong>{exams.length}</strong> of <strong>{totalDocs}</strong> results
                </span>

                <div className="d-flex align-items-center gap-2 pe-2">
                  <Button 
                    variant="light" size="sm" className="border"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  <span className="text-muted small px-2">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>

                  <Button 
                    variant="light" size="sm" className="border"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
             </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default ExamList;