let logLevel = 1;

export function log(message: string, level: number = 1) {
	if (level >= logLevel) {
		console.log(message);
	}
}

export function setLogLevel(level: 1 | 2 | 3) {
	logLevel = level;
}
