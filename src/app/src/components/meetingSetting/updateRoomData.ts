import { db, auth } from '../../firebase';
import { collection, doc, query, where, getDocs, updateDoc } from "firebase/firestore";


export const UpdateRoomData = async(value:string) => {
  try {
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