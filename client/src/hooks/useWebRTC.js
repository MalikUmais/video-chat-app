
// Interactive Connectivity Establishment (ICE)

import {useEffect, useRef} from 'react';
import socket from '../socket';
import { useSelector,useDispatch } from 'react-redux';
import { setPeerConnection, setRemoteStream } from '../features/peerSlice';

const useWebRTC = () => {
    
    const dispathc=useDispatch();
    const {roomId}=useSelector((state)=>state.room);
    const {localStream}=useSelector((state)=>state.peer);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);

    useEffect(()=>{
        if(!localStream||!roomId) return;

        const pc=new RTCPeerConnection({
            iceServers:[
                {
                    urls:'stun:stun.l.google.com:19302',
                }
            ],
        })

        //save pc to globally (pc=peer connection)
        peerConnectionRef.current=pc;
        dispathc(setPeerConnection(pc));

        //local tracks to connection
        localStream.getTracks().forEach((track)=>{
            pc.addTrack(track,localStream);
        });

        //remote tracks receiving 
        pc.ontrack=(event)=>{
            const remoteStream=new MediaStream();
            remoteStream.addTrack(event.track);
            if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject=remoteStream;
            }
            dispatch(setRemoteStream(remoteStream));
        }
        //Send ICE candidate to other peer
        pc.onicecandidate=(event)=>{
            if(event.candidate){
                socket.emit('ice-candidate',{candidate:event.candidate,roomId});
            }
        };


        //handling answer flow
        socket.on('offer',async({offer})=>{
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer=await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer',{answer,roomId});
        });

        socket.on('answer',async({answer})=>{
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('ice-candidate',async({candidate})=>{
            try{
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }catch(err){
                console.error('Failed to add ICE candidate:',err);
            }
        });

        //Join room and send offer in case of first user
        
    })
}
