import chokidar, { FSWatcher } from 'chokidar';
import processDataRequest from '../ProcessDataRequest/ProcessDataRequest';
import { configStorage } from '../../config';
import { eventListeners } from '../../main';

let watcher: FSWatcher | null = null;

function createFileWatcher(files: FileObject[]): void {
  if(watcher) {
    watcher?.close();
  }

  watcher = chokidar.watch(files.map((file) => file.todoFilePath), {
    awaitWriteFinish: {
      stabilityThreshold: 50,
      pollInterval: 50,
    },
  });

  watcher
    .on('add', (file) => {
      console.log(`FileWatcher.ts: New file added: ${file}`);
    })
    .on('change', async (file) => {
      try {
        await processDataRequest();
        console.log(`File ${file} has been changed`);
      } catch(error) {
        console.error(error.message);
      }
    })
    .on('unlink', (file) => {
      console.log(`FileWatcher.ts: FileObject ${file} has been unlinked`);
      const updatedFiles = files.filter((item) => item.todoFilePath !== file);
      configStorage.set('files', updatedFiles);
    })
    .on('ready', () => {
      console.log('FileWatcher.ts: Initial scan complete. Ready for changes');
    });

  eventListeners.watcher = watcher;
}

export { createFileWatcher, watcher };
