import React from "react";
import { useNavigate } from "react-router-dom";
import "./styling/emailVerification.css";

function EmailVerification() {
  const navigate = useNavigate();

  return (
    <div className="verification-container">
      <h1>Email Verified!</h1>
      <p>Your email has been successfully verified. You can now sign in.</p>
      <button onClick={() => navigate('/auth')}>Go to Sign In</button>
    </div>
  );
}

export default EmailVerification;
