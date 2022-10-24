import React from "react";

import { alpha } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

export function RemoteVideo(props:any) {
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

export function ShareVideo(props:any) {
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