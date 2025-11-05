import { ipcRenderer } from 'electron';
import { processFile } from 'impilib';
import log from 'electron-log';

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