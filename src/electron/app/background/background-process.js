import { processFile } from 'impilib';
try {
    console.log('[background-process] started');
    process.parentPort.on('message', (messageEvent) => {
        const options = messageEvent.data;
        console.log('[background-process] received options, starting processFile');
        processFile(options, (result) => {
            console.log('[background-process] processFile complete, error:', !!result.Error);
            if (result.Error) {
                result.Error = { message: result.Error.message };
            }
            process.parentPort.postMessage({ type: 'result', payload: result });
        }, (processedRow, maxRows) => {
            process.parentPort.postMessage({ type: 'progress', payload: { processedRow, maxRows } });
        });
    });
}
catch (err) {
    console.error('[background-process] fatal error:', err.message, err.stack);
    process.exit(1);
}
