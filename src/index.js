import dotenv from 'dotenv'
import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})
app.get("/login",(req, res)=>{
    res.send("mazhar")
})

app.listen(process.env.PORT,()=>{
    console.log(`app listening on port ${port}`)
})