let userName, 
    groupName, 
    socket = io(), 
    input = $("input[name='txt-msg']"), 
    messageBody = $(".message-body"), 
    userList = $(".user");
socket.on('connect', () => {
    while (!userName) {
        userName = prompt("Enter your Name:");
    }
    while (!groupName) {
        groupName = prompt("Enter your Group Name:");
    }
    socket.emit('joinGroup', userName, groupName);
});
input.on('keyup', (e) => { 
    if (e.key === 'Enter') sendMessage(e.target.value.trim());
});

function sendMessage(message) {
    if (!message) return;
    let msg = { user: userName, message };
    appendMessage(msg, 'outgoing');
    socket.emit('groupMessage', msg);
    input.val('');
}
function appendMessage({ user, message }, type) {
    let userLabel = type === 'incoming' ? `<h4>${user}</h4>` : '';
    messageBody.append(`<div class="message ${type}">${userLabel}<p>${message}</p></div>`);
    messageBody.scrollTop(messageBody[0].scrollHeight);
}
$('#imageInput').on('change', function (e) {
    var reader = new FileReader();
    var file = e.target.files[0];
    
    if(file.type.startsWith('image/')) {
        reader.onload = evt => {
            socket.emit('uploadImage', evt.target.result, userName); 
            appendImage(evt.target.result, 'outgoing'); 
        };
    } else {
        reader.onload = evt => {
            socket.emit('uploadFile', evt.target.result, userName, file.name); 
            appendFile(file.name, evt.target.result, 'outgoing'); 
        };
    }
    reader.readAsDataURL(file);
    $('#imageInput').val('');
});
function appendImage(data, type, user = userName) {
    let userLabel = type === 'incoming' ? `<h4>${user}</h4>` : ''; 
    messageBody.append(`<div class="message ${type}">${userLabel}<img src="${data}" class="uploadedImage"/></div>`);
    messageBody.scrollTop(messageBody[0].scrollHeight);
}
function appendFile(fileName, data, type, user = userName) {
    let userLabel = type === 'incoming' ? `<h4>${user}</h4>` : ''; 
    messageBody.append(`<div class="message ${type}">${userLabel}<a href="${data}" download="${fileName}">${fileName}</a></div>`);
    messageBody.scrollTop(messageBody[0].scrollHeight);
}
socket.on('publishImage', (data, user) => appendImage(data, 'incoming', user));
socket.on('publishFile', (data, user, fileName) => appendFile(fileName, data, 'incoming', user));
socket.on('groupMessage', (msg) => appendMessage(msg, 'incoming'));
socket.on('updateUsers', (users) => {
    userList.empty();
    $('.group').text(groupName);
    users.forEach(user => userList.append(`<span><img src="image/user.png"> <sub>${user}</sub></span>`));
});
function sendClick() {
    sendMessage(input.val());
}
