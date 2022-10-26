import { auth, db } from '../../firebase';
import { collection, doc, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";


export const UpdateRoomData = async(value:string) => {
  try {
    const user = auth.currentUser;
    if(user !== null){
      const roomRef = query(collection(db, "MeetingRooms"), where("token", "==", value));
      const roomData = await getDocs(roomRef);
      roomData.forEach((data)=>{
        updateDoc(doc(db, "MeetingRooms/", data.id),{members:arrayUnion(user.email)})
      })
    }
  } catch (error) {
    console.error(error);
  }
}