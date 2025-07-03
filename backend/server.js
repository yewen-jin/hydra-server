// load environmental variables contained in .env file
require('dotenv').config()

const fs = require('fs')
const express = require('express')
var cors = require('cors')

const app = express()
const path = require('path')
var http = require('http')

const corsOptions = {
  origin: ['https://hydra.ojack.xyz'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

var server = http.createServer(app)
//
// TURN server access
var twilio = require('twilio')

if (process.env.TWILIO_SID) {
  var twilio_client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
}

var io = require('socket.io')(server, {cors: {
  origin: true,
  // methods: ["GET", "POST"],
  credentials: true,
}})
require('./mastodon-gallery.js')(app)

// create a server on port 8000
var httpsPort = process.env.HTTPS_PORT !== undefined ? process.env.HTTPS_PORT : 8000
server.listen(httpsPort, function () {
  console.log(`server available at http://localhost:${httpsPort}`)
})

// Persistent room for editor/display communication
const EDITOR_DISPLAY_ROOM = 'hydra-editor-display';

io.on('connection', function (socket) {
  var thisRoom = null
  
  // ORIGINAL: Hydra peer-to-peer room functionality
  socket.on('join', function (room, _userData) {
    thisRoom = room

    var peers = io.nsps['/'].adapter.rooms[room] ? Object.keys(io.nsps['/'].adapter.rooms[room].sockets) : []

    if (twilio_client) {
      twilio_client.api.accounts(process.env.TWILIO_SID).tokens
        .create({})
        .then((token) => {
          socket.emit('ready', {
            id: socket.id,
            peers: peers,
            servers: token.iceServers
          })

          socket.join(thisRoom)
          socket.to(thisRoom).emit('new peer', socket.id)
          socket.emit("peers", peers);
        })
    } else {
      socket.emit('ready', {
        id: socket.id,
        peers: peers
      })

      socket.join(thisRoom)
      socket.to(thisRoom).emit('new peer', socket.id)
      socket.emit("peers", peers);
    }
  })

  // NEW: Editor/Display persistent room functionality
  socket.on('join-editor-display', function (data) {
    const { type } = data; // 'editor' or 'display'
    
    socket.join(EDITOR_DISPLAY_ROOM);
    socket.editorDisplayType = type;
    
    console.log(`${type} joined editor-display room:`, socket.id);
    
    // Get current room info
    var roomClients = io.nsps['/'].adapter.rooms[EDITOR_DISPLAY_ROOM] ? 
      Object.keys(io.nsps['/'].adapter.rooms[EDITOR_DISPLAY_ROOM].sockets) : [];
    
    // Notify other clients in the room
    socket.to(EDITOR_DISPLAY_ROOM).emit('peer-joined', {
      id: socket.id,
      type: type
    });
    
    // Send current room info to the joining client
    socket.emit('room-info', {
      room: EDITOR_DISPLAY_ROOM,
      clientCount: roomClients.length
    });
  });

  // NEW: Handle code updates within the editor-display room
  socket.on('update-code', function (data) {
    console.log('Received code update from:', socket.id);
    
    // Only broadcast to clients in the editor-display room
    socket.to(EDITOR_DISPLAY_ROOM).emit('code-update', data);
    
    console.log('Code broadcasted to displays in room:', EDITOR_DISPLAY_ROOM);
  });

  // ORIGINAL: Hydra broadcast functionality
  socket.on('broadcast', function (data) {
    socket.to(thisRoom).emit('broadcast', data)
  })

  // ORIGINAL: Hydra peer-to-peer messaging
  socket.on('message', function (data) {
    var client = io.sockets.connected[data.id];
   
    client && client.emit('message', {
      id: socket.id,
      label: socket.label,
      type: data.type,
      message: data.message
    });
  })

  // Handle disconnect for both systems
  socket.on('disconnect', function () {
    console.log('Client disconnected:', socket.id);
    
    // If it was an editor/display client, notify the room
    if (socket.editorDisplayType) {
      socket.to(EDITOR_DISPLAY_ROOM).emit('peer-left', {
        id: socket.id,
        type: socket.editorDisplayType
      });
    }
  });
})

app.use('/api', express.static(path.join(__dirname, '../frontend/hydra-functions/docs')))
app.use('/functions', express.static(path.join(__dirname, '../frontend/hydra-functions/docs')))
app.use('/docs', express.static(path.join(__dirname, '../frontend/hydra-docs')))
app.use('/garden', express.static(path.join(__dirname, '../frontend/hydra-garden/dist')))
app.use('/grants', express.static(path.join(__dirname, '../frontend/hydra-grants/public')))

app.use(express.static(path.join(__dirname, '../frontend/web-editor/public')))
