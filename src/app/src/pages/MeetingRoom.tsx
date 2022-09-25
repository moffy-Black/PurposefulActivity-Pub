import { useParams } from "react-router-dom";
import { Room } from "../components/Room";

const MeetingRoom = () => {
  const { token } = useParams();
  if (typeof token === "string") {
    return <Room roomId={token} />;
  } else {
    return null;
  }
};

export default MeetingRoom;
