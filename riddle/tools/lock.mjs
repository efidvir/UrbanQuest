#!/usr/bin/env node
// Makes the "lock" block for a riddle file, so the page can only show the word once the player
// gets everything right. Neither the word nor the settings that open it are stored anywhere.
//
// A key (riddles/*.json, key.lock): the tooth levels, left to right.
//   node lock.mjs 2,3,1,4,4,2,3,1,2,4 "word"      (made-up levels)
// A key with nine teeth or more is also locked in three parts (about a third of the teeth each), so
// after a wrong try the page can tell players which part of the key already fits. Choose the parts
// with --parts 4,3,3 (teeth per part, left to right), or leave them out with --parts 0.
//
// The lighting console (riddles/*.json, console.lock): every setting on the console.
//   node lock.mjs --console --pillars 2,5,2 --glass 0,1,0 \
//     --stages square,none,circle --benches triangle,4 --stripes 9 "word"      (made-up settings)
//   pillars  each fader, left to right (the number of pillars in its group)
//   glass    each fader's glass button, 1 = on
//   stages   the three stage pads, left to right: circle, square, triangle or none
//   benches  the benches' shape (sine, square, triangle or saw) and how many there are
//   stripes  how many light stripes
// Each of the four parts (pillars, stages, benches, stripes) is locked on its own, so after GO the
// page can light up the parts that are right. A count that's uncertain on site can take either
// value with a slash: --benches triangle,4/5 accepts 4 or 5 benches.
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

const {subtle} = globalThis.crypto
const enc = new TextEncoder()
const b64 = (a) => Buffer.from(a).toString('base64')
const random = (n) => crypto.getRandomValues(new Uint8Array(n))

// One lock: the text, encrypted with a key made from the secret (PBKDF2, then AES-GCM).
// The page builds exactly the same secret from the player's settings.
const lockWith = async (secret, text, iterations) => {
  const salt = random(16)
  const iv = random(12)
  const base = await subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey'])
  const key = await subtle.deriveKey({name: 'PBKDF2', salt, iterations, hash: 'SHA-256'}, base, {name: 'AES-GCM', length: 256}, false, ['encrypt'])
  const data = new Uint8Array(await subtle.encrypt({name: 'AES-GCM', iv}, key, enc.encode(text)))
  return {salt: b64(salt), iv: b64(iv), data: b64(data)}
}

// The same letter rules as the page (riddle/index.html, normLetters).
const HE = {'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H', 'ו': 'V', 'ז': 'Z', 'ח': 'H', 'ט': 'T', 'י': 'Y', 'כ': 'K', 'ך': 'K', 'ל': 'L', 'מ': 'M', 'ם': 'M',
  'נ': 'N', 'ן': 'N', 'ס': 'S', 'ע': 'A', 'פ': 'P', 'ף': 'P', 'צ': 'T', 'ץ': 'T', 'ק': 'K', 'ר': 'R', 'ש': 'S', 'ת': 'T'}
const normLetters = (s) => [...s].map((c) => HE[c] || c.toUpperCase()).filter((c) => /[A-Z0-9]/.test(c)).join('')

const list = (s) => String(s).split(/[\s,]+/).filter(Boolean)
// "3,16/17,2" → [[3,16,2], [3,17,2]]: every combination of the alternatives.
const choices = (items) => items.reduce((all, item) => all.flatMap((pre) => item.split('/').map((v) => [...pre, v])), [[]])

let out
if (args[0] === '--answer') {
  const [, answer, shown] = args
  if (!answer || !normLetters(answer)) fail('Usage: node lock.mjs --answer "WORD" ["text to show"]')
  out = {iterations: 150000, ...await lockWith('answer|' + normLetters(answer), shown || answer, 150000)}
} else if (args[0] === '--console') {
  const opt = {}
  let word
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]
    else word = args[i]
  }
  for (const k of ['pillars', 'glass', 'stages', 'benches', 'stripes']) if (!opt[k]) fail(`Missing --${k}`)
  if (!word) fail('Give the word to lock, in quotes, at the end')
  const whole = (v) => /^\d+$/.test(v)
  const pillars = choices(list(opt.pillars))
  const glass = list(opt.glass)
  const stages = list(opt.stages)
  const [shape, counts] = list(opt.benches)
  const benches = String(counts || '').split('/')
  const stripes = String(opt.stripes).split('/')
  if (pillars.some((p) => p.some((n) => !whole(n)))) fail('--pillars: whole numbers, one per fader (16/17 for either)')
  if (glass.length !== pillars[0].length || glass.some((n) => n !== '0' && n !== '1')) fail('--glass: 1 or 0 for each fader')
  if (stages.some((s) => !['circle', 'square', 'triangle', 'none'].includes(s))) fail('--stages: circle, square, triangle or none')
  if (!['sine', 'square', 'triangle', 'saw'].includes(shape) || benches.some((n) => !whole(n))) fail('--benches: a shape and a number, e.g. saw,5 (or saw,5/6)')
  if (stripes.some((n) => !whole(n))) fail('--stripes: a whole number (or 15/16)')
  const num = (n) => String(Number(n))
  // The four parts of the console, each with every setting that counts as right for it.
  // Keep in step with cvPartSecret in riddle/index.html.
  const parts = {
    pillars: pillars.map((p) => `console|pillars|${p.map(num).join(',')}|${glass.join(',')}`),
    stages: [`console|stages|${stages.join(',')}`],
    benches: benches.map((n) => `console|benches|${shape},${num(n)}`),
    stripes: stripes.map((n) => `console|stripes|${num(n)}`),
  }
  if (Object.values(parts).some((v) => v.length > 12)) fail('Too many alternatives in one part (twelve at most)')
  // Each part opens a random share; all four shares together make the key to the word.
  const iterations = 60000
  const shares = {}
  const sections = {}
  for (const [k, secrets] of Object.entries(parts)) {
    shares[k] = b64(random(16))
    sections[k] = []
    for (const s of secrets) sections[k].push(await lockWith(s, shares[k], iterations))
  }
  const keyBytes = await subtle.digest('SHA-256', enc.encode('console|' + ['pillars', 'stages', 'benches', 'stripes'].map((k) => shares[k]).join('|')))
  const key = await subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt'])
  const iv = random(12)
  const data = new Uint8Array(await subtle.encrypt({name: 'AES-GCM', iv}, key, enc.encode(word)))
  out = {iterations, sections, iv: b64(iv), data: b64(data)}
} else {
  const [seqArg, word, ...rest] = args
  if (!seqArg || !word) fail('Usage: node lock.mjs <tooth levels, comma separated, 1 = lowest> "<word>" [--parts 8,8,7]   (or --console / --answer, see the top of this file)')
  const levels = list(seqArg).map(Number)
  if (!levels.length || levels.some((n) => !Number.isInteger(n) || n < 1 || n > 9)) fail('Tooth levels must be whole numbers from 1 to 9')
  const n = levels.length
  let sizes = []
  const pi = rest.indexOf('--parts')
  if (pi >= 0) sizes = list(rest[pi + 1] || '').map(Number).filter((v) => v > 0)
  else if (n >= 9) {
    const a = Math.ceil(n / 3)
    const b = Math.ceil((n - a) / 2)
    sizes = [a, b, n - a - b]
  }
  if (sizes.length && sizes.reduce((s, v) => s + v, 0) !== n) fail(`--parts must add up to the ${n} teeth`)
  out = {teeth: n, iterations: 150000, ...await lockWith(levels.join(''), word, 150000)}
  if (sizes.length > 1) {
    out.parts = []
    let from = 1
    for (const size of sizes) {
      const to = from + size - 1
      // Keep in step with keyPartSecret in riddle/index.html.
      out.parts.push({from, to, ...await lockWith(`part|${from}-${to}|${levels.slice(from - 1, to).join('')}`, 'fits', 150000)})
      from = to + 1
    }
  }
}
console.log(JSON.stringify(out, null, 2))
