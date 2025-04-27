import React from "react";
import RoomForm from "../components/RoomForm";

const Home = () => {
  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome to WebRTC Video Chat</h1>
        <p>Connect with others through secure, peer-to-peer video calls</p>
      </div>

      <RoomForm />

      <div className="features-section">
        <h2>Features</h2>
        <ul>
          <li>Real-time video and audio communication</li>
          <li>Create or join private rooms</li>
          <li>Secure peer-to-peer connection using WebRTC</li>
          <li>Toggle camera and microphone</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
