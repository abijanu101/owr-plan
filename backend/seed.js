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

    // 2. Persons
    const personsData = [
      { name: 'Ahmed',    type: 'person', color: '#5E5AB2', faceIcon: 'face/happy.svg' },
      { name: 'Alizeh',   type: 'person', color: '#B23B3B', faceIcon: 'face/sassy.svg' },
      { name: 'Zoha',     type: 'person', color: '#488845', faceIcon: 'face/happy.svg' },
      { name: 'Abi',      type: 'person', color: '#1B7A7A', faceIcon: 'face/naughty.svg' },
      { name: 'Ansa',     type: 'person', color: '#911B7D', faceIcon: 'face/happy.svg' },
      { name: 'Haleema',  type: 'person', color: '#F39C12', faceIcon: 'face/happy.svg' },
    ];

    // 3. Groups (existing + new)
    const groupsData = [
      { name: 'Section G',      type: 'group', color: '#1B5491' },
      { name: 'AML-6A',         type: 'group', color: '#B29B3B' },
      { name: 'owrplan gng',    type: 'group', color: '#5E5AB2' },
      { name: 'Design Team',    type: 'group', color: '#16A085' }, // new
      { name: 'Social Committee', type: 'group', color: '#E67E22' }, // new
    ];

    const entities = {};

    // Create persons
    for (const p of personsData) {
      entities[p.name] = await Entity.create({ ...p, userId: user._id });
    }
    // Create groups
    for (const g of groupsData) {
      entities[g.name] = await Entity.create({ ...g, userId: user._id });
    }

    // Helper to add a member to a group (two‑way)
    const addMemberToGroup = async (personName, groupName) => {
      const person = entities[personName];
      const group = entities[groupName];
      if (!person || !group) return;
      // Add to group's members if not already present
      if (!group.members.includes(person._id)) {
        group.members.push(person._id);
        await group.save();
      }
      // Add to person's groups if not already present
      if (!person.groups.includes(group._id)) {
        person.groups.push(group._id);
        await person.save();
      }
    };

    // Define memberships
    const memberships = [
      // Section G: Abi, Ansa (already done) + add Ahmed and Zoha?
      { person: 'Abi',    group: 'Section G' },
      { person: 'Ansa',   group: 'Section G' },
      { person: 'Ahmed',  group: 'Section G' },
      { person: 'Zoha',   group: 'Section G' },
      // AML-6A: all except Haleema (example)
      { person: 'Ahmed',  group: 'AML-6A' },
      { person: 'Alizeh', group: 'AML-6A' },
      { person: 'Zoha',   group: 'AML-6A' },
      { person: 'Abi',    group: 'AML-6A' },
      { person: 'Ansa',   group: 'AML-6A' },
      // owrplan gng: already done, but ensure all (already in code)
      { person: 'Alizeh', group: 'owrplan gng' },
      { person: 'Abi',    group: 'owrplan gng' },
      { person: 'Ahmed',  group: 'owrplan gng' },
      { person: 'Zoha',   group: 'owrplan gng' },
      { person: 'Haleema',group: 'owrplan gng' },
      // Design Team: Ahmed, Alizeh, Zoha
      { person: 'Ahmed',  group: 'Design Team' },
      { person: 'Alizeh', group: 'Design Team' },
      { person: 'Zoha',   group: 'Design Team' },
      // Social Committee: Alizeh, Abi, Haleema
      { person: 'Alizeh', group: 'Social Committee' },
      { person: 'Abi',    group: 'Social Committee' },
      { person: 'Haleema',group: 'Social Committee' },
    ];

    for (const m of memberships) {
      await addMemberToGroup(m.person, m.group);
    }

    console.log('Created dense relationships (groups ↔ persons)');

    // 4. More activities
    const activitiesData = [
      // Existing ones (keep)
      {
        title: 'Ca Class University',
        description: 'Lecture on advanced topics',
        participants: [entities['Alizeh']._id, entities['Abi']._id, entities['Ansa']._id],
        slots: [
          { day: 'Monday', startTime: '09:00 AM', endTime: '11:30 AM' },
          { day: 'Monday', startTime: '02:00 PM', endTime: '03:30 PM' }
        ]
      },
      {
        title: 'Team Meeting',
        description: 'Weekly sync',
        participants: [entities['Ahmed']._id, entities['Abi']._id, entities['Ansa']._id],
        slots: [{ day: 'Monday', startTime: '04:00 PM', endTime: '05:00 PM' }]
      },
      {
        title: 'Gym Session',
        description: 'Fitness',
        participants: [entities['Ahmed']._id, entities['Alizeh']._id],
        slots: [
          { day: 'Monday', startTime: '06:00 AM', endTime: '07:30 AM' },
          { day: 'Tuesday', startTime: '06:00 AM', endTime: '07:30 AM' }
        ]
      },
      // New activities
      {
        title: 'Design Review',
        description: 'Review UI mockups',
        participants: [entities['Ahmed']._id, entities['Alizeh']._id, entities['Zoha']._id],
        slots: [{ day: 'Wednesday', startTime: '11:00 AM', endTime: '12:30 PM' }]
      },
      {
        title: 'Social Committee Lunch',
        description: 'Plan next event',
        participants: [entities['Alizeh']._id, entities['Abi']._id, entities['Haleema']._id],
        slots: [{ day: 'Thursday', startTime: '12:30 PM', endTime: '01:30 PM' }]
      },
      {
        title: 'Project X Standup',
        description: 'Daily standup',
        participants: [entities['Ahmed']._id, entities['Zoha']._id, entities['Abi']._id, entities['Ansa']._id],
        slots: [
          { day: 'Tuesday', startTime: '09:30 AM', endTime: '10:00 AM' },
          { day: 'Thursday', startTime: '09:30 AM', endTime: '10:00 AM' }
        ]
      },
      {
        title: 'Study Group',
        description: 'Prepare for finals',
        participants: [entities['Alizeh']._id, entities['Zoha']._id, entities['Ansa']._id, entities['Haleema']._id],
        slots: [
          { day: 'Wednesday', startTime: '03:00 PM', endTime: '05:00 PM' },
          { day: 'Friday', startTime: '10:00 AM', endTime: '12:00 PM' }
        ]
      },
      {
        title: 'Birthday Celebration',
        description: 'Surprise party for Abi',
        participants: [entities['Ahmed']._id, entities['Alizeh']._id, entities['Zoha']._id, entities['Haleema']._id],
        slots: [{ day: 'Friday', startTime: '06:00 PM', endTime: '09:00 PM' }]
      },
      {
        title: 'Figma Workshop',
        description: 'Learn prototyping',
        participants: [entities['Ahmed']._id, entities['Alizeh']._id, entities['Zoha']._id],
        slots: [{ day: 'Tuesday', startTime: '02:00 PM', endTime: '04:00 PM' }]
      },
    ];

    for (const act of activitiesData) {
      await Activity.create({
        ...act,
        userId: user._id
      });
    }
    console.log(`Created ${activitiesData.length} activities`);

    // 5. Ledgers (enriched a bit, but not the focus)
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
      },
      {
        title: 'Design Software Licenses',
        members: [entities['Ahmed']._id, entities['Alizeh']._id, entities['Zoha']._id],
        expenses: [
          {
            title: 'Figma Subscription',
            amount: 1500,
            paidBy: [{ entity: entities['Ahmed']._id, amount: 1500 }],
            splitBetween: [
              { entity: entities['Alizeh']._id, share: 500 },
              { entity: entities['Zoha']._id, share: 500 }
            ]
          }
        ]
      }
    ];

    for (const ledg of ledgersData) {
      await Ledger.create({
        ...ledg,
        userId: user._id
      });
    }
    console.log('Created Ledgers');

    console.log('Database seeded successfully with dense relationships!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (require.main === module) {
      mongoose.connection.close();
    }
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;