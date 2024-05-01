const socket = io();
const currentRoom = window.location.href.split("/").pop();
const currentUser = "needs changing"
const seperate_chats = "||";
const seperate_names = "|";


socket.on('joined', function(room, user) {
    if (user !== currentUser) {
        const history = document.getElementById('history');
        const newMessage = document.createElement('p');

        newMessage.innerHTML = `${user} joined the chat`;
        newMessage.className = "system-message";
        history.appendChild(newMessage);
    }
});

socket.on('chat', function(room, user, message) {
    writeOnHistory(user, message);
});


function connectToRoom(history) {
    socket.emit('create or join', currentRoom, currentUser);

    if (history) {
        const messages = history.split(seperate_chats);
        messages.forEach(message => {
            const [user, text] = message.split(seperate_names);
            if (user && text) {
                writeOnHistory(user, text);
            }
        });
    }
}


function sendChatText() {
    const message = document.getElementById('chat_input').value;
    if (!message) return;
    socket.emit('chat', currentRoom, currentUser, message);
}


function writeOnHistory(user, message) {
    const history = document.getElementById('history');
    const newMessage = document.createElement('p');

    const historyInput = document.getElementById('historyChat');
    historyInput.value += `${user}${seperate_names}${message}${seperate_chats}`;

    if (user === currentUser) {
        user = "Me";
        newMessage.className = "current-user-message";
    }

    newMessage.innerHTML = `<b>${user}</b>: ${message}`;
    history.appendChild(newMessage);
    document.getElementById('chat_input').value = '';
}
