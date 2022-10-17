import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./UI/AuthContext";
import Home from "./UI/Home";
import SignUp from "./UI/userAuth/SignUp";
import SignIn from "./UI/userAuth/SignIn";
import BasePage from "./UI/base/BasePage";
import "./App.css";
import MeetingRoom from "./UI/meetingRoom/MeetingRoom";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={'/'} element={<Home />} />
          <Route path={'/signup/'} element={<SignUp />} />
          <Route path={'/signin/'} element={<SignIn />} />
          <Route path={'/mypage/:content'} element={<BasePage />} />
          <Route
            path={'/meeting-room/:token'}
            element={<MeetingRoom />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
