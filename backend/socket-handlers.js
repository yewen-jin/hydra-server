function initializeSocketHandlers(io) {
  const EDITOR_DISPLAY_ROOM = 'hydra-editor-display';

  io.on('connection', function (socket) {
    console.log('Client connected:', socket.id);

    // Handle editor/display room joining
    socket.on('join-editor-display', (data) => {
      const { type } = data; // 'editor' or 'display'
      
      socket.join(EDITOR_DISPLAY_ROOM);
      socket.editorDisplayType = type;
      
      console.log(`${type} joined editor-display room:`, socket.id);
      
      // Notify other clients in the room
      socket.to(EDITOR_DISPLAY_ROOM).emit('peer-joined', {
        id: socket.id,
        type: type
      });
      
      // Send current room info
      const roomClients = io.sockets.adapter.rooms.get(EDITOR_DISPLAY_ROOM);
      socket.emit('room-info', {
        room: EDITOR_DISPLAY_ROOM,
        clientCount: roomClients ? roomClients.size : 0
      });
    });

    // Handle code updates within the editor-display room
    socket.on('update-code', (data) => {
      console.log('Received code update from:', socket.id);
      
      // Only broadcast to clients in the same room
      socket.to(EDITOR_DISPLAY_ROOM).emit('code-update', data);
      
      console.log('Code broadcasted to displays in room:', EDITOR_DISPLAY_ROOM);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      if (socket.editorDisplayType) {
        socket.to(EDITOR_DISPLAY_ROOM).emit('peer-left', {
          id: socket.id,
          type: socket.editorDisplayType
        });
      }
    });
  });
}

module.exports = { initializeSocketHandlers };