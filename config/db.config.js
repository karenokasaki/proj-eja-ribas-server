import mongoose from "mongoose";

async function connect() {
  try {
    mongoose.set("strictQuery", true);
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connection on db: ${dbConnection.connection.name}`);
  } catch (error) {
    console.log(error);
  }
}

export default connect;
