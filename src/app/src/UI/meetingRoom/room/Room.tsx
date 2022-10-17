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
  const [room, setRoom] = React.useState<SfuRoom>();
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
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
  const [sizeVideoRef, setSizeVideoRef] = React.useState(0);
  const { transcript, interimTranscript, finalTranscript, resetTranscript } = useSpeechRecognition();
  const speechText = new SpeechSynthesisUtterance();

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
    const peer = new Peer({ key: process.env.REACT_APP_SKYWAY_API_KEY||""});
    setPeer(peer);
  },[]);
  React.useEffect(() => {
    if (interimTranscript !== '') {
      onSend(`Transcript-${interimTranscript}`);
    }
    }, [interimTranscript]);
  React.useEffect(() => {
    onSend(`Transcript-`);
    resetTranscript();
  }, [finalTranscript]);
  React.useEffect(() => {
    if (localVideoRef.current) {
      setSizeVideoRef(localVideoRef.current.offsetWidth/32|0);
    }
  }, [localVideoRef.current?.offsetWidth])
  const onStart = () => {
    if (peer) {
      if (!peer.open) {
        return;
      }
      const tmpRoom = peer.joinRoom<SfuRoom>(roomId, {
        mode: "sfu",
        stream: localStream,
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
        return <RemoteVideo key={video.peerId} video={video} comprehension={switchBorderColor(remoteComprehensions[video.peerId])} transcription={remoteTranscriptions[video.peerId]} size={-sizeVideoRef*2} />;
      }
    });
  };
  const shareVideo = () => {
    return remoteVideo.map((video) => {
      if (video.peerId === isRemoteShared) {
        return <ShareVideo key={video.peerId} video={video} comprehension={switchBorderColor(remoteComprehensions[video.peerId])} transcription={remoteTranscriptions[video.peerId]} size={-sizeVideoRef*2} />;
      }
    })
  }
  const openBottomBar = () => {
    return (
      <Box className="functionArea" sx={{width:"100%", bottom:"0", position:"fixed"}}>
        <Box justifyContent={"center"} alignItems={"center"} display={"flex"}>
          <Box sx={{bgcolor: "#37474F", borderRadius: "16px"}} marginBottom={0.5}>
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
      <Box className="functionArea" sx={{width:"100%", bottom:"0", position:"fixed"}}>
        <Box justifyContent={"center"} alignItems={"center"} display={"flex"}>
          <Box sx={{bgcolor: "#37474F", borderRadius: "16px"}} marginBottom={0.5}>
            <IconButton onClick={event => {setEnableBottomBar(!enableBottomBar)}}>
              <KeyboardDoubleArrowDownIcon style={{ color: "white"}} />
            </IconButton>
          </Box>
        </Box>
        <Grid container  sx={{bgcolor: "#37474F", weight:"100%", borderRadius: '16px'}}>
          <Grid item xs={3} md={2.5}>
            <Box bgcolor={"#FFFFFF"} margin={1} borderRadius={"16px"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
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
            <Box bgcolor={"#FFFFFF"} margin={1} borderRadius={"16px"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
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
            <Box margin={1} bgcolor={"#FFFFFF"} borderRadius={"16px"}>
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
            <Box bgcolor={"#FFFFFF"} margin={1} borderRadius={"16px"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
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
          <Box>
            <div className="video-screen">
              {isRemoteShared ?<Box justifyContent={"center"} alignItems={"center"} display={"flex"}>
                  <Box width={"66%"}>
                    {shareVideo()}
                  </Box>
                </Box> : <></>}
              <Grid container spacing={5} paddingTop={5} paddingLeft={10} paddingRight={10}>
                <Grid item xs={6} md={4}>
                  <Card className="card" sx={{borderRadius: '16px', borderWidth: '6px', borderStyle:"solid", borderColor:switchBorderColor(localComprehension) }}>
                    <CardMedia
                      component='video'
                      className='localvideo'
                      ref={localVideoRef}
                      autoPlay muted playsInline
                    />
                    { message===''? <Typography align="center" fontSize={32} color={"#FFFFFF"} bgcolor={alpha("#323232", 0.95)}> {transcript.slice(-sizeVideoRef*2)}</Typography> :null}
                    { transcript===''? <Typography align="center" fontSize={32} color={"#FFFFFF"} bgcolor={alpha("#323232", 0.95)}> {message.slice(-sizeVideoRef*2)}</Typography> :null}
                  </Card>
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
  return <Card className="card" sx={{borderRadius: '16px', borderWidth: '6px', borderStyle:"solid", borderColor:props.comprehension}}>
          <CardMedia
            component='video'
            className='Remotevideo'
            ref={videoRef}
            autoPlay playsInline
          />
          <Typography align="center" fontSize={32} color={"#FFFFFF"} bgcolor={alpha("#323232", 0.95)}>{props.transcription?.slice(props.size)}</Typography>
        </Card>
};