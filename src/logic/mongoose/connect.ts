'use server';
import mongoose from 'mongoose';

let connection: mongoose.Mongoose | null = null;

const connect = async () => 
    !connection
    ?   (connection = await mongoose.connect(process.env.MONGODB_URI as string))
    :   connection;


export default connect;