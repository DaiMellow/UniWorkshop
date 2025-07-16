import { loadSetting, saveSetting } from './settings.js';

export const getSteamCmdExeName = async () => {
    try {
        const response = await window.api.getSteamCmdExe();
        if (response) {
            console.log('Received SteamCmd executable name:', response);
            return response;
        } else {
            console.error(response?.error);
            throw new Error(response?.error);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getOs = async () => {
    try {
        const response = await window.api.getOs();
        if (response) {
            return response;
        } else {
            console.error(response?.error);
            throw new Error(response?.error);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const openFolderDialog = async () => {
    try {
        const response = await window.api.openFolderDialog();
        if (response) {
            console.log('Response:', response);
            console.log('Folder selected:', response.filePaths);
            return response.filePaths?.[0];
        } else {
            console.error(response?.error);
            throw new Error(response?.error);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export async function checkSteamCmdExists(filePath) {
    try {
        const steamExeName = await getSteamCmdExeName();
        const exists = await window.api.checkFileExists(`${filePath}/${steamExeName}`);

        console.log('Received file existence result:', exists);

        if (typeof exists === 'boolean') {
            console.log(`${steamExeName} ${exists ? 'exists' : 'does not exist'} at the provided path.`);
            return exists;
        } else {
            console.error('Expected boolean, but received:', exists);
            return false;
        }
    } catch (error) {
        console.error('Error checking file existence:', error);
        return false;
    }
}

export async function doesFolderExist(folderPath) {
    try {
        const exists = await window.api.checkFolderExists(folderPath);

        console.log('Received folder existence result:', exists);

        if (typeof exists === 'boolean') {
            console.log(`${folderPath} ${exists ? 'exists' : 'does not exist'}.`);
            return exists;
        } else {
            console.error('Expected boolean, but received:', exists);
            return false;
        }
    } catch (error) {
        console.error('Error checking folder existence:', error);
        return false;
    }
}

export async function checkForCorruptData() {
    let SteamCmdLocation = null;
    let SaveLocation = null;
    let SteamApiKey = null;
    let SteamCmdModPath = null;
    let OnboardingComplete = null;

    // Function to check if the SteamCmd location is valid
    function isSteamPathValidator(SteamCmdLocation) {
        const regex = /^(?:[a-zA-Z]:)?[\\/](?:[^<>:"/\\|?*]+[\\/])*(?:[^<>:"/\\|?*]+)?$/i; 
        const test = regex.test(SteamCmdLocation);
        if (test) {
            checkSteamCmdExists(SteamCmdLocation)
        }
        return test;
    }
    function isSteamApiKeyValidator(steamApiKey) {
        const regex = /^[A-Za-z0-9]{32}$/i;
        const test = regex.test(steamApiKey);
        return test;
    }

    try {
        console.log('Loading the settings...');
        SteamCmdLocation = await loadSetting('SteamCmd_Path');
        SaveLocation = await loadSetting('SaveLocation');
        SteamApiKey = await loadSetting('SteamApiKey');
        SteamCmdModPath = await loadSetting('SteamCmd_ModPath');
        OnboardingComplete = !!parseInt(await loadSetting('OnboardingComplete'), 10); // Parse and convert
        console.log(`data loaded from Home.vue SteamCmdLocation ${SteamCmdLocation}, Save Location ${SaveLocation}, SteamApi ${SteamApiKey}, Onboarding ${OnboardingComplete}`)
    } catch (error) {
        console.error('Failed to load settings:', error);
    }

    let Errors = []

    let isSteamPathValid = isSteamPathValidator(SteamCmdLocation);
    let isSteamApiKeyValid = isSteamApiKeyValidator(SteamApiKey);

    if (!isSteamPathValid) {
        Errors.push('SteamCmdLocation is invalid')
        // Clearing the path to avoid issues
        await saveSetting('SteamCmd_Path', '');
    }

    if (!isSteamApiKeyValid) {
        Errors.push('SteamApiKey is invalid')
        // Clearing the key to avoid issues
        await saveSetting('SteamApiKey', '');
    }

    if (Errors.length > 0) {
        console.log('Database has a corruption...')
        console.log('Errors found:', Errors)
        return Errors;
    } else {
        console.log('No errors found')
        await saveSetting('OnboardingComplete', true);
        return Errors;
    }
}