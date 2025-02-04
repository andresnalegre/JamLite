import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";
import Search from "./Search";

function Library({ token }) {
  const [playlists, setPlaylists] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlaylists(response.data.items);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage("Failed to load playlists. Please try again later.");
        console.error("Error fetching playlists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [token]);

  return (
    <div className="library-container">
      <div className="library-left">
        <h2>Your Library</h2>
        {isLoading ? (
          <p className="loading-message">Loading playlists...</p>
        ) : (
          <ul className="playlist-list">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <li key={playlist.id} className="playlist-item">
                  <img
                    src={playlist.images[0]?.url || "/default_playlist_image.png"}
                    alt={playlist.name}
                    className="playlist-image"
                  />
                  <div className="playlist-info">
                    <h3>{playlist.name}</h3>
                    <p>{playlist.tracks.total} tracks</p>
                  </div>
                </li>
              ))
            ) : (
              <p className="no-playlists">{errorMessage || "No playlists found."}</p>
            )}
          </ul>
        )}
      </div>
      <div className="library-right">
        <Search token={token} />
      </div>
    </div>
  );
}

export default Library;