const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
app.use(express.json({ limit: "100mb" }));
app.use(
  cors(true)
);

function deleteFile(filePath, time) {
    console.log(time)
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log(`File deleted: ${filePath}`);
      }
    });
   
  }, 60 * 60 * 10*time );
}

app.post("/fileupload", (req, res) => {
  let { file } = req.body;
  let { time } = req.body;

  const matches = file.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).send("Invalid file data.");
  }
  function generateUniqueCode() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }
  const fileType = matches[1].split("/")[1];
  const base64Data = matches[2];
  const uniqueCode = generateUniqueCode();
  const fileName = `${uniqueCode}.${fileType}`;
  const filePath = path.join(__dirname, "uploads", fileName);
  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      console.log(err);
      return res.send("file not uploaded", err);
    }
    res.send(uniqueCode);
    deleteFile(filePath, time);
  });
});


app.post("/receiveFile", (req, res) => {
    const { code } = req.body;
  
    fs.readdir("uploads", (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
      }
  
      // Find the file that starts with the given code
      let matchedFile = files.find((file) => file.startsWith(code));
  
      if (!matchedFile) {
       
        return res.status(500).send({ status: "error", message: "Error sending the file" });
      }
  
      let filePath = path.join(__dirname, "uploads", matchedFile);
     
      res.sendFile(filePath);
      
    });
  });
  

app.listen(3000, (err) => {
  if (err) {
    console.log("server not running", err);
  } else {
    console.log("server running at 3000");
  }
});
