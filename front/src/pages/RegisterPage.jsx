import React, { useState, useEffect } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../store/slices/authSlice';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    const { name , value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name) {
      errors.first_name = 'First Name is required';
    }
    if (!formData.last_name) {
      errors.last_name = 'Last Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phone_number && !/^01\d{9}$/.test(formData.phone_number)) {
      errors.phone_number = 'Phone number must be 11 digits and start with 01';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmPassword, ...registrationData } = formData;
      
      const resultAction = await dispatch(registerUser(registrationData));
      
      if (!resultAction.error) {
        setRegistrationSuccess(true);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone_number: '',
          role: 'user'
        });
        
        // Redirect to verification page instead of login
        setTimeout(() => {
          navigate('/verify-email');
        }, 1500);
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
                    src="https://images.pexels.com/photos/3585000/pexels-photo-3585000.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Register"
                    className="img-fluid h-100 rounded-start"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="col-md-6">
                  <div className="card-body">
                    <h2 className="mb-4 fw-bold text-center" style={{ color: "#660ff1" }}>
                      Register Now
                    </h2>

                    {registrationSuccess && (
                      <div className="alert alert-success" role="alert">
                        Registration successful! Redirecting to verification page...
                      </div>
                    )}
                    
                    {error && !registrationSuccess && (
                      <div className="alert alert-danger" role="alert">
                        {typeof error === 'object' 
                          ? Object.values(error).flat().join(', ') 
                          : error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-4">
                          <label className="form-label" htmlFor="first_name">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={`form-control form-control-lg ${
                              formErrors.first_name ? "is-invalid" : ""
                            }`}
                          />
                          {formErrors.first_name && (
                            <div className="invalid-feedback">
                              {formErrors.first_name}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6 mb-4">
                          <label className="form-label" htmlFor="last_name">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`form-control form-control-lg ${
                              formErrors.last_name ? "is-invalid" : ""
                            }`}
                          />
                          {formErrors.last_name && (
                            <div className="invalid-feedback">
                              {formErrors.last_name}
                            </div>
                          )}
                        </div>
                      </div>

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

                      <div className="row">
                        <div className="col-md-6 mb-4">
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
                        <div className="col-md-6 mb-4">
                          <label className="form-label" htmlFor="confirmPassword">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-control form-control-lg ${
                              formErrors.confirmPassword ? "is-invalid" : ""
                            }`}
                          />
                          {formErrors.confirmPassword && (
                            <div className="invalid-feedback">
                              {formErrors.confirmPassword}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label" htmlFor="phone_number">
                          Mobile Phone <span className="text-muted">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          placeholder="01xxxxxxxxx"
                          className={`form-control form-control-lg ${
                            formErrors.phone_number ? "is-invalid" : ""
                          }`}
                        />
                        {formErrors.phone_number && (
                          <div className="invalid-feedback">
                            {formErrors.phone_number}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="form-label" htmlFor="role">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className={`form-select form-select-lg ${
                            formErrors.role ? "is-invalid" : ""
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="seller">Seller</option>
                        </select>
                        {formErrors.role && (
                          <div className="invalid-feedback">
                            {formErrors.role}
                          </div>
                        )}
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
                          disabled={loading || registrationSuccess}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Registering...
                            </>
                          ) : (
                            "Register"
                          )}
                        </button>
                      </div>

                      <div className="d-flex justify-content-center my-4">
                        <div className="text-center">
                          <p className="text-muted mb-3">Or register with</p>
                          <GoogleLoginButton />
                        </div>
                      </div>

                      <p className="text-center text-muted mt-4">
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          className="fw-bold"
                          style={{ color: "#660ff1" }}
                        >
                          Sign In
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