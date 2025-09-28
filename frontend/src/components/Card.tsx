import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '../types/index.js';

interface CardProps {
  card: CardType;
  onCardClick: (card: CardType) => void;
}

const createCardStyle = (transform: CSS.Transform | null, transition: string | undefined) => ({
  transform: CSS.Transform.toString(transform),
  transition,
});

const createCardClassName = (isDragging: boolean) => `
  bg-white p-3 mt-3 rounded-lg shadow-sm border border-gray-200
  cursor-grab active:cursor-grabbing
  hover:shadow-md transition-shadow
  ${isDragging ? 'opacity-50' : 'opacity-100'}
`;

const handleCardClick = (event: React.MouseEvent, card: CardType, onCardClick: (card: CardType) => void) => {
  event.stopPropagation();
  onCardClick(card);
};

export function Card({ card, onCardClick }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const cardStyle = createCardStyle(transform, transition);
  const cardClassName = createCardClassName(isDragging);

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      {...attributes}
      {...listeners}
      className={cardClassName}
      onClick={(e) => handleCardClick(e, card, onCardClick)}
    >
      <h3 className="font-medium text-gray-800">{card.title}</h3>
      {card.description && (
        <p className="text-sm text-gray-600 mt-1">{card.description}</p>
      )}
    </div>
  );
}
