import { exec } from 'child_process';
const sudo = require('sudo-prompt');

export const execute = (cmd: string, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (err: any, stdout: any, stderr: any) => {
      if (err) { return reject(err); }
      return resolve({ stdout, stderr });
    });
  });
}

export const prompt = (cmd: string, options = {}) => {
  return new Promise((resolve, reject) => {
    sudo.exec(cmd, options, (err: any, stdout: any, stderr: any) => {
      if (err) { return reject(err); }
      return resolve({ stdout, stderr });
    });
  });
}