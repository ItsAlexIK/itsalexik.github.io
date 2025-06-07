import React, { useState } from "react";
import "../styles/ChatModal.css";

const ChatModal = ({ isOpen, onClose, disabled = false }) => {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;

    try {
      setError(false);
      const response = await fetch("https://heartbeetle.com/alex.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      });

      if (response.ok) {
        setMessage("");
        setSent(true);
        setTimeout(() => setSent(false), 7500);
      } else {
        setError(true);
        setTimeout(() => setError(false), 7500);
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
              if (disabled) return;
              setMessage(e.target.value);
              setSent(false);
              setError(false);
            }}
            placeholder="Type your message here..."
            disabled={disabled}
          />
          <button type="submit" disabled={disabled}>
            Send
          </button>

          {disabled && (
            <div className="message-disabled">
              🚫 This feature is temporarily disabled.
            </div>
          )}
          {sent && !disabled && (
            <div className="message-sent">✅ Message sent!</div>
          )}
          {error && !disabled && (
            <div className="message-error">
              ❌ <b>Error sending message!</b>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
