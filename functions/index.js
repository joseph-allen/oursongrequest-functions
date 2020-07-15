const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
const firebase = require("firebase");

admin.initializeApp();
const config = {
  apiKey: "AIzaSyCkhBpHI0b_QBW72WhosxBPPvcuz-9Ytqs",
  authDomain: "our-song-request.firebaseapp.com",
  databaseURL: "https://our-song-request.firebaseio.com",
  projectId: "our-song-request",
  storageBucket: "our-song-request.appspot.com",
  messagingSenderId: "931185379407",
  appId: "1:931185379407:web:7ff83002ceda10edfd823a",
  measurementId: "G-YVQQRBKG67",
};
// Initialize Firebase
firebase.initializeApp(config);

const db = admin.firestore();

app.get("/helloWorld", (request, response) => {
  response.send("Hello from Firebase!");
});

app.post("/signup", (req, res) => {
  const newUser = {
    stagename: req.body.stageName,
    name: req.body.name,
    sociallink: req.body.socialLink,
    handle: req.body.stageName
      .split(" ")
      .map((x) => x[0].toUpperCase() + x.substring(1))
      .join(""),
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  //   TODO: validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        stagename: newUser.stagename,
        name: newUser.name,
        sociallink: newUser.sociallink,
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
