import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase.config";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import dayjs from "dayjs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);

  const handleUserData = async (user) => {
    try {
      const token = await user.getIdToken(true);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleUserData(user);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-200">
      <div className="p-4">
        <nav className="block w-full max-w-full bg-transparent text-white shadow-none rounded-xl transition-all px-0 py-1">
          <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
            <div className="capitalize gap-y-2">
              <h2 className="flex gap-x-2 antialiased tracking-normal font-sans text-3xl font-bold leading-relaxed text-gray-900">
                Hello
                <strong className="block antialiased tracking-normal font-sans text-3xl font-bold leading-relaxed text-[#4845d2]">
                  {userDetails?.name}
                </strong>
                👋
              </h2>
              <h2 className="block antialiased tracking-normal font-sans text-2xl font-medium leading-relaxed text-[#4845d2]">
                Dashboard
              </h2>
            </div>
          </div>
        </nav>
        <div className="mt-12">
          <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
            <Link
              to="/newletter"
              className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md hover:bg-gradient-to-tr from-blue-600 to-blue-400 hover:text-white cursor-pointer"
            >
              <div className="bg-clip-border mx-4 mt-5 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/40 shadow-lg absolute grid h-12 w-12 place-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-file-plus"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                  <path d="M12 11l0 6" />
                  <path d="M9 14l6 0" />
                </svg>
              </div>
              <div className="p-8 text-right">
                <p className="font-sans text-lg leading-normal font-bold">
                  Create new letter
                </p>
              </div>
            </Link>
            <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
              <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-pink-600 to-pink-400 text-white shadow-pink-500/40 shadow-lg absolute mt-5 grid h-12 w-12 place-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-file-stack"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
                  <path d="M5 21h14" />
                  <path d="M5 18h14" />
                  <path d="M5 15h14" />
                </svg>
              </div>
              <div className="p-4 text-right">
                <p className="block antialiased font-sans text-lg leading-normal font-bold">
                  Total Letters
                </p>
                <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
                  {userDetails?.savedLetters?.length}
                </h4>
              </div>
            </div>
          </div>

          <div className="mb-4 gap-6">
            <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md overflow-hidden xl:col-span-2">
              <div className="relative bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 flex items-center justify-between px-6 py-3">
                <div>
                  <h6 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-relaxed text-blue-gray-900 mb-1">
                    Drafts
                  </h6>
                </div>
              </div>
              <div className="p-6 overflow-x-scroll px-0 pt-0 pb-2">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-200 py-3 px-6 text-left">
                        <p className="block antialiased font-sans text-[11px] font-medium uppercase text-blue-gray-400">
                          File name
                        </p>
                      </th>
                      <th className="border-b border-gray-200 py-3 px-6 text-left">
                        <p className="block antialiased font-sans text-[11px] font-medium uppercase text-blue-gray-400">
                          Created At
                        </p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetails && userDetails.savedLetters.length > 0 ? (
                      userDetails.savedLetters
                        .filter((letter) => letter.isDraft)
                        .map((letter) => (
                          <tr key={letter._id}>
                            <td className="py-3 px-7 border-b border-gray-200">
                              <Link
                                to={`/editletter/${letter._id}`}
                                className="flex items-center gap-4 hover:text-gray-600 cursor-pointer group"
                              >
                                <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-bold">
                                  {letter.title}
                                </p>
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200">
                                  Edit
                                </span>
                              </Link>
                            </td>
                            <td className="py-3 px-7 border-b border-gray-200">
                              <div className="w-10/12">
                                <p className="antialiased font-sans mb-1 block text-xs font-medium text-blue-gray-600">
                                  {new Date(letter.updatedAt).toLocaleString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  )}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td className="py-3 px-7 border-b border-gray-200">
                          <div className="flex justify-end items-center gap-4 hover:text-gray-600 cursor-pointer group">
                            <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-bold">
                              No Letters yet
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mb-4 gap-6">
            <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md overflow-hidden xl:col-span-2">
              <div className="relative bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 flex items-center justify-between px-6 py-3">
                <div>
                  <h6 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-relaxed text-blue-gray-900 mb-1">
                    Saved Posts
                  </h6>
                </div>
              </div>
              <div className="p-6 overflow-x-scroll px-0 pt-0 pb-2">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-200 py-3 px-6 text-left">
                        <p className="block antialiased font-sans text-[11px] font-medium uppercase text-blue-gray-400">
                          File name
                        </p>
                      </th>
                      <th className="border-b border-gray-200 py-3 px-6 text-left">
                        <p className="block antialiased font-sans text-[11px] font-medium uppercase text-blue-gray-400">
                          Created At
                        </p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetails && userDetails.savedLetters.length > 0 ? (
                      userDetails.savedLetters
                        .filter((letter) => !letter.isDraft)
                        .map((letter) => (
                          <tr key={letter._id}>
                            <td className="py-3 px-7 border-b border-gray-200">
                              <Link
                                to={`/editletter/${letter._id}`}
                                className="flex items-center gap-4 hover:text-gray-600 cursor-pointer group"
                              >
                                <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-bold">
                                  {letter.title}
                                </p>
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200">
                                  View
                                </span>
                              </Link>
                            </td>
                            <td className="py-3 px-7 border-b border-gray-200">
                              <div className="w-10/12">
                                <p className="antialiased font-sans mb-1 block text-xs font-medium text-blue-gray-600">
                                  {new Date(letter.updatedAt).toLocaleString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  )}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td className="py-3 px-7 border-b border-gray-200">
                          <div className="flex justify-end items-center gap-4 hover:text-gray-600 cursor-pointer group">
                            <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-bold">
                              No Letters yet
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
