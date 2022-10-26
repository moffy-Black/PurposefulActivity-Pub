import { Navigate } from "react-router-dom";

import { useAuthContext } from "../AuthContext";
import { PersistentDrawerLeft } from "./PersistentDrawerLeft";

const BasePage = () => {
  const { user } = useAuthContext();
  const DRAWERWIDTH = 240;

  if (!user) {
    return <Navigate to="/signin" />;
  } else {
    return <PersistentDrawerLeft drawerWidth={DRAWERWIDTH} />;
  }
};


export default BasePage;
