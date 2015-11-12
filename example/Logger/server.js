'use strict';
const Arrow = require('../..');
const express = require('express');

const application = new Arrow();
application.use(express.static(__dirname + '/public/themes/freelancer'));
application.start();