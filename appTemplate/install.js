'use strict';
const Arrow = require('arrowjs');
const application = new Arrow();
application
  .start()
  .then(() => {
    process.exit(1)
  });