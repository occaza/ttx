// Dictionary & parsing engine for iOS Panic Full (.ips) analysis

export interface PanicSensorDef {
	code: string;
	name: string;
	component: string;
	location: string;
	severity: 'critical' | 'high' | 'medium';
	symptoms: string[];
	description: string;
	troubleshooting: string[];
	modelsNote?: string;
}

export interface DeviceModelInfo {
	code: string;
	marketingName: string;
	generation: string;
}

export const IPHONE_MODELS: Record<string, string> = {
	// iPhone 16 Series
	'iPhone17,1': 'iPhone 16 Pro',
	'iPhone17,2': 'iPhone 16 Pro Max',
	'iPhone17,3': 'iPhone 16',
	'iPhone17,4': 'iPhone 16 Plus',
	// iPhone 15 Series
	'iPhone16,1': 'iPhone 15 Pro',
	'iPhone16,2': 'iPhone 15 Pro Max',
	'iPhone15,4': 'iPhone 15',
	'iPhone15,5': 'iPhone 15 Plus',
	// iPhone 14 Series
	'iPhone15,2': 'iPhone 14 Pro',
	'iPhone15,3': 'iPhone 14 Pro Max',
	'iPhone14,7': 'iPhone 14',
	'iPhone14,8': 'iPhone 14 Plus',
	// iPhone 13 Series
	'iPhone14,2': 'iPhone 13 Pro',
	'iPhone14,3': 'iPhone 13 Pro Max',
	'iPhone14,4': 'iPhone 13 mini',
	'iPhone14,5': 'iPhone 13',
	// iPhone SE
	'iPhone14,6': 'iPhone SE (Gen 3)',
	'iPhone12,8': 'iPhone SE (Gen 2)',
	'iPhone8,4': 'iPhone SE (Gen 1)',
	// iPhone 12 Series
	'iPhone13,1': 'iPhone 12 mini',
	'iPhone13,2': 'iPhone 12',
	'iPhone13,3': 'iPhone 12 Pro',
	'iPhone13,4': 'iPhone 12 Pro Max',
	// iPhone 11 Series
	'iPhone12,1': 'iPhone 11',
	'iPhone12,3': 'iPhone 11 Pro',
	'iPhone12,5': 'iPhone 11 Pro Max',
	// iPhone X / XS / XR
	'iPhone11,2': 'iPhone XS',
	'iPhone11,4': 'iPhone XS Max',
	'iPhone11,6': 'iPhone XS Max (China)',
	'iPhone11,8': 'iPhone XR',
	'iPhone10,3': 'iPhone X (Global)',
	'iPhone10,6': 'iPhone X (GSM)',
	// iPhone 8 Series
	'iPhone10,1': 'iPhone 8 (Global)',
	'iPhone10,4': 'iPhone 8 (GSM)',
	'iPhone10,2': 'iPhone 8 Plus (Global)',
	'iPhone10,5': 'iPhone 8 Plus (GSM)',
	// iPhone 7 Series
	'iPhone9,1': 'iPhone 7 (Global)',
	'iPhone9,3': 'iPhone 7 (GSM)',
	'iPhone9,2': 'iPhone 7 Plus (Global)',
	'iPhone9,4': 'iPhone 7 Plus (GSM)'
};

export const PANIC_DATABASE: PanicSensorDef[] = [
	{
		code: 'mic1',
		name: 'Microphone 1 (Bottom Microphone)',
		component: 'Fleksibel Charging Port / Bawah (Dock Flex Assembly)',
		location: 'Bagian bawah bodi iPhone (konektor port charger & speaker bawah)',
		severity: 'critical',
		symptoms: [
			'iPhone restart otomatis setiap tepat 3 atau 5 menit (Watchdog timeout)',
			'Suara rekaman video kamera belakang atau memo suara bawah mati/gemerisik',
			'Bisa dicas tetapi sering restart sendiri saat digunakan'
		],
		description:
			'Sistem iOS (thermalmonitord) gagal membaca sinyal sensor suhu pada Microfon 1 yang terletak di fleksibel konektor charger bawah. Jika sensor tidak merespons dalam 180 detik, Watchdog akan merestart perangkat secara paksa.',
		troubleshooting: [
			'Lepas soket fleksibel charging port dari motherboard, lalu nyalakan perangkat menggunakan kabel wireless atau baterai untuk melihat apakah restart 3 menit berhenti.',
			'Ganti fleksibel dock charging port dengan sparepart baru (disarankan kualitas original/OEM bergaransi).',
			'Periksa soket FPC charging port di motherboard apakah ada pin kotor, korosi air, atau pin bengkok.',
			'Jika fleksibel baru tetap restart, ukur nilai resistansi/hambatan jalur I2C Mic 1 di sekitar konektor FPC motherboard.'
		],
		modelsNote: 'Umum terjadi pada iPhone 11, 11 Pro, 12, 12 Pro, 13, 13 Pro, 14, dan 15 series.'
	},
	{
		code: 'prs0',
		name: 'Barometer / Pressure Sensor 0',
		component: 'Fleksibel Charging Port / Barometer Bawah',
		location: 'Terpasang menyatu pada modul fleksibel port charger bawah',
		severity: 'critical',
		symptoms: [
			'Restart tepat 3 menit sekali',
			'Aplikasi kompas atau barometer ketinggian tidak responsif'
		],
		description:
			'Sensor tekanan udara (barometer prs0) yang menempel pada assembly fleksibel charging port tidak terdeteksi oleh CPU melalui jalur I2C.',
		troubleshooting: [
			'Ganti 1 set fleksibel charging port.',
			'Periksa jalur tegangan pendukung PP_VDD_MAIN dan jalur clock I2C ke barometer.'
		],
		modelsNote: 'Sering muncul bersamaan dengan error mic1 pada iPhone 11 ke atas.'
	},
	{
		code: 'mic2',
		name: 'Microphone 2 / Proximity Sensor',
		component: 'Fleksibel Speaker Atas / Kamera Depan (Front Sensor / Earpiece Flex)',
		location: 'Bagian atas layar dekat lubang speaker earpiece dan kamera TrueDepth',
		severity: 'critical',
		symptoms: [
			'iPhone restart otomatis tepat setiap 3 menit',
			'Layar tidak mati otomatis saat telepon ditempelkan ke telinga (Proximity mati)',
			'Fitur TrueTone atau Face ID kadang bermasalah jika fleksibel robek/korosi'
		],
		description:
			'Thermalmonitord kehilangan pembacaan sensor suhu dari Mikrofon 2 / Proximity yang ada pada fleksibel speaker earpiece atas. Kerusakan umumnya akibat terkena cairan dari lubang earpiece atau sobek saat pergantian LCD.',
		troubleshooting: [
			'Lepas soket fleksibel speaker atas dari motherboard, lalu tes iPhone selama lebih dari 5 menit. Jika tidak restart, dipastikan sumber masalah di modul atas.',
			'Bersihkan soket earpiece dari sisa korosi atau cairan dengan cairan contact cleaner/IPA.',
			'Ganti fleksibel sensor speaker atas. Catatan: Pergantian tanpa memindahkan sensor Face ID/Flood Illuminator asli akan menonaktifkan Face ID / True Tone.'
		],
		modelsNote: 'Sangat sering terjadi pada iPhone X, XR, XS, 11, 12, 13, 14 series.'
	},
	{
		code: 'prx',
		name: 'Proximity Sensor',
		component: 'Fleksibel Sensor Depan / Earpiece',
		location: 'Modul sensor atas layar',
		severity: 'critical',
		symptoms: [
			'Restart periodik 3-5 menit',
			'Proximity sensor tidak mendeteksi objek saat panggilan'
		],
		description:
			'Komunikasi I2C ke sensor proximity terputus, memicu Watchdog timeout restart.',
		troubleshooting: [
			'Tes cabut soket speaker atas dan amati apakah restart hilang.',
			'Cek kondisi fisik fleksibel sensor apakah ada lipatan tajam atau bekas cairan.'
		]
	},
	{
		code: 'tg0b',
		name: 'Battery Gas Gauge 0 (Battery Gauge)',
		component: 'Konektor Baterai / BMS Board Baterai / Jalur SWI/I2C Baterai',
		location: 'Modul board baterai dan soket FPC baterai di motherboard',
		severity: 'critical',
		symptoms: [
			'Persentase baterai macet (misal tetap 1% atau 100%)',
			'iPhone restart tiba-tiba saat dicas atau saat beban kerja tinggi',
			'Kesehatan baterai (Battery Health) muncul strip (-) atau Service'
		],
		description:
			'CPU tidak dapat berkomunikasi dengan chip Gas Gauge (BMS) baterai untuk membaca kapasitas, arus, dan suhu sel baterai melalui jalur data (HDQ/SWI/I2C).',
		troubleshooting: [
			'Coba ganti dengan baterai lain yang normal dan teruji.',
			'Periksa pin tengah (Sense / Data SWI) pada soket baterai motherboard apakah longgar, patah, atau terangkat.',
			'Periksa resistor pull-up dan diode zener pelindung jalur data baterai di motherboard.',
			'Jika baterai baru saja diganti cell/bms, pastikan titik pengelasan nikel BMS rapat dan tidak konslet.'
		]
	},
	{
		code: 'tg0v',
		name: 'Battery Voltage Sensor',
		component: 'Sirkuit Pemantau Tegangan Baterai / IC Power (PMIC)',
		location: 'Motherboard sekitar PMIC dan konektor baterai',
		severity: 'high',
		symptoms: ['Restart saat tegangan drop', 'Persentase baterai loncat-loncat'],
		description:
			'Tegangan baterai tidak terbaca secara valid oleh sensor ADC PMIC.',
		troubleshooting: [
			'Periksa tegangan baterai menggunakan multimeter.',
			'Pastikan soket baterai terpasang rapat dan baut plat penutup baterai terpasang.'
		]
	},
	{
		code: 'wdt timeout',
		name: 'Watchdog Timer Timeout',
		component: 'SMC / PMU Watchdog (Kegagalan Respons Sensor / Bus)',
		location: 'Sub-sistem Power Management / Jalur Sensor I2C/SPI',
		severity: 'critical',
		symptoms: [
			'iPhone restart sendiri tepat pada interval 180 detik (3 menit) atau 300 detik (5 menit)',
			'Sering diawali dengan animasi freeze atau respring beberapa detik sebelum layar mati'
		],
		description:
			'Watchdog adalah pengawas keamanan hardware iOS. Jika ada komponen/sensor wajib yang tidak memberi sinyal "heartbeat" dalam jangka waktu tertentu, CPU menganggap sistem macet dan memutus daya untuk restart darurat.',
		troubleshooting: [
			'Cari baris "Missing sensor(s)" di dalam panic log untuk mengetahui sensor spesifik (misal: mic1, mic2, prs0, tg0b).',
			'Jika tidak ada missing sensor tertulis, periksa bitmask register (misal 0x80000 = mic1 charging flex pada iPhone 11/12).'
		]
	},
	{
		code: 'i2c0',
		name: 'I2C Bus 0 Communication Failure',
		component: 'Jalur Bus Data I2C0 (PMIC, Display, Touch, Charging)',
		location: 'Jalur interkoneksi motherboard (Layer board atas/bawah)',
		severity: 'critical',
		symptoms: ['Bootloop', 'Restart saat membuka aplikasi tertentu', 'Layar blank sesaat'],
		description:
			'Jalur komunikasi serial I2C0 mengalami hanging, pull-up resistor putus, atau salah satu IC yang terhubung short ke ground.',
		troubleshooting: [
			'Periksa nilai impedansi di pin SDA dan SCL pada konektor yang terkait dengan bus I2C0.',
			'Lepas komponen peripheral satu per satu (Kamera depan, kamera belakang, port cas) untuk mencari komponen yang membebani bus.'
		]
	},
	{
		code: 'i2c1',
		name: 'I2C Bus 1 Communication Failure',
		component: 'Jalur Bus Data I2C1 (Audio Codec, Tigris/Hydra, Sensor)',
		location: 'Motherboard',
		severity: 'critical',
		symptoms: ['Restart acak', 'Fitur audio atau charging bermasalah'],
		description:
			'Terjadi time-out pada transaksi bus I2C1.',
		troubleshooting: [
			'Periksa IC yang terhubung pada jalur I2C1 (seperti Audio Codec, Tristar/Hydra).',
			'Cek apakah ada korosi atau bekas jatuh yang menyebabkan jalur antar layer (interposer) retak.'
		]
	},
	{
		code: 'i2c2',
		name: 'I2C Bus 2 Communication Failure',
		component: 'Jalur Bus Data I2C2 (NFC, Wireless Charging, Barometer)',
		location: 'Motherboard & Fleksibel Belakang',
		severity: 'high',
		symptoms: ['Restart periodik', 'NFC / Apple Pay gagal', 'Wireless charge tidak jalan'],
		description:
			'Koneksi komunikasi data I2C2 terputus atau short.',
		troubleshooting: [
			'Lepas fleksibel koil wireless charging / NFC belakang.',
			'Ukur hambatan dalam jalur I2C2 SCL/SDA di motherboard.'
		]
	},
	{
		code: 'i2c3',
		name: 'I2C Bus 3 Communication Failure',
		component: 'Jalur Bus Data I2C3 (Kamera / Sensor Hub)',
		location: 'Motherboard',
		severity: 'high',
		symptoms: ['Kamera hitam / tidak terbuka', 'Restart saat membuka kamera'],
		description:
			'Gangguan komunikasi pada bus I2C3 yang umumnya melayani modul kamera atau sensor gerak.',
		troubleshooting: [
			'Coba lepas modul kamera belakang dan kamera depan.',
			'Tes unit tanpa kamera apakah masih terjadi panic restart.'
		]
	},
	{
		code: 'ans2',
		name: 'Apple NVMe NAND Storage Subsystem 2',
		component: 'IC NAND Flash Memory (Storage Internal)',
		location: 'Motherboard (Chip Memory Storage)',
		severity: 'critical',
		symptoms: [
			'iPhone sering freeze mendadak lalu restart',
			'Gagal restore di 3uTools / iTunes (Error 9, Error 4013, Error 4014)',
			'Penyimpanan penuh atau sering korup data'
		],
		description:
			'Kernel mengalami I/O failure saat membaca atau menulis partisi penyimpanan internal NAND Flash. Menandakan chip NAND mulai aus, bad sector, atau solderan bola timah di bawah IC NAND retak akibat benturan.',
		troubleshooting: [
			'Cadangkan data penting segera selagi perangkat masih sempat hidup.',
			'Coba lakukan Clean Restore firmware via DFU mode.',
			'Jika tetap gagal atau keluar Error 4013/9, diperlukan proses reballing atau penggantian IC NAND oleh teknisi spesialis mikrosolder.'
		]
	},
	{
		code: 'nvme',
		name: 'NVMe Storage Driver Panic',
		component: 'IC Storage NAND Flash / Controller PCIe',
		location: 'Motherboard',
		severity: 'critical',
		symptoms: ['Stuck di logo Apple', 'Error 4013 saat restore', 'Restart saat loading OS'],
		description:
			'PCIe controller gagal berkomunikasi dengan chip penyimpanan internal NVMe.',
		troubleshooting: [
			'Periksa tegangan supply NAND: 0.9V, 1.8V, dan 2.5V.',
			'Periksa jalur PCIe coupling capacitor ke CPU.'
		]
	},
	{
		code: 'AOP PANIC',
		name: 'Always-On Processor Panic',
		component: 'AOP Sensor Hub / Audio DSP / Sensor Gerak (Gyro/Accel)',
		location: 'Motherboard / Sensor Terkait',
		severity: 'high',
		symptoms: [
			'Layar tidak mau berputar otomatis (Auto-rotate mati)',
			'Raise to wake tidak aktif',
			'Restart saat memutar audio atau merekam'
		],
		description:
			'Sub-prosesor Always-On (AOP) yang menangani sensor gerak, mic low-power, dan DSP mengalami firmware crash.',
		troubleshooting: [
			'Periksa sensor Gyroscope/Accelerometer di motherboard.',
			'Lepas fleksibel mic dan sensor eksternal untuk isolasi masalah.'
		]
	},
	{
		code: 'sep-firmware',
		name: 'Secure Enclave Processor (SEP)',
		component: 'Hardware Keamanan SEP / Face ID / Touch ID',
		location: 'Motherboard & Modul Biometrik',
		severity: 'critical',
		symptoms: ['Face ID / Touch ID mati permanen', 'Restart acak', 'Error saat aktivasi'],
		description:
			'Secure Enclave Processor mendeteksi kegagalan integritas hardware atau mismatch modul biometrik.',
		troubleshooting: [
			'Periksa apakah fleksibel FaceID/TouchID robek atau terkena cairan.',
			'Pastikan komponen biometrik terpasang dengan presisi.'
		]
	},
	{
		code: '0x80000',
		name: 'Thermalmonitord Bitmask 0x80000',
		component: 'Fleksibel Charging Port (Mic 1)',
		location: 'Konektor Charger Bawah',
		severity: 'critical',
		symptoms: ['Restart 3 menit pada iPhone 11 series'],
		description:
			'Bitmask register 0x80000 pada Watchdog mengindikasikan ketiadaan respon dari sensor mic1 port cas pada lini iPhone 11.',
		troubleshooting: ['Ganti 1 set fleksibel charging port bawah original.']
	},
	{
		code: '0x40000',
		name: 'Thermalmonitord Bitmask 0x40000',
		component: 'Fleksibel Speaker Atas (Mic 2 / Proximity)',
		location: 'Speaker Atas / Layar',
		severity: 'critical',
		symptoms: ['Restart 3 menit pada iPhone 11 Pro / Pro Max'],
		description:
			'Bitmask 0x40000 mengindikasikan sensor mic2 earpiece tidak merespons.',
		troubleshooting: ['Tes lepas soket earpiece speaker atas atau ganti fleksibel sensor atas.']
	},
	{
		code: '0x20000',
		name: 'Thermalmonitord Bitmask 0x20000',
		component: 'Fleksibel Charging Port / Barometer (iPhone 12 Series)',
		location: 'Konektor Bawah iPhone 12',
		severity: 'critical',
		symptoms: ['Restart 3 menit pada iPhone 12 / 12 Pro / 12 Pro Max'],
		description:
			'Bitmask 0x20000 pada iPhone 12 series menandakan putusnya sensor pada fleksibel charging port.',
		troubleshooting: ['Ganti fleksibel charging port bawah.']
	},
	{
		code: '0x4000',
		name: 'Thermalmonitord Bitmask 0x4000',
		component: 'Fleksibel Koil Wireless Charging / NFC',
		location: 'Housing Belakang iPhone',
		severity: 'high',
		symptoms: ['Restart setelah 3-5 menit', 'Wireless charging tidak responsif'],
		description:
			'Sensor suhu pada modul wireless charging belakang tidak terbaca.',
		troubleshooting: ['Periksa fleksibel wireless charging di bagian belakang baterai.']
	}
];

export interface ParsedPanicResult {
	incidentId: string;
	crashReporterKey: string;
	date: string;
	deviceModelCode: string;
	deviceModelName: string;
	osVersion: string;
	osBuild: string;
	panicString: string;
	debuggerMessage: string;
	missingSensors: string[];
	suspects: PanicSensorDef[];
	primarySuspect: PanicSensorDef | null;
	evidenceLines: string[];
	isWatchdogTimeout: boolean;
	summaryStatus: 'high_confidence' | 'medium_confidence' | 'generic_panic';
}

export function parsePanicLog(text: string): ParsedPanicResult {
	const lines = text.split('\n');

	let incidentId = '';
	let crashReporterKey = '';
	let date = '';
	let deviceModelCode = '';
	let osVersion = '';
	let osBuild = '';
	let panicString = '';
	let debuggerMessage = '';
	const evidenceLines: string[] = [];

	// Try extracting header metadata
	for (const line of lines) {
		const trimmed = line.trim();
		if (!incidentId && /incident\s*identifier/i.test(trimmed)) {
			incidentId = trimmed.split(/:\s*/)[1] || '';
		}
		if (!crashReporterKey && /crashreporter\s*key/i.test(trimmed)) {
			crashReporterKey = trimmed.split(/:\s*/)[1] || '';
		}
		if (!date && /^Date:\s*(.+)$/i.test(trimmed)) {
			date = trimmed.replace(/^Date:\s*/i, '');
		}
		if (!deviceModelCode) {
			const modelMatch = trimmed.match(/iPhone\d+,\d+|iPad\d+,\d+|Watch\d+,\d+/i);
			if (modelMatch) {
				deviceModelCode = modelMatch[0];
			}
		}
		if (!osVersion && /OS\s*Version:\s*(.+)$/i.test(trimmed)) {
			const rawOs = trimmed.replace(/^OS\s*Version:\s*/i, '');
			osVersion = rawOs;
			const buildMatch = rawOs.match(/\(([^)]+)\)/);
			if (buildMatch) {
				osBuild = buildMatch[1];
			}
		}
		if (!panicString && /"panicString"\s*:\s*"([^"]+)"/i.test(trimmed)) {
			const m = trimmed.match(/"panicString"\s*:\s*"([^"]+)"/i);
			if (m) panicString = m[1].replace(/\\n/g, '\n');
		}
		if (!debuggerMessage && /Debugger message:\s*(.+)$/i.test(trimmed)) {
			debuggerMessage = trimmed.replace(/Debugger message:\s*/i, '');
		}
	}

	// If panicString was not JSON formatted, find it in raw text
	if (!panicString) {
		const panicIdx = lines.findIndex((l) => /panic\s*\(cpu|\bpanicString\b/i.test(l));
		if (panicIdx !== -1) {
			panicString = lines.slice(panicIdx, panicIdx + 6).join('\n');
		} else {
			panicString = lines.slice(0, 10).join('\n');
		}
	}

	const fullSearchText = (text + '\n' + panicString).toLowerCase();

	const isWatchdogTimeout =
		/wdt timeout|watchdog|thermalmonitord|userspace watchdog timeout/i.test(fullSearchText);

	// Extract missing sensors (e.g., "Missing sensor(s): mic1, prs0")
	// Handle raw text as well as escaped JSON strings (\\n, \\r, etc.)
	const missingSensors: string[] = [];
	const missingMatch = (panicString + '\n' + text).match(/missing\s*sensor\(s\)\s*:\s*([^\r\n\\"]+)/i);
	if (missingMatch) {
		const rawSensors = missingMatch[1].replace(/\\n.*$/i, '').trim();
		evidenceLines.push(`Missing sensor(s): ${rawSensors}`);
		const parts = rawSensors.split(/[\s,]+/);
		for (const p of parts) {
			const clean = p.replace(/[^a-z0-9_-]/gi, '').trim().toLowerCase();
			if (
				clean &&
				clean.length >= 2 &&
				clean.length <= 15 &&
				!['service', 'total', 'checkins', 'seconds', 'last', 'from', 'none'].includes(clean) &&
				!missingSensors.includes(clean)
			) {
				missingSensors.push(clean);
			}
		}
	}

	// Collect suspect definitions
	const matchedSuspects: PanicSensorDef[] = [];

	// Match direct missing sensors first
	for (const s of missingSensors) {
		const found = PANIC_DATABASE.find(
			(def) => def.code.toLowerCase() === s || def.code.toLowerCase().includes(s)
		);
		if (found && !matchedSuspects.some((x) => x.code === found.code)) {
			matchedSuspects.push(found);
		}
	}

	// Match from full panic text against database codes
	for (const def of PANIC_DATABASE) {
		if (matchedSuspects.some((x) => x.code === def.code)) continue;

		const target = def.code.toLowerCase();
		if (fullSearchText.includes(target)) {
			matchedSuspects.push(def);
			// Grab matching evidence line
			const evLine = lines.find((l) => l.toLowerCase().includes(target));
			if (evLine && !evidenceLines.includes(evLine.trim())) {
				evidenceLines.push(evLine.trim());
			}
		}
	}

	// If watchdog timeout was found but no specific sensor, include watchdog entry
	if (isWatchdogTimeout && !matchedSuspects.some((x) => x.code === 'wdt timeout')) {
		const wdt = PANIC_DATABASE.find((d) => d.code === 'wdt timeout');
		if (wdt) matchedSuspects.push(wdt);
	}

	const deviceModelName = IPHONE_MODELS[deviceModelCode] || deviceModelCode || 'iPhone (Model tidak dikenal)';

	let summaryStatus: 'high_confidence' | 'medium_confidence' | 'generic_panic' = 'generic_panic';
	if (missingSensors.length > 0 || (matchedSuspects.length > 0 && matchedSuspects[0].severity === 'critical')) {
		summaryStatus = 'high_confidence';
	} else if (matchedSuspects.length > 0) {
		summaryStatus = 'medium_confidence';
	}

	return {
		incidentId: incidentId || 'Tidak tercatat',
		crashReporterKey: crashReporterKey || '-',
		date: date || 'Tidak tercantum di log',
		deviceModelCode,
		deviceModelName,
		osVersion: osVersion || '-',
		osBuild: osBuild || '-',
		panicString: panicString.trim(),
		debuggerMessage: debuggerMessage || '-',
		missingSensors,
		suspects: matchedSuspects,
		primarySuspect: matchedSuspects[0] || null,
		evidenceLines: evidenceLines.slice(0, 5),
		isWatchdogTimeout,
		summaryStatus
	};
}
