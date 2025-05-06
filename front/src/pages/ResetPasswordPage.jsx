import React, { useState, useEffect } from "react"; // Add useEffect
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { resetPassword, clearSuccess } from "../store/slices/authSlice"; // Import clearSuccess

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector((state) => state.auth);

  //NOTE: clear success state on unmount (OF THE COMPONENT)
  useEffect(() => {
    return () => {
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!re.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateEmail(email)) {
      dispatch(resetPassword(email));
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow border-0 rounded-4">
            <Card.Body className="p-5">
              <h2
                className="mb-4 fw-bold text-center"
                style={{ color: "#660ff1" }}
              >
                Reset Password
              </h2>

              {success && (
                <Alert variant="success">
                  Password reset email sent! Please check your inbox.
                </Alert>
              )}

              {error && !success && (
                <Alert variant="danger">
                  {typeof error === "object"
                    ? Object.values(error).flat().join(", ")
                    : error}
                </Alert>
              )}

              {!success && (
                <>
                  <p className="text-muted mb-4">
                    Enter your email address below and we'll send you
                    instructions to reset your password.
                  </p>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isInvalid={!!emailError}
                        className="form-control-lg"
                      />
                      {emailError && (
                        <Form.Control.Feedback type="invalid">
                          {emailError}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        type="submit"
                        className="btn-lg"
                        style={{ backgroundColor: "#660ff1", border: "none" }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              size="sm"
                              animation="border"
                              className="me-2"
                            />
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </div>
                  </Form>
                </>
              )}

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="text-decoration-none"
                  style={{ color: "#660ff1" }}
                >
                  Back to Login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ResetPasswordPage;
