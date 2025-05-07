import React from 'react';
import { Link } from 'react-router-dom';

export default function VerifyEmailPage() {
  return (
    <section className="h-100 bg-light" style={{ minHeight: "100vh" }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="bi bi-envelope-check" style={{ fontSize: "4rem", color: "#660ff1" }}></i>
                </div>
                <h2 className="mb-4 fw-bold" style={{ color: "#660ff1" }}>
                  Verify Your Email
                </h2>
                <div className="alert alert-info" role="alert">
                  <p className="mb-0">
                    We've sent a verification email to your inbox. Please check your email and click on the verification link to activate your account.
                  </p>
                </div>
                <div className="mt-4">
                  <p>
                    If you don't see the email in your inbox, please check your spam folder.
                  </p>
                  <p className="mt-3">
                    The verification link will expire in 24 hours.
                  </p>
                </div>
                <div className="mt-5">
                  <p>
                    Already verified your account?{" "}
                    <Link to="/login" className="fw-bold" style={{ color: "#660ff1" }}>
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
