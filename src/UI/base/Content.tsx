import { useParams } from "react-router-dom";
import MeetingView from "../meetingSetting/MeetingSetting";
import Minutes from "../Minutes/Minutes";

const Content = () => {
  const { content } = useParams();

  if (content === "meeting") {
    return <MeetingView />;
  } else {
    return <Minutes />;
  }
};

export default Content;
