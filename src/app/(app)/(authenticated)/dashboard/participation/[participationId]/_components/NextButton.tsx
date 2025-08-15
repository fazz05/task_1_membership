'use client';

import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import type { ButtonHTMLAttributes } from 'react';

type NextButtonProps = {
  loading?: boolean;
  text: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export default function NextButton({
  loading = false,
  text,
  className = '',
  ...props
}: NextButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`relative w-full rounded-md bg-teal-500 p-2 text-black
                  disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {/* Sembunyikan teks saat loading tanpa geser layout */}
      <span className={loading ? 'invisible' : 'visible'}>{text}</span>

      <AiOutlineLoading3Quarters
        aria-hidden
        className={`absolute left-2 top-1/2 -translate-y-1/2
                    ${loading ? 'block animate-spin' : 'hidden'}`}
      />
    </button>
  );
}
