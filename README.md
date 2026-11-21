# Urban Quest: Habima AR experiments

Web-based AR experiments for the Habima Square quest in Tel Aviv. Everything runs in the phone's browser, with nothing to install.

## SLAM trail test

[`slam-test/`](slam-test/): tap the floor and a trail of arrows appears, leading to Udi's lost key. It checks whether the arrows stay pinned to the ground while you walk.

- Open on a phone: https://efidvir.github.io/UrbanQuest/slam-test/
- Larger trail for outdoors: add `?size=garden`
- Real-world metres instead of estimated scale: add `?scale=absolute`

## Garden walk test (Udi's clock)

[`garden-walk/`](garden-walk/): two squares of the garden's grass grid act as one seven-segment digit. AR arrows lead you along the walkways one side at a time, a glowing trail marks where you've walked, and at the end the digit appears in front of you. The digits make Udi's key code.

- Open on a phone: https://efidvir.github.io/UrbanQuest/garden-walk/
- At home the squares are 1 m; in the garden set their real size, for example `?cell=4`
- Choose the code with `?digits=725`; hide the reveal sign with `?reveal=0`
- Arrows restart from your feet at every corner. If tracking slips, finish the side on foot, face the far end of the garden and tap Continue.

## Mystery walk (the real mechanic)

[`mystery-walk/`](mystery-walk/): players don't know what they're drawing. Arrows show only the next side of the route: gold arrows draw, white arrows just move you. Each drawn side fades a few seconds later, so the picture only exists in the player's head, and at the end they have to work out what they drew.

- Open on a phone: https://efidvir.github.io/UrbanQuest/mystery-walk/
- The default route draws a hidden digit in a 1 × 2 m area
- Write a route with `?route=`: one-square moves `F` `B` `L` `R` and diagonals `FR` `FL` `BR` `BL`, as seen facing the far end of the garden. Put `~` in front of a move to walk without drawing, and a number after it to repeat (`F2` = two squares). Example: `?route=F2,~R,FR,BL`
- `?cell=4` sets the real square size; `?trail=1` keeps the drawn sides visible; `?check=0` hides the "Show the drawing" button at the end
- The start screen says how much room the route needs around you, so you can pick a direction at home
- Udi's four-digit code is one unbroken walk over the whole grass grid, in two lines of two digits joined by an underline. It's 24 sides, three of them walked straight back. Its route lives in [`riddle/riddles/garden.json`](riddle/riddles/garden.json).

## Riddle pages (the playable version)

[`riddle/`](riddle/) is the page players open from each TravelQuest mission. Every mission uses the same page: Udi's story in Hebrew and English with cartoon pictures of him and Mitzi the cat, then the mission itself, then back to TravelQuest to enter the answer. Each mission is one file in [`riddle/riddles/`](riddle/riddles/), opened with `riddle/?r=<file name>`:

| Mission | File | What players do |
| --- | --- | --- |
| Starting point | `start` | Crack Udi's colourful page (the original clue picture) |
| Sycamore tree | `sycamore` | Crack the counting cipher under the old sycamore (the original clue picture) |
| Walk in the garden | `garden` | Walk Udi's route in AR and work out the code it draws |
| Lock | `key` | Set the teeth of Udi's key to match the row of trees, over the camera view |
| Stop the water | `water` | Work out Udi's drawing (the original clue picture) |

Open on a phone: https://efidvir.github.io/UrbanQuest/riddle/?r=garden (or `r=start`, `sycamore`, `key`, `water`)

### The garden walk

The walk is guided only by what players see in AR, with no written directions:

- **At the start:** Udi stands on the ground in front of you, waves, and explains in speech bubbles. Mitzi sits next to him.
- **Along the way:** Mitzi runs ahead to the next crossing and waits on a glowing ring. Udi's footprints light up the stretch to walk, gold where he was "writing". Walked footprints fade after a few seconds, so the shape only lives in the player's head.
- **Story moments:** his empty coffee cup stands where it ran out, and his dropped keys float at the crossing where he lost them; walking there picks them up.
- **The square size measures itself:** on the first stretch Mitzi just leads the way, and the player taps "I'm at the first crossing". That distance becomes the square size, and from then on the page advances by itself at each crossing. Tapping is always possible, and it also re-aims the footprints at your feet.
- **At the end:** Udi reappears reading his diary and asks what he wrote. Then the page sends players back to TravelQuest to enter the code.

If AR can't start, the page switches to a **compass mode**: a big arrow turns with the phone and points along the next stretch, Mitzi trots when you face the right way, the phone buzzes, and players tap at each crossing. It checks GPS once at the start to see whether they're in the garden (phone GPS is too rough to tell crossings apart). Only if the phone has no compass does the page fall back to the **written diary**, one page per stretch.

### The key

Udi's key has one tooth per tree in the real row of trees, from left to right, in four heights. Players hold up the camera, look at the trees, and pick a height for each tooth. When every tooth is right, the key turns and Udi shows the word to enter in TravelQuest. The word is encrypted with the tooth sequence, so neither is in the page or the repository: to change the lock, run `node riddle/tools/lock.mjs <levels, e.g. 4,4,3> "<word>"` and paste the result into the riddle file's `key.lock`.

### Making a new mission

Copy the riddle file closest to what you need and change it: `garden.json` for a walk (story, start point, route in the same notation as the mystery walk, diary lines, Udi's opening and closing lines, story props), `key.json` for a key, `start.json` for a clue picture (put the picture in [`riddle/clues/`](riddle/clues/)). Every file has its story, ending and return address in both languages. The garden's starting point is a placeholder until it's marked on site.

The cartoon pictures live in [`riddle/art/`](riddle/art/), with the prompts used to make them and a script that cuts the figures out of their green background. A riddle file lists its pictures in its `art` block; anything missing falls back to the page's own drawings.

Options for testing: `?lang=en`, `?cell=0.5` (half-metre squares at home, no measuring; the start screen says how much room you need), `?auto=0` or `?auto=1`, `?trail=1` (keep walked footprints visible), `?screen=s-end` (open a screen directly; `compass` or `key` starts that mode).

Built with three.js and the 8th Wall engine binary. The engine is © Niantic Spatial, Inc., used under the [XR Engine License Agreement](https://github.com/8thwall/engine/blob/main/LICENSE) and provided as is, without warranty.
