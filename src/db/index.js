import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async (mongoUrl) => {
  try {


  }catch (error) {
   const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}
        /${DB_NAME}`);
        console.log(`Database connected successfully DB HOST:
            ${connectionInstance.connection.host}`);
    console.log("Database connection error:", error);
    process.exit(1);

}
}
export default connectDB;
