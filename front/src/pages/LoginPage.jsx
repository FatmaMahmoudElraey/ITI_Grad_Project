import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/authSlice";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "seller") {
        navigate("/seller/dashboard");
      } else if (user.role === "user") {
        navigate("/home");
      } else {
        navigate("/admin-dashboard");
      }
    }

    // Clear any previous auth errors when component mounts
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch, user]);

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

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      try {
        await dispatch(loginUser({
          email: formData.email,
          password: formData.password,
        })).unwrap();
        localStorage.setItem("email", formData.email);
        // Success will redirect via useEffect
      } catch (err) {
        console.error("Login failed:", err);
        
        // Show more specific error messages
        if (err.detail) {
          // Handle Django REST framework's default error format
          setFormErrors({
            ...formErrors,
            auth: err.detail
          });
        } else if (typeof err === 'object' && Object.keys(err).length > 0) {
          // Handle field-specific errors
          const newErrors = {};
          Object.entries(err).forEach(([key, value]) => {
            newErrors[key] = Array.isArray(value) ? value[0] : value;
          });
          setFormErrors(newErrors);
        } else {
          // Generic error message
          setFormErrors({
            ...formErrors,
            auth: "Invalid email or password"
          });
        }
      }
    }
  };

  return (
    <section className="h-100 bg-light" style={{ minHeight: "100vh" }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="row g-0">
                <div className="col-md-6 d-none d-md-block">
                  <img
                    src="https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Login"
                    className="img-fluid h-100 rounded-start"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="col-md-6">
                  <div className="card-body p-5">
                    <h2 className="mb-4 fw-bold" style={{ color: "#660ff1" }}>
                      Welcome Back
                    </h2>

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {typeof error === "object"
                          ? Object.values(error).flat().join(", ")
                          : error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label" htmlFor="email">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`form-control form-control-lg ${
                            formErrors.email ? "is-invalid" : ""
                          }`}
                        />
                        {formErrors.email && (
                          <div className="invalid-feedback">
                            {formErrors.email}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="form-label" htmlFor="password">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`form-control form-control-lg ${
                            formErrors.password ? "is-invalid" : ""
                          }`}
                        />
                        {formErrors.password && (
                          <div className="invalid-feedback">
                            {formErrors.password}
                          </div>
                        )}
                      </div>

                      <div className="mb-3 text-end">
                        <Link
                          to="/reset-password"
                          className="text-decoration-none"
                          style={{ color: "#660ff1" }}
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className="d-grid mb-3">
                        <button
                          type="submit"
                          className="btn btn-lg"
                          style={{
                            backgroundColor: "#660ff1",
                            color: "white",
                            borderRadius: "0.5rem",
                          }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </button>
                      </div>

                      <p className="text-center text-muted mt-4">
                        Don't have an account?{" "}
                        <Link
                          to="/register"
                          className="fw-bold"
                          style={{ color: "#660ff1" }}
                        >
                          Register
                        </Link>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}