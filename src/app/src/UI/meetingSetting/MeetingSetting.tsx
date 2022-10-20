import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { CreateRoomData } from "../../firestore/crud/createRoomData"
import { UpdateRoomData } from "../../firestore/crud/updateRoomData"

const MeetingView = () => {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    async function handleCreateMeetingRoom() {
        const token = await CreateRoomData()
        if (token!==null) {
            navigate("../../meeting-room/"+token);
        }
    };

    async function handleParticipateMeetingRoom() {
        await UpdateRoomData(roomId);
        navigate("../../meeting-room/"+roomId);
    }
    return (
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
            <Button sx={{ m: 2 }} variant="contained" color="secondary" onClick={handleCreateMeetingRoom}>部屋を作る</Button>
            <TextField  sx={{ m: 2 }} id="outlined-basic" label="招待コード" variant="outlined" value={roomId} onChange={(event) => setRoomId(event.target.value)}/>
            <Button  sx={{ m: 2 }} variant="outlined" color="secondary" onClick={handleParticipateMeetingRoom}>部屋に入る</Button>
        </Box>
    );
};

export default MeetingView;
