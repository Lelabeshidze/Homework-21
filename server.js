const ws = require('ws');
const uuid = require('uuid');

const server = new ws.WebSocketServer({ port: 8080 });
let activeUsers = [];
let messages = [];
server.on('connection', function connection(socket) {
  socket.id = uuid.v4();
  brodCastAll({type: 'activeUsers', data: activeUsers});
  socket.on('message', message => {
    const data = JSON.parse(message);
    console.log(data);
    if (data.type === 'newUser') {
      data.id = socket.id;
      activeUsers.push(data);
      brodCastAll(data);
    }
    if (data.type === 'userTyping') {
      brodCastAllExcludeCurrent(data, socket);
    }
    if (data.type === 'chatMessage') {
      const messageData = { ...data, id: uuid.v4() };
      messages.push(messageData);
      sendMessageWithSmile(messageData, socket);
    }
    if (data.type === 'messageLike') {
      let newCount = 0;
      messages = messages.map(m => {
        if(m.id === data.id){
          return {...m, likeCount: newCount = (m.likeCount || 0) + 1}
        }
        return m;
      })
      brodCastAll({type: 'messageLike', id: data.id, likeCount: newCount})
    }
  });

  socket.on('close', () => {
    server.emit('disconnection', socket)
    console.log('Connection Closed');
  });

  server.on('disconnection', socket => {
    activeUsers = activeUsers.filter(user => user.id !== socket.id);
    brodCastAll({type: 'activeUsers', data: activeUsers});
    console.log('User disconnected', socket.id);
  });
});

function brodCastAllExcludeCurrent(messageObject, socket) {
  server.clients.forEach(function each(client) {
    if (client !== socket&& client.readyState === ws.OPEN) {
      client.send(JSON.stringify(messageObject));
    }
  });
}

function brodCastAll(messageObject) {
  server.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(messageObject));
    }
  });
}

function sendMessageWithSmile(messageObject, socket) {
  const sender = activeUsers.find(user => user.id === socket.id);
  server.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      const normalMessage = {...messageObject};
      normalMessage.data = normalMessage.data.replace(/:D/gi, '😀');
      normalMessage.data = normalMessage.data.replace(/;\)/g, '😉');
      normalMessage.data = normalMessage.data.replace(/<3/g, '😍');
      normalMessage.data = normalMessage.data.replace(/:\|/g, '😐');
      normalMessage.data = normalMessage.data.replace(/:omg/g, '🤦');
      normalMessage.data = `${client === socket && socket.id === sender.id ? 'You' : sender.data}: ${normalMessage.data}`;
      // console.log(sender);
      client.send(JSON.stringify(normalMessage));
    }
  });
}