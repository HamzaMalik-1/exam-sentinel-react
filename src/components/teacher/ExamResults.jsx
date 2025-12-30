import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  FileText, 
  School, 
  ChevronRight, 
  Calendar,
  BarChart3
} from "lucide-react";
import { Card, Table, Form, Badge, InputGroup, Row, Col, ProgressBar } from "react-bootstrap";

// --- MOCK DATA ---
const MOCK_CLASS_RESULTS = [
  { 
    resultId: 1, 
    className: "Grade 10 - A", 
    testName: "Mid-Term Mathematics", 
    date: "2024-10-15", 
    totalStudents: 30, 
    averagePercentage: 78 
  },
  { 
    resultId: 2, 
    className: "Grade 10 - B", 
    testName: "Mid-Term Mathematics", 
    date: "2024-10-15", 
    totalStudents: 28, 
    averagePercentage: 62 
  },
  { 
    resultId: 3, 
    className: "Grade 11 - Science", 
    testName: "Physics Fundamentals", 
    date: "2024-11-02", 
    totalStudents: 25, 
    averagePercentage: 85 
  },
  { 
    resultId: 4, 
    className: "Grade 9 - C", 
    testName: "English Grammar", 
    date: "2024-11-05", 
    totalStudents: 32, 
    averagePercentage: 45 
  },
];

const ExamResults = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // --- FILTERING LOGIC ---
  const filteredResults = useMemo(() => {
    return MOCK_CLASS_RESULTS.filter((item) => {
      const matchesSearch = 
        item.testName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.className.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = selectedClass === "" || item.className === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [searchQuery, selectedClass]);

  // --- HANDLERS ---
  const handleRowClick = (resultId) => {
    // Navigate to the detail page (Student Individual Results)
    // You will need to create a route like: /teacher/result/:id
    navigate(`/teacher/result/${resultId}`);
  };

  // Helper for Color Coding Percentage
  const getVariant = (score) => {
    if (score >= 75) return "success"; // Green
    if (score >= 50) return "warning"; // Yellow
    return "danger"; // Red
  };

  // Extract unique classes for dropdown
  const uniqueClasses = [...new Set(MOCK_CLASS_RESULTS.map(item => item.className))];

  return (
    <div className="container-fluid p-4">
      
      {/* --- HEADER --- */}
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: "#1C437F" }}>Exam Results</h3>
        <p className="text-muted mb-0">Overview of class performance and average scores.</p>
      </div>

      {/* --- FILTERS --- */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-3">
            {/* Search Input */}
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search by Test Name or Class..." 
                  className="bg-light border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>

            {/* Class Filter Dropdown */}
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Filter size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Select 
                  className="bg-light border-start-0 shadow-none"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls, idx) => (
                    <option key={idx} value={cls}>{cls}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* --- RESULTS TABLE --- */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-4">Class Name</th>
                <th className="py-3">Test Name</th>
                <th className="py-3">Date</th>
                <th className="py-3">Overall Class Percentage</th>
                <th className="py-3 text-end pe-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <tr 
                    key={item.resultId} 
                    onClick={() => handleRowClick(item.resultId)}
                    style={{ cursor: "pointer" }}
                    className="hover-shadow-row" // Add this class in your CSS or use style
                  >
                    {/* Class Name */}
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                          <School size={20} />
                        </div>
                        <span className="fw-semibold text-dark">{item.className}</span>
                      </div>
                    </td>

                    {/* Test Name */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FileText size={16} className="text-muted" />
                        <span className="fw-medium text-secondary">{item.testName}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="text-muted">
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={16} />
                        <small>{item.date}</small>
                      </div>
                    </td>

                    {/* Percentage Bar */}
                    <td style={{ minWidth: "200px" }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="flex-grow-1">
                          <ProgressBar 
                            now={item.averagePercentage} 
                            variant={getVariant(item.averagePercentage)} 
                            style={{ height: "8px", borderRadius: "10px" }} 
                          />
                        </div>
                        <Badge 
                          bg={getVariant(item.averagePercentage)} 
                          className="px-2 py-1"
                        >
                          {item.averagePercentage}%
                        </Badge>
                      </div>
                    </td>

                    {/* Arrow Action */}
                    <td className="text-end pe-4">
                      <ChevronRight size={20} className="text-muted opacity-50" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                       <BarChart3 size={40} className="text-muted opacity-25 mb-2" />
                       <p>No results found for your filter.</p>
                    </div>
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

export default ExamResults;