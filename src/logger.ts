type LogLevel = 1 | 2 | 3;
let logLevel: LogLevel = 1;
let logFunction = console.log;

export function setLogFunction(func: (str: string) => unknown) {
  logFunction = func;
}

export function log(message: string, level = 1) {
  if (level >= logLevel) {
    logFunction(message);
  }
}

export function setLogLevel(level: LogLevel) {
  logLevel = level;
}

export function logError(context: string, error: unknown, level: LogLevel = 3) {
  log(`Error ${context}: ${getErrorMessage(error)}`, level);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
