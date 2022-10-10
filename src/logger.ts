let logLevel = 1;
let logFunction = console.log;

export function setLogFunction(func: (str: string) => unknown) {
	logFunction = func;
}

export function log(message: string, level: number = 1) {
	if (level >= logLevel) {
		logFunction(message);
	}
}

export function setLogLevel(level: 1 | 2 | 3) {
	logLevel = level;
}
