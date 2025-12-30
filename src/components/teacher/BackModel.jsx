import React from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BackModel = ({ show, setShow, text, navigationUrl, img, alt }) => {
  const navigate = useNavigate();

  return (
    <Modal 
      show={show} 
      onHide={() => setShow(false)} 
      centered 
      size="md" 
      backdrop="static"
      contentClassName="border-0 rounded-4 shadow"
    >
      <Modal.Body className="text-center p-5">
        <div className="d-flex flex-column align-items-center justify-content-center">
          
          {/* Icon */}
          <div className="mb-4">
             <img src={img} alt={alt} style={{ width: "80px", height: "auto" }} />
          </div>

          {/* Warning Text */}
          <h5 className="fw-bold mb-3" style={{ color: "#1C437F" }}>
            Are you sure?
          </h5>
          <p className="text-muted fs-16 mb-4" style={{ maxWidth: "300px" }}>
            {text}
          </p>

          {/* Action Buttons */}
          <div className="d-flex gap-3 w-100 justify-content-center">
            <button
              type="button"
              className="btn btn-secondary px-4 py-2 border-0 fw-medium"
              style={{ backgroundColor: "#A0AAB5", minWidth: "120px" }} // Grey
              onClick={() => setShow(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary px-4 py-2 border-0 fw-medium"
              style={{ backgroundColor: "#1C437F", minWidth: "120px" }} // Navy Blue
              onClick={() => {
                setShow(false);
                navigate(navigationUrl);
              }}
            >
              Go Back
            </button>
          </div>
          
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BackModel;