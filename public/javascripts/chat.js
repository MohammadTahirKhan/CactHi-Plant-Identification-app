const socket = io();
const currentRoom = window.location.href.split("/").pop();
var currentUser;
const seperate_chats = "||";
const seperate_names = "|";

socket.on("joined", function (room, user) {
    if (user !== currentUser) {
        const history = document.getElementById("history");
        const newMessage = document.createElement("p");

        newMessage.innerHTML = `${user} joined the chat`;
        newMessage.className = "system-message";
        history.appendChild(newMessage);
    }
});

socket.on("chat", function (room, user, message) {
    writeOnHistory(user, message);
});

/**
 * Connects a user to the chat room, displaying the chat history if it exists
 * @param {string} history - The chat history to be displayed
 */
function connectToRoom(history) {
    getCurrentUser().then((username) => {
        currentUser = username;
        socket.emit("create or join", currentRoom, currentUser);

        if (history) {
            const messages = history.split(seperate_chats);
            messages.forEach((message) => {
                const [user, text] = message.split(seperate_names);
                if (user && text) {
                    writeOnHistory(user, text);
                }
            });
        }
    });
}

/**
 * Emits a chat message to the server
 */
function sendChatText() {
    const message = document.getElementById("chat_input").value;
    if (!message) return;
    socket.emit("chat", currentRoom, currentUser, message);
}

/**
 *  Writes a message to the chat history
 * @param {string} user - name of the user who sent the message
 * @param {string} message  - message sent by the user
 */
function writeOnHistory(user, message) {
    const history = document.getElementById("history");
    const newMessage = document.createElement("p");

    const historyInput = document.getElementById("historyChat");
    historyInput.value += `${user}${seperate_names}${message}${seperate_chats}`;

    if (user === currentUser) {
        newMessage.className = "current-user-message";
        newMessage.innerHTML = `${message}`;
    } else {
        newMessage.innerHTML = `<strong>${user}</strong>: ${message}`;
    }

    history.appendChild(newMessage);
    document.getElementById("chat_input").value = "";
}
