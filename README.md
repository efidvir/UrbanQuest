# Urban Quest: Habima AR experiments

Web-based AR experiments for the Habima Square quest in Tel Aviv. Everything runs in the phone's browser, with nothing to install.

## SLAM trail test

[`slam-test/`](slam-test/): tap the floor and a trail of arrows appears, leading to Udi's lost key. It checks whether the arrows stay pinned to the ground while you walk.

- Open on a phone: https://efidvir.github.io/UrbanQuest/slam-test/
- Larger trail for outdoors: add `?size=garden`
- Real-world metres instead of estimated scale: add `?scale=absolute`

Built with three.js and the 8th Wall engine binary. The engine is © Niantic Spatial, Inc., used under the [XR Engine License Agreement](https://github.com/8thwall/engine/blob/main/LICENSE) and provided as is, without warranty.
