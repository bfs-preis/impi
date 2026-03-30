const { ipcRenderer } = require('electron');
const { createRequire } = require('module');
const path = require('path');

// Create a require function that can resolve from the app's node_modules
const appRequire = createRequire(path.join(__dirname, '..', 'package.json'));

window.onload = function () {
	// Dynamic import for ESM module
	import(appRequire.resolve('impilib')).then((impilib) => {
		const processFile = impilib.processFile;
		console.log('background ready, processFile:', typeof processFile);

		ipcRenderer.on('background-start', (event, payload) => {
			console.log('background-start received');
			processFile(payload, (result) => {
				if (result.Error) {
					result.Error = { message: result.Error.message };
				}
				ipcRenderer.send('background-response', result);
			}, (processedRow, maxRows) => {
				ipcRenderer.send('background-response-row', {
					processedRow: processedRow,
					maxRows: maxRows
				});
			});
		});
	}).catch(err => {
		console.error('Failed to load impilib:', err);
	});
};
