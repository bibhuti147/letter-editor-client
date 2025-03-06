export const createLettersFolder = async (token) => {
  const searchResponse = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name='Letters' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const searchData = await searchResponse.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  const folderMetadata = {
    name: "Letters",
    mimeType: "application/vnd.google-apps.folder",
  };

  const response = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(folderMetadata),
  });

  const data = await response.json();
  return data.id;
};
