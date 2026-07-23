import {
    Copy, TextCursor, Split, Shuffle,
    List, FileCode, NotebookPen, Type,
    Smile, SeparatorHorizontal, Table, Map,
    ArrowDown, ChartBar, Lock, BookOpen, Scissors, FileText, Percent
} from '@lucide/svelte';

export const tools = [
    { title: 'Remove Duplicate Lines', desc: 'Hapus baris duplikat dari teks Anda.', href: '/remove-duplicate-lines', icon: Copy, category: 'Text Operations' },
    { title: 'Markdown Editor', desc: 'Editor Markdown dengan toolbar dan live preview.', href: '/markdown-editor', icon: FileText, category: 'Text Operations' },
    { title: 'Markdown Preview (Old)', desc: 'Editor Markdown versi klasik.', href: '/markdown-preview', icon: BookOpen, category: 'Text Operations' },
    { title: 'Add Prefix/Suffix into Line', desc: 'Tambahkan prefix atau suffix di setiap baris.', href: '/add-prefix-suffix', icon: TextCursor, category: 'Text Operations' },
    { title: 'Case Converter', desc: 'Ubah format teks ke UPPERCASE, camelCase, snake_case, dll.', href: '/case-converter', icon: Type, category: 'Text Operations' },
    { title: 'Split File', desc: 'Pecah teks menjadi file-file kecil.', href: '/split-files', icon: Split, category: 'Text Operations' },
    { title: 'Split Random Delimiter', desc: 'Pisahkan teks berdasarkan delimiter acak.', href: '/split-random-delimiter', icon: SeparatorHorizontal, category: 'Text Operations' },
    { title: 'Caption Formater', desc: 'Rapikan dan format caption media sosial.', href: '/captions-formatter', icon: Type, category: 'Text Operations' },
    { title: 'Extract Lines', desc: 'Potong dan ambil jumlah baris spesifik dari teks.', href: '/slice-lines', icon: Scissors, category: 'Text Operations' },
    { title: 'Sort Lines', desc: 'Urutkan baris teks secara alfabetis.', href: '/sort-lines', icon: ArrowDown, category: 'Text Operations' },

    { title: 'Word Counter & Stats', desc: 'Hitung kata, karakter, dan statistik teks.', href: '/word-counter', icon: ChartBar, category: 'Data & Parsing' },
    { title: 'Line Counter', desc: 'Hitung jumlah baris dalam dokumen.', href: '/lines-counter', icon: List, category: 'Data & Parsing' },
    { title: 'File Comparation', desc: 'Bandingkan dua file dan temukan perbedaannya.', href: '/files-comparation', icon: FileCode, category: 'Data & Parsing' },
    { title: 'CSV/VCard Parser', desc: 'Ekstrak data dari file VCard atau CSV.', href: '/csv-parser', icon: Table, category: 'Data & Parsing' },

    { title: 'Shared Notepad', desc: 'Catatan online yang bisa diakses lintas browser.', href: '/notepad', icon: NotebookPen, category: 'General Utilities' },
    { title: 'Emoji Browser', desc: 'Cari dan salin emoji dengan mudah.', href: '/emoji-picker', icon: Smile, category: 'General Utilities' },
    { title: 'Page Identifier', desc: 'Identifikasi halaman dan query parameter.', href: '/pageid?id=Demo', icon: Map, category: 'General Utilities' },
    { title: 'Percentage Calculator', desc: 'Perhitungan persentase praktis dan cepat.', href: '/percentage-calculator', icon: Percent, category: 'General Utilities' },

    { title: 'JS Obfuscator', desc: 'Lindungi JavaScript Anda dari reverse engineering.', href: '/obfuscate', icon: Lock, category: 'Security & Misc' },
    { title: 'Random Number', desc: 'Buat angka acak sesuai kebutuhan.', href: '/random-number-generator', icon: Shuffle, category: 'Security & Misc' }
];

export const groupedTools = () => {
    const groups: Record<string, typeof tools> = {};
    tools.forEach(t => {
        if (!groups[t.category]) groups[t.category] = [];
        groups[t.category].push(t);
    });
    return groups;
};
