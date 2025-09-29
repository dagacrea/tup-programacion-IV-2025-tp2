import express from "express";
//import { param,body,validationResult,query} from "express-validator";
import mysql from "mysql2/promise"

const db=await mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"280520",
    database:"rectangulo"
})

const app=express()
const port = 3000

app.get("/", (req,res)=>{
    res.send("holamundo")
})

app.get("/rectangulos",async (req,res)=>{
    const[rows]=await db.execute("SELECT * FROM rectangulos")
    res.json({succes:true,data:rows})
})

app.post("/rectangulos", async (req,res)=>{
    const {base,altura,perimetro,area}=req.body
    const [result]=await db.execute(
        "INSERT INTO rectangulos (base,altura,perimetro,area) VALUES(?,?,?,?)"
        [base,altura,perimetro,area]
    )
    res.status(201)
    .json({succes:true,data:{id:result.insertId,base,altura,perimetro,area}})
})

app.listen(port,()=>{
    console.log(`la aplicacion esta funcionando en el puerto ${port}`)
})