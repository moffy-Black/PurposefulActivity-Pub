import { db, auth, timestamp } from '../../firebase';
import { collection, addDoc } from "firebase/firestore";

export const CreateRoomData = async() => {
  try {
    const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
      return token
    }
  } catch (error) {
    console.error(error);
    return null
  };
}