import { auth } from "../../firebase";

export const funcLogout = () => {
  try {
    auth.signOut();
    return true
  } catch (error) {
    console.error(error);
    return false
  }
}