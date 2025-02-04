import React, { useState } from "react";
import axios from "axios";
import "./Manage.css";

function Manage({ token, selectedTracks }) {
  const [playlistName, setPlaylistName] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleCreatePlaylist = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!playlistName) {
      setErrorMessage("Playlist name is required.");
      return;
    }

    if (selectedTracks.length === 0) {
      setErrorMessage("No tracks selected for the playlist.");
      return;
    }

    try {
      const userResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userId = userResponse.data.id;

      const playlistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: playlistName,
          description: "Created with JamLite",
          public: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const playlistId = playlistResponse.data.id;

      const trackUris = selectedTracks.map((track) => track.uri);

      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: trackUris,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage(`Playlist "${playlistName}" created successfully!`);
    } catch (error) {
      console.error("Error creating playlist:", error.response || error.message || error);
      setErrorMessage(
        error.response?.data?.error?.message || "Failed to create playlist. Please try again."
      );
    }
  };

  return (
    <div className="manage-container">
      <h1>Create a Playlist</h1>
      <div className="manage-input">
        <input
          type="text"
          placeholder="Enter playlist name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
        <button onClick={handleCreatePlaylist}>Create Playlist</button>
      </div>
      {successMessage && <p className="manage-success">{successMessage}</p>}
      {errorMessage && <p className="manage-error">{errorMessage}</p>}
    </div>
  );
}

export default Manage;