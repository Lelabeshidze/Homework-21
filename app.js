const enterMessenger = document.querySelector('.enter-messenger');
const enterMessengerInput = enterMessenger.querySelector('input');
const enterMessengerBtn = document.querySelector('#messenger-enter-btn');
const messengerWrapper = document.querySelector('.messenger-wrapper');
const onlineUsers = document.querySelector('.online-users');
const messagesContainer = document.querySelector('.messenger-messages');
const messengerFrom = document.querySelector('#message-form');
const messengerInput = document.querySelector('#message-input');
const typingIndicator = document.querySelector('#typing-indicator');

enterMessengerBtn.addEventListener('click', () => {
  if(!enterMessengerInput.value){
    alert('Please enter your name');
  } else {
    enterMessenger.classList.add('entered');
    messengerWrapper.classList.add('entered');
    initMessenger(enterMessengerInput.value);
  }
});

function initMessenger(newUserName){
  console.log(newUserName);
  const webSocketClient = new WebSocket('ws://localhost:8080');
  webSocketClient.addEventListener('open', () => {
    const newUserData = { type: 'newUser', data: newUserName };
    webSocketClient.send(JSON.stringify(newUserData));
  });
  webSocketClient.addEventListener('message', e => {
    const message = JSON.parse(e.data);
    if(message.type === 'newUser'){
      appendUser(message.data);
    }
    if(message.type === 'activeUsers'){
      appendAllUsers(message.data);
    }
    if(message.type === 'chatMessage'){
      appendMessage(message.data, message.id, webSocketClient);
    }
    console.log(message);
  });

  messengerFrom.addEventListener('submit', e => {
    e.preventDefault();
    const messageData = { type: 'chatMessage', data: messengerInput.value};
    webSocketClient.send(JSON.stringify(messageData));
    messengerInput.value = '';
  });
}

function appendUser(userName){
  const userParagraph = document.createElement('p');
  userParagraph.innerText = userName;
  onlineUsers.appendChild(userParagraph);
}

function appendAllUsers(users) {
  onlineUsers.innerHTML = '';
  users.forEach(user => {
    appendUser(user.data);
  });
}

function appendMessage(message, id, webSocketClient) {
  const messageLikes = document.createElement('span');
  const div = document.createElement('div');
  div.innerHTML = message;
  div.setAttribute('data-id', id);
  div.appendChild(messageLikes);
  messagesContainer.appendChild(div);
}