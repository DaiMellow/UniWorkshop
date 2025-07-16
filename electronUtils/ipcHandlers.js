import { app, ipcMain, shell, dialog } from "electron";
import path, { join, basename } from "path";
import { spawn, exec } from "child_process";
import fs from "fs";
import AdmZip from "adm-zip";
import { addModToProfile, installMod, createDisabledFolder, createGameProfile, createSteamIdName, deleteFolderWithId, deleteGameProfile, deleteMod, getAllData, getGameNameBySteamId, getGameProfileBySteamId, getGameProfileByUniqueId, getGameProfiles, getModsForProfile, getSetting, getSteamUserName, getWorkshopItemDetails, isPathSafe, setSetting, updateAutoUpdateMod, updateGameProfile, updateModPath, updateModStatus, updateStatusMod, updateSteamIdNameCompatibility } from './handlerFunctions.js';
import { clearDatabase } from "./db.js";

const os = process.platform;

// Change the expected executable name based on the OS
const steamCmdExeExec = os === "win32" ? "steamcmd.exe" : os === "linux" ? "steamcmd.sh" : "steamcmd";
console.log(os, steamCmdExeExec)

export function registerIpcHandlers() {
    // Listen for a request to clear the database
    ipcMain.handle("clearDatabase", () => {
        clearDatabase();
        app.relaunch();
        app.exit();
    });

    ipcMain.handle("getOs", (_event) => {
        console.log("Getting OS information...");
        return os;
    });

    ipcMain.handle("getSteamCmdExe", (_event) => {
        console.log("Getting SteamCMD executable name...");
        return steamCmdExeExec;
    });

    ipcMain.handle("getEnvironment", (_event) => {
        console.log("Getting environment information...");
        return process.env.NODE_ENV === "development" ? "development" : "production";
    });

    ipcMain.handle("openLink", (_event, link) => {
        console.log("Opening link:", link);
        shell.openExternal(link).catch((error) => {
            console.error("Error opening link:", error);
        });
    });

    ipcMain.handle("openLogs", (_event) => {
        console.log("Opening logs folder…");
        const logFile = join(app.getPath("userData"), "logs", "main.log");

        return shell.openPath(logFile)
            .then(errMsg => {
                if (errMsg) {
                    console.error("Error opening logs folder:", errMsg);
                    return { success: false, error: errMsg };
                } else {
                    console.log("Logs folder opened successfully.");
                    return { success: true };
                }
            });
    });

    ipcMain.handle('openFolderDialog', async (_event) => {
        return await dialog.showOpenDialog({ properties: ['openDirectory'] });
    });

    ipcMain.handle('createDisabledFolder', async (_event, path) => {
        try {
            const disabledPath = await createDisabledFolder(path);
            return { success: true, disabledPath };
        } catch (error) {
            console.error('Error in createDisabledFolder:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("updateModStatus", async (_event, id, status) => {
        console.log("Updating mod status with ID:", id, "to status:", status);
        try {
            const changes = await updateModStatus(id, status);
            return { success: true, value: changes };
        } catch (error) {
            console.error("Error updating mod status:", error.message);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("deleteFolderWithModId", async (_event, uniqueId) => {
        try {
            await deleteFolderWithId(uniqueId);
            return { success: true };
        } catch (error) {
            console.error("Error in deleteFolderWithModId:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("getAllData", async (_event) => {
        console.log("Fetching all data from the database...");
        getAllData();
        return { success: true };
    });

    ipcMain.handle("checkFileExists", async (_event, filePath) => {
        console.log(`Checking file at path: ${filePath}`);
        const exists = fs.existsSync(filePath);
        console.log(`File exists: ${exists}`);
        return exists;
    });

    ipcMain.handle("setSetting", async (_event, key, value) => {
        try {
            await setSetting(key, value);
            return { success: true };
        } catch (error) {
            console.error("Error setting value:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('getSetting', async (_event, key) => {
        try {
            const value = await getSetting(key);
            return { success: true, value };
        } catch (error) {
            return { success: false, error };
        }
    });

    ipcMain.handle("createGameProfile", async (_event, name, path, disabledPath, steamId) => {
        console.log("Creating game profile with name:", name, "path:", path, "disabledPath:", disabledPath, "steamId:", steamId);
        try {
            const profileId = await createGameProfile(name, path, disabledPath, steamId);
            await createDisabledFolder(disabledPath);
            console.log("Disabled folder created successfully.");
            return { success: true, value: profileId };
        } catch (error) {
            console.error("Error creating game profile or disabled folder:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("getGameProfiles", async (_event) => {
        try {
            const profiles = await getGameProfiles();
            return { success: true, value: profiles };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("getGameProfileBySteamId", async (_event, steamId) => {
        try {
            const profiles = await getGameProfileBySteamId(steamId);
            return { success: true, value: profiles };
        } catch (error) {
            console.error("Error fetching game profile by Steam ID:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("getGameProfileByUniqueId", async (_event, uniqueId) => {
        try {
            const profiles = await getGameProfileByUniqueId(uniqueId);
            return { success: true, value: profiles };
        } catch (error) {
            console.error("Error fetching game profile by unique ID:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("deleteGameProfileByUniqueId", async (_event, id) => {
        try {
            const changes = await deleteGameProfile(id);
            return { success: true, value: changes };
        } catch (error) {
            console.error("Error deleting game profile:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("updateGameProfile", async (_event, id, name, path, steamId) => {
        try {
            const changes = await updateGameProfile(id, name, path, steamId);
            return { success: true, value: changes };
        } catch (error) {
            console.error("Error updating game profile:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("getModsForProfileByUniqueId", async (_event, gameProfileId) => {
        try {
            const mods = await getModsForProfile(gameProfileId);
            return { success: true, value: mods };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("addModToProfile", async (_event, name, path, gameProfileId, steam_id, mod_id, author, description, version, img, status, autoUpdate) => {
        try {
            const modId = await addModToProfile(name, path, gameProfileId, steam_id, mod_id, author, description, version, img, status, autoUpdate);
            return { success: true, value: modId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("deleteModByUniqueId", async (_event, uniqueId) => {
        try {
            const changes = await deleteMod(uniqueId);
            return { success: true, value: changes };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("updateModPathByUniqueId", async (_event, uniqueId, path) => {
        try {
            const changes = await updateModPath(uniqueId, path);
            return { success: true, value: changes };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("updateAutoUpdateModByUniqueId", async (_event, id, AutoUpdate) => {
        try {
            const changes = await updateAutoUpdateMod(id, AutoUpdate);
            return { success: true, value: changes };
        } catch (error) {
            console.error("Error updating autoUpdate for mod:", error.message);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("updateStatusModByUniqueId", async (_event, id, status) => {
        try {
            const changes = await updateStatusMod(id, status);
            return { success: true, value: changes };
        } catch (error) {
            console.error("Error updating status for mod:", error.message);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("createSteamIdName", async (_event, steamId) => {
        try {
            const steamIdEntry = await createSteamIdName(steamId);
            return { success: true, value: steamIdEntry };
        } catch (error) {
            console.error("Error creating Steam ID entry:", error.message);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("getGameNameBySteamId", async (_event, steamId) => {
        try {
            const gameName = await getGameNameBySteamId(steamId);
            return { success: true, value: gameName };
        } catch (error) {
            console.error("Error fetching game name by Steam ID:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("updateModCompatibilityBySteamId", async (_event, steam_id, is_compatible) => {
        try {
            const changes = await updateSteamIdNameCompatibility(steam_id, is_compatible);
            return { success: true, value: changes };
        } catch (error) {
            console.error("Error updating mod compatibility:", error);
            return { success: false, error: error.message };
        }
    });

    // Uses the unique id of the profile to delete the profile and all the mods associated with it
    ipcMain.handle("deleteProfileByUniqueId", async (_event, id) => {
        try {
            // Fetch all the paths to delete first
            const mods = await getModsForProfile(id);
            for (const mod of mods) {
                let path = mod.path;
                console.log("Found path to delete:", path);

                if (mod.status === 'disabled') {
                    console.log("Mod is disabled, removing from disabled folder:", path);
                    // Stripping the modid from the path and then adding the correct path
                    const modId = mod[0].mod_id;
                    path = path.replace(/\/?[^/]+$/, '') + '_disabled/' + modId;
                    console.log("Disabled path to delete:", path);
                }

                if (!isPathSafe(path)) {
                    console.error(`Unsafe path detected: ${path}. Deletion aborted.`);
                    return { success: false, error: `Unsafe path detected: ${path}` };
                }

                console.log("Deleting folder at path:", path);
                await fs.promises.rm(path, { recursive: true, force: true });
            }
            await deleteGameProfile(id);
            return { success: true };
        } catch (error) {
            console.error("Error in delete-profile:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("openFolder", async (_event, folderPath) => {
        try {
            const result = await shell.openPath(folderPath);
            if (result) {
                console.error("Error opening folder:", result);
                return { success: false, error: result };
            } else {
                return { success: true };
            }
        } catch (error) {
            console.error("Failed to open folder:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('anonInstallMod', async (ipcEvent, modId, gameId, steamCmdPath) => {
        const send = payload => ipcEvent.sender.send('installModProgress', payload);

        try {
            await installMod(
                `${steamCmdPath}/${steamCmdExeExec}`,
                [
                    '+login', 'anonymous',
                    '+workshop_download_item', gameId, modId,
                    '+quit',
                ],
                step => send({ step })
            );

            ipcEvent.sender.send('installModResult', { success: true });
            return { success: true };

        } catch (err) {
            ipcEvent.sender.send('installModResult', { success: false, error: err.message });
            return { success: false, error: err.message };
        }
    });

    // Handle anonymous installation of mods to a custom directory
    ipcMain.handle(
        'anonInstallModCustomDirectory',
        async (ipcEvent, modId, gameId, steamCmdPath, targetDir) => {
            const send = payload => ipcEvent.sender.send('installModProgress', payload);

            try {
                await installMod(
                    `${steamCmdPath}/${steamCmdExeExec}`,
                    [
                        '+login', 'anonymous',
                        '+force_install_dir', targetDir,
                        '+workshop_download_item', gameId, modId,
                        '+quit',
                    ],
                    step => send({ step })
                );

                const workshopPath = path.join(
                    targetDir,
                    'steamapps', 'workshop', 'content',
                    String(gameId),
                    String(modId)
                );
                await waitForDir(workshopPath);

                ipcEvent.sender.send('installModResult', { success: true });
                return { success: true };

            } catch (err) {
                ipcEvent.sender.send('installModResult', { success: false, error: err.message });
                return { success: false, error: err.message };
            }
        }
    );

    // Exclusively for windows for now.
    ipcMain.handle("installSteamCMD", async (_event, customPath) => {
        const installPath = customPath || app.getPath("userData");
        const steamCmdZip = join(installPath, "steamcmd.zip");
        const steamCmdExe = join(installPath, "steamcmd.exe");

        if (!fs.existsSync(installPath)) {
            fs.mkdirSync(installPath, { recursive: true });
        }

        if (fs.existsSync(steamCmdExe)) {
            return {
                success: false,
                message: "SteamCMD is already installed at this path.",
            };
        }

        // PowerShell command to download SteamCMD
        const installCommand = `powershell.exe -Command "Invoke-WebRequest -Uri 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip' -OutFile '${steamCmdZip}'"`;

        try {
            await new Promise((resolve, reject) => {
                exec(installCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error downloading: ${error.message}`);
                        reject(new Error(error.message));
                    } else {
                        console.log(stdout);
                        resolve();
                    }
                });
            });

            // Extract SteamCMD using adm-zip
            const zip = new AdmZip(steamCmdZip);
            zip.extractAllTo(String(installPath), true);

            // Start the SteamCMD installation process
            const process = spawn(steamCmdExe, ["+quit"]);
            let installStarted = false;

            return await new Promise((resolve, reject) => {
                process.stdout.on("data", (data) => {
                    const output = data.toString();
                    console.log(`stdout: ${output}`);

                    // Check for the key steps in the output
                    if (output.includes("Steam Console Client")) {
                        console.log("SteamCMD installed");
                    }

                    if (!installStarted && output.includes("Update complete")) {
                        installStarted = true;
                        console.log("Install started");
                    }

                    // Check for final output indicating the installation is complete
                    if (output.includes("Update complete, launching")) {
                        console.log("Install finished");
                    }
                });

                process.stderr.on("data", (data) => {
                    console.error(`stderr: ${data}`);
                });

                process.on("close", (code) => {
                    if (code === 0) {
                        resolve({
                            success: true,
                            message: "Installation process exited successfully.",
                        });
                    } else {
                        reject(new Error(`Process exited with code ${code}`));
                    }
                });
            });
        } catch (err) {
            console.error(err);
            return { success: false, message: err.message };
        }
    });

    ipcMain.handle("moveFolder", async (_event, sourcePath, destPath) => {
        try {
            // Ensure the destination directory exists
            const targetPath = join(destPath, basename(sourcePath));
            fs.mkdirSync(destPath, { recursive: true });

            // Copy the folder recursively
            const copyFolderRecursive = (src, dest) => {
                if (!fs.existsSync(src)) {
                    throw new Error(`Source path does not exist: ${src}`);
                }

                if (!fs.existsSync(dest)) {
                    fs.mkdirSync(dest, { recursive: true });
                }

                const entries = fs.readdirSync(src, { withFileTypes: true });

                for (const entry of entries) {
                    const srcPath = join(src, entry.name);
                    const destPath = join(dest, entry.name);

                    if (entry.isDirectory()) {
                        copyFolderRecursive(srcPath, destPath);
                    } else {
                        fs.copyFileSync(srcPath, destPath);
                    }
                }
            };

            copyFolderRecursive(sourcePath, targetPath);

            // Recursive deletion with safety
            const deleteFolderRecursive = (path) => {
                if (!isPathSafe(path)) {
                    console.error(`Unsafe path detected: ${path}. Deletion aborted.`);
                    return;
                }

                if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach((file) => {
                        const curPath = join(path, file);
                        if (fs.lstatSync(curPath).isDirectory()) {
                            deleteFolderRecursive(curPath);
                        } else {
                            fs.unlinkSync(curPath);
                        }
                    });
                    fs.rmdirSync(path);
                    console.log(`Deleted folder: ${path}`);
                }
            };

            deleteFolderRecursive(sourcePath);

            return { success: true };
        } catch (error) {
            console.error("Error moving folder:", error);

            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("is-safe-to-delete", async (_event, path) => {
        try {
            const isSafe = isPathSafe(path);
            return { success: true, isSafe };
        } catch (error) {
            console.error("Error checking if path is safe to delete:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("doesFolderExist", async (_event, folderPath) => {
        console.log(`Checking if folder exists at path: ${folderPath}`);
        const exists = fs.existsSync(folderPath);
        console.log(`Folder exists: ${exists}`);
        return exists;
    });

    ipcMain.handle("getUserDataPath", () => {
        return app.getPath("userData").replace(/\\/g, "/"); // Get the path to Roaming folder with forward slashes
    });

    ipcMain.handle("getWorkshopItemDetails", async (_event, steamApiKey, workshopItemId) => {
        try {
            const details = await getWorkshopItemDetails(steamApiKey, workshopItemId);
            console.log("Workshop item details:", details);
            return { success: true, details };
        } catch (error) {
            console.error("Error fetching workshop item details:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("getSteamUserName", async (_event, steamApiKey, steamUserId) => {
        try {
            const { username, icon } = await getSteamUserName(steamApiKey, steamUserId);
            return { success: true, username: username, icon: icon };
        } catch (error) {
            console.error("Error fetching Steam user name:", error);
            return { success: false, error: error.message };
        }
    });
}

function waitForDir(dirPath, ms = 200, retries = 50) {
    return new Promise((resolve, reject) => {
        let tries = 0;
        const iv = setInterval(() => {
            if (fs.existsSync(dirPath)) {
                clearInterval(iv);
                resolve();
            } else if (++tries >= retries) {
                clearInterval(iv);
                reject(new Error(`Folder never appeared: ${dirPath}`));
            }
        }, ms);
    });
}