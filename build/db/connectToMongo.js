import mongoose from 'mongoose';

async function connectToMongo() {
    try {
        await mongoose.connect("mongodb+srv://alexwaldmann2004:85sv6aS8z2RQxY1s@cluster0.8rpqnmn.mongodb.net/balls?retryWrites=true&w=majority");
        console.log("Connected to the database");
    }
    catch (error) {
        console.error("Failed to connect to the database:", error);
    }
}

export { connectToMongo as default };
//# sourceMappingURL=connectToMongo.js.map
