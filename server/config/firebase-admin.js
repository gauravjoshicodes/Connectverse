const admin = require('firebase-admin');

// Since we only need to verify ID tokens, initializing with just the projectId
// is sufficient. It will dynamically fetch Google's public keys.
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0899721715",
  });
  console.log('Firebase Admin initialized securely');
} catch (error) {
  console.error('Firebase admin initialization error', error);
}

module.exports = admin;
