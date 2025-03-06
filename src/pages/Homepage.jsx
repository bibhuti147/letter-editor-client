import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, signUpWithGooglePopup } from "../firebase.config";
import axios from "axios";
import { toast } from "react-toastify";

const Homepage = () => {
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
    <>
      <section className="bg-zinc-200 h-screen flex items-center flex-col">
        <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold sm:text-5xl">
              Manage your letters
              <strong className="font-extrabold text-[#4845d2] sm:block">
                Your Text-Based Editor
              </strong>
            </h1>

            <p className="mt-4 sm:text-xl/relaxed">
              Sign up with Google, write and edit letters, and save them to
              Google Drive seamlessly.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {userDetails?.uid ? (
                <Link
                  to="/dashboard"
                  className="block w-full rounded bg-[#4845d2] px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-800 focus:outline-none focus:ring active:bg-red-500 cursor-pointer sm:w-auto"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div
                  onClick={handleAuth}
                  className="block w-full rounded bg-[#4845d2] px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-800 focus:outline-none focus:ring active:bg-red-500 cursor-pointer sm:w-auto"
                >
                  Get Started
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Homepage;
