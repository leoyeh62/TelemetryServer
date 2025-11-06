import express from "express";
const app = express();
app.use(express.json());

app.post("/session", (req, res) => {
  console.log("Session reçue :", req.body);
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serveur en écoute sur le port ${port}`));