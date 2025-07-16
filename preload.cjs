const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('api', {
    openLogFile: () =>
        ipcRenderer.invoke('openLogs'),

    clearDatabase: () =>
        ipcRenderer.invoke('clearDatabase'),

    getOs: () =>
        ipcRenderer.invoke('getOs'),

    getSteamCmdExe: () =>
        ipcRenderer.invoke('getSteamCmdExe'),

    getEnvironment: () =>
        ipcRenderer.invoke('getEnvironment'),

    openLink: (url) =>
        ipcRenderer.invoke('openLink', url),

    openFolderDialog: () =>
        ipcRenderer.invoke('openFolderDialog'),

    createDisabledFolder: (path) =>
        ipcRenderer.invoke('createDisabledFolder', path),

    updateModStatus: (id, status) =>
        ipcRenderer.invoke('updateModStatus', id, status),

    deleteFolderWithModId: (id) =>
        ipcRenderer.invoke('deleteFolderWithModId', id),

    getAllData: () =>
        ipcRenderer.invoke('getAllData'),

    checkFileExists: (filePath) =>
        ipcRenderer.invoke('checkFileExists', filePath),

    setSetting: (key, value) =>
        ipcRenderer.invoke('setSetting', key, value),

    getSetting: (key) =>
        ipcRenderer.invoke('getSetting', key),

    createGameProfile: (name, path, disabledPath, steamId) =>
        ipcRenderer.invoke('createGameProfile', name, path, disabledPath, steamId),

    getGameProfiles: () =>
        ipcRenderer.invoke('getGameProfiles'),

    getGameProfileBySteamId: (steamId) =>
        ipcRenderer.invoke('getGameProfileBySteamId', steamId),

    getGameProfileByUniqueId: (uniqueId) =>
        ipcRenderer.invoke('getGameProfileByUniqueId', uniqueId),

    deleteGameProfileByUniqueId: (uniqueId) =>
        ipcRenderer.invoke('deleteGameProfileByUniqueId', uniqueId),

    updateGameProfile: (id, name, path, steamId) => // Todo: add disabledPath
        ipcRenderer.invoke('updateGameProfile', id, name, path, steamId),

    getModsForProfileByUniqueId: (uniqueId) =>
        ipcRenderer.invoke('getModsForProfileByUniqueId', uniqueId),

    addModToProfile: (name, path, gameProfileId, steam_id, mod_id, author, description, version, img, status, autoUpdate) =>
        ipcRenderer.invoke('addModToProfile', name, path, gameProfileId, steam_id, mod_id, author, description, version, img, status, autoUpdate),

    deleteModByUniqueId: (uniqueId) =>
        ipcRenderer.invoke('deleteModByUniqueId', uniqueId),

    updateModPathByUniqueId: (uniqueId, path) =>
        ipcRenderer.invoke('updateModPathByUniqueId', uniqueId, path),

    updateAutoUpdateModByUniqueId: (uniqueId, AutoUpdate) =>
        ipcRenderer.invoke('updateAutoUpdateModByUniqueId', uniqueId, AutoUpdate),

    updateStatusModByUniqueId: (uniqueId, status) =>
        ipcRenderer.invoke('updateStatusModByUniqueId', uniqueId, status),

    createSteamIdName: (gameName, steamId) =>
        ipcRenderer.invoke('createSteamIdName', gameName, steamId),

    getGameNameBySteamId: (steamId) =>
        ipcRenderer.invoke('getGameNameBySteamId', steamId),

    updateModCompatibilityBySteamId: (steamId, compatibility) =>
        ipcRenderer.invoke('updateModCompatibilityBySteamId', steamId, compatibility),

    deleteProfileByUniqueId: (uniqueId) =>
        ipcRenderer.invoke('deleteProfileByUniqueId', uniqueId),

    openFolder: (path) =>
        ipcRenderer.invoke('openFolder', path),

    anonInstallMod: (modId, gameId, steamCmdPath) =>
        ipcRenderer.invoke('anonInstallMod', modId, gameId, steamCmdPath),

    anonInstallModCustomDirectory: (modId, gameId, steamCmdPath, customDirectory) =>
        ipcRenderer.invoke('anonInstallModCustomDirectory', modId, gameId, steamCmdPath, customDirectory),

    onModProgress: cb =>
        ipcRenderer.on('installModProgress', (_e, progress) => cb(progress)),

    onModResult: cb =>
        ipcRenderer.on('installModResult', (_e, result) => cb(result)),

    installSteamCMD: (path) =>
        ipcRenderer.invoke('installSteamCMD', path),

    moveFolder: (source, destination) =>
        ipcRenderer.invoke('moveFolder', source, destination),

    doesFolderExist: (path) =>
        ipcRenderer.invoke('doesFolderExist', path),

    getUserDataPath: () =>
        ipcRenderer.invoke('getUserDataPath'),

    removeModListener: () => {
        ipcRenderer.removeAllListeners('installModProgress');
        ipcRenderer.removeAllListeners('installModResult');
        ipcRenderer.removeAllListeners('installModError');
        return Promise.resolve();
    },

    getWorkshopItemDetails: (steamApiKey, workshopItemId) =>
        ipcRenderer.invoke('getWorkshopItemDetails', steamApiKey, workshopItemId),

    getSteamUserName: (steamApiKey, steamUserId) =>
        ipcRenderer.invoke('getSteamUserName', steamApiKey, steamUserId),
});