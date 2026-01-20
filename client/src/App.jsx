import "./App.css";
import axios from "axios";
import { Axios } from "./axios";
import { useState } from "react";

function App() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uris, setUris] = useState({
    signedUrl: null,
    publicUrl: null,
  });

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoFile(file);

      const { data, status } = await Axios.post("/generate-signed-url", {
        name: file.name,
        type: file.type,
      });

      if (status === 200) {
        setUris(data);
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
      } else {
        console.log("error");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(uris.signedUrl, photoFile);
      if (res.status === 200) {
        alert("Upload success");
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log(uris);
  return (
    <div className="App">
      <h1>Upload Image</h1>
      <input type={"file"} name="picture" onChange={handleUpload} />
      {previewUrl && (
        <img src={previewUrl} style={{ width: 200, height: 200 }} alt="logo" />
      )}
      <input type="button" value="Save" onClick={handleSubmit} />
    </div>
  );
}

export default App;
