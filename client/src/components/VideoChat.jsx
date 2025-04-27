
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Peer from "simple-peer";
import socket from "../socket";
import useWebRTC from "../hooks/useWebRTC";

const VideoChat = ({ roomId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const { username } = useSelector((state) => state.chat);
  const {
    connectToRoom,
    handleUserJoined,
    handleReceiveSignal,
    handleUserLeft,
  } = useWebRTC({
    roomId,
    username,
    localVideoRef,
    remoteVideoRef,
    setLocalStream,
    setRemoteStream,
  });

  useEffect(() => {
    // Initialize camera and microphone
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;

          // Ensure video plays immediately
          localVideoRef.current.onloadedmetadata = () => {
            localVideoRef.current.play().catch((e) => {
              console.error("Error playing local video:", e);
            });
          };
        }

        setLocalStream(stream);

        // Connect to the room once we have media
        connectToRoom(stream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert(
          "Failed to access camera or microphone. Please check permissions."
        );
      }
    };

    startMedia();

    // Clean up on component unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <div className="video-chat-container">
      <div className="video-panel">
        <div className="video-box local-video">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <div className="user-label">You ({username})</div>
        </div>

        <div className="video-box remote-video">
          <video ref={remoteVideoRef} autoPlay playsInline />
          <div className="user-label">Remote User</div>
        </div>
      </div>

      <div className="controls">
        <button
          onClick={toggleMute}
          className={`control-btn ${isMuted ? "active" : ""}`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={toggleCamera}
          className={`control-btn ${isCameraOff ? "active" : ""}`}
        >
          {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        </button>
      </div>
    </div>
  );
};

export default VideoChat;
