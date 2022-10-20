import { db, auth, timestamp } from '../../firebase';
import { collection, addDoc } from "firebase/firestore";

export const CreateRoomData = async() => {
  try {
    const user = auth.currentUser;
    if(user !== null){
      const roomRef = await addDoc(collection(db, "MeetingRooms"), {
        date: timestamp,
        creator: user.email,
        members: [user.email],
        document: false,
      });
      return roomRef.id
    }
  } catch (error) {
    console.error(error);
    return null
  };
}