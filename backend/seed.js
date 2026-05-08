require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/Users');
const Entity = require('./src/models/Entities');
const Activity = require('./src/models/Activities');
const Ledger = require('./src/models/Ledgers');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/owrplan';

async function seed(skipConnection = false) {
  try {
    if (!skipConnection) {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to DB');
    }

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
      { name: 'Ahmed', type: 'person', color: '#4F46E5', faceIcon: 'face/happy.svg' },   // Indigo/Blue
      { name: 'Alizeh', type: 'person', color: '#E11D48', faceIcon: 'face/sassy.svg' },   // Rose
      { name: 'Zoha', type: 'person', color: '#10B981', faceIcon: 'face/happy.svg' },   // Emerald
      { name: 'Abi', type: 'person', color: '#F59E0B', faceIcon: 'face/naughty.svg' }, // Amber
      { name: 'Ansa', type: 'person', color: '#A855F7', faceIcon: 'face/happy.svg' },   // Purple
      { name: 'Haleema', type: 'person', color: '#06B6D4', faceIcon: 'face/happy.svg' }    // Cyan
    ];

    const groupsData = [
      { name: 'Section G', type: 'group', color: '#3B82F6' }, // Blue
      { name: 'AML-6A', type: 'group', color: '#F97316' }, // Orange
      { name: 'owrplan gng', type: 'group', color: '#EC4899' }, // Pink
      { name: 'Design Team', type: 'group', color: '#84CC16' }, // Lime
      { name: 'Social Committee', type: 'group', color: '#64748B' }  // Slate
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
      // --- RECURRING ACTIVITIES ---
      {
        title: 'Daily Standup',
        activityType: 'recurring',
        participants: [entities['Ahmed']._id, entities['Zoha']._id, entities['Abi']._id],
        recurringStartTime: '09:30 AM',
        recurringEndTime: '10:00 AM',
        everyUnit: 'Day',
      },
      {
        title: 'Morning Gym',
        activityType: 'recurring',
        participants: [entities['Ahmed']._id],
        recurringStartTime: '06:30 AM',
        recurringEndTime: '08:00 AM',
        everyUnit: 'Day',
      },
      {
        title: 'Work (9-5) Monday',
        activityType: 'recurring',
        participants: [entities['Ansa']._id, entities['Alizeh']._id],
        recurringStartTime: '09:00 AM',
        recurringEndTime: '05:00 PM',
        recurringDay: 'Monday',
        everyUnit: 'Week',
      },
      {
        title: 'Work (9-5) Tuesday',
        activityType: 'recurring',
        participants: [entities['Ansa']._id, entities['Alizeh']._id],
        recurringStartTime: '09:00 AM',
        recurringEndTime: '05:00 PM',
        recurringDay: 'Tuesday',
        everyUnit: 'Week',
      },
      {
        title: 'Work (9-5) Wednesday',
        activityType: 'recurring',
        participants: [entities['Ansa']._id, entities['Alizeh']._id],
        recurringStartTime: '09:00 AM',
        recurringEndTime: '05:00 PM',
        recurringDay: 'Wednesday',
        everyUnit: 'Week',
      },
      {
        title: 'Work (9-5) Thursday',
        activityType: 'recurring',
        participants: [entities['Ansa']._id, entities['Alizeh']._id],
        recurringStartTime: '09:00 AM',
        recurringEndTime: '05:00 PM',
        recurringDay: 'Thursday',
        everyUnit: 'Week',
      },
      {
        title: 'Work (9-5) Friday',
        activityType: 'recurring',
        participants: [entities['Ansa']._id, entities['Alizeh']._id],
        recurringStartTime: '09:00 AM',
        recurringEndTime: '05:00 PM',
        recurringDay: 'Friday',
        everyUnit: 'Week',
      },
      {
        title: 'Yoga Class (Wed)',
        activityType: 'recurring',
        participants: [entities['Haleema']._id, entities['Alizeh']._id],
        recurringDay: 'Wednesday',
        recurringStartTime: '05:30 PM',
        recurringEndTime: '06:30 PM',
        everyUnit: 'Week',
      },
      {
        title: 'Yoga Class (Fri)',
        activityType: 'recurring',
        participants: [entities['Haleema']._id, entities['Alizeh']._id],
        recurringDay: 'Friday',
        recurringStartTime: '05:30 PM',
        recurringEndTime: '06:30 PM',
        everyUnit: 'Week',
      },
      {
        title: 'Design Team Sync',
        activityType: 'recurring',
        participants: [entities['Ahmed']._id, entities['Alizeh']._id, entities['Zoha']._id],
        recurringDay: 'Monday',
        recurringStartTime: '02:00 PM',
        recurringEndTime: '03:30 PM',
        everyUnit: 'Week',
      },
      {
        title: 'Game Night',
        activityType: 'recurring',
        participants: [
          entities['Ahmed']._id,
          entities['Alizeh']._id,
          entities['Zoha']._id,
          entities['Abi']._id,
          entities['Haleema']._id
        ],
        recurringDay: 'Saturday',
        recurringStartTime: '08:00 PM',
        recurringEndTime: '11:59 PM',
        everyUnit: 'Week',
      },
      {
        title: 'Late Night Dev Session',
        activityType: 'recurring',
        participants: [entities['Ahmed']._id, entities['Zoha']._id],
        recurringDay: 'Friday',
        recurringStartTime: '10:00 PM',
        recurringEndTime: '01:00 AM',
        everyUnit: 'Week',
      },
      {
        title: 'Guitar Practice',
        activityType: 'recurring',
        participants: [entities['Abi']._id],
        recurringStartTime: '07:00 PM',
        recurringEndTime: '08:00 PM',
        everyUnit: 'Day',
      },
      {
        title: 'Meditation',
        activityType: 'recurring',
        participants: [entities['Haleema']._id],
        recurringStartTime: '05:00 AM',
        recurringEndTime: '05:30 AM',
        everyUnit: 'Day',
      },
      {
        title: 'University Classes (Mon)',
        activityType: 'recurring',
        participants: [entities['Ahmed']._id],
        recurringDay: 'Monday',
        recurringStartTime: '11:00 AM',
        recurringEndTime: '01:00 PM',
        everyUnit: 'Week',
      },
      {
        title: 'University Classes (Wed)',
        activityType: 'recurring',
        participants: [entities['Ahmed']._id],
        recurringDay: 'Wednesday',
        recurringStartTime: '11:00 AM',
        recurringEndTime: '01:00 PM',
        everyUnit: 'Week',
      },
      {
        title: 'University Classes (Fri)',
        activityType: 'recurring',
        participants: [entities['Ahmed']._id],
        recurringDay: 'Friday',
        recurringStartTime: '11:00 AM',
        recurringEndTime: '01:00 PM',
        everyUnit: 'Week',
      },
      {
        title: 'Weekly Groceries',
        activityType: 'recurring',
        participants: [entities['Abi']._id, entities['Ansa']._id],
        recurringDay: 'Sunday',
        recurringStartTime: '10:00 AM',
        recurringEndTime: '12:00 PM',
        everyUnit: 'Week',
      },

      // --- NON-RECURRING ACTIVITIES ---
      {
        title: 'Project Kickoff Meeting',
        activityType: 'non-recurring',
        participants: [entities['Ahmed']._id, entities['Alizeh']._id, entities['Zoha']._id],
        rangeStart: new Date(now + 1 * day),
        rangeEnd: new Date(now + 1 * day + 90 * 60 * 1000),
      },
      {
        title: 'Doctor Appointment',
        activityType: 'non-recurring',
        participants: [entities['Abi']._id],
        rangeStart: new Date(now + 2 * day + 14 * 60 * 60 * 1000),
        rangeEnd: new Date(now + 2 * day + 15 * 60 * 60 * 1000),
      },
      {
        title: 'Client Review',
        activityType: 'non-recurring',
        participants: [entities['Zoha']._id],
        rangeStart: new Date(now + 5 * day + 10 * 60 * 60 * 1000),
        rangeEnd: new Date(now + 5 * day + 11 * 60 * 60 * 1000),
      },
      {
        title: 'Car Service',
        activityType: 'non-recurring',
        participants: [entities['Ahmed']._id],
        rangeStart: new Date(now + 4 * day + 8 * 60 * 60 * 1000),
        rangeEnd: new Date(now + 4 * day + 12 * 60 * 60 * 1000),
      },
      {
        title: 'Dinner with Parents',
        activityType: 'non-recurring',
        participants: [entities['Ansa']._id],
        rangeStart: new Date(now + 1 * day + 19 * 60 * 60 * 1000),
        rangeEnd: new Date(now + 1 * day + 21 * 60 * 60 * 1000),
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
    if (!skipConnection) {
      await mongoose.connection.close();
    }
  }
}

module.exports = seed;

if (require.main === module) {
  seed();
}