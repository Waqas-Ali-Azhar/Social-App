const { db, admin } = require("../util/admin");

const firebase = require("firebase");

const firebaseConfig = require("../util/config");
firebase.initializeApp(firebaseConfig);

const { validateSignupData, validateLoginData } = require("../util/validators");

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };
  console.log(newUser);

  const { valid, errors } = validateSignupData(newUser);
  if (!valid) res.status(400).json(errors);
  const noImg = "no-img.png";
  //todo validate
  let token;
  let userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;

      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${
          firebaseConfig.storageBucket
        }/o/${noImg}?alt=media`,
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is  already in use" });
      }
      return res.status(500).json({ error: err.code });
    });

  // firebase
  //   .auth()
  //   .createUserWithEmailAndPassword(newUser.email, newUser.password)
  //   .then(data => {
  //     return res
  //       .status(201)
  //       .json({ message: `user ${data.user.uid} signed up successfully` });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     return res.status(500).json({ error: err.code });
  //   });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  //   let errors = {};
  //   if (isEmpty(user.email)) errors.email = "Must not be empty";
  //   if (isEmpty(user.password)) errors.password = "Must not be empty";

  //   if (Object.keys(errors).length > 0) {
  //     return res.status(400).json(errors);
  //   }

  const { valid, erros } = validateLoginData(user);
  if (!valid) res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.log(err);
      if (err.code == "auth/wrong-password")
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      return res.status(500).json({ error: err.code });
    });
};

// exports.uploadImage = (res, req) => {
//   console.log(req);
//   const BusBoy = require("busboy");
//   const path = require("path");
//   const os = require("os");
//   const fs = require("fs");

//   const busboy = new BusBoy({ headers: req.headers });
//   let imageFileName;
//   let imageToBeUploaded = {};

//   busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
//     console.log(mimetype);
//     console.log("vicky end");

//     // const imageExtension = filename.split(".")[filename.split(".").length - 1];
//     // imageFileName = `${Math.round(Math.random() * 100000)}.${imageExtension}`;
//     // const filepath = path.join(os.temdir(), imageFileName);
//     // imageToBeUploaded = { filepath, mimetype };
//     // file.pipe(fs.createWriteStream(filepath));
//   });
//   busboy.on("finish", () => {
//     admin
//       .storage()
//       .bucket()
//       .upload(imageToBeUploaded.filepath, {
//         resumable: false,
//         metadata: {
//           metadata: {
//             contentType: imageToBeUploaded.mimetype
//           }
//         }
//       })
//       .then(() => {
//         const imageUrl = `https://firebasestoreage.googleapis.com/v0/b/${
//           firebaseConfig.storageBucket
//         }/o/${imageFileName}?alt=media`;
//         return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
//       })
//       .then(() => {
//         return res.json({ message: "Image uploaded successfully" });
//       })
//       .catch(err => {
//         console.error(err);
//         return res.status(500).json({ error: err.code });
//       });
//   });
//   busboy.end(req.rawBody);
// };

exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // 32756238461724837.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
          config.storageBucket
        }/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "image uploaded successfully" });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: "something went wrong" });
      });
  });
  //busboy.end(req.rawBody);
};
