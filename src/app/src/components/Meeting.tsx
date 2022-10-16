import * as React from "react";
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { db, auth, timestamp } from '../firebase';
import { collection, doc, query, where, getDocs, updateDoc, addDoc } from "firebase/firestore";

const MeetingView = () => {

    async function handleCreateMeetingRoom() {
        try {
            const  str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const token = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((n)=>str[n%str.length]).join('')
            const user = auth.currentUser;
            if(user !== null){
                await addDoc(collection(db, "MeetingRooms"), {
                    token: token,
                    date: timestamp,
                    creator: user.email,
                    members: [user.email],
                    document: false,
                });
                window.open("../../meeting-room/"+token, "_blank");
            }
        } catch (error) {
            console.error(error);
        };
    };

    const [value, setValue] = useState('default');

    async function handleParticipateMeetingRoom() {
        try {
            window.open("../../meeting-room/"+value, "_blank");
            const user = auth.currentUser;
            if(user !== null){
                const room = query(collection(db, "MeetingRooms"), where("token", "==", value));
                const data = await getDocs(room);
                data.forEach((d)=>{
                    updateDoc(doc(collection(db, "MeetingRooms/"+d.data().id+"/members")), {
                        token: d.data().token,
                        date: d.data().date,
                        creator: d.data().creator,
                        members: d.data().members.push(user.email),
                        document: d.data().document,
                    })
                })
            }
        } catch (error) {
            console.error(error);
        }
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
            <TextField  sx={{ m: 2 }} id="outlined-basic" label="招待コード" variant="outlined" onChange={(event) => setValue(event.target.value)}/>
            <Button  sx={{ m: 2 }} variant="outlined" color="secondary" onClick={handleParticipateMeetingRoom}>部屋に入る</Button>
        </Box>
    );
};

export default MeetingView;
