import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  ChevronRight,
  School
} from "lucide-react";
import { Card, Table, Form, InputGroup, ProgressBar, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";
import toast from 'react-hot-toast';

const StudentResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      // Matches: router.get("/my-results", protect, getMyResults);
      const res = await axiosInstance.get("/student/my-results");
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load your results history.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SEARCH FILTERING ---
  const filteredResults = useMemo(() => {
    return results.filter(item => 
      item.testName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, results]);

  const getVariant = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "primary";
    return "danger";
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold" style={{ color: "#1C437F" }}>My Results</h3>
          <p className="text-muted mb-0">View your performance and test details.</p>
        </div>
      </div>

      {/* --- SEARCH --- */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
           <InputGroup>
              <InputGroup.Text className="bg-light border-end-0">
                 <Search size={18} className="text-muted" />
              </InputGroup.Text>
              <Form.Control 
                 type="text" 
                 placeholder="Search by test name..." 
                 className="bg-light border-start-0 shadow-none"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </InputGroup>
        </Card.Body>
      </Card>

      {/* --- TABLE --- */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Class</th>
                <th className="py-3">Test Name</th>
                <th className="py-3">Submission Date</th>
                <th className="py-3">Score</th>
                <th className="py-3">Percentage</th>
                <th className="py-3 text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((exam) => {
                  const percentage = Math.round(exam.percentage);
                  const variant = getVariant(percentage);

                  return (
                    <tr 
                      key={exam.id} 
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/student/results/${exam.id}`)}
                    >
                      <td className="ps-4">
                         <div className="d-flex align-items-center gap-2">
                            <div className="bg-light p-2 rounded-circle text-primary">
                                <School size={16} />
                            </div>
                            <span className="fw-semibold text-dark">{exam.className}</span>
                         </div>
                      </td>
                      <td>
                         <span className="fw-medium text-secondary">{exam.testName}</span>
                      </td>
                      <td className="text-muted">
                         <div className="d-flex align-items-center gap-2">
                            <Calendar size={14} />
                            {exam.submissionDate}
                         </div>
                      </td>
                      <td>
                         <span className="fw-bold text-dark">{exam.obtainedMarks}</span>
                         <span className="text-muted small"> / {exam.totalMarks}</span>
                      </td>
                      <td style={{ width: "20%" }}>
                         <div className="d-flex align-items-center gap-2">
                            <ProgressBar 
                                now={percentage} 
                                variant={variant} 
                                style={{ height: "6px", width: "80px", borderRadius: "10px" }} 
                            />
                            <span className={`small fw-bold text-${variant}`}>{percentage}%</span>
                         </div>
                      </td>
                      <td className="text-end pe-4">
                         <div className="btn btn-light btn-sm text-primary rounded-circle">
                            <ChevronRight size={18} />
                         </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No completed exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentResults;