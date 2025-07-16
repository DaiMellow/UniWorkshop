import { unwrap } from './unwrapper.js';
import { deleteFolder } from './fileManagement.js';

/** Profiles ************************************************************/

export const createGameProfile = (name, path, disabledPath, steamId) =>
    unwrap(window.api.createGameProfile(name, path, disabledPath, steamId));

export const getGameProfiles = () =>
    unwrap(window.api.getGameProfiles());

export const getGameProfileWithSteamId = (steamId) =>
    unwrap(window.api.getGameProfileBySteamId(steamId));

export const getGameProfileWithUniqueId = (uniqueId) =>
    unwrap(window.api.getGameProfileByUniqueId(uniqueId));

export const deleteGameProfile = (gameProfileId) =>
    unwrap(window.api.deleteGameProfile(gameProfileId));

export const updateGameProfile = (gameProfile) =>
    unwrap(window.api.updateGameProfile(gameProfile));

/** Mods ***************************************************************/

export const addModToProfile = (...args) =>
    unwrap(window.api.addModToProfile(...args));

export const deleteModFromProfile = async (id) => {
    await deleteFolder(id).catch(console.error);
    return unwrap(window.api.deleteModByUniqueId(id));
};

export const updateModInProfile = (gameProfileId, mod) =>
    unwrap(window.api.updateModInProfile(gameProfileId, mod));

export const getModsFromProfile = (gameProfileId) =>
    unwrap(window.api.getModsForProfileByUniqueId(gameProfileId));

export const updateAutoUpdateModByUniqueId = (id, autoUpdate) =>
    unwrap(window.api.updateAutoUpdateModByUniqueId(id, autoUpdate));

export const updateModStatusByUniqueId = (id, status) =>
    unwrap(window.api.updateStatusModByUniqueId(id, status));

/** Steam‑ID helper ****************************************************/

export const createSteamIdName = async (steamId) => {
    return unwrap(window.api.createSteamIdName(steamId));
};

export const getGameNameBySteamId = (steamId) =>
    unwrap(window.api.getGameNameBySteamId(steamId));

export const updateModCompatibility = (steam_id, is_compatible) =>
    unwrap(window.api.updateModCompatibilityBySteamId(steam_id, is_compatible));

export const updateModPath = (uniqueId, path) =>
    unwrap(window.api.updateModPath(uniqueId, path));

export const updateModStatus = (uniqueId, status) =>
    unwrap(window.api.updateModStatus(uniqueId, status));
