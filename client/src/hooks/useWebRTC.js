import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import socket from '../socket';

const useWebRTC = ({
    roomId,
    username,
    localVideoRef,
    remoteVideoRef,
    setLocalStream,
    setRemoteStream
}) => {
    const [peers, setPeers] = useState({});
    const peersRef = useRef({});
    const socketRef = useRef(null);
    const isDestroyed = useRef({});

    const connectToRoom = (stream) => {
        if (!roomId || !username || !stream) return;

        socketRef.current = socket;

        socket.off('user-joined');
        socket.off('signal');
        socket.off('user-left');
        socket.off('all-users');

        socket.emit('join-room', { roomId, username });

        socket.on('user-joined', ({ userId, username: peerUsername }) => {
            console.log(`User joined: ${peerUsername} (${userId})`);

            if (!stream) return;

            // Do not initiate connection here if you are an existing user
            // Only the new user will initiate towards existing users
        });

        socket.on('signal', ({ from, signal }) => {
            console.log(`Signal received from ${from}`);

            if (isDestroyed.current[from]) {
                console.log(`Ignoring signal from destroyed peer: ${from}`);
                return;
            }

            let peer = peersRef.current[from]?.peer;

            if (!peer) {
                console.log('Creating new peer on receiving first signal from', from);
                peer = createPeer(from, stream, false);
                peersRef.current[from] = {
                    peerId: from,
                    peer,
                    username: 'Remote User'
                };
                isDestroyed.current[from] = false;

                setPeers(prevPeers => ({
                    ...prevPeers,
                    [from]: peer
                }));

                try {
                    peer.signal(signal);
                } catch (err) {
                    console.error(`Error signaling to new peer ${from}:`, err);
                }
            } else {
                try {
                    peer.signal(signal);
                } catch (err) {
                    console.error(`Error signaling to existing peer ${from}:`, err);
                }
            }
        });

        socket.on('user-left', ({ userId }) => {
            console.log(`User left: ${userId}`);
            destroyPeer(userId);
        });

        socket.on('all-users', ({ users }) => {
            console.log('Existing users in room:', users);

            users.forEach(({ userId, username: peerUsername }) => {
                if (userId !== socket.id) {
                    if (!stream) return;

                    console.log(`Connecting to existing user: ${peerUsername} (${userId})`);

                    const peer = createPeer(userId, stream, true);
                    peersRef.current[userId] = {
                        peerId: userId,
                        peer,
                        username: peerUsername
                    };
                    isDestroyed.current[userId] = false;

                    setPeers(prevPeers => ({
                        ...prevPeers,
                        [userId]: peer
                    }));
                }
            });
        });

        return () => {
            cleanupWebRTC();
        };
    };

    const createPeer = (peerId, stream, initiator) => {
        if (!stream) {
            console.error('Cannot create peer without valid media stream.');
            return null;
        }

        const peer = new Peer({
            initiator,
            trickle: true,
            stream
        });

        peer.on('signal', signal => {
            if (!isDestroyed.current[peerId]) {
                socketRef.current.emit('signal', {
                    to: peerId,
                    signal,
                    from: socketRef.current.id
                });
            }
        });

        peer.on('stream', remoteStream => {
            console.log('Received remote stream');

            if (isDestroyed.current[peerId]) {
                console.warn(`Ignoring stream for destroyed peer: ${peerId}`);
                return;
            }

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.onloadedmetadata = () => {
                    remoteVideoRef.current.play()
                        .catch(e => console.error("Error playing remote video:", e));
                };
                setRemoteStream(remoteStream);
            }
        });

        peer.on('error', err => {
            console.error('Peer error:', err);
            if (err.message.includes('destroyed') && !isDestroyed.current[peerId]) {
                isDestroyed.current[peerId] = true;
            }
        });

        peer.on('close', () => {
            console.log(`Peer connection closed for ${peerId}`);
            isDestroyed.current[peerId] = true;
        });

        return peer;
    };

    const destroyPeer = (userId) => {
        const peerWrapper = peersRef.current[userId];
        if (peerWrapper && !isDestroyed.current[userId]) {
            try {
                const peer = peerWrapper.peer;
                peer.removeAllListeners && peer.removeAllListeners();
                peer.destroy();
            } catch (err) {
                console.error(`Error destroying peer ${userId}:`, err);
            }

            isDestroyed.current[userId] = true;

            setPeers(prevPeers => {
                const updatedPeers = { ...prevPeers };
                delete updatedPeers[userId];
                return updatedPeers;
            });

            delete peersRef.current[userId];
        }
    };

    const cleanupWebRTC = () => {
        if (socketRef.current) {
            socketRef.current.off('user-joined');
            socketRef.current.off('signal');
            socketRef.current.off('user-left');
            socketRef.current.off('all-users');

            socketRef.current.emit('leave-room', { roomId });
        }

        Object.keys(peersRef.current).forEach(userId => {
            destroyPeer(userId);
        });

        peersRef.current = {};
        isDestroyed.current = {};
        setPeers({});

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
            setRemoteStream(null);
        }
    };

    useEffect(() => {
        return () => {
            cleanupWebRTC();
        };
    }, []);

    return {
        connectToRoom,
        peers
    };
};

export default useWebRTC;
