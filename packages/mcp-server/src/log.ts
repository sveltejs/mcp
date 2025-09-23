import { dev } from '$app/environment';
// eslint-disable-next-line @typescript-eslint/naming-convention, func-style
export const log = (...props: unknown[]) => {
	if (dev) {
		console.log(...props);
	}
};

// eslint-disable-next-line @typescript-eslint/naming-convention, func-style
export const logWarning = (...props: unknown[]) => {
	if (dev) {
		console.warn(...props);
	}
};
// eslint-disable-next-line @typescript-eslint/naming-convention, func-style
export const logError = (...props: unknown[]) => {
	if (dev) {
		console.error(...props);
	}
};
// eslint-disable-next-line @typescript-eslint/naming-convention, func-style
export const logAlways = (...props: unknown[]) => {
	console.log(...props);
};
// eslint-disable-next-line @typescript-eslint/naming-convention, func-style
export const logWarningAlways = (...props: unknown[]) => {
	console.warn(...props);
};
// eslint-disable-next-line @typescript-eslint/naming-convention, func-style
export const logErrorAlways = (...props: unknown[]) => {
	console.error(...props);
};
