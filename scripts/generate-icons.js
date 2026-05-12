// Generates minimal solid-color PNG icons — no extra npm packages needed
import { writeFileSync, mkdirSync } from "fs";
import { deflateSync } from "zlib";

function createPNG(size, r, g, b) {
  const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const table = Array.from({ length: 256 }, (_, i) => {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
  });

  function crc(typeStr, data) {
    const type = Buffer.from(typeStr, "ascii");
    const all = Buffer.concat([type, data]);
    let c = 0xffffffff;
    for (const b of all) c = table[(c ^ b) & 0xff] ^ (c >>> 1);
    c = (c ^ 0xffffffff) >>> 0;
    const out = Buffer.alloc(4);
    out.writeUInt32BE(c);
    return out;
  }

  function chunk(typeStr, data) {
    const type = Buffer.from(typeStr, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    return Buffer.concat([len, type, data, crc(typeStr, data)]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // width
  ihdr.writeUInt32BE(size, 4); // height
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB

  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const off = y * (1 + size * 3);
    raw[off] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      raw[off + 1 + x * 3] = r;
      raw[off + 2 + x * 3] = g;
      raw[off + 3 + x * 3] = b;
    }
  }

  return Buffer.concat([
    SIG,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("assets", { recursive: true });

// Blue: #0ea5e9
for (const size of [16, 32, 48, 128]) {
  writeFileSync(`assets/icon${size}.png`, createPNG(size, 14, 165, 233));
  console.log(`Created assets/icon${size}.png`);
}
