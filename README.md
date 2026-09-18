# USHER Election Night 2026 — Fresh Rebuild V5

A fresh, original election-night website for GitHub Pages with a broadcast-style white UI, live presentation output, General Election declarations, council declarations, exit poll graphics, history charts, ticker and a production control room.

## Files

All files are deliberately in the repository root:

- `index.html` — live presentation output
- `control.html` — production control room
- `styles.css` — all presentation/control styling
- `data.js` — 650 fictional constituencies, 128 councils, parties and history demonstration data
- `core.js` — localStorage + BroadcastChannel live state
- `presentation.js` — live presentation rendering
- `control.js` — control room rendering/actions
- `logo.svg` — original USHER Election Night 2026 logo
- `README.md` — this guide

## Main presentation slides

1. Opening logo
2. Exit-poll countdown
3. Exit poll
4. National map / declarations
5. Constituency focus
6. Council focus
7. Historical seats chart
8. Full results board
9. Winner call
10. Break screen

## General Election

- 650 constituencies
- 326 seats for a majority
- Every seat has a fictional previous winner, prediction, model likelihood, electorate and projected vote shares
- Declare an actual winner and majority from the control room
- Result immediately updates the presentation map and totals
- Push the selected seat to the live presentation

## Councils

- 128 fictional councils
- Previous control, projected control and live declared control
- Councillor net change
- Dedicated council presentation slide and scoreboard

## Exit Poll

- Editable seat total and change for every party
- Validation requires the projection to total exactly 650
- Dedicated countdown and reveal controls
- The live exit-poll screen includes the 326-seat majority line, map, declared-seat count and council count

## Ticker

Edit time + headline rows in the control room. The ticker updates on the presentation immediately.

## Live syncing

The fresh rebuild uses two browser-native methods:

- `BroadcastChannel` for instant same-browser updates
- `localStorage` for persistence and tab/window syncing

Open `control.html` in one tab and `index.html` in another. Changes should appear immediately without refreshing.

## GitHub Pages

Upload every file directly to the repository root. Do not put them inside another folder.

Then open:

- Presentation: `https://YOUR-USERNAME.github.io/YOUR-REPO/`
- Control: `https://YOUR-USERNAME.github.io/YOUR-REPO/control.html`

Recommended broadcast output: **1920×1080**.

## Notes

The design is an original USHER broadcast package inspired by the general conventions of modern election-night television graphics. It does not reproduce another broadcaster's branding or exact graphics.
