import { gapi } from "gapi-script";

const CLIENT_ID = import.meta.env.VITE_GD_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GD_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const authenticateWithGoogle = async () => {
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          authInstance.signIn().then((user) => {
            const token = user.getAuthResponse().access_token;
            resolve(token);
          });
        })
        .catch((err) => reject(err));
    });
  });
};
