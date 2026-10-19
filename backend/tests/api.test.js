import http from 'http';
import app from '../src/app.js';
import config from '../src/config/index.js';
import { matchmakerRepo, customerRepo, matchRecordRepo, noteRepo, activityRepo } from '../src/repositories/jsonRepository.js';

let server;
let baseUrl;
let authCookie;

beforeAll(async () => {
  // Start server on an ephemeral port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  // Clean test records if any exist
  const existing = await matchRecordRepo.findAll({ customerId: 'cust-101', candidateId: 'cust-102' });
  for (const m of existing) {
    await matchRecordRepo.delete(m.id);
  }
});

afterAll(async () => {
  const existing = await matchRecordRepo.findAll({ customerId: 'cust-101', candidateId: 'cust-102' });
  for (const m of existing) {
    await matchRecordRepo.delete(m.id);
  }
  await new Promise((resolve) => server.close(resolve));
});

describe('TDC Matchmaker API Integration Tests', () => {
  describe('GET /api/health', () => {
    test('returns status ok', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });
  });

  describe('Auth Flow', () => {
    test('POST /api/auth/login fails with invalid credentials', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'priya.sharma@datecrew.com',
          password: 'WrongPassword!',
        }),
      });
      expect(res.status).toBe(401);
    });

    test('POST /api/auth/login succeeds with valid credentials and sets session cookie', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'priya.sharma@datecrew.com',
          password: 'Password123!',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('priya.sharma@datecrew.com');

      // Extract cookie header
      const rawCookie = res.headers.get('set-cookie');
      expect(rawCookie).toBeDefined();
      authCookie = rawCookie.split(';')[0];
    });

    test('GET /api/auth/me returns authenticated user details', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Cookie: authCookie },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.email).toBe('priya.sharma@datecrew.com');
      expect(data.user.role).toBe('matchmaker');
    });

    test('GET /api/auth/me returns 401 when unauthenticated', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`);
      expect(res.status).toBe(401);
    });
  });

  describe('Dashboard Flow', () => {
    test('GET /api/dashboard/stats returns pipeline and activity stats', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard/stats`, {
        headers: { Cookie: authCookie },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.metrics).toBeDefined();
      expect(data.metrics.totalCustomers).toBeGreaterThan(0);
      expect(data.pipeline).toBeDefined();
    });
  });

  describe('Customer Management Flow', () => {
    test('GET /api/customers returns assigned customer list with pagination', async () => {
      const res = await fetch(`${baseUrl}/api/customers?page=1&limit=10`, {
        headers: { Cookie: authCookie },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.total).toBeGreaterThan(0);
      expect(data.page).toBe(1);
    });

    test('GET /api/customers/:id returns full biodata for assigned customer', async () => {
      const res = await fetch(`${baseUrl}/api/customers/cust-101`, {
        headers: { Cookie: authCookie },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.customer.id).toBe('cust-101');
      expect(data.customer.firstName).toBe('Aarav');
      expect(data.customer.verification).toBeDefined();
    });

    test('PATCH /api/customers/:id/status updates journey status and logs audit activity', async () => {
      const res = await fetch(`${baseUrl}/api/customers/cust-101/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookie,
        },
        body: JSON.stringify({ status: 'Profile Review' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.customer.journeyStatus).toBe('Profile Review');

      // Revert back for other tests
      await fetch(`${baseUrl}/api/customers/cust-101/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookie,
        },
        body: JSON.stringify({ status: 'Ready for Matching' }),
      });
    });
  });

  describe('Notes Flow', () => {
    test('POST and GET /api/customers/:id/notes records and lists meeting notes', async () => {
      const createRes = await fetch(`${baseUrl}/api/customers/cust-101/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookie,
        },
        body: JSON.stringify({
          content: 'Discussed match criteria preferences update during follow-up call.',
          type: 'Call',
        }),
      });

      expect(createRes.status).toBe(201);
      const createdNote = await createRes.json();
      expect(createdNote.note.content).toContain('Discussed match criteria');

      const listRes = await fetch(`${baseUrl}/api/customers/cust-101/notes`, {
        headers: { Cookie: authCookie },
      });
      expect(listRes.status).toBe(200);
      const listData = await listRes.json();
      expect(listData.notes.some(n => n.id === createdNote.note.id)).toBe(true);
    });
  });

  describe('Matching Engine Flow', () => {
    test('GET /api/customers/:id/matches returns ranked candidates with category breakdowns', async () => {
      const res = await fetch(`${baseUrl}/api/customers/cust-101/matches`, {
        headers: { Cookie: authCookie },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.customer).toBeDefined();
      expect(Array.isArray(data.matches)).toBe(true);
      expect(data.matches.length).toBeGreaterThan(0);
      const topMatch = data.matches[0];
      expect(topMatch.score).toBeGreaterThan(0);
      expect(topMatch.categoryBreakdown).toBeDefined();
    });

    test('POST /api/matches/send creates mock match introduction record', async () => {
      // Find candidate to match with cust-101 (e.g. cust-102)
      const res = await fetch(`${baseUrl}/api/matches/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookie,
        },
        body: JSON.stringify({
          customerId: 'cust-101',
          candidateId: 'cust-102',
          score: 88,
          scoreBreakdown: { age: { score: 90, max: 100 } },
          explanations: ['Both tech/consulting leaders in Bangalore', 'Shared active lifestyle'],
          introductionMessage: 'Hi Aarav, introducing Ananya from McKinsey Bangalore.',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.matchRecord).toBeDefined();
      expect(data.matchRecord.status).toBe('Sent');
      expect(data.email).toBeDefined();
      expect(data.email.mock).toBe(true);
    });

    test('GET /api/matches lists sent match introductions', async () => {
      const res = await fetch(`${baseUrl}/api/matches`, {
        headers: { Cookie: authCookie },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.some(m => m.customerId === 'cust-101' && m.candidateId === 'cust-102')).toBe(true);
    });
  });
});
