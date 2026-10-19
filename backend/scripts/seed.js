import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import config from '../src/config/index.js';

const DATA_DIR = path.resolve(config.dataDir);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Indian Name & Biodata Generator Pools
const firstNamesMale = [
  'Aarav', 'Rohan', 'Kabir', 'Vikram', 'Rishi', 'Dev', 'Karan', 'Pranav', 'Aditya', 'Arjun',
  'Siddharth', 'Nikhil', 'Varun', 'Gaurav', 'Manish', 'Kunal', 'Abhishek', 'Ayush', 'Harsh',
  'Dhruv', 'Anand', 'Rahul', 'Vivek', 'Akash', 'Sameer', 'Ashwin', 'Kartik', 'Tarun', 'Aniket',
  'Saurabh', 'Mayank', 'Prateek', 'Shreyas', 'Tejas', 'Deepak', 'Rohit', 'Sanjay', 'Amit', 'Rajesh'
];

const firstNamesFemale = [
  'Ananya', 'Pooja', 'Mira', 'Tanvi', 'Sanya', 'Shruti', 'Neha', 'Aditi', 'Rhea', 'Kavya',
  'Isha', 'Simran', 'Meera', 'Roshni', 'Aakanksha', 'Divya', 'Sneha', 'Pallavi', 'Trisha',
  'Avani', 'Nandini', 'Gayatri', 'Kritika', 'Shreya', 'Anushka', 'Tara', 'Swati', 'Priyanka',
  'Bhavna', 'Radhika', 'Malini', 'Deepika', 'Aishwarya', 'Natasha', 'Ritu', 'Sunita', 'Namrata', 'Aanchal'
];

const lastNames = [
  'Mehta', 'Deshmukh', 'Iyer', 'Singhal', 'Verma', 'Nair', 'Choudhary', 'Kulkarni', 'Kapoor', 'Malhotra',
  'Chatterjee', 'Ranganathan', 'Bhasin', 'Reddy', 'Rao', 'Sen', 'Sharma', 'Patel', 'Agarwal', 'Gupta',
  'Joshi', 'Bhat', 'Bhattacharya', 'Menon', 'Nambiar', 'Sethi', 'Khanna', 'Saxena', 'Pandey', 'Mishra',
  'Ghosh', 'Banerjee', 'Pillai', 'Shetty', 'Hegde', 'Trivedi', 'Venkatesh', 'Subramanian'
];

const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Gurgaon', 'Noida', 'Ahmedabad'];

const companies = [
  'Google India', 'Microsoft R&D', 'McKinsey & Company', 'Morgan Stanley', 'Bain Capital',
  'Zomato', 'Swiggy', 'Databricks', 'Tata Motors', 'Peak XV Partners', 'Amazon India',
  'Flipkart', 'Goldman Sachs', 'BCG India', 'Adobe', 'Uber', 'Razorpay', 'Infosys', 'Wipro'
];

const designationsTech = ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'Tech Lead', 'Data Scientist'];
const designationsBiz = ['Product Manager', 'Director of Product', 'Management Consultant', 'Associate Partner', 'Investment Banker', 'Private Equity Analyst', 'Founder & CEO'];

const colleges = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kharagpur', 'BITS Pilani', 'DTU Delhi',
  'IIM Bangalore', 'IIM Ahmedabad', 'ISB Hyderabad', 'SRCC Delhi', 'St. Stephen\'s College',
  'COEP Pune', 'National Law School Bangalore', 'Bangalore Medical College', 'AIIMS New Delhi'
];

const religions = ['Hindu', 'Hindu', 'Hindu', 'Jain', 'Sikh'];
const castesHindu = ['Brahmin', 'Khatri', 'Agarwal', 'Vaishnav', 'Maratha', 'Nair', 'Reddy', 'Kayastha'];
const motherTongues = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'Malayalam'];
const diets = ['Vegetarian', 'Vegetarian', 'Eggetarian', 'Non-Vegetarian'];
const ternary = ['Yes', 'Yes', 'Maybe', 'No'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runSeed() {
  console.log('🌱 Starting comprehensive TDC Matchmaker database seed (100+ profiles)...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. MATCHMAKERS
  const matchmakers = [
    {
      id: 'mm-1',
      name: 'Priya Sharma',
      email: 'priya.sharma@datecrew.com',
      passwordHash,
      role: 'matchmaker',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      createdAt: '2025-01-10T09:00:00.000Z',
    },
    {
      id: 'mm-2',
      name: 'Arjun Kapoor',
      email: 'arjun.kapoor@datecrew.com',
      passwordHash,
      role: 'matchmaker',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: '2025-01-15T10:00:00.000Z',
    },
  ];

  // 2. GENERATE 110+ REALISTIC INDIAN CUSTOMER PROFILES (55 Male, 55 Female)
  const customers = [];

  const maleAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300',
  ];

  const femaleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
  ];

  const statuses = [
    'New', 'Profile Review', 'Ready for Matching', 'Ready for Matching',
    'Matches Sent', 'Meeting Scheduled', 'In Progress', 'On Hold'
  ];

  // Generate 55 Men
  for (let i = 1; i <= 55; i++) {
    const id = i === 1 ? 'cust-101' : `cust-m-${100 + i}`;
    const firstName = i === 1 ? 'Aarav' : firstNamesMale[(i - 1) % firstNamesMale.length];
    const lastName = i === 1 ? 'Mehta' : lastNames[(i * 3) % lastNames.length];
    const birthYear = randomInt(1989, 1998); // ages 27 - 36
    const birthMonth = String(randomInt(1, 12)).padStart(2, '0');
    const birthDay = String(randomInt(1, 28)).padStart(2, '0');
    const city = randomChoice(cities);
    const height = randomInt(172, 188); // male height
    const income = randomInt(20, 120) * 100000; // 20L - 1.2Cr
    const isTech = Math.random() > 0.4;
    const designation = isTech ? randomChoice(designationsTech) : randomChoice(designationsBiz);
    const religion = randomChoice(religions);
    const caste = religion === 'Hindu' ? randomChoice(castesHindu) : 'General';
    const motherTongue = randomChoice(motherTongues);
    const wantsKids = randomChoice(['Yes', 'Yes', 'Maybe']);
    const openToRelocate = randomChoice(['Yes', 'Maybe', 'No']);
    const openToPets = randomChoice(['Yes', 'Maybe']);
    const diet = randomChoice(diets);
    const assignedMatchmakerId = i <= 35 ? 'mm-1' : 'mm-2';
    const status = randomChoice(statuses);

    customers.push({
      id,
      firstName,
      lastName,
      gender: 'Male',
      dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+91 98${randomInt(10, 99)} ${randomInt(10000, 99999)}`,
      city,
      country: 'India',
      heightCm: height,
      maritalStatus: Math.random() > 0.9 ? 'Divorced' : 'Never Married',
      motherTongue,
      languagesKnown: ['English', motherTongue, 'Hindi'],
      undergraduateCollege: randomChoice(colleges),
      degree: isTech ? 'B.Tech in Computer Science' : 'B.Com / B.A. Economics',
      highestEducation: isTech ? 'Master of Science' : 'MBA',
      currentCompany: randomChoice(companies),
      designation,
      employmentType: 'Full-time',
      incomeINR: income,
      workLocation: city,
      religion,
      caste,
      subCaste: 'Traditional',
      gotra: 'Kashyap',
      familyType: randomChoice(['Nuclear', 'Joint']),
      familyValues: randomChoice(['Moderate', 'Liberal']),
      familyBackground: `Father is a retired professional, Mother is a homemaker. Family well-settled in ${city}.`,
      siblings: { count: randomInt(0, 2), details: `${randomInt(0, 2)} sibling(s)` },
      familyLocation: city,
      wantsKids,
      openToRelocate,
      openToPets,
      dietaryPreference: diet,
      interests: ['Fitness', 'Travel', 'Technology', 'Reading', 'Music'],
      relationshipExpectations: 'Looking for a thoughtful, driven partner with mutual respect and warm family values.',
      preferredAgeRange: { min: birthYear > 1993 ? 24 : 26, max: 2025 - birthYear - 1 }, // Male looks for younger women
      preferredHeightRangeCm: { min: 158, max: 175 }, // Male looks for shorter women
      preferredIncomeRangeINR: { min: 1000000, max: null },
      preferredLocations: [city, 'Bangalore', 'Mumbai'],
      preferredProfessions: ['Tech', 'Product', 'Finance', 'Consulting', 'Design', 'Medicine'],
      preferredEducation: ['B.Tech', 'Masters', 'MBA'],
      preferredLanguages: ['English', 'Hindi', motherTongue],
      preferredFamilyValues: ['Moderate', 'Liberal'],
      preferredReligion: [religion, 'Any'],
      preferredMaritalStatuses: ['Never Married'],
      preferredWantsKids: ['Yes', 'Maybe'],
      preferredPets: ['Yes', 'Maybe'],
      dealbreakers: [
        { field: 'maritalStatus', condition: 'must_be', value: 'Never Married' },
        { field: 'wantsKids', condition: 'must_not_be', value: 'No' },
      ],
      journeyStatus: status,
      verification: {
        status: Math.random() > 0.15 ? 'Verified' : 'Pending',
        verifiedAt: '2025-01-20T10:00:00.000Z',
        method: 'Aadhaar + LinkedIn + Degree Registry',
        notes: 'Identity confirmed via official government portal.',
      },
      assignedMatchmakerId,
      avatar: randomChoice(maleAvatars),
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-02-01T10:00:00.000Z',
    });
  }

  // Generate 55 Women
  for (let i = 1; i <= 55; i++) {
    const id = i === 1 ? 'cust-102' : `cust-f-${100 + i}`;
    const firstName = i === 1 ? 'Ananya' : firstNamesFemale[(i - 1) % firstNamesFemale.length];
    const lastName = i === 1 ? 'Deshmukh' : lastNames[(i * 5) % lastNames.length];
    const birthYear = randomInt(1991, 2000); // ages 25 - 34
    const birthMonth = String(randomInt(1, 12)).padStart(2, '0');
    const birthDay = String(randomInt(1, 28)).padStart(2, '0');
    const city = randomChoice(cities);
    const height = randomInt(158, 172); // female height
    const income = randomInt(15, 85) * 100000; // 15L - 85L
    const isTech = Math.random() > 0.5;
    const designation = isTech ? randomChoice(designationsTech) : randomChoice(designationsBiz);
    const religion = randomChoice(religions);
    const caste = religion === 'Hindu' ? randomChoice(castesHindu) : 'General';
    const motherTongue = randomChoice(motherTongues);
    const wantsKids = randomChoice(['Yes', 'Yes', 'Maybe']);
    const openToRelocate = randomChoice(['Yes', 'Maybe']);
    const openToPets = randomChoice(['Yes', 'Maybe']);
    const diet = randomChoice(diets);
    const assignedMatchmakerId = i <= 35 ? 'mm-1' : 'mm-2';
    const status = randomChoice(statuses);

    customers.push({
      id,
      firstName,
      lastName,
      gender: 'Female',
      dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+91 97${randomInt(10, 99)} ${randomInt(10000, 99999)}`,
      city,
      country: 'India',
      heightCm: height,
      maritalStatus: Math.random() > 0.92 ? 'Divorced' : 'Never Married',
      motherTongue,
      languagesKnown: ['English', motherTongue, 'Hindi'],
      undergraduateCollege: randomChoice(colleges),
      degree: isTech ? 'B.Tech in Information Technology' : 'B.A. Economics / B.Com (Hons)',
      highestEducation: isTech ? 'Master of Science' : 'MBA / Masters',
      currentCompany: randomChoice(companies),
      designation,
      employmentType: 'Full-time',
      incomeINR: income,
      workLocation: city,
      religion,
      caste,
      subCaste: 'Traditional',
      gotra: 'Shandilya',
      familyType: 'Nuclear',
      familyValues: randomChoice(['Moderate', 'Liberal']),
      familyBackground: `Father is a senior executive, Mother is an educator. Family based in ${city}.`,
      siblings: { count: randomInt(0, 2), details: `${randomInt(0, 2)} sibling(s)` },
      familyLocation: city,
      wantsKids,
      openToRelocate,
      openToPets,
      dietaryPreference: diet,
      interests: ['Yoga', 'Podcasts', 'Culinary Arts', 'Trekking', 'Art'],
      relationshipExpectations: 'Looking for an ambitious, intellectually curious partner who values empathy, humor, and mutual growth.',
      preferredAgeRange: { min: 2025 - birthYear, max: 2025 - birthYear + 6 }, // Female looks for compatible or slightly older partner
      preferredHeightRangeCm: { min: 172, max: 190 }, // Female looks for taller partner
      preferredIncomeRangeINR: { min: 2500000, max: null },
      preferredLocations: [city, 'Bangalore', 'Mumbai', 'Delhi'],
      preferredProfessions: ['Tech', 'Product', 'Finance', 'Consulting', 'Engineering'],
      preferredEducation: ['B.Tech', 'Masters', 'MBA'],
      preferredLanguages: ['English', 'Hindi', motherTongue],
      preferredFamilyValues: ['Liberal', 'Moderate'],
      preferredReligion: [religion, 'Any'],
      preferredMaritalStatuses: ['Never Married'],
      preferredWantsKids: ['Yes', 'Maybe'],
      dealbreakers: [
        { field: 'maritalStatus', condition: 'must_be', value: 'Never Married' },
      ],
      journeyStatus: status,
      verification: {
        status: Math.random() > 0.1 ? 'Verified' : 'Pending',
        verifiedAt: '2025-01-25T14:00:00.000Z',
        method: 'DigiLocker Govt ID + Corporate Email Verification',
        notes: 'Verified.',
      },
      assignedMatchmakerId,
      avatar: randomChoice(femaleAvatars),
      createdAt: '2025-01-15T12:00:00.000Z',
      updatedAt: '2025-02-05T14:00:00.000Z',
    });
  }

  // 3. INITIAL NOTES
  const notes = [
    {
      id: 'note-201',
      customerId: 'cust-101',
      matchmakerId: 'mm-1',
      content: 'Initial discovery call completed. High intellectual energy and clear on wanting an ambitious partner.',
      type: 'Meeting',
      createdAt: '2025-01-21T11:30:00.000Z',
    },
    {
      id: 'note-202',
      customerId: 'cust-102',
      matchmakerId: 'mm-1',
      content: 'Onboarding consultation. Values fitness, humor, and open debate.',
      type: 'Meeting',
      createdAt: '2025-01-23T15:00:00.000Z',
    },
  ];

  // 4. SENT MATCH RECORDS
  const matchRecords = [
    {
      id: 'match-301',
      customerId: 'cust-101',
      candidateId: 'cust-f-103',
      matchmakerId: 'mm-1',
      score: 86,
      scoreBreakdown: {
        age: { score: 95, max: 100 },
        location: { score: 90, max: 100 },
        education: { score: 85, max: 100 },
        lifestyle: { score: 80, max: 100 },
        family: { score: 80, max: 100 }
      },
      explanations: [
        'Shared city location and mutual lifestyle goals',
        'Strong academic background from top-tier institution'
      ],
      introductionMessage: 'Hi, I would love to introduce you to an accomplished professional in Bangalore.',
      status: 'Sent',
      sentAt: '2025-02-05T12:00:00.000Z',
      createdAt: '2025-02-05T12:00:00.000Z',
    },
  ];

  // 5. AUDIT TIMELINE
  const activities = [
    {
      id: 'act-401',
      customerId: 'cust-101',
      actorId: 'mm-1',
      action: 'customer_created',
      description: 'Profile created for Aarav Mehta',
      metadata: {},
      createdAt: '2025-01-20T11:00:00.000Z',
    },
    {
      id: 'act-402',
      customerId: 'cust-101',
      actorId: 'mm-1',
      action: 'status_updated',
      description: 'Status updated to Ready for Matching',
      metadata: { previousStatus: 'Profile Review', newStatus: 'Ready for Matching' },
      createdAt: '2025-02-01T10:00:00.000Z',
    },
  ];

  // Write all collections
  fs.writeFileSync(path.join(DATA_DIR, 'matchmakers.json'), JSON.stringify(matchmakers, null, 2), 'utf-8');
  fs.writeFileSync(path.join(DATA_DIR, 'customers.json'), JSON.stringify(customers, null, 2), 'utf-8');
  fs.writeFileSync(path.join(DATA_DIR, 'notes.json'), JSON.stringify(notes, null, 2), 'utf-8');
  fs.writeFileSync(path.join(DATA_DIR, 'matchRecords.json'), JSON.stringify(matchRecords, null, 2), 'utf-8');
  fs.writeFileSync(path.join(DATA_DIR, 'activities.json'), JSON.stringify(activities, null, 2), 'utf-8');

  console.log(`✅ Seed successfully written to ${DATA_DIR}:`);
  console.log(`   - ${matchmakers.length} matchmakers`);
  console.log(`   - ${customers.length} total customer profiles (${customers.filter(c => c.gender === 'Female').length} Female, ${customers.filter(c => c.gender === 'Male').length} Male)`);
  console.log(`   - ${notes.length} notes`);
  console.log(`   - ${matchRecords.length} match records`);
  console.log(`   - ${activities.length} activity items`);
}

runSeed().catch(err => {
  console.error('❌ Error during seed:', err);
  process.exit(1);
});
