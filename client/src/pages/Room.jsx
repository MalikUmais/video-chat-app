import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VideoChat from "../components/VideoChat";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { username } = useSelector((state) => state.chat);

  useEffect(() => {
    // Redirect to home if no username is set
    if (!username) {
      navigate("/", { replace: true });
    }
  }, [username, navigate]);

  if (!username) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="room-container">
      <div className="room-header">
        <h2>Room: {roomId}</h2>
      </div>

      <VideoChat roomId={roomId} />
    </div>
  );
};

export default Room;
