# Praktikos

A minimalist reading app: Evagrius Ponticus, *Praktikos* [or *The Monk*], in English only. One section at a time, with previous and next, a chapter grid, dark and light mode, and a font switcher. Same pattern as the Dao De Jing reader, with no Greek and no language switch.

Live site: https://karls.design/praktikos/

## What is in this first version

- `index.html`, `styles.css`, `app.js`: the reader, no build step
- `data/index.json`: the Prologue, all 100 chapters, and the Epilogue, in reading order
- `data/chapters/prologue.json`, `001.json` to `100.json`, `epilogue.json`: one file per unit, each with its English paragraphs. The app fetches only the unit being read, and preloads the next one.
- Dark and light mode, saved in the browser, with the system setting as the default
- Font switcher, default Inter. Fonts in the switcher: Inter, EB Garamond, Marcellus, Newsreader, IBM Plex Mono. They are in the `FONTS` array in `app.js`, each with an id, label, CSS family, Google Fonts URL, and letter spacing. Inter uses letter spacing -0.02em, which is -2 percent. The other fonts use 0.
- Chapter picker: the progress text in the pager ("Prologue", "Chapter 12 of 100", "Epilogue") is a button with a caret-down icon. Clicking it opens a modal on desktop and a bottom drawer that slides up on mobile, both showing the same grid to jump to a unit. It closes from the close button, the backdrop, or Escape, and returns focus to the progress button. Chapter hotkeys wait while it is open.
- Per-unit URLs: the address updates to `#prologue`, `#12`, or `#epilogue` as you read, so a chapter can be linked and shared, and a link with a hash opens on that unit.
- Each chapter shows its section from the source site's contents: Introduction 1-5, Nature of the Logismoi 6-14, Resisting the Logismoi 15-33, Passions 34-39, Instructions 40-53, During Sleep 54-56, Near Apatheia 57-62, Signs of Apatheia 63-90, Apophthegmata 91-100.
- Page flip sound: `assets/page-flip.mp3`, 0.55 seconds, 9.8KB, mono, preloaded so it plays instantly, at half volume. It plays on every user-initiated chapter change, Previous and Next buttons, arrow keys, R, and the chapter grid, and only when the unit actually changes, never on first load. Same clip as the Dao De Jing app, trimmed with ffmpeg from a Pixabay clip. There is no singing bowl in this app.
- Favicon: `assets/favicon.svg`, a simple cross, linked only in this app's `index.html`.

## Text source

- English: Luke Dysinger, O.S.B., translation in the public domain. Taken from https://www.ldysinger.com/Evagrius/01_Prak/01_Praktikos.htm . The site states "Translation by Luke Dysinger, O.S.B. (translation in public domain)". Greek text based on Sources Chrétiennes No. 171 and PG 40.
- Greek is not included in this app, by design. The source presents English and Greek side by side, with cross-reference notes after many chapters. Those notes were removed here; only the translated text is shown.
- Extraction: the source HTML was parsed into paragraphs, the English column only. Notes after a horizontal rule, standalone citations like "[Cassian, Inst. 3]", and trailing cross-reference lists were dropped. Small-caps first words were normalized to normal case, for example "CHRISTIANITY is" became "Christianity is". A few sentences in the source run together where a note sat between them; a period was added in those spots, and two obvious concatenations were fixed ("intobeing" to "into being", a duplicated "The The"). Total text: 6,961 words across the Prologue, 100 chapters, and Epilogue. The extraction script is not in this repo; it was run once from the source file.
- No other translation is used. Bamberger and Sinkewicz are still in copyright and are not included.

## Run it locally

Do not open `index.html` directly from Finder. The app loads its chapters with fetch(), which does not work from a file address, so the page would load blank.

Instead, in Terminal, from this folder, run:

```
./serve.sh
```

Then open http://localhost:8000 in a browser. Stop the server with Ctrl+C.

## GitHub Pages

Settings, Pages, Deploy from a branch, branch `main`, folder `/ (root)`, Save. The site then serves from the repo root.
