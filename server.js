const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname,'public') ));
const botName = 'Chat-n-Chat';

//Run when client connects
io.on('connection', socket =>{

    //Catch room and username
    socket.on('joinroom',({username,room})=>{
        
        const user = userJoin(socket.id,username,room);

        socket.join(user.room)

        //User display
        socket.emit('message', formatMessage(botName,'Welcome to Chat-n-Chat'));

        //Broadcast
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,user.username+" has joined the chat!"));

        //Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    //Listen for chat message
    socket.on('chatMessages',(msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    
    })

    //Disconnect
    
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,user.username+" has left the chat!"));
        
        
        //Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });

    }
    });


})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log('Server running on port '+PORT));