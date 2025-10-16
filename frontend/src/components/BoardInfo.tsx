
interface Column {
  id: string;
  title: string;
  cards: Array<{
    id: string;
    title: string;
  }>;
}

interface BoardInfoProps {
  boardName: string;
  columns: Column[];
}

export function BoardInfo({ boardName, columns }: BoardInfoProps) {
  const totalCards = columns.reduce((acc, column) => acc + column.cards.length, 0);
  const totalColumns = columns.length;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{boardName}</h2>
          <div className="flex space-x-4 text-sm text-gray-600 mt-1">
            <span>{totalColumns} colunas</span>
            <span>{totalCards} cards</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            Ativo
          </div>
          <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
