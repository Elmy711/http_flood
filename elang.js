import http from 'k6/http';
import { sleep, check } from 'k6';

// Konfigurasi dinamis yang diambil langsung dari input terminal
export const options = {
    scenarios: {
        manual_load: {
            executor: 'constant-vus',
            vus: parseInt(__ENV.VUS) || 10,           // Default: 10 user jika tidak diisi
            duration: __ENV.DURATION || '30s',        // Default: 30 detik jika tidak diisi
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.10'], // Toleransi error maksimal 10%
    },
};

export default function () {
    // Ambil input target, jika kosong otomatis pakai localhost
    const target = __ENV.TARGET || 'http://127.0.0.1:8080/';

    const params = {
        headers: {
            'User-Agent': 'k6-Manual-Dynamic-Test',
            'Connection': 'keep-alive',
        },
    };

    const res = http.get(target, params);

    // Cek respon server
    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    // Mengatur jeda secara manual (0 = tanpa jeda/agresif, 1 = jeda 1 detik)
    const sleepTime = parseFloat(__ENV.SLEEP) || 0;
    if (sleepTime > 0) {
        sleep(sleepTime);
    }
}
