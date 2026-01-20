import path from 'path';

export const SONG_QUEUE = 'song-queue';
export const SONG_JOB = 'process-song';
export const DISTRIBUTION_QUEUE = 'distribution-queue';
export const DISTRIBUTION_JOB = 'distribute-song-job';
export const FILES_STORAGE_PATH = path.join(__dirname, '../../store');
