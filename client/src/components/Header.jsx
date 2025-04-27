import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useSelector((state) => state.chat);
  const isInRoom = location.pathname.includes("/room/");
  const roomId = isInRoom ? location.pathname.split("/room/")[1] : null;

  const handleLogoClick = () => {
    navigate("/");
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard
      .writeText(roomLink)
      .then(() => {
        alert("Room link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        alert("Could not copy room link");
      });
  };

  return (
    <header className="app-header">
      <div className="logo" onClick={handleLogoClick}>
        <h1>WebRTC Chat</h1>
      </div>

      <div className="header-actions">
        {isInRoom && (
          <>
            <div className="room-info">
              <span className="room-id">Room: {roomId}</span>
              <button className="copy-link-btn" onClick={copyRoomLink}>
                Copy Link
              </button>
            </div>

            {username && (
              <div className="user-info">
                Logged in as: <span className="username">{username}</span>
              </div>
            )}

            <button className="leave-btn" onClick={() => navigate("/")}>
              Leave Room
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
