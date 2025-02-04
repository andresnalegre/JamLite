import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Save.css";

function Save({ token, selectedTracks, onNewPlaylist }) {
  const [playlistName, setPlaylistName] = useState("");
  const [existingPlaylists, setExistingPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPlaylistSaved, setIsPlaylistSaved] = useState(false);
  const [isDeletingMode, setIsDeletingMode] = useState(false);

  const fetchPlaylists = React.useCallback(async () => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingPlaylists(response.data.items);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleSaveToExisting = async () => {
    if (!selectedPlaylist) {
      setErrorMessage("Please select a playlist");
      return;
    }

    try {
      const trackUris = selectedTracks.map((track) => track.uri);
      await axios.post(
        `https://api.spotify.com/v1/playlists/${selectedPlaylist.id}/tracks`,
        { uris: trackUris },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage(`Tracks added to "${selectedPlaylist.name}" successfully!`);
      setIsPlaylistSaved(true);
    } catch (error) {
      setErrorMessage("Failed to add tracks to playlist. Please try again.");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!selectedPlaylist) {
      setErrorMessage("Please select a playlist to delete");
      return;
    }

    try {
      await axios.delete(
        `https://api.spotify.com/v1/playlists/${selectedPlaylist.id}/followers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(`Playlist "${selectedPlaylist.name}" deleted successfully!`);
      setSelectedPlaylist(null);
      await fetchPlaylists();
      setIsDeletingMode(false);
    } catch (error) {
      setErrorMessage("Failed to delete playlist. Please try again.");
    }
  };

  const handleSaveNewPlaylist = async () => {
    if (!playlistName) {
      setErrorMessage("Playlist name is required.");
      return;
    }

    try {
      const userResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
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

      const newPlaylist = playlistResponse.data;

      const trackUris = selectedTracks.map((track) => track.uri);
      await axios.post(
        `https://api.spotify.com/v1/playlists/${newPlaylist.id}/tracks`,
        { uris: trackUris },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchPlaylists();
      
      setSuccessMessage(`Playlist "${playlistName}" created successfully!`);
      setIsPlaylistSaved(true);
    } catch (error) {
      setErrorMessage("Failed to create playlist. Please try again.");
    }
  };

  return (
    <div className="save-container">
      <h1>SELECT YOUR PLAYLIST</h1>
      
      <div className="save-options-container">
        <div className="save-section existing-playlist">
          <h2>ADD TO EXISTING PLAYLIST</h2>
          <div className="playlists-list">
            {existingPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className={`playlist-item ${selectedPlaylist?.id === playlist.id ? 'selected' : ''} ${
                  isDeletingMode ? 'delete-mode' : ''
                }`}
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <img src={playlist.images[0]?.url} alt={playlist.name} />
                <span>{playlist.name}</span>
                {isDeletingMode && selectedPlaylist?.id === playlist.id && (
                  <span className="delete-indicator">×</span>
                )}
              </div>
            ))}
          </div>
          
          <div className="existing-playlist-buttons">
            <button 
              onClick={handleSaveToExisting}
              disabled={!selectedPlaylist || isPlaylistSaved || isDeletingMode}
              className={isDeletingMode ? 'button-disabled' : ''}
            >
              Add to Selected Playlist
            </button>
            
            <button 
              onClick={() => {
                if (isDeletingMode) {
                  handleDeletePlaylist();
                } else {
                  setIsDeletingMode(true);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }
              }}
              className={`delete-button ${isDeletingMode ? 'confirm-delete' : ''}`}
              disabled={isDeletingMode && !selectedPlaylist}
            >
              {isDeletingMode ? 'Confirm Delete' : 'Delete Playlist'}
            </button>
            
            {isDeletingMode && (
              <button 
                onClick={() => {
                  setIsDeletingMode(false);
                  setSelectedPlaylist(null);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
  
        <div className="save-section new-playlist">
          <h2>CREATE NEW PLAYLIST</h2>
          <input
            type="text"
            placeholder="Enter playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            disabled={isPlaylistSaved}
          />
          <button 
            onClick={handleSaveNewPlaylist}
            disabled={isPlaylistSaved}
          >
            SAVE
          </button>
        </div>
      </div>
  
      {(successMessage || errorMessage) && (
        <div className="message-container">
          {successMessage && (
            <div className="save-success">
              {successMessage}
            </div>
          )}
          {errorMessage && <div className="save-error">{errorMessage}</div>}
        </div>
      )}
    </div>
  );
}

export default Save;