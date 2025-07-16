export const loadSetting = async (key) => {
    try {
        const response = await window.api.getSetting(key);
        if (response.success) {
            console.log('Setting loaded:', key, response.value);
            return response.value;
        } else {
            console.error(response.error);
            throw new Error(response.error);
        }
    } catch (error) {
        console.error("loadSetting error:", error);
        throw error;
    }
};

export const saveSetting = (key, value) => {
    window.api.setSetting(key, value);
    console.log('Saving', key, value);
    return value;
};

export const getAllData = async () => {
    console.log('Calling backend for all data');
    try {
        const response = await window.api.getAllData();
        if (response.success) {
            return response.value;
        } else {
            console.error(response.error);
            throw new Error(response.error);
        }
    } catch (error) {
        console.error("getAllData error:", error);
        throw error;
    }
};
