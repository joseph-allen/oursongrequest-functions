const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: true }));
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

app.post("/users/:handle", (req, res) => {
  const userData = {
    profilePicture: req.body.profilePicture,
    videoURL: req.body.videoURL,
    genres: req.body.genres,
    bio: req.body.bio,
    videoPrice: req.body.videoPrice,
    videoResponseTime: req.body.videoResponseTime,
    isPublic: req.body.isPublic,
  };

  // Remove undefined keys
  Object.keys(userData).forEach((key) =>
    userData[key] === undefined ? delete userData[key] : {}
  );

  // TODO: make sure request are authenticated  from a logged in user

  db.doc(`/users/${req.params.handle}`)
    .update(userData)
    .then(() => {
      return res.json(200).json({ message: userData });
    })
    .catch((err) => {
      console.error(err);
      return res.json(500).json({ error: err.code });
    });
});

app.get("/users/:handle", (req, res) => {
  let userData = {};

  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData = doc.data();
        return db.collection("users").get();
      } else {
        return "error";
      }
    })
    .then(() => {
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.json(500).json({ error: err.code });
    });
});

app.post("/login", (req, res) => {
  const userData = {
    email: req.body.email,
    password: req.body.password,
  };

  firebase
    .auth()
    .signInWithEmailAndPassword(userData.email, userData.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      console.error(errorMessage);

      return res.status(500).json({ error: errorCode });
    });
});

// Get Handle from ID
app.get("/getUserHandle/:ID", (req, res) => {
  db.collection("users")
    .where("userId", "==", `${req.params.ID}`)
    .get()
    .then((docs) => {
      docs.forEach((doc) => {
        return res.status(200).json({ handle: doc.data()["handle"] });
      });

      return res.status(400).json({ handle: "not found" });
    })
    .catch((error) => console.log(error));
});

app.post("/signup", (req, res) => {
  const newUser = {
    stagename: req.body.stageName,
    name: req.body.name,
    handle: req.body.stageName
      .split(" ")
      .map((x) => x[0].toUpperCase() + x.substring(1))
      .join(""),
    phone: req.body.phone,
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
        handle: newUser.handle,
        phone: newUser.phone,
        email: newUser.email,
        genres: "placeholderTag1, Tag2, Tag3",
        bio: "placeholder Bio",
        videoPrice: "50",
        videoResponseTime: "8",
        createdAt: new Date().toISOString(),
        isPublic: false,
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

app.post("/createUser", (req, res) => {
  const newUser = {
    stagename: req.body.stageName,
    name: req.body.name,
    handle: req.body.stageName
      .split(" ")
      .map((x) => x[0].toUpperCase() + x.substring(1))
      .join(""),
    phone: req.body.phone,
    email: req.body.email,
    userId: req.body.userId,
    profilePicture: req.body.profilePicture,
  };

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      }
      return res.status(200).json({ success: "account created" });
    })
    .then(() => {
      const userCredentials = {
        stagename: newUser.stagename,
        name: newUser.name,
        handle: newUser.handle,
        phone: newUser.phone,
        email: newUser.email,
        genres: "placeholderTag1, Tag2, Tag3",
        bio: "placeholder Bio",
        videoPrice: "50",
        videoResponseTime: "8",
        createdAt: new Date().toISOString(),
        isPublic: false,
        userId: newUser.userId,
        profilePicture: newUser.profilePicture,
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

app.post("/signupCustomer", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  //   TODO: validate data
  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((token) => {
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
