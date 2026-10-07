export interface RegexFlags {
	global: boolean;
	ignoreCase: boolean;
	multiline: boolean;
	dotAll: boolean;
	unicode: boolean;
}

export type RegexMode = 'extract' | 'replace' | 'filter-match' | 'filter-non-match';

export interface RegexPreset {
	name: string;
	pattern: string;
	flags: Partial<RegexFlags>;
	description: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
	{
		name: 'Email Address',
		pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
		flags: { global: true, ignoreCase: true },
		description: 'Ekstrak semua format alamat email'
	},
	{
		name: 'URL / Hyperlink',
		pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*',
		flags: { global: true, ignoreCase: true },
		description: 'Ekstrak tautan HTTP/HTTPS'
	},
	{
		name: 'Angka (Digits)',
		pattern: '\\d+',
		flags: { global: true },
		description: 'Ekstrak semua deretan angka'
	},
	{
		name: 'Nomor Telepon',
		pattern: '(?:\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{2,4}\\)?[-.\\s]?\\d{3,4}[-.\\s]?\\d{3,4}',
		flags: { global: true },
		description: 'Ekstrak nomor telepon atau handphone'
	},
	{
		name: 'Alamat IPv4',
		pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
		flags: { global: true },
		description: 'Ekstrak format IP address v4'
	},
	{
		name: 'Tag HTML',
		pattern: '<[^>]+>',
		flags: { global: true, ignoreCase: true },
		description: 'Ekstrak atau hapus tag HTML'
	},
	{
		name: 'Kata Kunci (Words)',
		pattern: '\\b[a-zA-Z0-9_]+\\b',
		flags: { global: true },
		description: 'Ekstrak setiap kata individual'
	},
	{
		name: 'Whitespace Berlebih',
		pattern: '[ \\t]+',
		flags: { global: true },
		description: 'Cocokkan spasi atau tab ganda'
	}
];

export interface ProcessRegexOptions {
	text: string;
	pattern: string;
	flags: RegexFlags;
	mode: RegexMode;
	replaceValue?: string;
	lineSeparator?: string;
}

export interface RegexResult {
	output: string;
	matchCount: number;
	errorMessage: string | null;
}

export function compileRegex(pattern: string, flags: RegexFlags): { regex: RegExp | null; error: string | null } {
	if (!pattern) {
		return { regex: null, error: null };
	}

	let flagStr = '';
	if (flags.global) flagStr += 'g';
	if (flags.ignoreCase) flagStr += 'i';
	if (flags.multiline) flagStr += 'm';
	if (flags.dotAll) flagStr += 's';
	if (flags.unicode) flagStr += 'u';

	try {
		const regex = new RegExp(pattern, flagStr);
		return { regex, error: null };
	} catch (err) {
		return {
			regex: null,
			error: err instanceof Error ? err.message : 'Pola regex tidak valid'
		};
	}
}

export function processRegex(options: ProcessRegexOptions): RegexResult {
	const { text, pattern, flags, mode, replaceValue = '', lineSeparator = '\n' } = options;

	if (!pattern) {
		return {
			output: '',
			matchCount: 0,
			errorMessage: null
		};
	}

	const { regex, error } = compileRegex(pattern, flags);
	if (error || !regex) {
		return {
			output: '',
			matchCount: 0,
			errorMessage: error
		};
	}

	try {
		if (mode === 'extract') {
			const matches = text.match(regex);
			if (!matches) {
				return {
					output: '',
					matchCount: 0,
					errorMessage: null
				};
			}

			return {
				output: matches.join(lineSeparator),
				matchCount: matches.length,
				errorMessage: null
			};
		}

		if (mode === 'replace') {
			let count = 0;
			const countRegex = new RegExp(
				regex.source,
				regex.flags.includes('g') ? regex.flags : regex.flags + 'g'
			);
			const matches = text.match(countRegex);
			count = matches ? matches.length : 0;

			const output = text.replace(regex, replaceValue);
			return {
				output,
				matchCount: count,
				errorMessage: null
			};
		}

		if (mode === 'filter-match' || mode === 'filter-non-match') {
			const lines = text.split(/\r?\n/);
			const lineRegex = new RegExp(
				regex.source,
				regex.flags.replace('g', '').replace('m', '')
			);

			const filteredLines: string[] = [];
			lines.forEach((line) => {
				const isMatch = lineRegex.test(line);
				if (mode === 'filter-match' && isMatch) {
					filteredLines.push(line);
				} else if (mode === 'filter-non-match' && !isMatch) {
					filteredLines.push(line);
				}
			});

			return {
				output: filteredLines.join(lineSeparator),
				matchCount: filteredLines.length,
				errorMessage: null
			};
		}

		return {
			output: '',
			matchCount: 0,
			errorMessage: null
		};
	} catch (err) {
		return {
			output: '',
			matchCount: 0,
			errorMessage: err instanceof Error ? err.message : 'Gagal memproses regex'
		};
	}
}
