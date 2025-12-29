import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONODB_URI}`,
    );
    console.log(
      `MongoDB connected !! DB Hosted on : ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MONGODB connection error: ", error.stack);
    process.exit(1);
  }
};

export default connectDB;
