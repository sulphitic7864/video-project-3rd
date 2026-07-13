/**
 * Firebase initialization and helper functions for syncing data to Firestore.
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { firebaseConfig } from './config/firebaseAndCloudinary';
import firebaseAppletConfig from '../firebase-applet-config.json';
import { VideoProject, ProjectCategory } from './types';
import { INITIAL_PROJECTS } from './data';
import dbUsers from './db.json';

// Initialize Firebase with auto-configured credentials and targeted database ID
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId || "(default)");

/**
 * Recursively removes any keys with `undefined` values from an object or array.
 * This is crucial because Firestore does not support saving `undefined` values.
 */
function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as any;
  }

  const result: any = {};
  for (const key of Object.keys(obj as any)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      result[key] = cleanUndefined(val);
    }
  }
  return result;
}

// --- SEEDING & SYNC FUNCTIONS FOR PROJECTS ---

/**
 * Fetches all video projects from Firestore.
 * If the collection is empty, automatically seeds it with INITIAL_PROJECTS.
 */
export async function fetchProjectsFromFirestore(): Promise<VideoProject[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    if (querySnapshot.empty) {
      console.log('Firestore projects collection is empty. Seeding with default projects...');
      const batch = writeBatch(db);
      INITIAL_PROJECTS.forEach((project) => {
        const docRef = doc(db, 'projects', project.id);
        batch.set(docRef, project);
      });
      await batch.commit();
      return INITIAL_PROJECTS;
    }

    const projects: VideoProject[] = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data() as VideoProject);
    });
    return projects;
  } catch (error) {
    console.error('Error fetching/seeding projects from Firestore:', error);
    return INITIAL_PROJECTS; // Fallback to local defaults if Firestore fails
  }
}

/**
 * Saves or updates a project in Firestore.
 */
export async function saveProjectToFirestore(project: VideoProject): Promise<void> {
  try {
    const docRef = doc(db, 'projects', project.id);
    const cleaned = cleanUndefined(project);
    await setDoc(docRef, cleaned);
  } catch (error) {
    console.error(`Error saving project ${project.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Deletes a project from Firestore.
 */
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  try {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting project ${projectId} from Firestore:`, error);
    throw error;
  }
}


// --- SEEDING & SYNC FUNCTIONS FOR SYSTEM SETTINGS ---

export interface PortfolioSettings {
  segmentImages: Record<ProjectCategory, string>;
  segmentCaptions: Record<ProjectCategory, string>;
  headerBackground: string;
  headerZoom: number;
  headerXOffset: number;
  headerYOffset: number;
  headerAspectRatio: string;
  headerZoomVertical: number;
  headerXOffsetVertical: number;
  headerYOffsetVertical: number;
  contactBio: string;
  contactEmail: string;
  contactPhoto: string;
}

const DEFAULT_SETTINGS: PortfolioSettings = {
  segmentImages: {
    narrative: '',
    documentary: '',
    commercial: '',
    notes: '',
  },
  segmentCaptions: {
    narrative: 'Pièce de Résistance, 2025. Shot on FX9.',
    documentary: 'Funny Business, 2026. Shot on Sony FX3',
    commercial: 'Pragyaan (Podcast)',
    notes: 'Director notebook & project documentation, 2026.',
  },
  headerBackground: '',
  headerZoom: 100,
  headerXOffset: 50,
  headerYOffset: 50,
  headerAspectRatio: 'aspect-video md:aspect-[21/9]',
  headerZoomVertical: 100,
  headerXOffsetVertical: 50,
  headerYOffsetVertical: 50,
  contactBio: 'Cinematographer & Director of Photography based in Mumbai, India. Specialized in anamorphic storytelling, commercial campaigns, and narrative features. Translating emotions into frames.',
  contactEmail: 'bahriakshit@gmail.com',
  contactPhoto: '/src/assets/images/akshit_portrait_1783337842451.jpg'
};

/**
 * Fetches global portfolio settings from Firestore.
 * Seeds with default settings if the document does not exist yet.
 */
export async function fetchSettingsFromFirestore(): Promise<PortfolioSettings> {
  try {
    const docRef = doc(db, 'settings', 'portfolio');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('Portfolio settings document not found. Initializing with default settings...');
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }

    const data = docSnap.data();
    // Support merging so any future/new parameters are safely filled with defaults
    return {
      ...DEFAULT_SETTINGS,
      ...data,
      segmentImages: { ...DEFAULT_SETTINGS.segmentImages, ...(data.segmentImages || {}) },
      segmentCaptions: { ...DEFAULT_SETTINGS.segmentCaptions, ...(data.segmentCaptions || {}) }
    } as PortfolioSettings;
  } catch (error) {
    console.error('Error fetching settings from Firestore:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves or updates global portfolio settings in Firestore.
 */
export async function saveSettingsToFirestore(settings: Partial<PortfolioSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'portfolio');
    const cleaned = cleanUndefined(settings);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Error updating settings in Firestore:', error);
    throw error;
  }
}


// --- SEEDING & SYNC FUNCTIONS FOR ADMIN USERS ---

export interface AdminUser {
  username: string;
  password?: string;
}

/**
 * Fetches all authorized admin accounts from Firestore.
 * Seeds them from db.json if the collection is empty.
 */
export async function fetchUsersFromFirestore(): Promise<AdminUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    if (querySnapshot.empty) {
      console.log('Firestore users collection is empty. Seeding from db.json...');
      const batch = writeBatch(db);
      const defaultUsers = dbUsers?.users || [];
      defaultUsers.forEach((user) => {
        const docRef = doc(db, 'users', user.username.toLowerCase());
        batch.set(docRef, {
          username: user.username,
          password: user.password
        });
      });
      await batch.commit();
      return defaultUsers;
    }

    const users: AdminUser[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as AdminUser);
    });
    return users;
  } catch (error) {
    console.error('Error fetching admin users from Firestore:', error);
    return dbUsers?.users || []; // Fallback to db.json local users
  }
}
