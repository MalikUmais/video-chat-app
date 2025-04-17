import { VideoChat, ChatBox } from "../components";

function Room() {
  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-gray-100">
      <div className="flex-1 p-4">
        <VideoChat />
      </div>
      <div className="w-full md:w-[400px] border-l p-4 bg-white shadow-md">
        <ChatBox />
      </div>
    </div>
  );
}

export default Room;
