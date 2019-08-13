const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://social-app-56cd9.firebaseio.com"
});

const db = admin.firestore();
//console.log(db);

module.exports = { admin, db };
