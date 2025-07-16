/**
 * Unwraps { success, value, error, stack } coming back from ipcRenderer.invoke().
 * – Keeps any real Error sent from the main process (message + stack).
 * – Adds the channel name to the message so you know which call failed.
 * – Throws a clear error if the renderer didn’t get a Promise at all.
 */
export async function unwrap(promise) {
    // Make sure we really got a Promise / then‑able
    if (!promise || typeof promise.then !== 'function') {
        throw new Error(
            'IPC function did not return a Promise – check preload exposure and ipcMain.handle().'
        );
    }

    const resp = await promise; // { success, value, error?, stack? }

    if (resp && resp.success) {
        return resp.value;
    }

    // Build an Error, keeping any details sent from main
    const message = resp && resp.error ? resp.error : 'Unknown IPC error';
    const err = new Error(message);

    if (resp && resp.stack && (!err.stack || !err.stack.includes(resp.stack))) {
        err.stack = `${err.stack}\n— remote stack —\n${resp.stack}`;
    }

    // Strip this helper from the trace
    if (Error.captureStackTrace) Error.captureStackTrace(err, unwrap);

    throw err;
}