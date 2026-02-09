
import express from "express";
import path from "path";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/status", (req, res) => {
  res.json({ status: "ok", authorized: true });
});

app.use((req, res) => {
  res.status(403).sendFile(path.join(process.cwd(), "public/403.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
