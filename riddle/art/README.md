# Pictures for Udi's garden walk

The pictures in this folder were made with Gemini from the prompts below, then turned into WebP files
with [`cutout.py`](cutout.py). The `art` block of the riddle file (`riddle/riddles/garden.json`) lists
them. Any picture that's missing from that list falls back to the built-in drawing.

## Style (paste this first, with every picture)

Flat 2D TV-cartoon style: thick, clean dark-brown outlines; bright flat colours with at most one soft
shadow tone; simple rounded shapes; big expressive eyes; friendly, slightly goofy expressions.
No text, no letters, no logos.

Udi: a clumsy, kind theatre caretaker in his late 50s. Round face, big bushy brown moustache, grey
sideburns, teal flat cap, cream shirt with rolled-up sleeves, blue work overalls with brass buttons,
a big ring of keys on his belt, a yellow pencil behind his ear, a small brown notebook diary.

Mitzi: a chubby ginger tabby cat with darker orange stripes, amber eyes and a mischievous look.

Make `udi-wave` first, then give it to the image tool as the reference for every other picture,
so Udi and Mitzi look the same everywhere.

## Cut-outs that stand on the ground in the camera view

Full body, centred, the whole figure in the frame with the feet touching the bottom edge, on a plain
flat bright-green background, no ground shadow. Nothing in the picture itself may be green, because
the green background is what gets cut away (that's why Mitzi's eyes are amber).

| File | Picture |
| --- | --- |
| `udi-wave.webp` | Udi standing, facing the viewer, waving hello with one hand, the diary in the other, cheerful |
| `udi-read.webp` | Udi standing, holding his open diary with both hands and reading it, puzzled frown |
| `mitzi-sit.webp` | Mitzi sitting, facing the viewer, tail curled round her paws |
| `mitzi-walk.webp` | Mitzi trotting, side view facing right, tail up |
| `key.webp` | An old brass stage-door key on a small ring (just the object) |
| `cup.webp` | An empty takeaway coffee cup with a lid (just the object) |

Cut the background away and trim to the figure:

    python3 cutout.py udi-wave.png udi-wave.webp

## Scenes for the story screens

Landscape, full background. The script crops them to 3:2.

| File | Picture |
| --- | --- |
| `intro.webp` | Night outside a modern theatre's stage door with a keypad blinking red. Udi scratches his head, worried. Mitzi sits nearby with a torn diary page in her mouth; paper scraps on the ground; stars above |
| `end.webp` | Night in a sunken garden with a lawn and paths. Udi reads his diary, puzzled, a question mark above his head. Mitzi sleeps curled up on the grass |
| `start-intro.webp` | Starting point. Early evening on a wide city plaza in front of a theatre. Udi holds a crumpled page covered in coloured dots, scratching his head; Mitzi has a paw on a small ball. No statues |
| `sycamore-intro.webp` | Sycamore. A low grassy hill with one huge old sycamore fig. Udi counts on his fingers holding a diary page; Mitzi sits on a low branch |
| `key-intro.webp` | Lock. A tiny key-cutting shop at night. Udi holds up a bent brass key, hand on his forehead; a row of street trees of different heights shows through the window; Mitzi bats a key ring on the counter |
| `key-end.webp` | Lock, solved. A heavy backstage door swings open with golden light; Udi holds up a shiny new key, fist raised; Mitzi dashes in |
| `water-intro.webp` | Stop the water. A backstage corridor with a burst pipe spraying water; Udi, soaked, on a ladder turning a red valve wheel; Mitzi dry and annoyed on a stack of crates |

Start every scene prompt with "a wide landscape scene (16:9) in exactly the same cartoon style, with the same Udi and Mitzi", in the same Gemini chat as the cut-outs.

    python3 cutout.py --scene intro.png intro.webp
