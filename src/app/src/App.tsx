import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import MyPage from "./pages/MyPage";
import "./App.css";
import MeetingRoom from "./pages/MeetingRoom";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={`/`} element={<Home />} />
          <Route path={`/signup/`} element={<SignUp />} />
          <Route path={`/signin/`} element={<SignIn />} />
          <Route path={`/mypage/:content`} element={<MyPage />} />
          <Route
            path={`/meeting-room/:token`}
            element={<MeetingRoom />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
