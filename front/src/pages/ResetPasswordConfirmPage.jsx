import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { resetPasswordConfirm, clearSuccess } from "../store/slices/authSlice";

const ResetPasswordConfirmPage = () => {
  const [formData, setFormData] = useState({
    new_password: "",
    re_new_password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const { uid, token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect to login after successful password reset
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        navigate("/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.new_password) {
      errors.new_password = "New password is required";
    } else if (formData.new_password.length < 8) {
      errors.new_password = "Password must be at least 8 characters";
    }

    if (!formData.re_new_password) {
      errors.re_new_password = "Please confirm your password";
    } else if (formData.new_password !== formData.re_new_password) {
      errors.re_new_password = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      dispatch(
        resetPasswordConfirm({
          uid,
          token,
          new_password: formData.new_password,
          re_new_password: formData.re_new_password,
        })
      );
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
                Set New Password
              </h2>

              {success && (
                <Alert variant="success">
                  Your password has been reset successfully! Redirecting to
                  login page...
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
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      isInvalid={!!formErrors.new_password}
                      className="form-control-lg"
                    />
                    {formErrors.new_password && (
                      <Form.Control.Feedback type="invalid">
                        {formErrors.new_password}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="re_new_password"
                      value={formData.re_new_password}
                      onChange={handleChange}
                      isInvalid={!!formErrors.re_new_password}
                      className="form-control-lg"
                    />
                    {formErrors.re_new_password && (
                      <Form.Control.Feedback type="invalid">
                        {formErrors.re_new_password}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <div className="d-grid mt-4">
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
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ResetPasswordConfirmPage;
