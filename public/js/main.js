const messageInput = document.getElementById("message-input");
const chatbox = document.querySelector(".chatbox");
const userList = document.querySelector("#users");

// get information from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const roomMap = new Map();
roomMap.set("Gaming", "🎮Gaming");
roomMap.set("Cars", "🚗Vroom Vroom");
roomMap.set("Chitchat", "💩Talking");

document.getElementById("room-name").innerHTML = roomMap.get(room);

// Allow leaveRoom function to be triggered on window unload event;
window.onbeforeunload = () => {
    leaveRoom();
}


const socket = io();

socket.emit("userJoined", {username, room});


// Receiveing messages from server
socket.on("message", message => {
    switch (message.messageType) {
        case "WELCOME":
            welcome(message);
            break;
        case "ANNOUNCEMENT":
            announcement(message);
            break;
        case "CHAT":
            appendMessage(message);
            break;
    }
    
    if (message.users) {
        updateUserList(message.users);
    }
    // Scroll the chatbox to the bottom
    chatbox.scrollTop = chatbox.scrollHeight;
});

// sending message
messageInput.addEventListener('submit', (e) => {
    e.preventDefault();

    // get message to be sent
    const msg = e.target.elements.msg.value;

    // emit the message to server
    socket.emit("chatMsg", {
        messageType: "CHAT",
        name: username,
        content: msg});

    // Empty input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

function welcome(message) {
    const newMessage = document.createElement("div");
    newMessage.classList.add("message");
    newMessage.innerHTML = `
    <p class="meta">${message.content}</p>
    `;

    chatbox.appendChild(newMessage);
}

function announcement(message) {
    const newMessage = document.createElement("div");
    newMessage.classList.add("message");
    newMessage.innerHTML = `
    <p class="meta">${message.content} <span>${message.time}</span></p>
    `;

    chatbox.appendChild(newMessage);
}

function appendMessage(message) {
    const newMessage = document.createElement("div");
    newMessage.classList.add("message");
    newMessage.innerHTML = `
    <p class="meta">${message.name} <span>${message.time}</span></p>
    <p class="text">${message.content}</p>
    `;

    chatbox.appendChild(newMessage);
}

function leaveRoom() {
    socket.emit("userLeft");
}

function updateUserList(users) {
    userList.innerHTML = "";
    users.forEach(user => {
        userList.innerHTML += `<li>${user.username}</li>`;
    });
}