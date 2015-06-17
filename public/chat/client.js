$(function(){
    $('#header-bar').click(function(){
        if ($('#chat-form').css('display') == 'none') {
            $('#chat-form').show();
            socket.emit('checkSession');
        } else {
            $('#chat-form').hide();
        }
    });
})

var socket = io.connect("http://" + window.location.hostname+":3334");
//var socket = io.connect("http://192.168.1.22:3334/");
//var socket = io.connect(":3333/");
//var socket = io();
var myID;

socket.on('clearForm',function(){
    "use strict";
    $('#message-form').show();
    $('#input-form').show();
})


socket.on('adminNotify',function(data){
    $('#AdminNotify').empty() ;
    $('#AdminNotify').append(data.message) ;

})


socket.on('readyChat', function(data) {
    $('#message-form li').remove();
    $('#name-form').hide();
    $('#message-form').show();
    $('#input-form').show();
    myID = data.id;
});

$(function () {
    $('#userMessage').on('keydown', function(key){

        if (key.which == 13 && key.shiftKey) {
            //$('#userMessage').val($('#userMessage').val() + "<br/>");
        } else if (key.which == 13) {
            key.preventDefault();
            sendMessage();
        }
    })

});

socket.on('message', function(data) {
    data = JSON.parse(data);
    if (data.username) {
        if (data.type === "adminMessage") {
            $('#message-form').append(
                "<li class='"+ data.type + "'><div class='messages-admin'>\
                <p>" + data.message + "</p></div></li>"
            );
        } else {
            $('#message-form').append(
                "<li class='"+ data.type + "'><div class='avatar-icon'><img src='/chat/img/boy.png'></div><div class='messages'>\
                <p>" + data.message + "</p></div></li>"
            );
        }
    } else {
        $('#message-form').append(
            "<li class='"+ data.type + "'><div class='messages-admin'>\
                <p>" + data.message + "</p></div></li>"
        );
    }
    var element = document.getElementById("message-form");
    element.scrollTop = element.scrollHeight;
});

function stripHTML(text){
    var regex = /(<([^>]+)>)/ig;
    return text.replace(regex, "");
}

var sendMessage = function() {
    var data = {
        message:stripHTML($('#userMessage').val()),
        type:'userMessage',
        id: myID
    };
    socket.send(JSON.stringify(data));
    $('#userMessage').val('');
}

socket.on('getLogChatByUser',function(data){
    data = JSON.parse(data);
    for (key in data) {
        if (data[key].username) {
            if (data[key].type === "adminMessage") {
                $('#message-form').append(
                    "<li class='"+ data[key].type + "'><div class='messages-admin'>\
                <p>" + data[key].message + "</p></div></li>"
                );
            } else {
                $('#message-form').append(
                    "<li class='"+ data[key].type + "'><div class='avatar-icon'><img  src='/chat/img/boy.png'></div><div class='messages'>\
                <p>" + data[key].message + "</p></div></li>"
                );
            }
        } else {
            $('#message-form').append(
                "<li class='"+ data[key].type + "'><div class='messages-admin'>\
                <p>" + data[key].message + "</p></div></li>"
            );
        }
    }
    var element = document.getElementById("message-form");
    element.scrollTop = element.scrollHeight;
})
