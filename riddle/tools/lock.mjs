#!/usr/bin/env node
// Makes the "lock" block for a riddle file, so the page can only show the word once the player
// gets everything right. Neither the word nor the settings that open it are stored anywhere.
//
// A key (riddles/*.json, key.lock): the tooth levels, left to right.
//   node lock.mjs 2,3,1,4,4,2 "word"      (made-up levels)
//
// The lighting console (riddles/*.json, console.lock): every setting on the console.
//   node lock.mjs --console --pillars 2,5,2 --glass 0,1,0 \
//     --stages square,none,circle --benches triangle,4 --stripes 9 "word"      (made-up settings)
//   pillars  each fader, left to right (the number of pillars in its group)
//   glass    each fader's glass button, 1 = on
//   stages   the three stage pads, left to right: circle, square, triangle or none
//   benches  the benches' shape (sine, square, triangle or saw) and how many there are
//   stripes  how many light stripes
//
// A word the player spells out letter by letter (riddles/*.json, skyline.lock): the word opens the lock,
// and the page then shows the text locked with it (the word itself if none is given).
//   node lock.mjs --answer "WORD" ["text to show"]
// Letters are compared without spaces, in capitals, with Hebrew letters read as their Latin sound.
//
// Paste the printed JSON into the riddle file. Needs Node 20 or newer.
const args = process.argv.slice(2)
const fail = (msg) => {
  console.error(msg)
  process.exit(1)
}

// The text the lock is made from. The page builds exactly the same text from the player's settings.
// The same letter rules as the page (riddle/index.html, normLetters).
const HE = {'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H', 'ו': 'V', 'ז': 'Z', 'ח': 'H', 'ט': 'T', 'י': 'Y', 'כ': 'K', 'ך': 'K', 'ל': 'L', 'מ': 'M', 'ם': 'M',
  'נ': 'N', 'ן': 'N', 'ס': 'S', 'ע': 'A', 'פ': 'P', 'ף': 'P', 'צ': 'T', 'ץ': 'T', 'ק': 'K', 'ר': 'R', 'ש': 'S', 'ת': 'T'}
const normLetters = (s) => [...s].map((c) => HE[c] || c.toUpperCase()).filter((c) => /[A-Z0-9]/.test(c)).join('')

let secret, word, extra = {}
if (args[0] === '--answer') {
  const [, answer, shown] = args
  if (!answer || !normLetters(answer)) fail('Usage: node lock.mjs --answer "WORD" ["text to show"]')
  word = shown || answer
  secret = 'answer|' + normLetters(answer)
} else if (args[0] === '--console') {
  const opt = {}
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]
    else word = args[i]
  }
  for (const k of ['pillars', 'glass', 'stages', 'benches', 'stripes']) if (!opt[k]) fail(`Missing --${k}`)
  const list = (s) => s.split(/[\s,]+/).filter(Boolean)
  const pillars = list(opt.pillars).map(Number)
  const glass = list(opt.glass).map(Number)
  const stages = list(opt.stages)
  const [shape, benches] = list(opt.benches)
  const stripes = Number(opt.stripes)
  if (pillars.some((n) => !Number.isInteger(n) || n < 0)) fail('--pillars: whole numbers, one per fader')
  if (glass.length !== pillars.length || glass.some((n) => n !== 0 && n !== 1)) fail('--glass: 1 or 0 for each fader')
  if (stages.some((s) => !['circle', 'square', 'triangle', 'none'].includes(s))) fail('--stages: circle, square, triangle or none')
  if (!['sine', 'square', 'triangle', 'saw'].includes(shape) || !Number.isInteger(Number(benches))) fail('--benches: a shape and a number, e.g. saw,5')
  if (!Number.isInteger(stripes)) fail('--stripes: a whole number')
  secret = ['console', pillars.join(','), glass.join(','), stages.join(','), `${shape},${Number(benches)}`, stripes].join('|')
} else {
  const [seqArg, w] = args
  word = w
  if (!seqArg) fail('Usage: node lock.mjs <tooth levels, comma separated, 1 = lowest> "<word>"   (or --console, see the top of this file)')
  const levels = seqArg.split(/[\s,]+/).filter(Boolean).map(Number)
  if (!levels.length || levels.some((n) => !Number.isInteger(n) || n < 1 || n > 9)) fail('Tooth levels must be whole numbers from 1 to 9')
  secret = levels.join('')
  extra = {teeth: levels.length}
}
if (!word) fail('Give the word to lock, in quotes, at the end')

const {subtle} = globalThis.crypto
const iterations = 150000
const salt = crypto.getRandomValues(new Uint8Array(16))
const iv = crypto.getRandomValues(new Uint8Array(12))
const base = await subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey'])
const key = await subtle.deriveKey({name: 'PBKDF2', salt, iterations, hash: 'SHA-256'}, base, {name: 'AES-GCM', length: 256}, false, ['encrypt'])
const data = new Uint8Array(await subtle.encrypt({name: 'AES-GCM', iv}, key, new TextEncoder().encode(word)))
const b64 = (a) => Buffer.from(a).toString('base64')
console.log(JSON.stringify({...extra, iterations, salt: b64(salt), iv: b64(iv), data: b64(data)}, null, 2))
