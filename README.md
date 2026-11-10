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

Built with three.js and the 8th Wall engine binary. The engine is © Niantic Spatial, Inc., used under the [XR Engine License Agreement](https://github.com/8thwall/engine/blob/main/LICENSE) and provided as is, without warranty.
