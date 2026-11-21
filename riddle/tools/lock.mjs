#!/usr/bin/env node
// Makes the "lock" block for a key riddle (riddles/*.json, key.lock).
// The word is encrypted with the tooth sequence, so the page can only show it
// once the player sets every tooth right. Neither the word nor the sequence is stored anywhere.
//
//   node lock.mjs 4,4,3,3,1,1 "word"
//
// Paste the printed JSON into the riddle file as key.lock. Needs Node 20 or newer.
const [seqArg, word] = process.argv.slice(2)
if (!seqArg || !word) {
  console.error('Usage: node lock.mjs <tooth levels, comma separated, 1 = lowest> "<word>"')
  process.exit(1)
}
const levels = seqArg.split(/[\s,]+/).filter(Boolean).map(Number)
if (!levels.length || levels.some((n) => !Number.isInteger(n) || n < 1 || n > 9)) {
  console.error('Tooth levels must be whole numbers from 1 to 9')
  process.exit(1)
}
const {subtle} = globalThis.crypto
const iterations = 150000
const salt = crypto.getRandomValues(new Uint8Array(16))
const iv = crypto.getRandomValues(new Uint8Array(12))
const base = await subtle.importKey('raw', new TextEncoder().encode(levels.join('')), 'PBKDF2', false, ['deriveKey'])
const key = await subtle.deriveKey({name: 'PBKDF2', salt, iterations, hash: 'SHA-256'}, base, {name: 'AES-GCM', length: 256}, false, ['encrypt'])
const data = new Uint8Array(await subtle.encrypt({name: 'AES-GCM', iv}, key, new TextEncoder().encode(word)))
const b64 = (a) => Buffer.from(a).toString('base64')
console.log(JSON.stringify({teeth: levels.length, iterations, salt: b64(salt), iv: b64(iv), data: b64(data)}, null, 2))
