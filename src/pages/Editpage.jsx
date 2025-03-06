import { useNavigate, useParams } from "react-router-dom";
import { Editor, EditorState, Modifier, RichUtils } from "draft-js";
import { useEffect, useState } from "react";
import "draft-js/dist/Draft.css";
import { stateToHTML } from "draft-js-export-html";
import { auth } from "../firebase.config";
import axios from "axios";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import { stateFromHTML } from "draft-js-import-html";
import { authenticateWithGoogle } from "../components/AuthenticateWithGoogle";
import { createLettersFolder } from "../components/CreateLettersFolder";
import { convert } from "html-to-text";

const Editpage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [title, setTitle] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const handleBlockType = (command) => {
    const newState = RichUtils.toggleBlockType(editorState, command);
    setEditorState(newState);
  };

  const handleFontStyle = (command) => {
    const newState = RichUtils.toggleInlineStyle(editorState, command);
    setEditorState(newState);
  };

  const handleStyleRemover = () => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    if (selection.isCollapsed()) return;

    const selectedText = contentState
      .getBlockForKey(selection.getStartKey())
      .getText()
      .slice(selection.getStartOffset(), selection.getEndOffset());

    const newContentState = Modifier.replaceText(
      contentState,
      selection,
      selectedText
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "remove-range"
    );

    // Check if selected block is a list, then convert it to "unstyled"
    const blockType = RichUtils.getCurrentBlockType(newEditorState);
    if (
      blockType === "unordered-list-item" ||
      blockType === "ordered-list-item"
    ) {
      setEditorState(RichUtils.toggleBlockType(newEditorState, "unstyled"));
    } else {
      setEditorState(newEditorState);
    }
  };

  const handleToGD = async () => {
    try {
      const contentState = editorState.getCurrentContent();
      const htmlContent = stateToHTML(contentState);

      const currentUser = auth.currentUser;
      const ftoken = await currentUser.getIdToken(true);

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/letter/editletter/${id}`,
        {
          title: title,
          content: htmlContent,
          isDraft: false,
        },
        {
          headers: {
            Authorization: `Bearer ${ftoken}`,
          },
        }
      );

      const options = {
        wordwrap: 130,
      };

      const content = convert(htmlContent, options);

      const token = await authenticateWithGoogle();
      const folderId = await createLettersFolder(token);

      const metadata = {
        name: `${title}`,
        mimeType: "application/vnd.google-apps.document",
        parents: [folderId],
      };

      const formData = new FormData();
      formData.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      formData.append("file", new Blob([content], { type: "text/plain" }));

      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      navigate("/dashboard");
      toast.success("Letter saved to Google Drive!");
    } catch (error) {
      console.error("Error saving letter:", error);
    }
  };

  const handleToDraft = async () => {
    const contentState = editorState.getCurrentContent();
    const content = stateToHTML(contentState);

    const currentUser = auth.currentUser;
    const token = await currentUser.getIdToken(true);

    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/letter/editletter/${id}`,
      {
        title: title,
        content: content,
        isDraft: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Letter edited successfully");
    setTitle("");
    navigate("/dashboard");
  };

  const handleClick = () => {
    setConfirm(true);
  };

  const handleGetLetter = async (user) => {
    try {
      const token = await user.getIdToken(true);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/letter/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle(response.data.data.letter.title);

      if (!response.data.data.letter.isDraft) {
        checkIfLetterExists();
      } else {
        setLoading(false);
      }

      const contentState = stateFromHTML(response.data.data.letter.content);
      setEditorState(EditorState.createWithContent(contentState));
    } catch (error) {
      console.error("Error while fetching letter", error);
    }
  };

  const [folderId, setFolderId] = useState(null);
  const [fileExists, setFileExists] = useState(false);
  const [loading, setLoading] = useState(true);

  const getLettersFolderId = async (token) => {
    const query = encodeURIComponent(
      "name='Letters' and mimeType='application/vnd.google-apps.folder'"
    );

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    return data.files.length > 0 ? data.files[0].id : null;
  };

  const checkFileExistsInFolder = async (token, folderId, fileName) => {
    const query = encodeURIComponent(
      `name='${fileName}' and '${folderId}' in parents`
    );

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    return data.files.length > 0;
  };

  const checkIfLetterExists = async () => {
    try {
      const token = await authenticateWithGoogle();

      const folderId = await getLettersFolderId(token);
      if (!folderId) {
        setLoading(false);
        return;
      }
      setFolderId(folderId);

      const fileExists = await checkFileExistsInFolder(token, folderId, title);
      setFileExists(fileExists);
    } catch (error) {
      console.error("Error checking file existence:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleGetLetter(user);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [title]);

  return (
    <>
      {confirm ? (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
          <div className="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-white">
            <div className="w-full">
              <div className="m-8 my-20 max-w-[400px] mx-auto">
                <div className="mb-8">
                  <h1 className="mb-4 text-3xl font-extrabold">
                    Save this on your drive
                  </h1>
                  {/* <p className="text-gray-600">
                Get the most out of Twitter by staying up to date with what's
                happening.
              </p> */}
                </div>
                <div className="space-y-4">
                  <button
                    onClick={handleToGD}
                    className="p-3 bg-black rounded-full text-white w-full font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setConfirm(false)}
                    className="p-3 bg-white border rounded-full w-full font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-zinc-200">
          <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">
              Edit "{title}" Letter
            </h1>
            <input
              type="text"
              disabled={fileExists || loading}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name of the Letter"
              className="text-4xl font-bold focus:outline-none pt-3 placeholder:text-gray-400 text-gray-600"
            />
            <div className="p-4 border rounded-lg shadow-md bg-white max-w-2xl my-5">
              <div className="flex gap-2 mb-2">
                <button
                  className="w-8 h-8 border border-gray-600 rounded-md active:bg-gray-300 cursor-pointer"
                  onMouseDown={() => handleBlockType("header-one")}
                >
                  H1
                </button>
                <button
                  className="w-8 h-8 border border-gray-600 rounded-md active:bg-gray-300 cursor-pointer"
                  onMouseDown={() => handleBlockType("header-two")}
                >
                  H2
                </button>
                <button
                  className="w-8 h-8 border border-gray-600 rounded-md active:bg-gray-300 cursor-pointer"
                  onMouseDown={() => handleBlockType("header-three")}
                >
                  H3
                </button>
                <button
                  className="w-6 h-8 border border-gray-600 rounded-md active:bg-gray-300 cursor-pointer"
                  onMouseDown={() => handleFontStyle("ITALIC")}
                >
                  I
                </button>
                <button
                  className="w-7 h-8 border border-gray-600 rounded-md active:bg-gray-300 cursor-pointer"
                  onMouseDown={() => handleFontStyle("BOLD")}
                >
                  B
                </button>
                <button
                  className="w-8 h-8 border border-gray-600 rounded-md active:bg-gray-300 cursor-pointer"
                  onMouseDown={() => handleBlockType("unordered-list-item")}
                >
                  UL
                </button>
                <button
                  className="w-8 h-8 border border-gray-600 rounded-md active:bg-gray-300 cursor-pointer"
                  onMouseDown={() => handleBlockType("ordered-list-item")}
                >
                  OL
                </button>
                <button
                  className="w-8 h-8 border border-gray-600 rounded-md active:bg-gray-300 cursor-pointer"
                  onMouseDown={handleStyleRemover}
                >
                  Tₓ
                </button>
              </div>

              <div className="p-2 border rounded mt-5 min-h-60">
                <Editor editorState={editorState} onChange={setEditorState} />
              </div>
            </div>
            {fileExists || loading ? (
              <p className="rounded-lg bg-green-600 p-3 text-white font-semibold mt-1 w-fit">
                {loading
                  ? "Checking..."
                  : fileExists
                  ? "Letter Already Exists"
                  : "Send Letter"}
              </p>
            ) : (
              <>
                <button
                  onClick={handleClick}
                  className="p-3 focus:outline-none text-white font-semibold rounded-xl bg-blue-600 active:bg-blue-400 cursor-pointer mt-1"
                >
                  Send to Drive
                </button>
                <button
                  onClick={handleToDraft}
                  className="ml-2 p-3 focus:outline-none text-white font-semibold rounded-xl bg-blue-600 active:bg-blue-400 cursor-pointer mt-1"
                >
                  Save as Draft
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Editpage;
