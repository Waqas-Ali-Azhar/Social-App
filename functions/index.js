const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const { getAllScreams, postOneScream } = require("./handlers/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails
} = require("./handlers/users");

// import firebase from "firebase";

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

//Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);

//user routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
// https://baseurl.com/api/screams

exports.api = functions.https.onRequest(app);
