'use strict';

let express = require('express');
let router = express.Router();
let upload = require('./controllers/index');

router.route('/uploads/dirtree').post(upload.dirtree);
router.route('/uploads/createdir').post(upload.createdir);
router.route('/uploads/deletedir').post(upload.deletedir);
router.route('/uploads/movedir').post(upload.movedir);
router.route('/uploads/copydir').post(upload.copydir);
router.route('/uploads/renamedir').post(upload.renamedir);
router.route('/uploads/fileslist').post(upload.fileslist);
router.route('/uploads/upload').post(upload.upload);
router.route('/uploads/download').post(upload.download);
router.route('/uploads/downloaddir').post(upload.downloaddir);
router.route('/uploads/deletefile').post(upload.deletefile);
router.route('/uploads/movefile').post(upload.movefile);
router.route('/uploads/copyfile').post(upload.copyfile);
router.route('/uploads/renamefile').post(upload.renamefile);
router.route('/uploads/thumb').get(upload.thumb);

module.exports = router;
