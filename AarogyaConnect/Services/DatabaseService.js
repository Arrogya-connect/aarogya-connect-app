import * as SQLite from 'expo-sqlite';

let db;
try {
  db = SQLite.openDatabaseSync('aarogya_connect_final.db');
} catch (error) {
  console.error("Database Open Failed:", error);
}

export const initDB = () => {
  if (!db) return;

  try {
    db.execSync('PRAGMA foreign_keys = ON;');

    db.execSync(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        registered_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS Consultations (
        consultation_id TEXT PRIMARY KEY,
        user_id TEXT,
        symptoms_text TEXT,
        duration_days INTEGER,
        discomfort_level INTEGER,
        calculated_urgency TEXT,
        rag_diseases_json TEXT,
        query_number TEXT,
        is_synced INTEGER DEFAULT 0,
        created_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
      );
    `);

    db.runSync(
      "INSERT OR IGNORE INTO Users (user_id, name, phone, registered_at) VALUES (?, ?, ?, ?)",
      ['Guest', 'Guest User', '0000000000', Date.now()]
    );
  } catch (error) {
    console.error("Database Init Failed:", error);
  }
};

export const registerUser = (name, phone) => {
  if (!db) return null;
  try {
    const userId = Date.now().toString(); 
    db.runSync(
      'INSERT INTO Users (user_id, name, phone, registered_at) VALUES (?, ?, ?, ?)', 
      [userId, name, phone, Date.now()]
    );
    return userId;
  } catch (error) {
    console.error("Register User Failed:", error);
    return null;
  }
};

export const saveConsultation = (userId, symptoms, duration, discomfort, urgency, ragResults, queryNumber = null) => {
  if (!db) return null;

  try {
    const consultId = Date.now().toString();
    const ragJson = JSON.stringify(ragResults);

    db.runSync(
      `INSERT INTO Consultations 
      (consultation_id, user_id, symptoms_text, duration_days, discomfort_level, calculated_urgency, rag_diseases_json, query_number, is_synced, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [consultId, userId || 'Guest', symptoms, duration, discomfort, urgency, ragJson, queryNumber, Date.now()]
    );

    return consultId;
  } catch (error) {
    console.error("Save Consultation Failed:", error);
    return null;
  }
};

export const getUserConsultations = (userId) => {
  if (!db) return [];
  try {
    return db.getAllSync(
      'SELECT * FROM Consultations WHERE user_id = ? ORDER BY created_at DESC',
      [userId || 'Guest']
    );
  } catch (error) {
    console.error("Get History Failed:", error);
    return [];
  }
};

export const getUnsyncedConsultations = () => {
  if (!db) return [];
  try {
    return db.getAllSync('SELECT * FROM Consultations WHERE is_synced = 0');
  } catch (error) {
    console.error("Get Unsynced Failed:", error);
    return [];
  }
};

export const markAsSynced = (consultationId) => {
  if (!db) return;
  try {
    db.runSync(
      'UPDATE Consultations SET is_synced = 1 WHERE consultation_id = ?',
      [consultationId]
    );
  } catch (error) {
    console.error("Mark Synced Failed:", error);
  }
};