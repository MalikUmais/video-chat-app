import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRoomDetails } from "../features/roomSlice";
function Home() {
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId && userName) {
      dispatch(setRoomDetails({ roomId, userName }));
      navigate(`/room/${roomId}`);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Join Video Room</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          className="p-2 m-2 rounded text-black w-64"
          placeholder="Enter your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          className="p-2 m-2 rounded text-black w-64"
          placeholder="Enter your Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 w-64"
        >
          Join Room
        </button>
      </form>
    </div>
  );
}

export default Home;
