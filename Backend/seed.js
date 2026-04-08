// database/seed.js  —  run with: node database/seed.js
// Seeds Profile, Projects, Skills, Education into MongoDB

require('dotenv').config({ path: '../backend/.env' });
const mongoose  = require('mongoose');
const Profile   = require('../backend/models/Profile');
const Project   = require('../backend/models/Project');
const Skill     = require('../backend/models/Skill');
const Education = require('../backend/models/Education');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/diksha_portfolio';

// ── Seed data ────────────────────────────────────────────────

const profileData = {
  name     : 'Diksha Asnora',
  tagline  : 'Building software that matters',
  bio      : [
    "I'm Diksha Asnora, a final-year Computer Science Engineering student with a deep passion for building impactful software. From data structures to cloud-native full-stack apps, I thrive on turning complex problems into elegant solutions.",
    "Currently pursuing my B.Tech at Ajay Kumar Garg Engineering College, I've spent four years honing my skills across the entire development stack — backend APIs, React frontends, databases, and ML pipelines.",
    "I'm actively seeking internship opportunities and entry-level roles where I can contribute meaningfully from day one while continuing to grow as an engineer.",
  ],
  email    : 'diksha.asnora@email.com',
  github   : 'https://github.com/diksha-asnora',
  linkedin : 'https://linkedin.com/in/diksha-asnora',
  resume   : '/resume.pdf',
  available: true,
  stats    : { projects: 15, cgpa: '8.4', years: 4 },
};

const skillsData = [
  { name: 'Python',      icon: '🐍', category: 'language',  order: 1 },
  { name: 'Java',        icon: '☕', category: 'language',  order: 2 },
  { name: 'JavaScript',  icon: '🌐', category: 'language',  order: 3 },
  { name: 'TypeScript',  icon: '🔷', category: 'language',  order: 4 },
  { name: 'C++',         icon: '⚙️', category: 'language',  order: 5 },
  { name: 'React',       icon: '⚛️', category: 'framework', order: 6 },
  { name: 'Node.js',     icon: '🟢', category: 'framework', order: 7 },
  { name: 'Express',     icon: '🚂', category: 'framework', order: 8 },
  { name: 'Spring Boot', icon: '🌱', category: 'framework', order: 9 },
  { name: 'MongoDB',     icon: '🍃', category: 'database',  order: 10 },
  { name: 'PostgreSQL',  icon: '🐘', category: 'database',  order: 11 },
  { name: 'MySQL',       icon: '🗄️', category: 'database',  order: 12 },
  { name: 'Redis',       icon: '🔴', category: 'database',  order: 13 },
  { name: 'Docker',      icon: '🐳', category: 'tool',      order: 14 },
  { name: 'Git',         icon: '🐙', category: 'tool',      order: 15 },
  { name: 'Linux',       icon: '🐧', category: 'tool',      order: 16 },
  { name: 'AWS',         icon: '☁️', category: 'cloud',     order: 17 },
  { name: 'Firebase',    icon: '🔥', category: 'cloud',     order: 18 },
];

const projectsData = [
  {
    title       : 'Sentiment Analysis Engine',
    description : 'A machine learning pipeline that classifies customer reviews into positive, negative, and neutral sentiments with 92% accuracy using BERT fine-tuning and a FastAPI serving layer.',
    tags        : ['Python', 'ML', 'NLP', 'BERT'],
    tagTheme    : 'teal',
    bannerEmoji : '🤖',
    bannerColor : 'banner-1',
    github      : 'https://github.com/diksha-asnora/sentiment-engine',
    demo        : 'https://sentiment-demo.vercel.app',
    featured    : true,
    order       : 1,
  },
  {
    title       : 'ShopEasy — E-Commerce Platform',
    description : 'Full-stack MERN e-commerce platform with product catalog, cart management, Stripe payment integration, JWT auth, and a real-time order tracking dashboard.',
    tags        : ['React', 'Node.js', 'MongoDB', 'Stripe'],
    tagTheme    : 'purple',
    bannerEmoji : '🛒',
    bannerColor : 'banner-2',
    github      : 'https://github.com/diksha-asnora/shopeasy',
    demo        : 'https://shopeasy.vercel.app',
    featured    : true,
    order       : 2,
  },
  {
    title       : 'COVID-19 Data Dashboard',
    description : 'Interactive visualization dashboard built with Python Dash and Plotly showing global pandemic trends, vaccination rates, and regional statistics with daily-refreshed data.',
    tags        : ['Python', 'Dash', 'Plotly', 'Pandas'],
    tagTheme    : 'teal',
    bannerEmoji : '📊',
    bannerColor : 'banner-3',
    github      : 'https://github.com/diksha-asnora/covid-dashboard',
    featured    : true,
    order       : 3,
  },
  {
    title       : 'SecureVault — Password Manager',
    description : 'End-to-end encrypted password manager with AES-256 encryption, biometric authentication support, and cross-device sync via a Spring Boot REST API.',
    tags        : ['Java', 'Spring Boot', 'AES-256', 'Security'],
    tagTheme    : 'purple',
    bannerEmoji : '🔐',
    bannerColor : 'banner-4',
    github      : 'https://github.com/diksha-asnora/securevault',
    featured    : true,
    order       : 4,
  },
];

const educationData = [
  {
    institution : 'Ajay Kumar Garg Engineering College',
    degree      : 'Bachelor of Technology',
    field       : 'Computer Science & Engineering',
    grade       : 'CGPA: 8.4 / 10',
    startYear   : 2021,
    endYear     : 2025,
    description : 'Core coursework: DSA, OS, DBMS, Computer Networks, Machine Learning, Software Engineering. Active member of the college coding club and Google Developer Student Club.',
    order       : 1,
  },
  {
    institution : 'Delhi Public School',
    degree      : 'Class XII',
    field       : 'PCM with Computer Science (CBSE)',
    grade       : '92.4%',
    startYear   : 2019,
    endYear     : 2021,
    order       : 2,
  },
  {
    institution : 'Delhi Public School',
    degree      : 'Class X',
    field       : 'CBSE',
    grade       : '95.2%',
    startYear   : 2019,
    endYear     : 2019,
    order       : 3,
  },
];

// ── Main seed function ────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Profile.deleteMany({}),
      Project.deleteMany({}),
      Skill.deleteMany({}),
      Education.deleteMany({}),
    ]);
    console.log('🗑️   Cleared existing collections');

    // Insert fresh data
    await Profile.create(profileData);
    await Skill.insertMany(skillsData);
    await Project.insertMany(projectsData);
    await Education.insertMany(educationData);

    console.log(`\n🌱  Seeded successfully:`);
    console.log(`    • 1 Profile`);
    console.log(`    • ${skillsData.length} Skills`);
    console.log(`    • ${projectsData.length} Projects`);
    console.log(`    • ${educationData.length} Education entries\n`);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected');
  }
}

seed();