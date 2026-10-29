const admin = require('firebase-admin');
require('dotenv').config();

let firebaseApp;

try {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  };

  // Only initialize if credentials are present
  if (
    serviceAccount.project_id &&
    serviceAccount.private_key &&
    serviceAccount.client_email &&
    !admin.apps.length
  ) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
  } else if (!admin.apps.length) {
    console.log('⚠️  Firebase Admin not initialized (missing credentials) — OTP features will be limited');
  }
} catch (err) {
  console.error('❌ Firebase Admin init error:', err.message);
}

const auth = admin.apps.length ? admin.auth() : null;

module.exports = { admin, auth, firebaseApp };
