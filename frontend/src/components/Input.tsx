import React from 'react';

// Estendemos as props padrão de um input HTML
type InputProps = React.ComponentProps<'input'> & {
  label: string;
};

export default function Input({ label, id, ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300 text-center">
        {label}
      </label>
      <input
        id={id}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block max-w-sm mx-auto p-2.5"
        {...props}
      />
    </div>
  );
}