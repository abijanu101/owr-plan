require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/Users');
const Entity = require('./src/models/Entities');
const Activity = require('./src/models/Activities');
const Ledger = require('./src/models/Ledgers');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/owrplan';

async function seed() {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState !== 1) {
       await mongoose.connect(MONGO_URI);
       console.log('Connected to DB in seed script');
    }

    // Clear existing data
    await User.deleteMany({});
    await Entity.deleteMany({});
    await Activity.deleteMany({});
    await Ledger.deleteMany({});
    console.log('Cleared existing data');

    // 1. Create a User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });
    console.log('Created User:', user.email);

    // 2. Create Entities
    const entitiesData = [
      { name: 'Ahmed', type: 'person', color: '#5E5AB2', faceIcon: 'face/happy.svg' },
      { name: 'Alizeh', type: 'person', color: '#B23B3B', faceIcon: 'face/sassy.svg' },
      { name: 'Zoha', type: 'person', color: '#488845', faceIcon: 'face/happy.svg' },
      { name: 'Abi', type: 'person', color: '#1B7A7A', faceIcon: 'face/naughty.svg' },
      { name: 'Ansa', type: 'person', color: '#911B7D', faceIcon: 'face/happy.svg' },
      { name: 'Haleema', type: 'person', color: '#F39C12', faceIcon: 'face/happy.svg' }, // NEW
      { name: 'Section G', type: 'group', color: '#1B5491' },
      { name: 'AML-6A', type: 'group', color: '#B29B3B' },
      { name: 'owrplan gng', type: 'group', color: '#5E5AB2' },
    ];

    const entities = {};
    for (const e of entitiesData) {
      entities[e.name] = await Entity.create({
        ...e,
        userId: user._id
      });
    }

    // 3. Add members to "Section G" (Abi and Ansa)
    const sectionG = entities['Section G'];
    const abi = entities['Abi'];
    const ansa = entities['Ansa'];
    if (sectionG && abi && ansa) {
      sectionG.members = [abi._id, ansa._id];
      await sectionG.save();
      // Also update Abi's groups array
      abi.groups = [sectionG._id];
      await abi.save();
      ansa.groups = [sectionG._id];
      await ansa.save();
      console.log(`Added ${abi.name} and ${ansa.name} to ${sectionG.name} and updated their groups`);
    } else {
      console.log('Could not add members to Section G');
    }

    // 4. Add members to "owrplan gng" and update each person's groups
    const owrplanGng = entities['owrplan gng'];
    const membersForOwplan = [
      entities['Alizeh'],
      entities['Abi'],
      entities['Ahmed'],
      entities['Zoha'],
      entities['Haleema']
    ].filter(m => m); // ensure all exist

    if (owrplanGng && membersForOwplan.length === 5) {
      owrplanGng.members = membersForOwplan.map(m => m._id);
      await owrplanGng.save();
      console.log(`Added ${membersForOwplan.map(m => m.name).join(', ')} to ${owrplanGng.name}`);

      // Update each person's groups array
      for (const person of membersForOwplan) {
        if (!person.groups) person.groups = [];
        person.groups.push(owrplanGng._id);
        await person.save();
      }
      console.log('Updated groups array for each person');
    } else {
      console.log('Could not add members to owrplan gng – missing persons or group');
    }

    console.log('Created Entities and established relationships');

    // 5. Create Activities (unchanged, but participants now include Haleema optionally? Not required)
    const activitiesData = [
      {
        title: 'Ca Class University',
        participants: [entities['Alizeh']._id, entities['Abi']._id, entities['Ansa']._id],
        slots: [
          { day: 'Monday', startTime: '09:00 AM', endTime: '11:30 AM' },
          { day: 'Monday', startTime: '02:00 PM', endTime: '03:30 PM' }
        ]
      },
      {
        title: 'Meeting',
        participants: [entities['Ahmed']._id, entities['Abi']._id, entities['Ansa']._id],
        slots: [
          { day: 'Monday', startTime: '04:00 PM', endTime: '05:00 PM' }
        ]
      },
      {
        title: 'Gym Session',
        participants: [entities['Ahmed']._id, entities['Alizeh']._id],
        slots: [
          { day: 'Monday', startTime: '06:00 AM', endTime: '07:30 AM' },
          { day: 'Tuesday', startTime: '06:00 AM', endTime: '07:30 AM' }
        ]
      }
    ];

    for (const act of activitiesData) {
      await Activity.create({
        ...act,
        userId: user._id
      });
    }
    console.log('Created Activities');

    // 4. Create Ledgers
    const ledgersData = [
      {
        title: 'After-Mid Hangout',
        members: [entities['Ansa']._id, entities['Abi']._id, entities['Alizeh']._id],
        expenses: [
          {
            title: 'Food',
            amount: 2500,
            paidBy: [{ entity: entities['Ansa']._id, amount: 2500 }],
            splitBetween: [
              { entity: entities['Abi']._id, share: null },
              { entity: entities['Alizeh']._id, share: null }
            ]
          }
        ]
      },
      {
        title: "Abi's Birthday",
        members: [entities['Ahmed']._id, entities['Alizeh']._id, entities['Zoha']._id],
        expenses: []
      },
      {
        title: 'Iftar Party',
        members: [entities['Ahmed']._id, entities['Alizeh']._id, entities['Zoha']._id, entities['Abi']._id, entities['Ansa']._id],
        expenses: []
      }
    ];

    for (const ledg of ledgersData) {
      await Ledger.create({
        ...ledg,
        userId: user._id
      });
    }
    console.log('Created Ledgers');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Only close if we are running this as a standalone script
    if (require.main === module) {
       mongoose.connection.close();
    }
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
