import React,{use, useEffect,useRef} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import { setLocalStream } from '../features/peerSlice';

const VideoChat = () => {
  const localVideoRef = useRef(null);
  const dispatch = useDispatch();
  const localStream=useSelector((state)=>state.peer.localStream);
  useEffect(() => {
    //first to get access webcam and mic
    const startVideo=async()=>{
      try{
        const stream=await navigator.mediaDevices.getUserMedia({
          video:true,
          audio:true
        });

        if(localVideoRef.current){
          localVideoRef.current.srcObject=stream;
        }
        dispatch(setLocalStream(stream));
      }catch(err){
        console.error('Error accessing media devices.', err);
      }
    }
    startVideo();
  },[dispatch]);

  return(
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-lg font-bold mb-2"> Video</h2>
      <video
      ref={localVideoRef}
      autoPlay
      muted
      className='w-full max-w-md rounded-md shadow-lg'
      />
    </div>
  )
}

export default VideoChat