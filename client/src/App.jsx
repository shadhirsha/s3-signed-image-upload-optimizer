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

  return (
    <div>
      <div className="App">
        <h1>Upload Image</h1>
        <input type={"file"} name="picture" onChange={handleUpload} />
        {previewUrl && (
          <img
            src={previewUrl}
            style={{ width: 200, height: 200 }}
            alt="logo"
          />
        )}
        <input type="button" value="Save" onClick={handleSubmit} />
      </div>
      <h3>Out Images Screen Test</h3>
      <p>
        https://hm-image-storage-test.s3.ap-southeast-1.amazonaws.com/uploads/1769440163073-photo-800w.webp
      </p>
      <img
        src={
          "https://hm-image-storage-test.s3.ap-southeast-1.amazonaws.com/uploads/1769440163073-photo-800w.webp"
        }
        alt="logo"
        srcSet="https://hm-image-storage-test.s3.ap-southeast-1.amazonaws.com/uploads/1769440163073-photo-400w.webp 400w, 
        https://hm-image-storage-test.s3.ap-southeast-1.amazonaws.com/uploads/1769440163073-photo-800w.webp 800w, 
        https://hm-image-storage-test.s3.ap-southeast-1.amazonaws.com/uploads/1769440163073-photo-1200w.webp 1200w"
        sizes="(max-width: 800px) 100vw, 
         800px"
      />
    </div>
  );
}

export default App;
