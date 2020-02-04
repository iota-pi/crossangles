const campusRegex = /\b([a-z]+)\.crossangles.app$/;

export const getCampus = (hostname: string): string => {
  const results = hostname.match(campusRegex);
  if (results) {
    return results[1];
  }

  // Default to value from environment variable
  return process.env.REACT_APP_CAMPUS!;
}

export default getCampus;
