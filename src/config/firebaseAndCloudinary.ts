/**
 * Central configuration file for Firebase and Cloudinary.
 * You can replace the placeholder values below with your real credentials.
 */

import firebaseAppletConfig from '../../firebase-applet-config.json';

// --- FIREBASE CONFIGURATION ---
// By default, this uses the auto-generated configuration from AI Studio.
// You can override this with your own Firebase Project configurations if desired.
export const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId
};

// --- CLOUDINARY CONFIGURATION ---
// Set these values in your .env file or replace them directly here.
// To use Cloudinary uploads, make sure to create an "unsigned upload preset" in your Cloudinary Dashboard.
export const cloudinaryConfig = {
  cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || "sueurrw7", // Replace with your Cloudinary Cloud Name
  uploadPreset: (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET || "portfolio" // Replace with your Cloudinary Unsigned Upload Preset name
};
