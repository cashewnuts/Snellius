'use strict'
const Pusher = require('pusher');

module.exports = (expressApp) => {

  if (expressApp === null) {
    throw new Error('expressApp option must be an express server instance')
  }

  const {
    PUSHER_APP_ID,
    PUSHER_APP_KEY,
    PUSHER_APP_SECRET,
    PUSHER_APP_CLUSTER,
  } = process.env
  var pusher = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_APP_KEY,
    secret: PUSHER_APP_SECRET,
    cluster: PUSHER_APP_CLUSTER, 
  });

  expressApp.get('/pusher/key', (req, res) => {
    if (req.user) {
      const data = {
        API_KEY: PUSHER_APP_KEY
      }
      return res.json(data);
    } else {
      return res.status(403).json({error: 'Must be signed in'})
    }
  })

  expressApp.post('/pusher/auth', (req, res) => {
    // Check user is logged in
    if (!req.user)
      return res.status('403').end()

    var user = req.user
    var socketId = req.body.socket_id
    var channel = req.body.channel_name
    var presenceData = {
      user_id: user.id,
      user_info: {
        name: user.name,
        email: user.email,
      }
    };
    var auth = pusher.authenticate(socketId, channel, presenceData);
    res.send(auth);
  });
}