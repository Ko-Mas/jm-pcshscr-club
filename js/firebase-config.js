// ============================================================
//  PCSHSCR Club Registration – Firebase Configuration
//  Replace the values below with your Firebase project config.
//  Get it from: Firebase Console → Project Settings → General
// ============================================================
const firebaseConfig = {
  apiKey:            "AIzaSyBf0LISrkOWlNDeWMvnxd0O9u6lWm9L-i0",
  authDomain:        "pcshscr-club.firebaseapp.com",
  projectId:         "pcshscr-club",
  storageBucket:     "pcshscr-club.firebasestorage.app",
  messagingSenderId: "891771449679",
  appId:             "1:891771449679:web:c4a855454263b551e5d53a",
  measurementId:     "G-N20F7872K6"
};

// Initialize Firebase (using compat SDK loaded via CDN)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── Firestore Collection Names ──────────────────────────────
const COL = {
  SETTINGS:      'settings',
  ROUNDS:        'rounds',
  CLUBS:         'clubs',
  STUDENTS:      'students',
  REGISTRATIONS: 'registrations',
  AUDIT_LOG:     'auditLog',
  ACTIVE_SLOTS:  'activeSlots',   // tracks users currently on club-selection
  WAITING_QUEUE: 'waitingQueue'   // queue entries for users waiting to enter
};

// ── Default settings document IDs ──────────────────────────
const SETTINGS_DOC       = 'global';
const QUEUE_SETTINGS_DOC = 'queue';   // settings/queue

// ── Queue / slot constants ──────────────────────────────────
const SLOT_TTL_MS  = 90 * 1000;   // slot expires after 90 s without heartbeat
const HEARTBEAT_MS = 25 * 1000;   // heartbeat interval
