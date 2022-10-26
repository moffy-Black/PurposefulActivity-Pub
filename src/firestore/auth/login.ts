import * as React from "react";
import { auth, createUserWithEmailAndPassword ,signInWithEmailAndPassword } from "../../firebase";

export const funcLogin = async (event: React.FormEvent<HTMLFormElement>, method: string) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  interface Obj {
    email: any;
    password: any;
  }
  const user: Obj = {
    email: data.get("email"),
    password: data.get("password"),
  };
  if (method==="signup") {
    try {
      await createUserWithEmailAndPassword(auth,user.email, user.password);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  } else if (method==="signin") {
    try {
      signInWithEmailAndPassword(auth,user.email, user.password);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};