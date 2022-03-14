const moment = require("moment");
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { userJoined, getCurrentUser, userLeft, getUsersOfRoom } = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const roomMap = new Map();
roomMap.set("Gaming", "🎮Gaming");
roomMap.set("Cars", "🚗Vroom Vroom");
roomMap.set("Chitchat", "💩Talking");

// Set static folder
app.use(express.static(path.join(__dirname, "./public")));

// Run when client connects
io.on("connection", socket => {
    socket.on("userJoined", ({username, room}) => {
        const user = userJoined(socket.id, username, room)

        socket.join(user.room);
        // Welcome user entered
        socket.emit("message", {
            messageType: "WELCOME",
            content: `Welcome to ${roomMap.get(room)} of Chit Chats!`,
            users: getUsersOfRoom(user.room)});

            
        // announce new user joined
        socket.broadcast.to(user.room).emit("message", {
            messageType: "ANNOUNCEMENT",
            time: moment().format("hh:mm a"),
            content: `${user.username} has joined the chat.`,
            users: getUsersOfRoom(user.room)});
    })

    // announce user left
    socket.on("userLeft", () => {
        const user = userLeft(socket.id);
        if (user) {
            socket.broadcast.to(user.room).emit("message", {
                messageType: "ANNOUNCEMENT",
                time: moment().format("hh:mm a"),
                content: `${user.username} has left the chat.`,
                users: getUsersOfRoom(user.room) });
        }
    })

    // listen for new chat messages
    socket.on("chatMsg", (msg) => {
        const user = getCurrentUser(socket.id);
        msg.time = moment().format("hh:mm a");
        io.to(user.room).emit('message', msg)
    })
})



const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
