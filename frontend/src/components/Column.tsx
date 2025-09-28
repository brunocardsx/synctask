import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Card as CardType, Column as ColumnType } from '../types/index.js';
import { AddCardButton } from './AddCardButton';
import { Card } from './Card';

interface ColumnProps {
  column: ColumnType;
  onCardClick: (card: CardType) => void;
  onCardAdded: (card: CardType) => void;
}

const createColumnClassName = () =>
  'bg-gray-100 p-4 rounded-lg min-w-80 max-w-80 flex-shrink-0';

const createDropZoneClassName = () =>
  'min-h-32';

const createEmptyStateClassName = () =>
  'text-gray-500 text-center py-8 text-sm border-2 border-dashed border-gray-300 rounded-lg';

const getCardIds = (cards: CardType[]): string[] =>
  cards.map(card => card.id);

const renderCards = (cards: CardType[], onCardClick: (card: CardType) => void) => {
  if (cards.length === 0) {
    return (
      <div className={createEmptyStateClassName()}>
        Solte os cards aqui
      </div>
    );
  }

  return cards.map(card => (
    <Card key={card.id} card={card} onCardClick={onCardClick} />
  ));
};

export function Column({ column, onCardClick, onCardAdded }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const cardIds = getCardIds(column.cards);
  const columnClassName = createColumnClassName();
  const dropZoneClassName = createDropZoneClassName();

  return (
    <div className={columnClassName}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{column.title}</h2>

      <div ref={setNodeRef} className={dropZoneClassName}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {renderCards(column.cards, onCardClick)}
        </SortableContext>

        <AddCardButton
          columnId={column.id}
          onCardAdded={onCardAdded}
        />
      </div>
    </div>
  );
}
