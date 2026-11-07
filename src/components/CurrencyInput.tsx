import React, { useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  formatRupiahInput,
  parseRupiahInput,
  formatCompactIDR,
} from '../utils/formatters';

interface CurrencyInputProps {
  value: string;
  onChange: (formattedValue: string, numericValue: number) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  label?: string;
  helperText?: string;
  showQuickPresets?: boolean;
  compact?: boolean;
  autoFocus?: boolean;
}

const MAX_RUPIAH = 1_000_000_000_000; // 1 Triliun (batas maksimum sesuai aturan database)

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '1.000.000',
  required = false,
  id,
  label,
  helperText,
  showQuickPresets = true,
  compact = false,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedDisplay = formatRupiahInput(value);
  const numericValue = parseRupiahInput(formattedDisplay);

  const applyDigits = (rawDigits: string) => {
    const clean = rawDigits.replace(/\D/g, '').replace(/^0+/, '');
    if (!clean) {
      onChange('', 0);
      return;
    }
    let num = Number(clean);
    if (!Number.isFinite(num)) return;
    if (num > MAX_RUPIAH) {
      num = MAX_RUPIAH;
    }
    const nextFormatted = formatRupiahInput(String(Math.round(num)));
    onChange(nextFormatted, Math.round(num));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyDigits(e.target.value);
  };

  // Menambahkan "000" setiap kali diklik:
  // Contoh ketik "1" -> klik "000" (1x) = "1.000" -> klik "000" (2x) = "1.000.000"
  const handleAppendZeros = (zeros: string) => {
    const currentDigits = String(value ?? '')
      .replace(/\D/g, '')
      .replace(/^0+/, '');
    const nextDigits = currentDigits ? `${currentDigits}${zeros}` : `1${zeros}`;
    applyDigits(nextDigits);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('', 0);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={id}
            className="block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
          {numericValue > 0 && (
            <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md">
              {formatCompactIDR(numericValue)}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-stretch rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden transition-all">
        <div className="flex items-center pl-3.5 pr-2 text-xs sm:text-sm font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/60 border-r border-slate-200 dark:border-slate-800 select-none shrink-0">
          Rp
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required={required}
          autoFocus={autoFocus}
          value={formattedDisplay}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-3 ${
            compact ? 'py-2 text-xs sm:text-sm' : 'py-2.5 text-sm'
          } font-mono font-bold tabular-nums bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal focus:outline-none`}
        />

        {/* Tombol Kolom 000 Langsung di Dalam Kolom Input */}
        <div className="flex items-center gap-1 pr-1.5 py-1 shrink-0">
          {formattedDisplay && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              title="Kosongkan angka"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAppendZeros('000')}
            title="Tambah .000 (Ketik 1 lalu klik 2x untuk 1.000.000)"
            className="px-2.5 py-1.5 text-xs font-mono font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-xs transition-all cursor-pointer select-none"
          >
            .000
          </button>
        </div>
      </div>

      {/* Pilihan Tombol Cepat 000 & Nominal Rupiah */}
      {showQuickPresets && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAppendZeros('000')}
            className="px-2.5 py-1 text-[11px] font-mono font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer transition-colors"
            title="Tambahkan 3 angka nol (.000)"
          >
            +000 (Ribu)
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAppendZeros('000000')}
            className="px-2.5 py-1 text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg cursor-pointer transition-colors"
            title="Tambahkan 6 angka nol (.000.000)"
          >
            +000.000 (Juta)
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAppendZeros('00')}
            className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            +00
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            Ketik <strong className="text-slate-600 dark:text-slate-300">1</strong> lalu pilih{' '}
            <strong className="text-blue-600 dark:text-sky-400">.000</strong> 2x ={' '}
            <strong className="font-mono text-slate-700 dark:text-slate-200">1.000.000</strong>
          </span>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
