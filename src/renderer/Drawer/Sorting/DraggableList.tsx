import React from 'react';
import DraggableListItem from './DraggableListItem';
import { Box } from '@mui/material';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import './DraggableList.scss';

const { store } = window.api;

type Props = {
  settings: Settings;
  attributeMapping: TranslatedAttributes;
};

const DraggableList: React.FC<Props> = ({
  settings,
  attributeMapping,
}) => {
  const reorder = (list: string[], startIndex: number, endIndex: number): string[] => {
    const result = Array.from(list); // Use Array.from instead of Array, from
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if(!result.destination) return;
    const updatedSorting = reorder(settings.sorting, result.source.index, result.destination.index);
    store.set('sorting', updatedSorting);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {settings.sorting.map((item, index) => (
              <DraggableListItem
                item={item}
                index={index}
                key={item.id}
                settings={settings}
                attributeMapping={attributeMapping}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;
