import React, { useEffect, useState, Suspense } from "react";
import { getTokenFromUrl, loginUrl } from "./Spotify";
import "./App.css";
import jamliteLogo from "./assets/jamlite.png";

const Auth = React.lazy(() => import("./components/Auth"));
const Search = React.lazy(() => import("./components/Search"));
const Save = React.lazy(() => import("./components/Save"));

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [token, setToken] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [currentStep, setCurrentStep] = useState(() => {
    return localStorage.getItem("currentStep") || "search";
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAndSetToken = async () => {
      try {
        const hash = getTokenFromUrl();
        window.location.hash = "";
        const storedToken = localStorage.getItem("spotify_token");
        const _token = hash.access_token || storedToken;

        if (_token) {
          setToken(_token);
          localStorage.setItem("spotify_token", _token);
          
          const savedStep = localStorage.getItem("currentStep");
          if (savedStep) {
            setCurrentStep(savedStep);
          }
          
          const savedTracks = localStorage.getItem("selectedTracks");
          if (savedTracks) {
            setSelectedTracks(JSON.parse(savedTracks));
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    validateAndSetToken();
  }, []);

  useEffect(() => {
    if (currentStep) {
      localStorage.setItem("currentStep", currentStep);
    }
  }, [currentStep]);

  useEffect(() => {
    if (selectedTracks.length > 0) {
      localStorage.setItem("selectedTracks", JSON.stringify(selectedTracks));
    }
  }, [selectedTracks]);

  const handleLogin = () => {
    setShowAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("currentStep");
    localStorage.removeItem("selectedTracks");
    setToken(null);
    setCurrentStep("search");
    setSelectedTracks([]);
  };

  const handleBack = () => {
    if (currentStep === "save") {
      setCurrentStep("search");
    } else if (showAuth) {
      setShowAuth(false);
    }
  };

  const handleTrackSelection = (track) => {
    if (!selectedTracks.some((t) => t.id === track.id)) {
      setSelectedTracks((prev) => [...prev, track]);
    }
  };

  const goToSavePlaylist = () => {
    setCurrentStep("save");
  };

  const handleNewPlaylist = () => {
    setSelectedTracks([]);
    localStorage.removeItem("selectedTracks");
    setCurrentStep("search");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (showAuth) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Auth loginUrl={loginUrl} onBack={() => setShowAuth(false)} />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`App ${token ? 'authenticated' : ''}`}>
        <header className="App-header">
          {!token ? (
            <div className="login-container">
              <div className="App-logo-container">
                <img src={jamliteLogo} alt="JamLite Logo" className="App-logo" />
              </div>
              <div className="title-container">
                <h2 className="Sub-title">Welcome to</h2>
                <h1 className="App-title">JamLite</h1>
              </div>
              <button className="App-button" onClick={handleLogin}>
                Login with Spotify
              </button>
            </div>
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              <div className="nav-buttons">
                {currentStep === "save" && (
                  <button className="back-button" onClick={handleBack}>
                    Back
                  </button>
                )}
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              {currentStep === "search" ? (
                <Search
                  token={token}
                  onSearchResultsUpdate={handleTrackSelection}
                  onNext={goToSavePlaylist}
                />
              ) : (
                <Save
                  token={token}
                  selectedTracks={selectedTracks}
                  onNewPlaylist={handleNewPlaylist}
                  onBack={handleBack}
                />
              )}
            </Suspense>
          )}
        </header>
      </div>
    </ErrorBoundary>
  );
}

export default App;