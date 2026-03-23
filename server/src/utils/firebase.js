const admin = require('firebase-admin');
const path = require('path');

// NOTE: To use real Firebase, place your serviceAccountKey.json in the server root
// and uncomment the initialization code below.
// For now, this is a placeholder to show where the Firestore integration goes.

let db;

try {
  const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.warn('Firebase Admin could not be initialized. Ensure serviceAccountKey.json exists in server root.');
  console.warn('Falling back to local JSON database for now.');
  // In a real scenario, you'd want to handle this more gracefully.
}

module.exports = db;
