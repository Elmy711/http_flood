import http from 'k6/http';
import { sleep, check } from 'k6';

// 1. Konfigurasi Skenario Pengujian (Opsi)
export const options = {
    stages: [
        { duration: '30s', target: 10 },  // Naikkan dari 0 ke 10 user dalam 30 detik
        { duration: '1m', target: 50 },   // Naikkan lagi dari 10 ke 50 user dalam 1 menit
        { duration: '30s', target: 0 },   // Turunkan kembali ke 0 user dalam 30 detik
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],   // Pengujian dianggap gagal jika error > 5%
        http_req_duration: ['p(95)<2000'], // 95% request harus di bawah 2 detik (2000ms)
    },
};

// 2. Alur Eksekusi Setiap Virtual User (VU)
export default function () {
    const url = 'https://sayarut.org.il/';

    // Menambahkan Header agar menyerupai browser asli (menghindari blokir instan)
    const params = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Connection': 'keep-alive',
        },
    };

    // Mengirim HTTP GET request
    const res = http.get(url, params);

    // Memeriksa apakah status respon adalah 200 OK
    check(res, {
        'status is 200': (r) => r.status === 200,
        'is not blocked (403)': (r) => r.status !== 403,
        'is not rate limited (429)': (r) => r.status !== 429,
    });

    // Jeda singkat antar request untuk meniru perilaku manusia (1 detik)
    // Jika ingin menguji performa ekstrem, bagian sleep ini bisa dihapus
    sleep(1);
}
