import winston, { createLogger, format, transports } from "winston";
import "winston-mongodb";
import morgan from "mongoose-morgan";

let loggingLevel = "info";

if (process.env.NODE_ENV !== "production") {
    loggingLevel = "debug"
}

// Logging setup
const morganLogger = await morgan({
    collection: "httpLogs",
    connectionString: process.env.DB_CONNECTION_STRING,
    dbName: process.env.DB_NAME,
    useNewUrlParser: true
},
    {},
    'dev'
);

const winstonLogger = createLogger({
    level: loggingLevel,
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
winstonLogger.add(new winston.transports.MongoDB({
    collection: "activityLogs",
    db: process.env.DB_CONNECTION_STRING,
    dbName: process.env.DB_NAME,
    options: {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
}));

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
    winstonLogger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

export { winstonLogger, morganLogger }