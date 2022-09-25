import * as React from 'react';
import { db, auth } from '../firebase';
import { collection, doc, query, where, getDocs, updateDoc } from "firebase/firestore";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';



interface Data {
    name: string;
    date: string;
    creator: string;
    members: number;
    document: boolean;
  }
export default function Minutes() {
    const [rows, setRows] = React.useState<Data[]>([]);
    const [rooms, setRooms] = React.useState<string[]>([])
    const getData = () => {
        // if (rows.length===0){
            const user = auth.currentUser;
            if (user!==null){
                const MeetingRooms = collection(db, "MeetingRooms");
                getDocs(query(MeetingRooms, where("members", "array-contains", user.email))).then(snapshot => {
                    snapshot.forEach(doc => {
                        if (!rooms.includes(doc.data().token)){
                            setRooms((token) => [
                                ...token, doc.data().token
                            ])
                            setRows((prev) => [
                                ...prev,
                                {
                                    name: doc.data().token,
                                    date: doc.data().date.toDate().toJSON(),
                                    creator: doc.data().creator,
                                    members: doc.data().members.length,
                                    document: doc.data().document,
                                }
                            ])
                        }
                })
                })
        // }
      }}

    const createDoc = async (roomId: string) => {
        const room = query(collection(db, "MeetingRooms"), where("token", "==", roomId));
        const data = await getDocs(room);
        data.forEach((d)=>{
            fetch('http://127.0.0.1:8080?roomid='+d.data().token+'&docid='+d.id)
            .then(res => res.json())
            .then(data => {
                console.log(JSON.stringify(data));
            })
            updateDoc(doc(collection(db, "MeetingRooms"), d.id), {
                token: d.data().token,
                date: d.data().date,
                creator: d.data().creator,
                members: d.data().members,
                document: true,
            })
        })
        await getData();
    }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>会議室ID</TableCell>
            <TableCell align="right">日時</TableCell>
            <TableCell align="right">作成者</TableCell>
            <TableCell align="right">参加人数</TableCell>
            <TableCell align="right">議事録</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.date}</TableCell>
              <TableCell align="right">{row.creator}</TableCell>
              <TableCell align="right">{row.members}</TableCell>
              <TableCell align="right">
                {row.document === true
                    ? <Button disabled>作成済</Button>
                    : <Button color="secondary" onClick={() => createDoc(row.name)}>作成する</Button>
                }   
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button sx={{ m: 2 }} variant="contained" color="secondary" onClick={getData}>表示</Button>
    </TableContainer>
  );
}