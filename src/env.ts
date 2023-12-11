export default {
  rootURI: import.meta.env.VITE_DATA_ROOT_URI || '',
  campus: import.meta.env.VITE_CAMPUS || '',
  contactURI: `${import.meta.env.VITE_CONTACT_ENDPOINT}/${import.meta.env.VITE_STAGE_NAME}/`,
};
