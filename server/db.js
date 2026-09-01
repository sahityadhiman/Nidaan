import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOCK_DB_FILE = path.join(__dirname, 'mock_db.json');

// Initialize Database connection (Firestore vs. Local JSON Fallback)
let dbType = 'mock';
let firestoreDb = null;

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (firebaseProjectId && firebaseClientEmail && firebasePrivateKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseProjectId,
        clientEmail: firebaseClientEmail,
        privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
      }),
    });
    firestoreDb = admin.firestore();
    dbType = 'firestore';
    console.log('Successfully connected to Firestore Database.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK. Falling back to local mock DB.', error);
  }
} else {
  console.log('Firebase credentials not found in env. Initializing local JSON Mock Database.');
}

// Local mock DB helpers
const readMockDb = () => {
  if (!fs.existsSync(MOCK_DB_FILE)) {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify({ issues: [], contractors: [], responders: [] }, null, 2));
  }
  const data = fs.readFileSync(MOCK_DB_FILE, 'utf8');
  return JSON.parse(data);
};

const writeMockDb = (data) => {
  fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2));
};

// Unified Database API
export const db = {
  getCollection: async (collectionName) => {
    if (dbType === 'firestore') {
      const snapshot = await firestoreDb.collection(collectionName).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const data = readMockDb();
      return data[collectionName] || [];
    }
  },

  getDoc: async (collectionName, docId) => {
    if (dbType === 'firestore') {
      const doc = await firestoreDb.collection(collectionName).doc(docId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } else {
      const data = readMockDb();
      const items = data[collectionName] || [];
      return items.find(item => item.id === docId) || null;
    }
  },

  addDoc: async (collectionName, docData) => {
    const id = docData.id || `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const finalData = { ...docData, id };
    
    if (dbType === 'firestore') {
      await firestoreDb.collection(collectionName).doc(id).set(finalData);
      return finalData;
    } else {
      const data = readMockDb();
      if (!data[collectionName]) data[collectionName] = [];
      data[collectionName].push(finalData);
      writeMockDb(data);
      return finalData;
    }
  },

  updateDoc: async (collectionName, docId, updateData) => {
    if (dbType === 'firestore') {
      await firestoreDb.collection(collectionName).doc(docId).update(updateData);
      const doc = await firestoreDb.collection(collectionName).doc(docId).get();
      return { id: docId, ...doc.data() };
    } else {
      const data = readMockDb();
      const items = data[collectionName] || [];
      const index = items.findIndex(item => item.id === docId);
      if (index !== -1) {
        items[index] = { ...items[index], ...updateData };
        data[collectionName] = items;
        writeMockDb(data);
        return items[index];
      }
      throw new Error(`Document with ID ${docId} not found in collection ${collectionName}`);
    }
  },

  deleteDoc: async (collectionName, docId) => {
    if (dbType === 'firestore') {
      await firestoreDb.collection(collectionName).doc(docId).delete();
      return true;
    } else {
      const data = readMockDb();
      const items = data[collectionName] || [];
      const filtered = items.filter(item => item.id !== docId);
      data[collectionName] = filtered;
      writeMockDb(data);
      return true;
    }
  },

  // Specialized search / query helpers
  getIssuesByStatus: async (status) => {
    const issues = await db.getCollection('issues');
    return issues.filter(issue => issue.status === status);
  },

  getContractorsBySpecialty: async (specialty) => {
    const contractors = await db.getCollection('contractors');
    return contractors.filter(c => c.specialties.includes(specialty));
  },

  // Force reset mock DB for seeding
  resetMockDb: (seedData) => {
    if (dbType === 'mock') {
      writeMockDb(seedData);
    }
  },

  getDbType: () => dbType
};
