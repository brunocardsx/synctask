import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardType {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

interface CardProps {
  card: CardType;
  onCardClick: (card: CardType) => void;
}

export default function Card({ card, onCardClick }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white p-3 mt-3 rounded-lg shadow-sm border border-gray-200
        cursor-grab active:cursor-grabbing
        hover:shadow-md transition-shadow
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onCardClick(card);
      }}
    >
      <h3 className="font-medium text-gray-800">{card.title}</h3>
      {card.description && (
        <p className="text-sm text-gray-600 mt-1">{card.description}</p>
      )}
    </div>
  );
}
