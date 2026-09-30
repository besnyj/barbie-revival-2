"""Inspect original SWF headers and printable strings without executing them."""
import pathlib, re, struct, sys, zlib
for name in sys.argv[1:]:
    p = pathlib.Path(name)
    data = p.read_bytes()
    print('\nFILE', name, 'bytes', len(data), 'signature', data[:3])
    if data[:3] == b'CWS':
        data = data[:8] + zlib.decompress(data[8:])
    for value in re.findall(rb'[\x20-\x7e]{5,}', data):
        print(value.decode('ascii'))
