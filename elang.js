import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 10 },  // Naik ke 10 user dalam 10 detik
        { duration: '20s', target: 25 },  // Naik ke 25 user dalam 20 detik
        { duration: '10s', target: 0 },   // Turun kembali ke 0
    ],
};

export default function () {
    // Mengambil input dari terminal. Jika tidak diisi, otomatis pakai localhost:8080
    const target = __ENV.TARGET || 'http://localhost:8080/';

    const params = {
        headers: {
            'User-Agent': 'k6-Dynamic-LoadTest',
            'Connection': 'keep-alive',
        },
    };

    const res = http.get(target, params);

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}
