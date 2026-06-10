import { processFile, ILogResult } from 'impilib';

try {
    console.log('[background-process] started');

    process.parentPort!.on('message', (messageEvent: Electron.MessageEvent) => {
        const options = messageEvent.data;
        console.log('[background-process] received options, starting processFile');

        processFile(options,
            (result: ILogResult) => {
                console.log('[background-process] processFile complete, error:', !!result.Error);
                if (result.Error) {
                    result.Error = { message: result.Error.message } as any;
                }
                process.parentPort!.postMessage({ type: 'result', payload: result });
            },
            (processedRow: number, maxRows: number) => {
                process.parentPort!.postMessage({ type: 'progress', payload: { processedRow, maxRows } });
            }
        );
    });
} catch (err: any) {
    console.error('[background-process] fatal error:', err.message, err.stack);
    process.exit(1);
}
