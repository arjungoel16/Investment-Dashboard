import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styling/Forum.css";

function Forum() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [responses, setResponses] = useState({});

  // Fetch all questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/forum/questions");
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  // Post a new question
  const handlePostQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      await axios.post("http://localhost:5000/forum/question", { question: newQuestion });
      setNewQuestion("");
      window.location.reload(); // Reload to fetch updated questions
    } catch (error) {
      console.error("Error posting question:", error);
    }
  };

  // Post a response
  const handlePostResponse = async (questionId) => {
    if (!responses[questionId]?.trim()) return;
    try {
      await axios.post(`http://localhost:5000/forum/response/${questionId}`, {
        response: responses[questionId],
      });
      setResponses((prev) => ({ ...prev, [questionId]: "" }));
      window.location.reload(); // Reload to fetch updated questions
    } catch (error) {
      console.error("Error posting response:", error);
    }
  };

  return (
    <div className="forum-container">
        <div className="navigation-buttons">
            <button onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button onClick={() => navigate('/news/global')}>Global News</button>
            <button onClick={() => navigate('/news/us')}>US News</button>
            <button onClick={() => navigate('/forex')}>Forex Market</button>
            <button onClick={() => navigate('/about')}>About Us</button>
            <button onClick={() => navigate('/forum')}>Forum</button>
        </div>


      {/* Forum Header */}
      <header className="forum-header">
        <h1>Welcome to the Investment Dashboard Forum</h1>
      </header>

      {/* New Question Section */}
      <div className="new-question">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question..."
        ></textarea>
        <button onClick={handlePostQuestion}>Post Question</button>
      </div>

      {/* Questions and Responses */}
      <div className="questions-list">
        {questions.map((question) => (
          <div key={question.id} className="question-card">
            <p className="question-text">{question.question}</p>
            <div className="responses-section">
              <h4>Responses</h4>
              {question.responses.map((response) => (
                <p key={response.id} className="response-text">
                  - {response.response}
                </p>
              ))}
              <textarea
                value={responses[question.id] || ""}
                onChange={(e) => setResponses((prev) => ({ ...prev, [question.id]: e.target.value }))}
                placeholder="Write a response..."
              ></textarea>
              <button onClick={() => handlePostResponse(question.id)}>Submit Response</button>
            </div>
          </div>
        ))}
      </div>

      {/* Forum Footer */}
      <footer className="forum-footer">
        <p>Please be respectful of others and do not use obscure language.</p>
      </footer>
    </div>
  );
}

export default Forum;
