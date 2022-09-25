// #skyway
import Peer, { SfuRoom } from "skyway-js";
//
// #react
import React from "react";
import { useParams } from "react-router-dom";
//
// #web speech API
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
//
// #vrm
import * as faceapi from "face-api.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM, VRMUtils, VRMSchema } from "@pixiv/three-vrm";
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls,PerspectiveCamera } from '@react-three/drei';
//
// #material ui
import AllInclusiveTwoToneIcon from '@mui/icons-material/AllInclusiveTwoTone';
import AppBar from '@mui/material/AppBar';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box'
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { alpha } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from "@mui/material/Grid";
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

//// ##reaction Icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
////

//// ##function Icon
import MicIcon from '@mui/icons-material/Mic';
import VideocamIcon from '@mui/icons-material/Videocam';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
////
//

// #backgroundImage
import BackgroundImage from '/usr/src/app/src/assets/gray.jpg';
//

import { collection, doc, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth, timestamp } from '../firebase';

type VideoStream = {
  stream: MediaStream;
  peerId: string;
};

type Comprehension = {
  [peerId:string]: string;
}

type Transcription = {
  [peerId:string]: "";
}

export const Room: React.VFC<{ roomId: string }> = ({ roomId }) => {
  const [peer, setPeer] = React.useState<Peer>();
  const [remoteVideo, setRemoteVideo] = React.useState<VideoStream[]>([]);
  const [localStream, setLocalStream] = React.useState<MediaStream>();
  const [vrmStream, setVrmStream] = React.useState<MediaStream>();
  const [room, setRoom] = React.useState<SfuRoom>();
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const vrmVideoRef = React.useRef<HTMLVideoElement>(null);
  const [isRoom, setIsRoom] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [isMic, setIsMic] = React.useState(false);
  const [isCamera, setIsCamera] = React.useState(false);
  const [isShared, setIsShared] = React.useState(false);
  const [isRemoteShared, setIsRemoteShared] = React.useState<string>();
  const [localComprehension, setLocalComprehension] = React.useState("greenComprehension");
  const [remoteComprehensions, setRemoteComprehensions] = React.useState<Comprehension>({});
  const [remoteTranscriptions, setRemoteTranscriptions] = React.useState<Transcription>({});
  const [enableBottomBar, setEnableBottomBar] = React.useState(true);
  const [widthVideoRef, setWidthVideoRef] = React.useState(0);
  const [heightVideoRef, setHeightVideoRef] = React.useState(0);
  const { transcript, interimTranscript, finalTranscript, resetTranscript } = useSpeechRecognition();
  const speechText = new SpeechSynthesisUtterance();
  const { token } = useParams();

  async function sendText(sendText: string) {
    try {
      const user = auth.currentUser;
      if(user !== null){
          const room = query(collection(db, "MeetingRooms"), where("token", "==", token));
          const data = await getDocs(room);
          data.forEach((d)=>{
                addDoc(collection(db, "MeetingRooms/"+d.id+"/conversations"), {
                    text: sendText,
                    speaker: user.email,
                    date: timestamp,
                });
          })
      }
    } catch(error) {
      console.error(error);
    }
  }

  const gltf = useLoader(GLTFLoader, "./../model/three-vrm-girl.vrm");
  const avatar = React.useRef<VRM>();
  const [headBones, setHeadBones] = React.useState<THREE.Object3D>();
  const [prevHeadYawAngle, setPrevHeadYawAngle] = React.useState(0);
  const LookPosition = new THREE.Vector3(0,1.65,0)
  const canvas = document.querySelector('canvas');

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true , audio: true})
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((e) => console.log(e));
          localVideoRef.current.srcObject.getVideoTracks().forEach((track)=>track.enabled=isCamera);
          localVideoRef.current.srcObject.getAudioTracks().forEach((track)=>track.enabled=isMic);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);
  React.useEffect(() => {
    const peer = new Peer({ key: process.env.REACT_APP_SKYWAY_API_KEY});
    setPeer(peer);
  },[]);
  React.useEffect(() => {
    const loadWeight = async() => {
      const WEIGHT_URL = "./../weight";
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(WEIGHT_URL),
        faceapi.loadFaceLandmarkModel(WEIGHT_URL),
        faceapi.loadFaceExpressionModel(WEIGHT_URL),
      ]).then();
    }
    loadWeight();

    VRMUtils.removeUnnecessaryJoints(gltf.scene);
    VRM.from(gltf).then(vrm => {
      avatar.current = vrm
      // 初期描画で背中が映ってしまうので向きを変えてあげる
      const boneNode = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Hips);
      boneNode?.rotateY(Math.PI);

      const headbones = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Head);
      if (headbones) {
        setHeadBones(headbones)
      }
      const rightsholderbones = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.RightShoulder)
      if (rightsholderbones) {
        rightsholderbones.rotation.z = -0.1*Math.PI
      }
      const leftsholderbones = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.LeftShoulder)
      if (leftsholderbones) {
        leftsholderbones.rotation.z = 0.1*Math.PI
      }
    })
  }, []);
  React.useEffect(() => {
    if (interimTranscript !== '') {
      onSend(`Transcript-${interimTranscript}`);
    }
    }, [interimTranscript]);
  React.useEffect(() => {

    onSend(`Transcript-`);
    sendText(transcript);
    resetTranscript();
  }, [finalTranscript]);
  React.useEffect(() => {
    if (localVideoRef.current) {
      setWidthVideoRef(localVideoRef.current.offsetWidth/32|0);
      setHeightVideoRef(localVideoRef.current.offsetHeight);
    }
    if (canvas&&!vrmStream) {
      setVrmStream(canvas.captureStream());
      console.log("load canvas")
    }
  }, [localVideoRef.current?.offsetWidth, localVideoRef.current?.offsetHeight])
  React.useEffect(() => {
    if (isCamera) {
      const loopVRM = setInterval(async() => {
        const option = new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.5,
        });
        if (localVideoRef.current) {
          const result = await faceapi
            .detectSingleFace(localVideoRef.current, option)
            .withFaceLandmarks()
            .withFaceExpressions();
          if (result) {

            // 頭部回転角度を鼻のベクトルに近似する
            // 68landmarksの定義から鼻のベクトルを求める
            const upperNose = result.landmarks.positions[27];
            const lowerNose = result.landmarks.positions[30];
            const noseVec = lowerNose.sub(upperNose);
            const noseVec2 = new THREE.Vector2(noseVec.x, noseVec.y);

            if (headBones) {
              const headYawAngle = -(noseVec2.angle() - Math.PI / 2)
              const changeAngle = Math.abs(prevHeadYawAngle - headYawAngle)
              if (changeAngle > 0.04) {
                const y = headYawAngle * 1.5
                headBones.rotation.y = y
              }
              setPrevHeadYawAngle(prevHeadYawAngle => prevHeadYawAngle+changeAngle);
            }
            // リップシンク
            const upperLip = result.landmarks.positions[51];
            const lowerLip = result.landmarks.positions[57];
            let lipRatio = (lowerLip.y - upperLip.y - 10) / 30
            if (lipRatio < 0) {
              lipRatio = 0
            } else if (lipRatio > 1) {
              lipRatio = 1
            }
            if (avatar.current) {

            }

            if (avatar.current) {
              if (result.expressions.happy > 0.7) {
                avatar.current.blendShapeProxy?.setValue(VRMSchema.BlendShapePresetName.A, 0)
                avatar.current.blendShapeProxy?.setValue(VRMSchema.BlendShapePresetName.Joy, result.expressions.happy )
              }
              else {
                avatar.current.blendShapeProxy?.setValue(VRMSchema.BlendShapePresetName.Joy, 0)
                avatar.current.blendShapeProxy?.setValue(VRMSchema.BlendShapePresetName.A, lipRatio)
              }
            }
            if (avatar.current) {
              avatar.current.update(250)
            }
          }
        }
      })
      return () => clearInterval(loopVRM);
    }
  },[isCamera])
  const onStart = () => {
    if (peer) {
      if (!peer.open) {
        return;
      }
      const judgeStream = () => {
        if (vrmStream&&localStream) {
          const [vrmVideoTrack]: MediaStreamTrack[] = vrmStream.getVideoTracks();
          const [userAudioTrack]: MediaStreamTrack[] = localStream.getAudioTracks();
          return new MediaStream([vrmVideoTrack, userAudioTrack]);
        }
        else if (localStream) {
          return localStream;
        }
      }
      const vrmSendStream = judgeStream()
      const tmpRoom = peer.joinRoom<SfuRoom>(roomId, {
        mode: "sfu",
        stream: vrmSendStream,
      });
      tmpRoom.once("open", () => {
        console.log("=== You joined ===\n");
      });
      tmpRoom.on("peerJoin", (peerId) => {
        console.log(`=== ${peerId} joined ===\n`);
      });
      tmpRoom.on("stream", async (stream) => {
        setRemoteVideo((prev) => [
          ...prev,
          { stream: stream, peerId: stream.peerId },
        ]);
      });
      tmpRoom.on("data", ({src, data}) => {
        console.log(`${src}: ${data}`);
        let recvData = data.split('-');
        switch (recvData[0]) {
          case "Comprehension":
            setRemoteComprehensions(
              prev => ({
                ...prev,
                [src]:recvData[1]
              })
            );
            break;
          case "Transcript":
            setRemoteTranscriptions(
              prev => ({
                ...prev,
                [src]:recvData[1]||""
              })
            );
            break;
          case "Speech":
            speechText.text = recvData[1];
            window.speechSynthesis.speak(speechText);
            break;
          case "Share":
            if (recvData[1] === "on") {
              setIsRemoteShared(src);
            }
            else {
              setIsRemoteShared(undefined);
            }
        }
      });
      tmpRoom.on("peerLeave", (peerId) => {
        setRemoteVideo((prev) => {
          return prev.filter((video) => {
            if (video.peerId === peerId) {
              video.stream.getTracks().forEach((track) => track.stop());
            }
            return video.peerId !== peerId;
          });
        });
        setRemoteComprehensions({});
        console.log(`=== ${peerId} left ===\n`);
      });
      setRoom(tmpRoom);
    }
  };
  const onEnd = () => {
    if (room) {
      room.close();
      setRemoteVideo((prev) => {
        return prev.filter((video) => {
          video.stream.getTracks().forEach((track) => track.stop());
          return false;
        });
      });
      setRoom(undefined);
    }
  };
  const onSend = async (text:string|null) => {
    if (room) {
        room.send(text);
    }
  };
  const handleShareEndedEvent = async() => {
    if (room&&localStream){
      room.replaceStream(localStream);
      onSend("Share-off")
      console.log("share ended")
    }
  }
  const onShared = async() => {
    if (room) {
      if (!isShared&&localStream) {
        const DisplayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        DisplayStream.getVideoTracks()[0].addEventListener("ended", () => {
          handleShareEndedEvent();
          setIsShared(false);
        })
        const [displayVideoTrack]: MediaStreamTrack[] = DisplayStream.getVideoTracks();
        const [userAudioTrack]: MediaStreamTrack[] = localStream.getAudioTracks();
        const sharingStream = new MediaStream([displayVideoTrack, userAudioTrack,]);
        room.replaceStream(sharingStream);
        onSend("Share-on")
      }
      else {
        window.confirm('画面一番下の"共有を停止"を押してください')
      }
    }
  };
  const onMic = async() => {
    localStream?.getAudioTracks().forEach((track)=>track.enabled=!isMic);
  };
  const onVideo = async() => {
    localStream?.getVideoTracks().forEach((track)=>track.enabled=!isCamera);
  };

  const switchBorderColor = (comprehensionMessage:string) => {
    if (comprehensionMessage==="greenComprehension") {
      return "springgreen"
    }
    else if(comprehensionMessage==="yellowComprehension") {
      return "yellow"
    }
    else if(comprehensionMessage==="redComprehension") {
      return "red"
    }
  };
  const onTranscription = async() => {
    if (!isMic) {
      SpeechRecognition.startListening({ language: 'ja-JP', continuous:true });
    } else {
      SpeechRecognition.abortListening();
      resetTranscript();
    }
  }
  const castVideo = () => {
    return remoteVideo.map((video) => {
      if (video.peerId !== isRemoteShared){
        return <RemoteVideo key={video.peerId} video={video} comprehension={switchBorderColor(remoteComprehensions[video.peerId])} transcription={remoteTranscriptions[video.peerId]} size={-widthVideoRef*2} />;
      }
    });
  };
  const shareVideo = () => {
    return remoteVideo.map((video) => {
      if (video.peerId === isRemoteShared) {
        return <ShareVideo key={video.peerId} video={video} comprehension={switchBorderColor(remoteComprehensions[video.peerId])} transcription={remoteTranscriptions[video.peerId]} size={-widthVideoRef*2} />;
      }
    })
  }
  const openBottomBar = () => {
    return (
      <Box component={"div"} className="functionArea" sx={{width:"100%", bottom:"0", position:"fixed"}}>
        <Box component={"div"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
          <Box component={"div"} sx={{bgcolor: "#37474F", borderRadius: "16px"}} marginBottom={0.5}>
            <IconButton onClick={event => {setEnableBottomBar(!enableBottomBar)}}>
              <KeyboardDoubleArrowUpIcon  style={{ color: "white"}} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }
  const bottomBar = () => {
    return (
      <Box component={"div"} className="functionArea" sx={{width:"100%", bottom:"0", position:"fixed"}}>
        <Box component={"div"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
          <Box component={"div"} sx={{bgcolor: "#37474F", borderRadius: "16px"}} marginBottom={0.5}>
            <IconButton onClick={event => {setEnableBottomBar(!enableBottomBar)}}>
              <KeyboardDoubleArrowDownIcon style={{ color: "white"}} />
            </IconButton>
          </Box>
        </Box>
        <Grid container  sx={{bgcolor: "#37474F", weight:"100%", borderRadius: '16px'}}>
          <Grid item xs={3} md={2.5}>
            <Box component={"div"} bgcolor={"#FFFFFF"} margin={1} borderRadius={"16px"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
              <ButtonGroup>
                <IconButton onClick={event => {
                  onMic();
                  onTranscription();
                  setIsMic(!isMic);
                }}>
                  {isMic ?<MicIcon sx={{ fontSize: 60, color: "#37474F" }}/> : <MicIcon sx={{ fontSize: 60, color: "primary" }}/> }
                </IconButton>
                <IconButton onClick={event => {
                  onVideo();
                  setIsCamera(!isCamera);
                }}>
                  {isCamera ?<VideocamIcon sx={{ fontSize: 60, color: "#37474F" }}/> : <VideocamIcon sx={{fontSize: 60, color: "primary"}}/>}
                </IconButton>
                <IconButton onClick={event => {
                  if (!isRemoteShared) {
                    if (room) {
                      if (!isShared) {
                        setIsShared(!isShared);
                      }
                      onShared();
                    }
                    else {
                      window.confirm("ルームに入室していないので画面共有はできません。");
                    }
                  }
                  else {
                    window.confirm("他の人が画面共有しているので画面共有はできません。");
                  }
                }}>
                  {isShared ?<ScreenShareIcon sx={{ fontSize: 60, color: "#37474F" }}/> : <ScreenShareIcon sx={{ fontSize: 60, color: "primary" }}/>}
                </IconButton>
              </ButtonGroup>
            </Box>
          </Grid>
          <Grid item xs={3} md={2.5}>
            <Box component={"div"} bgcolor={"#FFFFFF"} margin={1} borderRadius={"16px"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
              <ButtonGroup>
                <IconButton onClick={event => {
                    onSend("Comprehension-greenComprehension");
                    setLocalComprehension("greenComprehension");
                  }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 60 }}/>
                  </IconButton>
                  <IconButton onClick={event => {
                    onSend("Comprehension-yellowComprehension");
                    setLocalComprehension("yellowComprehension");
                  }}>
                    <WarningIcon color="warning" sx={{ fontSize: 60 }}/>
                  </IconButton>
                  <IconButton onClick={event => {
                    onSend("Comprehension-redComprehension");
                    setLocalComprehension("redComprehension");
                  }}>
                    <DisabledByDefaultIcon color="error" sx={{ fontSize: 60 }}/>
                  </IconButton>
                </ButtonGroup>
              </Box>
          </Grid>
          <Grid item xs={3} md={6}>
            <Box component={"div"} margin={1} bgcolor={"#FFFFFF"} borderRadius={"16px"}>
              <TextField
                variant="standard"
                fullWidth InputProps={{ sx: { height: 76 } }}
                multiline
                inputProps={{style: {fontSize: 24}}}
                value={message}
                onChange={(event) => {
                    setMessage(event.target.value);
                    onSend(`Transcript-${event.target.value}`);
                  }
                }
                onKeyDown={(event) => {
                  if (((event.ctrlKey && !event.metaKey) || (!event.ctrlKey && event.metaKey)) && event.key === "Enter") {
                        if (isMic) {
                          onSend(`Speech-${message}`);
                          sendText(message);
                          speechText.text = message;
                          window.speechSynthesis.speak(speechText);
                        }
                        setMessage("");
                    }
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={3} md={1}>
            <Box component={"div"} bgcolor={"#FFFFFF"} margin={1} borderRadius={"16px"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
              <ButtonGroup>
                <IconButton onClick={event => {
                  setIsRoom(!isRoom);
                  if(isRoom) {onEnd();} else {onStart();}
                  }}>
                    {isRoom ?<LogoutIcon color="error" sx={{ fontSize: 60 }} /> : <LoginIcon color="success" sx={{ fontSize: 60 }} /> }
                  </IconButton>
              </ButtonGroup>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <div style={{height:64}}>
        <AppBar position="relative" color="secondary" sx={{position:"fixed"}}>
          <Toolbar>
            <AllInclusiveTwoToneIcon sx={{ mr: 4 }} />
            <Typography variant="h6" color="inherit" noWrap>
              Purposeful Activity
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <main style={{backgroundImage: `url(${BackgroundImage})`, backgroundSize:"cover"}}>
          <Box component={"div"}>
            <div className="video-screen">
              {isRemoteShared ?<Box component={"div"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
                  <Box component={"div"} width={"66%"}>
                    {shareVideo()}
                  </Box>
                </Box> : <></>}
              <Grid container spacing={5} paddingTop={5} paddingLeft={10} paddingRight={10}>
                <Grid item xs={6} md={6}>
                  <Card className="card" sx={{borderRadius: '16px', borderWidth: '6px', borderStyle:"solid", borderColor:switchBorderColor(localComprehension) }}>
                    <CardMedia
                      component='video'
                      className='localvideo'
                      ref={localVideoRef}
                      autoPlay muted playsInline
                    />
                    { message===''? <Typography align="center" fontSize={32} color={"#FFFFFF"} bgcolor={alpha("#323232", 0.95)}> {transcript.slice(-widthVideoRef*2)}</Typography> :null}
                    { transcript===''? <Typography align="center" fontSize={32} color={"#FFFFFF"} bgcolor={alpha("#323232", 0.95)}> {message.slice(-widthVideoRef*2)}</Typography> :null}
                  </Card>
                </Grid>
                <Grid item xs={6} md={6}>
                  <div style={{height:heightVideoRef,backgroundColor:"#FFFFFF", borderRadius:"16px"}}>
                    {isCamera?
                    <Canvas >
                      <color attach="background" args={['#ffffff']} />
                      <OrbitControls makeDefault minDistance={0.599} maxDistance={0.6} target={LookPosition} />
                      <PerspectiveCamera makeDefault fov={45} position={[0,1.5,0.5]} />
                      <spotLight position={[0, 2, -1]} intensity={0.4} />
                      <ambientLight intensity={0.65} />
                      <React.Suspense fallback={null}>
                        <primitive object={gltf.scene}></primitive>
                      </React.Suspense>
                    </Canvas>:<Canvas children={undefined}></Canvas>}
                  </div>
                </Grid>
                {castVideo()}
              </Grid>
            </div>
          </Box>
          <div style={{height:112}}>
            {enableBottomBar? <>{bottomBar()}</>: <>{openBottomBar()}</>}
          </div>
      </main>
    </ThemeProvider>
  );
};

const RemoteVideo = (props:any) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = props.video.stream;
      videoRef.current.play().catch((e) => console.log(e));
    }
  }, [props.video]);
  return <Grid item xs={6} md={4}>
          <Card className="card" sx={{borderRadius: '16px', borderWidth: '6px', borderStyle:"solid", borderColor:props.comprehension}}>
            <CardMedia
              component='video'
              className='Remotevideo'
              ref={videoRef}
              autoPlay playsInline
            />
            <Typography align="center" fontSize={32} color={"#FFFFFF"} bgcolor={alpha("#323232", 0.95)}>{props.transcription?.slice(props.size)}</Typography>
          </Card>
        </Grid>
};

const ShareVideo = (props:any) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = props.video.stream;
      videoRef.current.play().catch((e) => console.log(e));
    }
  }, [props.video]);
  return <Card className="card" sx={{borderRadius: '16px', borderWidth: '6px', borderStyle:"solid", bgcolor:"#FFFFFF",borderColor:props.comprehension}}>
          <CardMedia
            component='video'
            className='Remotevideo'
            ref={videoRef}
            autoPlay playsInline
          />
          <Typography align="center" fontSize={32} color={"#FFFFFF"} bgcolor={alpha("#323232", 0.95)}>{props.transcription?.slice(props.size)}</Typography>
        </Card>
};