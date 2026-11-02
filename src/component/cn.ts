import { extendTailwindMerge } from 'tailwind-merge'

// Daftarkan ukuran heading custom agar `text-h1` dll. tidak dianggap sebagai warna
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    },
  },
})

export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes)
}
