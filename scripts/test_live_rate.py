import urllib.request

url = 'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/rbgold'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        rawData = resp.read().decode('utf-8', errors='ignore')

    lines = rawData.strip().splitlines()
    parsed_rate = None
    for line in lines:
        parts = [p.strip() for p in line.split('\t') if p.strip()]
        if len(parts) >= 3:
            name = parts[1]
            if 'silver 999' in name.lower():
                for p in parts[2:]:
                    try:
                        val = float(p)
                        if val > 1000:
                            parsed_rate = round(val / 1000, 2)
                            print(f'Matched item "{name}" with raw value {val} -> Live Silver Rate per gram: Rs. {parsed_rate}')
                            break
                    except: pass
                if parsed_rate: break
except Exception as e:
    print('Error:', e)
