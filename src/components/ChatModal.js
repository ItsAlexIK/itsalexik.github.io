import React, { useState } from "react";
import "../ChatModal.css";

const ChatModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;

    try {
      setError(false);
      const response = await fetch("https://89.144.32.143/api/alex.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      });

      if (response.ok) {
        setMessage("");
        setSent(true);
        setTimeout(() => setSent(false), 3500);
      } else {
        setError(true);
        setTimeout(() => setError(false), 4500);
      }
    } catch (error) {
      setError(true);
      setTimeout(() => setError(false), 7000);
      console.error("Error sending message:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-modal-btn"
          onClick={onClose}
          type="button"
          aria-label="Close"
        ></button>
        <h2>Send Anonymous Message</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSent(false);
              setError(false);
            }}
            placeholder="Type your message here..."
          />
          <button type="submit">Send</button>
          {sent && (
            <div className="message-sent">
              <span role="img" aria-label="sent">
                ✅
              </span>
              Message sent!
            </div>
          )}{" "}
          {error && (
            <div className="message-error">
              <span role="img" aria-label="error" style={{ marginRight: 6 }}>
                ❌
              </span>
              <b>Error sending message!</b>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
