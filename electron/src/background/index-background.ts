// tslint:disable-next-line:no-require-imports
// tslint:disable-next-line:no-var-requires
const { ipcRenderer } = require('electron');
const processFile = require('impilib').processFile;
const log = require('electron-log');

window.onload = function () {
	ipcRenderer.on('background-start', (event: any, payload: any) => {

		console.log('background-start');
		processFile(payload, (result: any) => {
			// Error object isnt JSON serializable so..
			if (result.Error) {
				result.Error = { message: result.Error.message };
			}
			ipcRenderer.send('background-response', result);
		}, (processedRow: number, maxRows: number) => {
			ipcRenderer.send('background-response-row', {
				processedRow: processedRow,
				maxRows: maxRows
			});
		});

	});
};