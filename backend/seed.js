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
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    await Promise.all([
      User.deleteMany({}),
      Entity.deleteMany({}),
      Activity.deleteMany({}),
      Ledger.deleteMany({})
    ]);

    console.log('Cleared DB');

    // ---------------- USER ----------------
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user'
    });

    // ---------------- ENTITIES ----------------
    const personsData = [
      { name: 'Ahmed', type: 'person', color: '#5E5AB2', faceIcon: 'face/happy.svg' },
      { name: 'Alizeh', type: 'person', color: '#B23B3B', faceIcon: 'face/sassy.svg' },
      { name: 'Zoha', type: 'person', color: '#488845', faceIcon: 'face/happy.svg' },
      { name: 'Abi', type: 'person', color: '#1B7A7A', faceIcon: 'face/naughty.svg' },
      { name: 'Ansa', type: 'person', color: '#911B7D', faceIcon: 'face/happy.svg' },
      { name: 'Haleema', type: 'person', color: '#F39C12', faceIcon: 'face/happy.svg' }
    ];

    const groupsData = [
      { name: 'Section G', type: 'group', color: '#1B5491' },
      { name: 'AML-6A', type: 'group', color: '#B29B3B' },
      { name: 'owrplan gng', type: 'group', color: '#5E5AB2' },
      { name: 'Design Team', type: 'group', color: '#16A085' },
      { name: 'Social Committee', type: 'group', color: '#E67E22' }
    ];

    const entities = {};

    for (const p of personsData) {
      entities[p.name] = await Entity.create({ ...p, userId: user._id, groups: [] });
    }

    for (const g of groupsData) {
      entities[g.name] = await Entity.create({
        ...g,
        userId: user._id,
        members: []
      });
    }

    // ---------------- LINKS ----------------
    const links = [
      ['Ahmed', 'Section G'],
      ['Alizeh', 'Section G'],
      ['Zoha', 'Section G'],
      ['Abi', 'Section G'],
      ['Ansa', 'Section G'],

      ['Ahmed', 'AML-6A'],
      ['Alizeh', 'AML-6A'],
      ['Zoha', 'AML-6A'],
      ['Abi', 'AML-6A'],

      ['Ahmed', 'owrplan gng'],
      ['Alizeh', 'owrplan gng'],
      ['Zoha', 'owrplan gng'],
      ['Abi', 'owrplan gng'],
      ['Haleema', 'owrplan gng'],

      ['Ahmed', 'Design Team'],
      ['Alizeh', 'Design Team'],
      ['Zoha', 'Design Team'],

      ['Alizeh', 'Social Committee'],
      ['Abi', 'Social Committee'],
      ['Haleema', 'Social Committee']
    ];

    for (const [p, g] of links) {
      const person = entities[p];
      const group = entities[g];

      if (!person || !group) continue;

      group.members ||= [];
      person.groups ||= [];

      if (!group.members.map(String).includes(String(person._id))) {
        group.members.push(person._id);
        await group.save();
      }

      if (!person.groups.map(String).includes(String(group._id))) {
        person.groups.push(group._id);
        await person.save();
      }
    }

    console.log('Relationships created');

    // ---------------- ACTIVITIES ----------------
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const activitiesData = [
      // NON-RECURRING
      {
        title: 'Project Kickoff Meeting',
        activityType: 'non-recurring',
        participants: [
          entities['Ahmed']._id,
          entities['Alizeh']._id,
          entities['Zoha']._id
        ],
        rangeStart: new Date(now + 2 * day),
        rangeEnd: new Date(now + 2 * day + 90 * 60 * 1000),
      },

      {
        title: 'Doctor Appointment',
        activityType: 'non-recurring',
        participants: [entities['Abi']._id],
        rangeStart: new Date(now + 3 * day),
        rangeEnd: new Date(now + 3 * day + 60 * 60 * 1000),
      },

      // RECURRING
      {
        title: 'Daily Standup',
        activityType: 'recurring',
        participants: [
          entities['Ahmed']._id,
          entities['Zoha']._id,
          entities['Abi']._id
        ],
        recurringDay: 'Monday',
        recurringStartTime: '09:30 AM',
        recurringEndTime: '10:00 AM',
        everyInterval: 1,
        everyUnit: 'Week',
      },

      {
        title: 'Late Night Dev Session',
        activityType: 'recurring',
        participants: [
          entities['Ahmed']._id,
          entities['Zoha']._id
        ],
        recurringDay: 'Friday',
        recurringStartTime: '10:00 PM',
        recurringEndTime: '01:00 AM',
        everyInterval: 1,
        everyUnit: 'Week',
      }
    ];

    for (const a of activitiesData) {
      await Activity.create({ ...a, userId: user._id });
    }

    // ---------------- LEDGER FIX ----------------
    await Ledger.create({
      title: 'Seed Ledger',
      members: [
        entities['Ahmed']._id,
        entities['Alizeh']._id,
        entities['Zoha']._id
      ],
      userId: user._id,
      expenses: []
    });

    console.log('Seed complete ✔');

  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();