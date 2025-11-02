import time
from pathlib import Path

try:
    from pyngrok import ngrok
except Exception as e:
    print("pyngrok not installed:", e)
    raise

out_file = Path(r"C:\LeafLens\tunnel_url.txt")

# Open HTTP tunnel to local FastAPI on port 8000
tunnel = ngrok.connect(8000, proto="http")
url = tunnel.public_url

out_file.write_text(url, encoding="utf-8")
print("Tunnel URL:", url)

# Keep the tunnel alive
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    pass