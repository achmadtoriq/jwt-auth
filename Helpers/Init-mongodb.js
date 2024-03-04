const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME, 
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: true,
    // useCreateIndex: true,
}).then(() => { 
    console.log(`MongoDB Connected.`);
}).catch((err) => console.log(err.message))


mongoose.connection.on('connected', () => {
    console.log(`MongoDB Connected to DB`);
})

mongoose.connection.on('error', (err) => {
    console.log(`Error: ${err.message}`);
})

mongoose.connection.on('disconnected', () => {
    console.log(`MongoDB Disconnected.`);
})


process.on('SIGINT', async() => {
    await mongoose.connection.close()
    process.exit(0)
})