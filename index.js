const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server);
let users = {}; 
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
io.on('connection', socket => {
    socket.on('joinGroup', (username, groupName) => {
        if (users[username] && users[username] !== groupName) {
            const previousGroup = users[username];
            socket.leave(previousGroup); 
            io.to(previousGroup).emit('updateUsers', Object.keys(users).filter(user => users[user] === previousGroup));
        }
        socket.join(groupName);
        socket.username = username;
        socket.groupName = groupName;
        users[username] = groupName;
        io.to(groupName).emit('updateUsers', Object.keys(users).filter(user => users[user] === groupName));
        socket.emit('groupMessage', { user: "Server", message: `Welcome ${username} to Group: ${groupName}` });
    });
    socket.on('groupMessage', msg => {
        if (users[msg.user] === socket.groupName) {
            socket.to(socket.groupName).emit('groupMessage', msg);
        }
    });
    socket.on('uploadImage', (data, username) => {
        if (users[username] === socket.groupName) {
            socket.to(socket.groupName).emit('publishImage', data, username); 
        }
    });
    socket.on('uploadFile', (data, username, fileName) => {
        if (users[username] === socket.groupName) {
            socket.to(socket.groupName).emit('publishFile', data, username, fileName); 
        }
    });
    socket.on('disconnect', () => {
        delete users[socket.username];
        io.to(socket.groupName).emit('updateUsers', Object.keys(users).filter(user => users[user] === socket.groupName));
    });
});

server.listen(30, () => console.log("Server running at http://localhost:30"));
