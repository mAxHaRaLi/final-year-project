import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import connectDB from './db/index.js';

dotenv.config({
    path: './.env'
});

 connectDB()
  .then( ()=>{
     app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at port :
             ${process.env.PORT}`);
     })
 })
  .catch((err)=>{
    console.log ("MONGO DB connection failed !!!" ,err);


 })


// const app = express()

// (async()=>{
//   try{
//     await mongoose.connect`${process.env.
//     MONGODB_URL}/${DB_NAME}`;
//     app.on("error",(error) => {
//       console.log("error connecting to mongodb", error);
//       throw error;
//     });
// }catch(err){
//     console.log("error connecting to mongodb", err)
// }})();

// const port = process.env.PORT || 3000;

// app.listen(port,()=>{
//     console.log(`app listening on port ${port}`)
// })