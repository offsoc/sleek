import fs from 'fs';
import { getActiveFile } from './ActiveFile';
import { configStorage, filterStorage } from '../config';
import { createAttributesObject, applyFilters } from './Filters';
import { createTodoObjects } from './CreateTodoObjects';
import { mainWindow } from '../main';
import { handleCompletedTodoObjects, sortAndGroupTodoObjects, flattenTodoObjects, countTodoObjects, applySearchString } from './ProcessTodoObjects';

interface TodoObjectsResponse {
  sortedTodoObjects: Record<string, any>;
  attributes: Record<string, any>;
  headers: {
    availableObjects: number;
    visibleObjects: number;
  };
  filters: object;
}

const headers = {
  availableObjects: null,
  visibleObjects: null,
};

interface FileData {
  active: boolean;
  path: string;
  filename: string;
}

async function processDataRequest(searchString: string): Promise<TodoObjectsResponse | null> {
  try {
    const files: FileData[] = configStorage.get('files');
    const file = getActiveFile(files);

    if (file === null) {
      return Promise.resolve(null);
    }

    const fileContent = await fs.promises.readFile(file.path, 'utf8');
    const hideCompleted: boolean = configStorage.get('hideCompleted');
    const sorting: string[] = configStorage.get('sorting');
    const invertGroups: boolean = configStorage.get('invertGroups', false);
    const invertSorting: boolean = configStorage.get('invertSorting', false);
    const completedLast: boolean = configStorage.get('completedLast', false);
    const filters: object = filterStorage.get('filters', {});

    let todoObjects: Record<string, any>;
    
    todoObjects = await createTodoObjects(fileContent);

    headers.availableObjects = countTodoObjects(todoObjects);

    if(hideCompleted) todoObjects = handleCompletedTodoObjects(todoObjects, hideCompleted);

    const attributes = createAttributesObject(todoObjects);

    if (filters) {
      todoObjects = applyFilters(todoObjects, filters);
    }
    
    if (searchString) {
      todoObjects = applySearchString(searchString, todoObjects);
    }

    headers.visibleObjects = countTodoObjects(todoObjects);

    const sortedAndGroupedTodos = sortAndGroupTodoObjects(todoObjects, sorting);

    const flattenedTodoObjects = flattenTodoObjects(sortedAndGroupedTodos, sorting[0].value);

    return Promise.resolve([flattenedTodoObjects, attributes, headers, filters]);
  } catch(error) {
    return Promise.reject(error);
  }
}

export default processDataRequest;