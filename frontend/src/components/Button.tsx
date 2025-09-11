import React from 'react';

type ButtonProps = React.ComponentProps<'button'>;

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}