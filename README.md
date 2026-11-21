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
| Lighting console | `console` | Set Udi's coffee-soaked lighting console until its drawing matches the real square |

Open on a phone: https://efidvir.github.io/UrbanQuest/riddle/?r=garden (or `r=start`, `sycamore`, `key`, `water`, `console`)

### Story film and animated pictures

The starting page opens with a short film of Udi's story (about 25 seconds, with Hebrew and English captions), and players tap "next" to start the first mission. Each mission's picture is animated: it plays once, silently, when the screen opens and then settles on its last frame, so the still picture is exactly where the animation stops. Tapping it plays it again with sound.

### The garden walk

The walk is guided only by what players see in AR, with no written directions:

- **At the start:** Udi stands on the ground in front of you, waves, and explains in speech bubbles. Mitzi sits next to him.
- **Along the way:** Mitzi runs ahead to the next crossing and waits on a glowing ring. Udi's footprints light up the stretch to walk, gold where he was "writing". Walked footprints fade after a few seconds, so the shape only lives in the player's head.
- **Story moments:** his empty coffee cup stands where it ran out, and his dropped keys float at the crossing where he lost them; walking there picks them up.
- **The square size measures itself:** on the first stretch Mitzi just leads the way, and the player taps "I'm at the first crossing". That distance becomes the square size, and from then on the page advances by itself at each crossing. Tapping is always possible, and it also re-aims the footprints at your feet.
- **At the end:** Udi reappears reading his diary and asks what he wrote. Then the page sends players back to TravelQuest to enter the code.

If AR can't start, the page switches to a **compass mode**: a big arrow turns with the phone and points along the next stretch, Mitzi trots when you face the right way, the phone buzzes, and players tap at each crossing. It checks GPS once at the start to see whether they're in the garden (phone GPS is too rough to tell crossings apart). Only if the phone has no compass does the page fall back to the **written diary**, one page per stretch.

### The key

Udi's key has one tooth per tree in the real row of trees, from left to right, in four heights. Players hold up the camera, look at the trees, and pick a height for each tooth. When every tooth is right, the key turns and Udi shows the word to enter in TravelQuest. The word is encrypted with the tooth sequence, so neither is in the page or the repository: to change the lock, run `node riddle/tools/lock.mjs <levels, e.g. 2,3,1> "<word>"` and paste the result into the riddle file's `key.lock`.

### The lighting console

Mitzi has knocked Udi's coffee over the square's lighting console, and every setting is wiped. The console is laid out like the square seen from the pillars of Heichal HaTarbut along Huberman Street, with Habima at the top, and each control draws one thing on the real square:

- **The pillars:** a fader for each group of pillars along the street, set to the number of pillars in the group, and a button for the groups that have glass. Udi's soaked cue sheet still shows the first groups and says the row looks the same in a mirror.
- **The little stages:** three pads, each set to the shape of the stage in that spot.
- **The benches:** the shape of the benches under the long middle row of pillars, and how many there are.
- **The light stripes:** how many stripes of light are set into the ground between the garden and Habima.

Players walk around the square and adjust the console until its drawing matches what they see. Then GO brings up the lights and the screen shows the word for TravelQuest. Like the key, the word is encrypted with all the settings together, so neither is in the page or the repository. To change the word, or if a count turns out different on site, run `node riddle/tools/lock.mjs --console --pillars <per group> --glass <1 or 0 per group> --stages <left,middle,right> --benches <shape>,<count> --stripes <count> "<word>"` and paste the result into `console.lock` in the riddle file.

### Making a new mission

Copy the riddle file closest to what you need and change it: `garden.json` for a walk (story, start point, route in the same notation as the mystery walk, diary lines, Udi's opening and closing lines, story props), `key.json` for a key, `console.json` for the console, `start.json` for a clue picture (put the picture in [`riddle/clues/`](riddle/clues/)). Every file has its story, ending and return address in both languages. The garden's starting point is a placeholder until it's marked on site.

The cartoon pictures and animations live in [`riddle/art/`](riddle/art/), with notes on how they were made and the scripts that cut figures out of their green background, turn a generated clip into a page's animation, and cut the story film. A riddle file lists its pictures and animations in its `art` block, and the starting page lists its film and the timing of its captions in `film`; anything missing falls back to the page's own drawings.

Options for testing: `?lang=en`, `?cell=0.5` (half-metre squares at home, no measuring; the start screen says how much room you need), `?auto=0` or `?auto=1`, `?trail=1` (keep walked footprints visible), `?screen=s-end` (open a screen directly; `compass` or `key` starts that mode).

Built with three.js and the 8th Wall engine binary. The engine is © Niantic Spatial, Inc., used under the [XR Engine License Agreement](https://github.com/8thwall/engine/blob/main/LICENSE) and provided as is, without warranty.
