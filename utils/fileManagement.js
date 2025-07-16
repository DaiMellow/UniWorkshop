// We pass the modId to the function to avoid just accepting any path
export const deleteFolder = async (modId) => {
    console.log('Deleting folder for modID:', modId);
    try {
        const response = await window.api.deleteFolderWithModId(modId);
        if (response.success) {
            return response.value;
        } else {
            console.error(response.error);
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('Error deleting folder:', error);
        throw error;
    }
};