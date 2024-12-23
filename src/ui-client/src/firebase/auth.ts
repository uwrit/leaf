import { Auth, getAuth, signOut } from "@firebase/auth";
import { app } from "./init";

export const firebaseAuth: Auth = getAuth(app);

export async function logout(): Promise<boolean> {
  try {
    await signOut(firebaseAuth);
    return true;
  } catch (e) {
    return false;
  }
}
