require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/Users');
const Entity = require('./src/models/Entities');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/owrplan';

async function check() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB');

    const users = await User.find({}, '-password');
    const entities = await Entity.find({});

    console.log('Users:', JSON.stringify(users, null, 2));
    console.log('Entities:', JSON.stringify(entities, null, 2));

    await mongoose.disconnect();
}

check().catch(console.error);