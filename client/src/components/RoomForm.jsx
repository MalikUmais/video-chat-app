import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { setUsername } from "../features/chatSlice";

const RoomForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    roomId: "",
    createNewRoom: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // If toggling to create a new room, generate a room ID
    if (name === "createNewRoom" && checked) {
      setFormData((prev) => ({
        ...prev,
        roomId: uuidv4().substring(0, 8),
      }));
    } else if (name === "createNewRoom" && !checked) {
      setFormData((prev) => ({
        ...prev,
        roomId: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      alert("Please enter a username");
      return;
    }

    if (!formData.roomId.trim()) {
      alert("Please enter a room ID or create a new room");
      return;
    }

    // Store username in Redux
    dispatch(setUsername(formData.username));

    // Navigate to the room
    navigate(`/room/${formData.roomId}`);
  };

  return (
    <div className="room-form-container">
      <form onSubmit={handleSubmit} className="room-form">
        <h2>Join or Create a Video Chat Room</h2>

        <div className="form-group">
          <label htmlFor="username">Your Name:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="createNewRoom" className="checkbox-label">
            <input
              type="checkbox"
              id="createNewRoom"
              name="createNewRoom"
              checked={formData.createNewRoom}
              onChange={handleChange}
            />
            Create a new room
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="roomId">Room ID:</label>
          <input
            type="text"
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            placeholder={
              formData.createNewRoom ? "Auto-generated" : "Enter room ID"
            }
            readOnly={formData.createNewRoom}
            required
          />
        </div>

        <button type="submit" className="join-btn">
          {formData.createNewRoom ? "Create & Join Room" : "Join Room"}
        </button>
      </form>
    </div>
  );
};

export default RoomForm;
