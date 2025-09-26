// Utilitários para drag and drop do frontend SyncTask
// Seguindo diretrizes: funções específicas ao invés de comentários

import type { DragEndEvent, DragOverEvent } from '../types/index.js';

export const getDragItemId = (event: DragEndEvent | DragOverEvent): string => {
    return event.active.id;
};

export const getDragOverId = (event: DragEndEvent | DragOverEvent): string | null => {
    return event.over?.id || null;
};

export const getDragItemIndex = (event: DragEndEvent | DragOverEvent): number => {
    return event.active.data.current.sortable.index;
};

export const getDragOverIndex = (event: DragEndEvent | DragOverEvent): number | null => {
    return event.over?.data.current.sortable.index || null;
};

export const isDragOverSameItem = (event: DragEndEvent | DragOverEvent): boolean => {
    return event.active.id === event.over?.id;
};

export const isDragOverDifferentItem = (event: DragEndEvent | DragOverEvent): boolean => {
    return !isDragOverSameItem(event);
};

export const isDragOverSameColumn = (event: DragEndEvent | DragOverEvent): boolean => {
    const activeId = getDragItemId(event);
    const overId = getDragOverId(event);

    if (!overId) return false;

    const activeColumnId = activeId.split('-')[0];
    const overColumnId = overId.split('-')[0];

    return activeColumnId === overColumnId;
};

export const isDragOverDifferentColumn = (event: DragEndEvent | DragOverEvent): boolean => {
    return !isDragOverSameColumn(event);
};

export const getColumnIdFromItemId = (itemId: string): string => {
    return itemId.split('-')[0];
};

export const getCardIdFromItemId = (itemId: string): string => {
    return itemId.split('-')[1];
};

export const createItemId = (columnId: string, cardId: string): string => {
    return `${columnId}-${cardId}`;
};

export const parseItemId = (itemId: string): { columnId: string; cardId: string } => {
    const [columnId, cardId] = itemId.split('-');
    return { columnId, cardId };
};

export const isValidDragEvent = (event: DragEndEvent | DragOverEvent): boolean => {
    return Boolean(
        event.active &&
        event.active.id &&
        event.active.data &&
        event.active.data.current &&
        event.active.data.current.sortable
    );
};

export const getDragDirection = (event: DragEndEvent | DragOverEvent): 'up' | 'down' | null => {
    const activeIndex = getDragItemIndex(event);
    const overIndex = getDragOverIndex(event);

    if (overIndex === null) return null;

    return activeIndex < overIndex ? 'down' : 'up';
};

export const getDragDistance = (event: DragEndEvent | DragOverEvent): number => {
    const activeIndex = getDragItemIndex(event);
    const overIndex = getDragOverIndex(event);

    if (overIndex === null) return 0;

    return Math.abs(activeIndex - overIndex);
};

export const shouldReorderItems = (event: DragEndEvent | DragOverEvent): boolean => {
    return Boolean(
        event.over &&
        event.over.id &&
        event.over.data &&
        event.over.data.current &&
        event.over.data.current.sortable &&
        isDragOverDifferentItem(event)
    );
};

export const shouldMoveToDifferentColumn = (event: DragEndEvent | DragOverEvent): boolean => {
    return Boolean(
        event.over &&
        event.over.id &&
        isDragOverDifferentColumn(event)
    );
};

export const createDragPreview = (_element: HTMLElement): HTMLElement => {
    const preview = _element.cloneNode(true) as HTMLElement;
    preview.style.opacity = '0.5';
    preview.style.transform = 'rotate(5deg)';
    preview.style.pointerEvents = 'none';
    preview.style.position = 'absolute';
    preview.style.top = '-1000px';
    preview.style.left = '-1000px';

    document.body.appendChild(preview);

    return preview;
};

export const removeDragPreview = (preview: HTMLElement): void => {
    if (preview && preview.parentNode) {
        preview.parentNode.removeChild(preview);
    }
};

export const createDropIndicator = (): HTMLElement => {
    const indicator = document.createElement('div');
    indicator.style.height = '2px';
    indicator.style.backgroundColor = '#3b82f6';
    indicator.style.borderRadius = '1px';
    indicator.style.margin = '2px 0';
    indicator.style.opacity = '0.8';

    return indicator;
};

export const insertDropIndicator = (
    container: HTMLElement,
    indicator: HTMLElement,
    index: number
): void => {
    const children = Array.from(container.children);
    const targetChild = children[index];

    if (targetChild) {
        container.insertBefore(indicator, targetChild);
    } else {
        container.appendChild(indicator);
    }
};

export const removeDropIndicator = (indicator: HTMLElement): void => {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
};
