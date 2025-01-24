import React from 'react';
import './styling/AboutUs.css';

function AboutUs() {
  return (
    <div className="about-container">
      {/* Page Title */}
      <h1>About this Platform</h1>

      {/* About Paragraph */}
      <div className="about-paragraph">
        <p>
        Welcome to the Investment Dashboard! This platform was developed to help users research
        investment options, read news articles, and conduct technical analysis for their watchlists.
        Our goal is to provide a comprehensive suite of tools and resources to empower investors of all levels.
        Whether you are a beginner or an experienced trader, our platform offers valuable insights and data to help you make informed decisions.
        Feel free to explore the different sections of the website and start building your investment portfolio today!
        Please note that this platform is for educational purposes only and does not constitute financial advice.
        </p>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <h2>Contact the Founder</h2>
        <p>
          <a href="https://www.linkedin.com/in/arjun-goel-vt/" target="_blank" rel="noopener noreferrer">
            Visit my LinkedIn Profile
          </a>
        </p>
      </div>

      {/* Footer Section */}
      <footer className="about-footer">
        <p>Please be respectful and professional when reaching out. Thank you!</p>
      </footer>
    </div>
  );
}

export default AboutUs;


