import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors()); // Allow all origins

const upload = multer();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

app.get("/", (req, res) => {
  res.send("Photo upload backend is running!");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileName = Date.now() + "-" + req.file.originalname;

  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/photos/${fileName}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": req.file.mimetype
    },
    body: req.file.buffer
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    return res.status(500).json({ error: "Upload failed", details: err });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;
  res.json({ url: publicUrl });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
