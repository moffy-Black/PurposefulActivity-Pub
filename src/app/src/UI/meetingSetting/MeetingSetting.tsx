import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { CreateRoomData } from "../../components/meetingSetting/createRoomData"
import { UpdateRoomData } from "../../components/meetingSetting/updateRoomData"

const MeetingView = () => {
    const [roomId, setRoomId] = useState('default');

    async function handleCreateMeetingRoom() {
        const token = await CreateRoomData()
        if (token!==null) {
            window.open("../../meeting-room/"+token, "_blank");
        }
    };

    async function handleParticipateMeetingRoom(value:string) {
        await UpdateRoomData(value);
        window.open("../../meeting-room/"+value, "_blank");
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
            <TextField  sx={{ m: 2 }} id="outlined-basic" label="招待コード" variant="outlined" onChange={(event) => setRoomId(event.target.value)}/>
            <Button  sx={{ m: 2 }} variant="outlined" color="secondary" onClick={()=>handleParticipateMeetingRoom(roomId)}>部屋に入る</Button>
        </Box>
    );
};

export default MeetingView;
