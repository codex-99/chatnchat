const chatForm=document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const activeUsers = document.getElementById('users');
const roomName = document.getElementById('room-name');
const socket = io();

//Get username and room form URL
const {username,room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

//Join chatroom
socket.emit('joinroom',{username,room});

// get room and users info
socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputUser(users);
})

socket.on('message',message=>{
    console.log(message);
    outputMessage(message);

    //Scroll down when a new message arrives
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    //Catching message
    const message=e.target.elements.msg.value;

    //send message to server
    socket.emit('chatMessages',message);

    //clear message input
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

//Output Message to DOM

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = "<p class='meta'>"+message.username+"<span>"+message.time+"</span></p><p class='text'>"+message.text+"</p>";

    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to dom

function outputRoomName(room){
    roomName.innerText = room;
}

// Add user to dom
function outputUser(users){
    activeUsers.innerHTML = users.map(user=> "<li>"+user.username+"</li>").join("");
}