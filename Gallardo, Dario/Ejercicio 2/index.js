import express from "express";
import { conectarDB } from "./db.js";
import listaRouter from "./lista.js";


conectarDB();

const app = express();
const port = 3000;

// Para interpretar body como JSON
app.use(express.json());

app.get("/", (req, res) => {
  // Responder con string
  res.send("Hola mundo!");
});

app.use("/lista", listaRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});