import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_ADDRESS!).then(() => {
    console.log('connection established');
}).catch(err => {
    console.error(err);
});