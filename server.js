const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const admin = require('firebase-admin');

const serviceAccount = require('./path/to/your/firebase-service-account.json'); // Replace with your Firebase service account key file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('alert', async (data) => {
    try {
      // Parse the incoming data
      const alertData = JSON.parse(data);
      const { Latitude, Longitude, UserName, city, state, user_Img, user_Phone } = alertData;
      
      // Construct the notification message
      const message = {
        notification: {
          title: `Emergency Alert from ${UserName}`,
          body: `Location: ${city}, ${state}`,
        },
        token: alertData.token, // FCM token of the device to send the notification
      };

      // Send the notification via FCM
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);

      // Optionally, save the alert details to your database or perform other actions
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


//api

app.use(bodyParser.json());

let deviceTokens = []; // This should be replaced with a proper database in production

app.post('/api/V1/messagingToken', (req, res) => {
  const { DeviceType, Token } = req.body;

  // Save the token (in-memory array for demonstration purposes)
  deviceTokens.push({ DeviceType, Token });

  res.status(200).send({ success: true, message: 'Token saved successfully' });
});


server.listen(4000, () => {
  console.log('Listening on port 4000');
});
