let name = null;
let roomNo = null;
let socket = io();

const seperate_chats = "||";
const seperate_names = "|";

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('chat_interface').style.display = 'none';

    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hidePlantList(room, userId);
        } else {
            // notifies that someone has joined the room
            writeOnHistory('<b>'+userId+'</b>' + ' joined room ' + room);
        }
    });
    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });

}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    let roomNo = document.getElementById('roomNo').value;
    let chatHistory = document.getElementById('historyChat')
    chatHistory.value = roomNo + "$$" + chatHistory.value + '||' + name +'|' +chatText;
    socket.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom(roomNo, history) {
    document.getElementById('roomNo').value = roomNo;
    name = document.getElementById('name').value;

    if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', roomNo, name);

    let historyElement = document.getElementById('history');
    let paragraph = document.createElement('p');
    const split_text = history.split(seperate_chats);

    for (let i = 0; i < split_text.length; i++) {
        let name = split_text[i].split(seperate_names)[0]
        let chat = split_text[i].split(seperate_names)[1]
        writeOnHistory('<b>' + name + ':</b> ' + chat);

    }

    let chatHistory = document.getElementById('historyChat')
    chatHistory.value = history;

    console.log(split_text);
    console.log("X");

}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnHistory(text) {
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    roomNo = document.getElementById('roomNo').value;

    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';

    console.log(roomNo,'chat',history);

}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hidePlantList(room, userId) {
    document.getElementById('name').style.display = 'none';
    document.getElementById('nameLabel').style.display = 'none';
    document.getElementById('plant_list').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
    document.getElementById('BackButton').style.display = 'block';
    document.getElementById('BackButton').style.display = 'block;'
}



