import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import Card from './Card';

interface CardType {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
}

interface ColumnType {
  id: string;
  title: string;
  order: number;
  cards: CardType[];
}

interface ColumnProps {
  column: ColumnType;
}

export default function Column({ column }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  // IDs dos cards para o SortableContext
  const cardIds = column.cards.map(card => card.id);

  return (
    <div className="bg-gray-100 p-4 rounded-lg min-w-80 max-w-80 flex-shrink-0">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{column.title}</h2>
      
      <div ref={setNodeRef} className="min-h-32">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.length > 0 ? (
            column.cards.map(card => (
              <Card key={card.id} card={card} />
            ))
          ) : (
            <div className="text-gray-500 text-center py-8 text-sm border-2 border-dashed border-gray-300 rounded-lg">
              Solte os cards aqui
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
