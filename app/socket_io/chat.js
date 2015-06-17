"use strict";


var cookieParser = require('cookie-parser');
var Promise = require('bluebird');
var needle = require('needle');
Promise.promisifyAll(needle);


module.exports = function (socket_manager, socket) {

    var io = socket_manager.io;

    if (socket_manager.userID === undefined) {
        socket_manager.userID = 1;
    }

    if (socket_manager.admin === undefined) {
        socket_manager.admin = {};
    }

    if (socket_manager.numberNotify === undefined){
        socket_manager.numberNotify = 0;
    }

    if (socket_manager.currentChatID === undefined) {
        socket_manager.currentChatID = "";
    }

    if (socket_manager.users === undefined) {
        socket_manager.users = {};
    }

    if (socket_manager.chatLog === undefined) {
        socket_manager.chatLog = {};
    }

    let sessionID = getSessionID(socket)._settledValue;

    socket.on('message', function(message){

        message = JSON.parse(message);
        message.message = stripHTML(message.message.trim()).replace(/\r?\n/g, '<br />');

        if (socket_manager.admin['state'] && message.message != "")  {
            if (message.type == "userMessage" && socket_manager.users[sessionID]) {
                message.username = socket_manager.users[sessionID]['name'];
                socket_manager.chatLog[sessionID].push(message);
                io.to(socket.id).emit('message',JSON.stringify(message));

                if (socket_manager.currentChatID == sessionID ) {

                    Promise.map(socket_manager.admin['socketID'],function(id){
                        io.to(id).emit('message',JSON.stringify(message));
                    })
                    AdminNotification(1);

                } else {
                    socket_manager.users[sessionID]['numberMessage']++;
                    socket_manager.users[sessionID]['showNotify'] = 'initial';
                    AdminNotification(1);
                }

            } else if (message.type == "adminMessage"){
                message.username = socket_manager.admin['name'];
                io.to(socket.id).emit('message',JSON.stringify(message));
                if (socket_manager.currentChatID && socket_manager.chatLog[socket_manager.currentChatID]) {
                    socket_manager.chatLog[socket_manager.currentChatID].push(message);

                    Promise.map(socket_manager.users[socket_manager.currentChatID]['socketID'],function(id){
                        io.to(id).emit('message', JSON.stringify(message));
                    })
                }
            }
        } else if (message.message != "") {
            if (message.type == "userMessage" && socket_manager.users[sessionID]) {
                message.username = socket_manager.users[sessionID]['name'];
                socket_manager.chatLog[sessionID].push(message);

                Promise.map(socket_manager.users[sessionID]['socketID'],function(id){
                    io.to(id).emit('message', JSON.stringify(message));
                })

            }
        }
    });

    socket.on('disconnect', function(){
        if (socket_manager.admin['state']) {

            if(socket_manager.admin['socketID'].indexOf(socket.id) != -1) {
                var removeID = socket_manager.admin['socketID'].indexOf(socket.id);

                socket_manager.admin['socketID'].splice(removeID, 1);

                if (socket_manager.admin['socketID'].length === 0) {
                    socket_manager.admin = {};
                }
            } else {
                if(socket_manager.users[sessionID]) {

                    if (socket_manager.chatLog[sessionID].length === 0 ) {
                        delete  socket_manager.users[sessionID];
                        delete  socket_manager.chatLog[sessionID];
                        AdminNotification();
                    } else if (socket_manager.users[sessionID]['socketID']) {
                        var removeID = socket_manager.users[sessionID]['socketID'].indexOf(socket.id);

                        if(removeID != -1) {
                            socket_manager.users[sessionID]['socketID'].splice(removeID, 1);
                        }

                        if (socket_manager.users[sessionID]['socketID'].length == 0 ){
                            socket_manager.users[sessionID]['userState'] = 'red';
                            if (socket_manager.admin['state']) {
                                AdminNotification();
                            }
                        }
                    }
                }
            }
        }

    })

    // Admin emit
    socket.on('checkAdminSession',function(){
        io.to(socket.id).emit('readySupport');
        makeAdmin(socket);
        AdminNotification();
    })

    socket.on("resetNumber",function(){
        socket_manager.numberNotify = 0;
    })


    socket.on("changeUser", function(data){
        socket_manager.currentChatID = data.userID;
        if (socket_manager.users[socket_manager.currentChatID]){
            socket_manager.users[socket_manager.currentChatID]['numberMessage'] = 0;
            socket_manager.users[socket_manager.currentChatID]['showNotify'] = 'none';
            socket_manager.users[socket_manager.currentChatID]['messageRead'] = true;
        }

        AdminNotification();

        Promise.map(socket_manager.admin['socketID'],function(id){
            io.to(id).emit('getInfoUser',JSON.stringify(socket_manager.users[socket_manager.currentChatID]));
            io.to(id).emit("getLogChatByUser",JSON.stringify(socket_manager.chatLog[socket_manager.currentChatID]));
        })
    });

    socket.on("deleteUserLog",function(data){
        if (socket_manager.currentChatID) {
            delete  socket_manager.users[socket_manager.currentChatID];
            delete  socket_manager.chatLog[socket_manager.currentChatID];
            AdminNotification();
            socket_manager.currentChatID = "";
        }
    })


    // User emit
    socket.on("checkSession",function(){
        if (socket_manager.users[sessionID]) {

            if (socket_manager.users[sessionID]['socketID'].indexOf(socket.id) === -1) {
                socket_manager.users[sessionID]['socketID'].push(socket.id);
            }

            socket_manager.users[sessionID]['userState'] = 'green';

            if(socket_manager.admin['state']) {
                AdminNotification();
                Promise.map(socket_manager.users[sessionID]['socketID'],function(id){
                    io.to(id).emit('clearForm');
                })
            }

        }
        if (!socket_manager.admin['state']) {
            io.to(socket.id).emit('adminNotify',{message: 'Hiện tôi đang không online'});
        } else {
            socket.emit('readyChat',{id : socket.id});

            startChat(socket);

            var welcomeMessage = 'Xin chào tôi có thể giúp gì cho bạn';
            io.to(socket.id).emit('message',JSON.stringify({ type: 'systemMessage', message: welcomeMessage}));

            AdminNotification(1);
        }
    })


    function AdminNotification(param){
        socket_manager.numberNotify++;
        let data = {};
        data.number = socket_manager.numberNotify;
        let userData = socket_manager.users;
        let returnData = {}
        for (var key in userData){
            if (socket_manager.chatLog[key].length !== 0) {
                returnData[key] = {};
                returnData[key] = userData[key];
            }
        }
        Promise.map(socket_manager.admin['socketID'],function(id){
            io.to(id).emit('listUser',JSON.stringify(returnData));
            if(param){
                io.to(id).emit('notifyAdmin',JSON.stringify(data));
            }
        })
    }

    function startChat(socket) {
        //sessionID = getSessionID(socket);
        if (socket_manager.users[sessionID]) {
            if (socket_manager.users[sessionID]['socketID'].indexOf(socket.id) === -1) {
                socket_manager.users[sessionID]['socketID'].push(socket.id);
            }

            Promise.map(socket_manager.users[sessionID]['socketID'],function(id){
                io.to(id).emit("getLogChatByUser",JSON.stringify(socket_manager.chatLog[sessionID]));
            })

        } else {
            makeNewUser(socket)
        }

    }

    function getSessionID(socket){

        let handshake = socket.request;
        let parseCookie = cookieParser();
        return new Promise(function(fulfill,reject){

            parseCookie(handshake, null, function (err, cookies) {
                let id = handshake.cookies.sid;
                fulfill(id);
            })
        } );
    }

    function getRegion(ip) {
        needle.getAsync('http://www.geoplugin.net/json.gp?ip=' + ip).then(function (data) {
            let regionData = JSON.parse(data[0].body);
            regionData = regionData['geoplugin_city'];
            socket_manager.users[sessionID]['region'] = regionData;
        })
    }
    function filterIP(ip){
        let ipString = ip;
        return new Promise(function(fulfill,reject){
            fulfill(ipString);
        })
    }

    function makeAdmin(socket){
        socket_manager.admin['sessionAdmin'] = sessionID;
        socket_manager.admin['name'] = "Admin";
        socket_manager.admin['state'] = "Online";
        socket_manager.admin['socketID'] = [];
        socket_manager.admin['socketID'].push(socket.id);
    }


    function makeNewUser(socket){
        let ips = socket.request.headers['x-real-ip'];
        getRegion(ips);
        socket_manager.users[sessionID] = {};
        socket_manager.users[sessionID]['name'] = "client " + socket_manager.userID;
        socket_manager.users[sessionID]['link'] = socket.request.headers['referer'];
        socket_manager.users[sessionID]['ip'] = filterIP(ips)._settledValue;
        socket_manager.users[sessionID]['socketID'] = [];
        socket_manager.users[sessionID]['socketID'].push(socket.id);
        socket_manager.users[sessionID]['numberMessage'] = 0;
        socket_manager.users[sessionID]['userState'] = 'green';
        socket_manager.users[sessionID]['messageRead'] = false;
        socket_manager.users[sessionID]['showNotify'] = 'none';
        socket_manager.chatLog[sessionID] = [];
        socket_manager.userID++;
    }

    function stripHTML(text){
        var regex = /(<([^>]+)>)/ig;
        return text.replace(regex, "");
    }


}
