import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, signUpWithGooglePopup } from "../firebase.config";
import { toast } from "react-toastify";
import axios from "axios";

const Header = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    const storedExp = sessionStorage.getItem("tokenExp");

    if (storedUserId && storedExp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < storedExp) {
        setUserDetails({ uid: storedUserId });
        scheduleLogout(storedExp);
      } else {
        setExpired(true);
      }
    }
  }, []);

  const handleAuth = async () => {
    try {
      const { user } = await signUpWithGooglePopup();
      const idToken = await user.getIdToken();
      console.log(idToken);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/sign-up`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const { exp } = response.data.data;

      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("tokenExp", response.data.data.exp);

      setUserDetails({ uid: user.uid });
      setExpired(false);
      window.location.reload();

      scheduleLogout(exp);
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Sign-in failed");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserDetails(null);
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("tokenExp");
      setExpired(false);
      window.location.reload();
    } catch (error) {
      console.error("Sign-out error:", error);
      toast.error("Sign-out failed");
    }
  };

  const refreshSession = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        handleSignOut();
        return;
      }

      const idToken = await currentUser.getIdToken(true);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const { exp } = response.data.data;
      sessionStorage.setItem("tokenExp", exp);

      setExpired(false);
      scheduleLogout(exp);
      toast.success("Session refreshed!");
    } catch (error) {
      console.error("Session refresh error:", error);
      toast.error("Failed to refresh session.");
    }
  };

  const scheduleLogout = (token) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = (token - currentTime) * 1000;

    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        setExpired(true);
      }, timeUntilExpiry);
    }
  };

  useEffect(() => {
    if (expired) {
      refreshSession();
    }
  }, [expired]);

  return (
    <div className="p-3 flex justify-between items-center shadow-md">
      <Link className="cursor-pointer" to="/">
        <img
          src="../src/assets/logo-full-brand.svg"
          alt="logo"
          width={160}
          height={100}
        />
      </Link>
      {userDetails ? (
        <button
          onClick={handleSignOut}
          className="rounded bg-[#4845d2] hover:bg-blue-800 cursor-pointer px-3 py-3 text-sm font-medium text-white"
        >
          Sign out
        </button>
      ) : (
        <button
          onClick={handleAuth}
          className="rounded bg-[#4845d2] hover:bg-blue-800 cursor-pointer px-3 py-3 text-sm font-medium text-white"
        >
          Sign up
        </button>
      )}
    </div>
  );
};

export default Header;
