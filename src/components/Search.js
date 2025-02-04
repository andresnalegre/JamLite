import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import "./Search.css";
import musicGif from "../assets/music.gif";

function Search({ token, selectedTracks, onSearchResultsUpdate, onNext }) {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [artistInfo, setArtistInfo] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTrackIds, setSelectedTrackIds] = useState(
    selectedTracks?.map(track => track.id) || []
  );

  const trackContainerRef = useRef(null);

  const handleSearch = async () => {
    if (!searchInput) return;

    setIsLoading(true);
    setOffset(0);
    setHasMore(true);
    setSearchResults([]);

    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: searchInput, type: "track,artist", limit: 20, offset: 0 },
      });

      const artist = response.data.artists.items[0];
      setArtistInfo(artist);

      if (artist) {
        const topTracksResponse = await axios.get(
          `https://api.spotify.com/v1/artists/${artist.id}/top-tracks`,
          { headers: { Authorization: `Bearer ${token}` }, params: { market: "US" } }
        );
        setTopTracks(topTracksResponse.data.tracks.slice(0, 5));
      }

      setSearchResults(response.data.tracks.items);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Failed to fetch search results. Please try again.");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreTracks = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: searchInput, type: "track", limit: 20, offset: offset + 20 },
      });

      const newTracks = response.data.tracks.items;
      if (newTracks.length === 0) {
        setHasMore(false);
        return;
      }

      setSearchResults(prevResults => [...prevResults, ...newTracks]);
      setOffset(prevOffset => prevOffset + 20);
    } catch (error) {
      console.error("Error loading more tracks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, searchInput, offset, isLoading, hasMore]);

  const handleScroll = useCallback(() => {
    const container = trackContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 100;

    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loadMoreTracks();
    }
  }, [loadMoreTracks]);

  const handleTrackSelect = (track) => {
    const isSelected = selectedTrackIds.includes(track.id);
    
    if (isSelected) {
      setSelectedTrackIds(prevIds => prevIds.filter(id => id !== track.id));
      onSearchResultsUpdate({ ...track, isRemoving: true });
    } else {
      setSelectedTrackIds(prevIds => [...prevIds, track.id]);
      onSearchResultsUpdate(track);
    }
  };

  return (
    <div className="search-container">
      <div className="music-gif-container">
        <img 
          src={musicGif}
          alt="Music Animation"
          className="music-gif"
        />
      </div>
      <h1>Search for Songs</h1>
      <div className="search-input">
        <input
          type="text"
          placeholder="Search & create your perfect playlist..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <div className="button-group">
          <button type="button" onClick={handleSearch}>Search</button>
          {selectedTrackIds.length > 0 && (
            <button type="button" className="next-button" onClick={onNext}>
              Next ({selectedTrackIds.length})
            </button>
          )}
        </div>
      </div>

      {errorMessage && <p className="search-error">{errorMessage}</p>}

      {artistInfo && (
        <div className="search-results-container">
          <div className="artist-info">
            <div className="artist-header">
              {artistInfo.images[0]?.url && (
                <img
                  src={artistInfo.images[0].url}
                  alt={artistInfo.name}
                  className="artist-image"
                />
              )}
              <h2>{artistInfo.name}</h2>
              <p>Artist</p>
            </div>
            <div className="top-tracks">
              <h3>Top 5 Tracks</h3>
              <ol>
                {topTracks.map((track) => (
                  <li key={track.id} className="top-track-item">
                    {track.name}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div
            className="track-list"
            ref={trackContainerRef}
            onScroll={handleScroll}
          >
            {searchResults.map((track) => (
              <div
                key={track.id}
                className={`track-item ${selectedTrackIds.includes(track.id) ? "selected" : ""}`}
              >
                <div className="track-info">
                  <span className="track-name">{track.name}</span>
                  <span className="track-artist">{track.artists[0]?.name}</span>
                </div>
                <button
                  type="button"
                  className={`add-button ${selectedTrackIds.includes(track.id) ? "selected" : ""}`}
                  onClick={() => handleTrackSelect(track)}
                >
                  {selectedTrackIds.includes(track.id) ? "✓" : "+"}
                </button>
              </div>
            ))}
            {isLoading && <p className="loading-text">Loading more...</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;