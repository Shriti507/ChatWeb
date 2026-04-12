import express from "express";
import cors from "cors";
const app=express()


app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello World!')
})

app.listen(3000,()=>{
    console.log(`server has started on PORT 3000`)
})