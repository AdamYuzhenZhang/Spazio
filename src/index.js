//For deployment
const functions = require("firebase-functions");

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;

//Yuzhen
const http = require("http");
const easyrtc = require("open-easyrtc");      // EasyRTC external module

// serviceAccountKey.json
const serviceAccount = require("./config/serviceAccountKey.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");
const storageService = require("./app/storage-service");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static("static/"));

// use res.render to load up an ejs view file
// index page
app.get("/", function (req, res) {
  res.render("pages/index");
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/room-page", function (req, res) {
    res.render("pages/room-page");
});
app.get("/vr_tests", function (req, res) {
    res.render("pages/vr_tests");
});
app.get("/urban-space-page", function (req, res) {
    res.render("pages/urban-space-page");
});
app.get("/multi-player-page", function (req, res) {
    res.render("pages/multi-player-page");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
  console.log('opening dashboard');
  const feed = await userFeed.get();
  console.log('opening dashboard 02');
  res.render("pages/dashboard", { user: req.user, feed });
  console.log('opening dashboard 03');
});

app.get("/user-home", authMiddleware, async function (req, res) {
    const db = admin.firestore();
    const user_info = await storageService.getUserByEmail(db, req.user.email);
    //console.log(user_info);
    const room_info = await storageService.getRoomByOwner(db, req.user.email);
    //console.log(room_info);
    if (user_info.roomID == "0"){
        res.render("pages/user-home", {user_info:user_info, room_info:room_info});
    } else {
        res.render("pages/user-home-urban", {user_info:user_info, room_info:room_info});
    }
});

app.get("/user-info", authMiddleware, async function (req, res) {
    res.render("pages/user-info", { user: req.user });
});

app.post("/sessionLogin", async (req, res) => {
  // CS5356 TODO #4
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501

  // Get the ID token passed
  const idToken = req.body.idToken.toString();
  functions.logger.log("session login debug");
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie.
  admin.auth()
      .createSessionCookie(idToken, { expiresIn })
      .then(
          (sessionCookie) => {
            // Set cookie policy for session cookie.
            const options = { maxAge: expiresIn, httpOnly: true, secure: true };
            res.cookie('__session', sessionCookie, options);
            res.status(200).send(JSON.stringify({ status: 'success' }));
            functions.logger.log("Login Success");
          },
          (error) => {
            functions.logger.log("Failed to check session cookie", error);
            res.status(401).send('UNAUTHORIZED REQUEST!');
          }
      );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("__session");
  res.redirect("/sign-in");
});

app.post("/dog-messages", authMiddleware, async (req, res) => {
  // CS5356 TODO #5
  // Get the message that was submitted from the request body
  // Get the user object from the request body
  // Add the message to the userFeed so its associated with the user
  try {
    const petMessage = req.body;
    userFeed.add(req.user, petMessage.message)
      .then(() => {
        res.redirect('/dashboard');
      })
  } catch (err){
    res.status(500).send({message: err}); 
  };x
});

app.post('/user-home-init', async function(req, res){
    const db = admin.firestore();
    //console.log("init 000");
    await storageService.initUser(db, req.body.email, req.body.name, req.body.bio, req.body.pronouns, req.body.roomID, req.body.country, req.body.language);
    await storageService.initRoom(db, req.body.email,  req.body.roomName, req.body.roomID, [req.body.email], [0,0,0], "");
    //console.log("init 111");
    //var startTime = performance.now()
    const user = await storageService.getUserByEmail(db, req.body.email);
    //var endTime = performance.now()
    //console.log(`Read user data took ${endTime - startTime} milliseconds`)

    //var startTime2 = performance.now()
    const room = await storageService.getRoomByOwner(db, req.body.email);
    //var endTime2 = performance.now()
    //console.log(`Read room data took ${endTime2 - startTime2} milliseconds`)

    //console.log("init 222");
    const user_info = req.body;
    //console.log(user);
    console.log(user_info);
    console.log(room);
    if (req.body.roomID == "0"){
        res.render("pages/user-home", {user_info:user_info, room_info:room})
    } else {
        res.render("pages/user-home-urban", {user_info:user_info, room_info:room})
    }
})

app.post('/user-home-customize', async function(req, res){
    const db = admin.firestore();
    //console.log("init 000");
    const user = await storageService.getUserByEmail(db, req.body.email);
    const room = await storageService.getRoomByOwner(db, req.body.email);
    await storageService.initRoom(db, room.ownerEmail,  room.roomName, room.roomType, room.usersInRoom,
        [req.body.layout1,req.body.layout2,req.body.layout3], req.body.message);
    const roomNew = await storageService.getRoomByOwner(db, req.body.email);
    console.log("room");
    if (user.roomID == "0"){
        res.render("pages/user-home", {user_info:user, room_info:roomNew})
    } else {
        res.render("pages/user-home-urban", {user_info:user, room_info:roomNew})
    }
})

//Yuzhen start
// // Serve the example and build the bundle in development.
// if (false) {
//     const webpackMiddleware = require("webpack-dev-middleware");
//     const webpack = require("webpack");
//     const config = require("../webpack.config");
//
//     app.use(
//         webpackMiddleware(webpack(config), {
//             publicPath: "/"
//         })
//     );
// }
// Start Express http server
const webServer = http.createServer(app);
const socketIo = require("socket.io")(webServer, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});        // web socket external module
// Start Socket.io so it attaches itself to Express server
const socketServer = socketIo.listen(webServer, {"log level": 1});
const myIceServers = [
    {"urls":"stun:stun1.l.google.com:19302"},
    {"urls":"stun:stun2.l.google.com:19302"},
];
easyrtc.setOption("appIceServers", myIceServers);
easyrtc.setOption("logLevel", "debug");
easyrtc.setOption("demosEnable", false);

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", (socket, easyrtcid, msg, socketCallback, callback) => {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, (err, connectionObj) => {
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", (connectionObj, roomName, roomParameter, callback) => {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
easyrtc.listen(app, socketServer, null, (err, rtcRef) => {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", (appObj, creatorConnectionObj, roomName, roomOptions, callback) => {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});


//webServer.listen(port, () => {
//    console.log("listening on http://localhost:" + port);});
exports.app = functions.https.onRequest(app);
//exports.app = functions.https.onRequest(webServer);
//Yuzhen end

//app.listen(port);
//console.log("Server started at http://localhost:" + port);

