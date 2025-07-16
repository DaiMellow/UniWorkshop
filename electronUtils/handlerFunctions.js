import { spawn } from "child_process";
import { db } from "./db.js";
import fs from "fs";
import axios from "axios";
import { eventBus } from '../utils/eventBus.js';

const os = process.platform;

// Change the expected executable name based on the OS
const steamCmdExeExec = os === "win32" ? "steamcmd.exe" : os === "linux" ? "steamcmd.sh" : "steamcmd";
console.log(os, steamCmdExeExec)

export const createGameProfile = (name, path, disabledPath, steamId) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO game_profiles (name, path, disabledPath, steam_id) VALUES (?, ?, ?, ?)`,
            [name, path, disabledPath, steamId],
            function (err) {
                if (err) {
                    console.error("Error creating game profile:", err.message);
                    reject(err.message);
                } else {
                    console.log(`Game profile created with ID: ${this.lastID}`);
                    resolve(this.lastID); // Return the ID of the newly created profile
                }
            }
        );
    });
};

// Function to get all game profiles
export const getGameProfiles = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM game_profiles`, [], (err, rows) => {
            if (err) {
                console.error("Error fetching game profiles:", err.message);
                reject(err.message);
            } else {
                console.log("Fetched game profiles:", rows);
                resolve(rows);
            }
        });
    });
};

// Function to get a game profile by steam_id
export const getGameProfileBySteamId = (id) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM game_profiles WHERE steam_id = ?`, [id], (err, rows) => {
            if (err) {
                console.error("Error fetching game profiles:", err.message);
                reject(err.message);
            } else {
                console.log("Fetched game profiles:", rows);
                resolve(rows); // Return an array of rows
            }
        });
    });
};

// Function to get a game profile by unique id
export const getGameProfileByUniqueId = (id) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM game_profiles WHERE id = ?`, [id], (err, rows) => {
            if (err) {
                console.error("Error fetching game profiles:", err.message);
                reject(err.message);
            } else {
                console.log("Fetched game profiles:", rows);
                resolve(rows); // Return an array of rows
            }
        });
    });
};

// Function to delete a game profile by ID
export const deleteGameProfile = (id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM game_profiles WHERE id = ?`, [id], function (err) {
            if (err) {
                console.error("Error deleting game profile:", err.message);
                reject(err.message);
            } else {
                console.log(`Game profile with ID ${id} deleted.`);
                resolve(this.changes); // Return the number of rows deleted
            }
        });
    });
};

// Function to update a game profile by ID
export const updateGameProfile = (id, name, path, steamId) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE game_profiles SET name = ?, path = ?, steam_id = ? WHERE id = ?`,
            [name, path, steamId, id],
            function (err) {
                if (err) {
                    console.error("Error updating game profile:", err.message);
                    reject(err.message);
                } else {
                    console.log(`Game profile with ID ${id} updated.`);
                    resolve(this.changes); // Return the number of rows updated
                }
            }
        );
    });
};

// Function to update add a mod to a game profile
export const addModToProfile = (title, path, gameProfileId, steam_id, mod_id, author, description, version, img, status, autoUpdate) => {
    // Get the date and time in the format YYYY-MM-DD HH:MM:SS for the created_at and updated_at fields
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");

    console.log("Adding mod to profile:", {
        title,
        path,
        gameProfileId,
        steam_id,
        mod_id,
        author,
        version,
        img,
        status,
        autoUpdate
    });

    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO mods (title, path, game_profile_id, steam_id, mod_id, author, description, version, img, status, autoUpdate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, path, gameProfileId, steam_id, mod_id, author, description, version, img, status, autoUpdate, formattedDate, formattedDate],
            function (err) {
                if (err) {
                    console.error("Error adding mod to profile:", err.message);
                    reject(err.message);
                } else {
                    console.log(`Mod added to profile with ID: ${this.lastID}`);
                    resolve(this.lastID);
                }
            }
        );
    });
};

// Function to get all mods for a specific game profile
export const getModsForProfile = (gameProfileId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM mods WHERE game_profile_id = ?`,
            [gameProfileId],
            (err, rows) => {
                if (err) {
                    console.error("Error fetching mods for profile:", err.message);
                    reject(err.message);
                } else {
                    console.log("Fetched mods for profile:", rows);
                    resolve(rows);
                }
            }
        );
    });
};

// Function to get mod by uniqueid (id)
export const getModFromModID = (gameProfileId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM mods WHERE id = ?`,
            [gameProfileId],
            (err, rows) => {
                if (err) {
                    console.error("Error fetching mod from id:", err.message);
                    reject(err.message);
                } else {
                    console.log("Fetched mod:", rows);
                    resolve(rows);
                }
            }
        );
    });
};

// Function to delete a mod by ID
export const deleteMod = (id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM mods WHERE id = ?`, [id], function (err) {
            if (err) {
                console.error("Error deleting mod:", err.message);
                reject(err.message);
            } else {
                console.log(`Mod with ID ${id} deleted.`);
                resolve(this.changes); // Return the number of rows deleted
            }
        });
    });
};

// Function to update path of a mod by ID //Todo: add the new fields
export const updateModPath = (id, path) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE mods SET path = ? WHERE id = ?`,
            [path, id],
            function (err) {
                if (err) {
                    console.error("Error updating mod:", err.message);
                    reject(err.message);
                } else {
                    console.log(`Mod with ID ${id} updated.`);
                    resolve(this.changes); // Return the number of rows updated
                }
            }
        );
    });
};

// Function to update the autoUpdate field of a mod by ID
export const updateAutoUpdateMod = (id, autoUpdate) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE mods SET autoUpdate = ? WHERE id = ?`,
            [autoUpdate, id],
            function (err) {
                if (err) {
                    console.error("Error updating mod:", err.message);
                    reject(err.message);
                } else {
                    console.log(`Mod with ID ${id} updated.`);
                    resolve(this.changes);
                }
            }
        );
    });
};

// Function to update the status field of a mod by ID
export const updateStatusMod = (id, status) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE mods SET status = ? WHERE id = ?`,
            [status, id],
            function (err) {
                if (err) {
                    console.error("Error updating mod:", err.message);
                    reject(err.message);
                } else {
                    console.log(`Mod with ID ${id} updated.`);
                    resolve(this.changes);
                }
            }
        );
    });
};

// Function to set a setting
export const setSetting = (key, value) => {
    if (typeof key !== 'string') {
        console.warn('saveSetting called with non-string key:', key);
        return;
    }
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?`,
            [key, value, value],
            (err) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve();
                }
            }
        );
    });
};

// Function to get a setting
export const getSetting = (key) => {
    if (typeof key !== 'string') {
        console.warn('[loadSetting] NON‑STRING KEY:', key, new Error().stack);
        return null;
    }
    return new Promise((resolve, reject) => {
        db.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row) => {
            if (err) {
                console.error(`Error fetching setting for ${key}:`, err.message);
                reject(err.message);
            } else {
                console.log(`Fetched value for ${key}:`, row ? row.value : "null");
                resolve(row ? row.value : null);
            }
        });
    });
};

// Function to create a new steam_id entry
export const createSteamIdName = async (steamId) => {
    const gameName = await getSteamGameName(steamId);

    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO steam_ids (game_name, steam_id) VALUES (?, ?)`,
            [gameName, steamId],
            function (err) {
                if (err) {
                    console.error('Error creating steam_id:', err.message);
                    reject(err.message);
                } else {
                    resolve({ SteamId: this.lastID, name: gameName });
                }
            }
        );
    });
};

// Function to get game name by steam_id
export const getGameNameBySteamId = (steamId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM steam_ids WHERE steam_id = ?`, [steamId], (err, rows) => {
            if (err) {
                console.error("Error fetching game name by steam_id:", err.message);
                reject(err.message);
            } else {
                console.log("Fetched game name by steam_id:", rows);
                resolve(rows);
            }
        });
    });
};

// Update the steam_id entry by STEAM_ID if the game doesn't allow anonymous login
export const updateSteamIdNameCompatibility = (steam_id, is_compatible) => {
    console.log("Updating steam_id compatibility with is_compatible:", is_compatible, "for steam_id:", steam_id);
    if (is_compatible === undefined) { // is_compatible can be undefined if the api didn't respond
        console.error("is_compatible is undefined. Cannot update steam_id compatibility.");
        return Promise.reject(new Error("is_compatible is undefined."));
    }
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE steam_ids SET is_compatible = ? WHERE steam_id = ?`,
            [is_compatible, steam_id],
            function (err) {
                if (err) {
                    console.error("Error updating steam_id:", err.message);
                    reject(err.message);
                } else {
                    console.log(`Steam ID with ID ${steam_id} updated.`);
                    resolve(this.changes);
                }
            }
        );
    });
};

// Function for troubleshooting (Gets all data from the all tables)
export const getAllData = () => {
    const tables = ["settings", "game_profiles", "mods", "steam_ids"];
    tables.forEach((table) => {
        db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
            if (err) {
                console.error(`Error fetching data from ${table}:`, err.message);
            } else {
                console.log(`Data from ${table}:`, rows);
            }
        });
    });
};

// Function to delete mod with id
export const deleteFolderWithId = async (uniqueid) => {
    try {
        // Fetch the path from the database using the modId
        const mod = await getModFromModID(uniqueid);
        if (mod.length === 0) {
            console.error("No mod found with the given ID:", uniqueid);
            return;
        }

        let path = mod[0].path;
        console.log("Found path to delete:", path);

        // Checking if we need to remove it from the disabled folder
        if (mod[0].status === 'disabled') {
            console.log("Mod is disabled, removing from disabled folder:", path);
            // Stripping the modid from the path and then add the disabled folder and then the modid
            const modId = mod[0].mod_id;
            path = path.replace(/\/?[^/]+$/, '') + '_disabled/' + modId;
            console.log("Disabled path to delete:", path);
        }
        // Check if the path is safe to delete
        if (!isPathSafe(path)) {
            console.error(`Unsafe path detected: ${path}. Deletion aborted.`);
            return;
        }

        // Delete the folder
        console.log("Deleting folder at path:", path);
        await fs.promises.rm(path, { recursive: true, force: true });
        console.log('Folder deleted');
        return true;
    } catch (err) {
        console.error('Error deleting folder:', err);
        return false;
    }
};

// Function to create a disabled folder (for disabled mods)
export const createDisabledFolder = async (path) => {
    try {
        console.log("Creating disabled folder at path:", path);
        await fs.promises.mkdir(path, { recursive: true });
        console.log("Disabled folder created successfully.");
        return path;
    }
    catch (err) {
        console.error("Error creating disabled folder:", err);
        return false;
    }
};

export const updateModStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE mods SET status = ? WHERE id = ?`,
            [status, id],
            function (err) {
                if (err) {
                    console.error("Error updating mod status:", err.message);
                    reject(err.message);
                } else {
                    console.log(`Mod with ID ${id} status updated to ${status}.`);
                    resolve(this.changes); // Return the number of rows updated
                }
            }
        );
    });
};

// Function to install a mod using SteamCMD
// Helper to map output lines to step numbers
function parseStep(output) {
    if (output.includes('Loading Steam API...OK')) return 1;
    if (output.includes('OK Waiting for user info...')) return 2;
    if (output.includes('OK Downloading item')) return 3;
    if (output.includes('Success. Downloaded item')) return 5;
    if (output.includes('Verifying installation')) return 7;
    return null;
}

export async function installMod(command, args, onProgress) {
    console.log(`Installing mod function called with command: ${command} and args: ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args); // Spawn a new process with the command and arguments
        proc.stdout.on('data', chunk => {  // Listen for data from stdout
            const line = chunk.toString();
            const step = parseStep(line);
            if (step !== null) onProgress(step); // Call the progress function with the step number if found
            if (/Failure|Timeout|Error/.test(line)) { // Check for errors in the output
                onProgress({ error: true, output: line });
            }
        });
        proc.stderr.on('data', chunk => {
            onProgress({ error: true, output: chunk.toString() });
        });
        proc.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`Process exited with code ${code}`));
        });
    });
}

// Prevents accidental deletion of critical or system folders (All file deletions pass through this function)
export function isPathSafe(path) {
    const dangerousPatterns = [
        /^([A-Z]:)?\\$/, // Root of any drive on Windows (e.g., C:\)
        /\/$/, // Root on Unix (e.g., /)
        /system/i, // Anything with "system" in the path
        /\/Library\//i, // macOS system path
        /\.\./, // Relative path going up
    ];
    return !dangerousPatterns.some((pattern) => pattern.test(path));
}

export async function getWorkshopItemDetails(steamApiKey, workshopItemId) {
    console.log('Fetching Steam data for workshop item ID:', workshopItemId);

    const url = 'https://api.steampowered.com/IPublishedFileService/GetDetails/v1/';

    try {
        const response = await axios.get(url, {
            params: {
                key: steamApiKey,
                'publishedfileids[0]': workshopItemId,
                'includevotes': true
            }
        });

        console.log('Workshop Item Details:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching workshop item details:', error);
        console.log('Error response:', error.response.status);
        if (error.response?.status === 429) {
            console.error('Error 429: Too Many Requests. Please try again later.');
            eventBus.emit('notify', 'Too many requests. (Please wait a few seconds before trying again.)');
        } else {
            console.log('Error fetching workshop item details:', error.response?.data || error.message);
            eventBus.emit('notify', error);
        }
        throw error;
    }
}

export async function getSteamUserName(steamApiKey, steamUserId) {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/`;
    try {
        const response = await axios.get(url, {
            params: {
                key: steamApiKey,
                steamids: steamUserId
            }
        });

        // Extract player summary from the response
        const playerSummary = response.data.response.players[0];
        const username = playerSummary.personaname;
        const icon = playerSummary.avatarmedium;

        console.log('Steam Username:', username);
        console.log('Steam User Icon:', icon);

        // Return both username and icon
        return { username, icon };
    } catch (error) {
        console.log('Error response:', error.response.status);
        if (error.response?.status === 429) {
            console.error('Error 429: Too Many Requests. Please try again later.');
            eventBus.emit('notify', 'Too many requests. (Please wait a few seconds before trying again.)');
        } else {
            console.log('Error fetching workshop item details:', error.response?.data || error.message);
            eventBus.emit('notify', error);
        }
        throw error;
    }
}

// Function to fetch the game name from Steam using the appId
async function getSteamGameName(appId) {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
    const data = await response.json();

    if (data[appId].success) {
        return data[appId].data.name;
    } else {
        throw new Error("Game not found");
    }
}