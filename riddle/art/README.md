# Pictures and animations for the riddle pages

Everything here follows Efi's original story pictures (`pics/Story pics` in the AR project, made in ChatGPT):
the same Udi, the same black cat, the same flat TV-cartoon look, warm dusk colours, and the real places
around Habima Square, drawn from photos of the site.

- **Pictures:** made in ChatGPT, with the original story pictures and a photo of the place attached as references.
- **Animations:** made in Gemini (Videos), starting from the picture. Each page plays its clip once and then
  settles on the clip's last frame, so the fixed picture is exactly where the animation stops.

Udi: the theatre caretaker. Tan skin, black hair, big expressive eyes, navy cap, navy short-sleeved shirt,
brown trousers, a belt with a wrench hanging from it, a small brown notebook. The cat: black, yellow eyes.

## Scenes and their animations

| Files | Mission | Made from |
| --- | --- | --- |
| `start-intro` | Starting point | Original INTRO picture: Udi panics at the plaza; the cat runs off with a page and the pages blow away |
| `sycamore-intro` | Sycamore | Original TREE picture: the cat walks out along a branch, Udi takes the page caught there and reads it |
| `intro` | Garden walk | New picture of the sunken garden at sunset (from the photo of its lawns and walkways): Udi leafs through his notebook, then his glowing footprints appear along the walkway and fade |
| `end` | Garden walk, end | Same garden at night: Udi puzzles over his notebook, the cat asleep on the lawn |
| `key-intro` | Lock | Original LOCK picture: the door won't open and the key won't turn |
| `key-end` | Lock, solved | Original LOCK OPEN picture: the door opens, Udi raises the new key, the lights come on |
| `water-intro` | Stop the water | Original WATER picture: the pool by Heichal HaTarbut overflows |
| `console-intro` | Lighting console | Original HALL picture: behind the glass door the console smokes and sparks, and the cat sits by the spilled coffee |
| `console-end` | Lighting console, solved | Original HALL OPEN picture: the smoke clears, the console lights up and the stage lights fade up over the hall |
| `skyline-intro` | The play's title | New picture of Udi on a garden walkway at dusk, a programme with a blank title in his hand, the square and the towers behind: he looks from the programme up at the rooftop signs and gets it |
| `skyline-end` | The play's title, solved | A still: Udi at the theatre's glass entrance holding up the printed programme, the cat on a cart full of programmes |
| `story` | The story film (starting point) | Cut from the start, garden, lock and water clips, with captions in `../riddles/start.json` |

Each scene has three files: `<name>.mp4` (the clip), `<name>-first.webp` (shown until it plays) and
`<name>.webp` (its last frame, the fixed picture). Make them from a downloaded clip with
[`../tools/clip.py`](../tools/clip.py):

    python3 ../tools/clip.py ~/Downloads/clip.mp4 water-intro

The story film is a few seconds of each clip, crossfaded, made with [`../tools/film.py`](../tools/film.py).
It prints the second each piece starts at, which is where its caption goes in `start.json`'s `film.captions`.
It skips the sycamore clip on purpose, since the film plays before the first riddle.

    python3 ../tools/film.py story start-intro.mp4:0:9 intro.mp4:3.5:5.5 key-intro.mp4:1:5.5 water-intro.mp4:2.5:7.5

## The skyline seating plan

`skyline.svg` is the skyline seen from the raised walkway in Gan Yaakov, traced from Efi's SKYLINE slides: the
buildings (`towers`, `near`), the long white building in front (`wall`, `windows`) and the outline the camera
view shows (`trace`). The page draws the numbered boxes and their seats on top of it, from `skyline.boxes` in
`../riddles/skyline.json`, in the same coordinates.

## Cut-outs that stand on the ground in the camera view

`udi-wave`, `udi-read`, `mitzi-sit`, `mitzi-walk` (side view facing right), `key`, `cup`. Ask ChatGPT for two
at a time on a plain flat bright-green background (#00FF00) with plenty of space between them, full body, no
shadow, no ground; split the sheet down the middle and cut each out with [`cutout.py`](cutout.py):

    python3 cutout.py --tan udi-wave.png udi-wave.webp

Use `--tan` for Udi: on a green background ChatGPT draws his skin a brighter orange than in the story
pictures, and `--tan` brings it back. Nothing in a cut-out may be green, because the green background is
what gets cut away.
