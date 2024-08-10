type LogLevel = 1 | 2 | 3;
let logLevel: LogLevel = 1;
let logFunction = console.log;

/** @param func */
export function setLogFunction(func: (str: string) => unknown) {
	logFunction = func;
}

/**
 * @param message
 * @param level
 */
export function log(message: string, level = 1) {
	if (level >= logLevel) {
		logFunction(message);
	}
}

/** @param level */
export function setLogLevel(level: LogLevel) {
	logLevel = level;
}

/**
 * @param context
 * @param error
 * @param level
 */
export function logError(context: string, error: unknown, level: LogLevel = 3) {
	log(`Error ${context}: ${getErrorMessage(error)}`, level);
}

/** @param error */
function getErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}
