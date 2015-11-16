> We use Winston logs 

```
 let logger = require('arrowjs').logger;
 logger.info("Hello Arrowjs");
```

#### Log levels
Each level is given a specific integer priority. The higher the priority the more important the message is considered to be, and the lower the corresponding integer priority. For example, npm logging levels are prioritized from 0 to 5 (highest to lowest):

```
 { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
```

#### Log types
```
  logger.log('info', "127.0.0.1 - there's no place like home");
  logger.log('warn', "127.0.0.1 - there's no place like home");
  logger.log('error', "127.0.0.1 - there's no place like home");
  logger.info("127.0.0.1 - there's no place like home");
  logger.warn("127.0.0.1 - there's no place like home");
  logger.error("127.0.0.1 - there's no place like home");
```