const winston = require('winston');
// logger is defined using the winston.createLogger() function. 
// This creates a new logger instance that can be used to log messages at different levels.
const logger = winston.createLogger({
    level: 'info',
    // The format option specifies how log messages should be formatted.
    // the combine() function is used to combine two formatters: timestamp() and json(). 
    format: winston.format.combine(
        // timestamp() formatter adds a timestamp to each log message
        winston.format.timestamp(),
        // json() formatter formats the log message as a JSON object.
        winston.format.json()
    ),
    defaultMeta: { service: 'cabBookingPOC' },
    // defined transports -> used to define how log messages are handled by the logger.
    // In this case I have two transports i.e. console and file.
    transports: [
        // console transport logs messages to the console.
        // It is created using the new winston.transports.Console() constructor.
        new winston.transports.Console(),
        // file transport logs messages to a file. 
        // It is created using the new winston.transports.File() constructor.
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

module.exports = logger;
