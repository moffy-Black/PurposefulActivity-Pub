import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./UI/AuthContext";
import Home from "./UI/Home";
import SignUp from "./UI/userAuth/SignUp";
import SignIn from "./UI/userAuth/SignIn";
import MyPage from "./UI/MyPage";
import "./App.css";
import MeetingRoom from "./UI/MeetingRoom";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={'/'} element={<Home />} />
          <Route path={'/signup/'} element={<SignUp />} />
          <Route path={'/signin/'} element={<SignIn />} />
          <Route path={'/mypage/:content'} element={<MyPage />} />
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
