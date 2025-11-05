// Mock fs/promises for browser environment
// This file is required by @0glabs/0g-ts-sdk when running in browser

const notAvailableError = (method) => {
  throw new Error(`fs.${method} is not available in browser environment`);
};

export const open = async () => notAvailableError('open');
export const readFile = async () => notAvailableError('readFile');
export const writeFile = async () => notAvailableError('writeFile');
export const mkdir = async () => notAvailableError('mkdir');
export const stat = async () => notAvailableError('stat');
export const access = async () => notAvailableError('access');
export const readdir = async () => notAvailableError('readdir');
export const rmdir = async () => notAvailableError('rmdir');
export const unlink = async () => notAvailableError('unlink');
export const copyFile = async () => notAvailableError('copyFile');
export const rename = async () => notAvailableError('rename');
export const lstat = async () => notAvailableError('lstat');
export const realpath = async () => notAvailableError('realpath');
export const chmod = async () => notAvailableError('chmod');
export const chown = async () => notAvailableError('chown');

// Sync versions
export const openSync = () => notAvailableError('openSync');
export const readFileSync = () => notAvailableError('readFileSync');
export const writeFileSync = () => notAvailableError('writeFileSync');
export const mkdirSync = () => notAvailableError('mkdirSync');
export const statSync = () => notAvailableError('statSync');
export const accessSync = () => notAvailableError('accessSync');
export const readdirSync = () => notAvailableError('readdirSync');
export const rmdirSync = () => notAvailableError('rmdirSync');
export const unlinkSync = () => notAvailableError('unlinkSync');
export const copyFileSync = () => notAvailableError('copyFileSync');
export const renameSync = () => notAvailableError('renameSync');
export const lstatSync = () => notAvailableError('lstatSync');
export const realpathSync = () => notAvailableError('realpathSync');
export const chmodSync = () => notAvailableError('chmodSync');
export const chownSync = () => notAvailableError('chownSync');

// Constants
export const constants = {
  F_OK: 0,
  R_OK: 4,
  W_OK: 2,
  X_OK: 1,
};

export default {
  open,
  readFile,
  writeFile,
  mkdir,
  stat,
  access,
  readdir,
  rmdir,
  unlink,
  copyFile,
  rename,
  lstat,
  realpath,
  chmod,
  chown,
  openSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
  accessSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  copyFileSync,
  renameSync,
  lstatSync,
  realpathSync,
  chmodSync,
  chownSync,
  constants,
  promises: {
    open,
    readFile,
    writeFile,
    mkdir,
    stat,
    access,
    readdir,
    rmdir,
    unlink,
    copyFile,
    rename,
    lstat,
    realpath,
    chmod,
    chown,
  }
};
