import React, { useEffect, useState } from "react";
import "./Auth.css";

function Auth({ loginUrl }) {
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("spotify_token");
    const currentPage = localStorage.getItem("current_page");
    
    if (token) {
      if (currentPage) {
        window.location.href = currentPage;
      } else {
        window.location.href = "/";
        localStorage.setItem("current_page", "/");
      }
    }
  }, []);

  const handleConfirm = () => {
    try {
      localStorage.setItem("current_page", window.location.pathname);
      window.location.href = loginUrl;
    } catch (error) {
      setErrorMessage("Failed to redirect to Spotify. Please try again later.");
      console.error("Error during login redirect:", error);
    }
  };

  const handleCancel = () => {
    const currentPage = localStorage.getItem("current_page");
    if (currentPage) {
      window.location.href = currentPage;
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Connect to Spotify</h1>
        <p className="auth-description">
          To use JamLite, you must accept the following permissions:
        </p>
        <ul className="auth-terms">
          <li>Access your public playlists</li>
          <li>Manage your private playlists</li>
          <li>View your profile and followers</li>
        </ul>
        <p className="auth-note">
          By clicking "Login with Spotify", you agree to allow JamLite to
          access your Spotify account and personalize your experience.
        </p>
        {errorMessage && <p className="auth-error">{errorMessage}</p>}
        <div className="auth-actions">
          <button className="auth-button confirm" onClick={handleConfirm}>
            Login with Spotify
          </button>
          <button
            className="auth-button cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;