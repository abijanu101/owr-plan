const mongoose = require('mongoose');
require('dotenv').config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const collection = mongoose.connection.collection('entities');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));
    
    const indexName = 'userId_1_name_1';
    const exists = indexes.some(idx => idx.name === indexName);
    
    if (exists) {
      console.log(`Dropping index: ${indexName}`);
      await collection.dropIndex(indexName);
      console.log('Index dropped successfully');
    } else {
      console.log(`Index ${indexName} not found`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

dropIndex();
