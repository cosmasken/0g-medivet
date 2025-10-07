// Mock fs/promises for browser compatibility
export const open = () => {
  throw new Error('File system operations not supported in browser');
};

export const readFile = () => {
  throw new Error('File system operations not supported in browser');
};

export const writeFile = () => {
  throw new Error('File system operations not supported in browser');
};

export const stat = () => {
  throw new Error('File system operations not supported in browser');
};

export default {
  open,
  readFile,
  writeFile,
  stat
};
