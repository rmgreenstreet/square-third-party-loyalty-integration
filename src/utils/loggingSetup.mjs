import winston, { createLogger, format, transports } from "winston";
import "winston-mongodb";
import morgan from "mongoose-morgan";

// Logging setup
const morganLogger = await morgan({
    collection: "httpLogs",
    connectionString: process.env.DB_CONNECTION_STRING,
    dbName: process.env.DB_NAME
},
    {},
    'dev'
);

const winstonLogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'Square Third Party Loyalty Integration' }
});

console.log("attempting connect to mongodb with winston");
logger.add(new winston.transports.MongoDB({
    collection: "activityLogs",
    db: process.env.DB_CONNECTION_STRING,
    dbName: process.env.DB_NAME,
    options: {
        useUnifiedTopology: true
    }
}));

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

export { winstonLogger, morganLogger }