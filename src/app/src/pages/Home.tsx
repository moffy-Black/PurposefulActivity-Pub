import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <h1>ホーム</h1>
      <div>
        <li><Link to={`/signup/`}>SignUp</Link></li>
        <li><Link to={`/signin/`}>SignIn</Link></li>
      </div>
    </>
  );
};

export default Home;