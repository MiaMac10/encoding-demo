# PSYC 402 Encoding Strategies Experiment

A static, browser-based practice memory experiment using plain HTML, CSS, and JavaScript. No server, database, account, or build tools required.

## How to run locally
1. Keep `index.html`, `styles.css`, and `script.js` in the same folder.
2. Double-click `index.html` to open it in a browser.
3. Complete all three six-word blocks, the 30-second backward-counting task, and the free-recall response.
4. Download both CSVs and verify the summary has one data row and the trial-level file has 18 data rows.
5. Start a new session to check that strategy order and word-list assignment change.

## GitHub Pages
1. Create a **public** GitHub repository named `encoding-demo`.
2. Upload the four files to the repository root, then commit.
3. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then Save.
4. Visit `https://YOUR-USERNAME.github.io/encoding-demo/` once deployment finishes and test everything again.

## Design notes
- Three randomly ordered strategies: maintenance rehearsal, self-reference, mental imagery.
- Three lists of six concrete words, randomly assigned to strategies each session.
- Four seconds per word; 30-second distractor; free recall of all 18 words.
- Scoring is case-insensitive, exact matches are prioritized, and a one-character edit is accepted for words of at least five letters. This is a simple approximation for minor spelling errors; review ambiguous spellings manually when analyzing real data.
- The results show scores per strategy and a bar visualization.
- Two local CSV downloads; no data are sent to a server. Do not upload participant data or secrets to the public repository.

## Suggested revision exercise
After publishing and testing, change the background color in `styles.css` from `#f3f6fa` to `#eaf4f1`, test locally, then upload the revised stylesheet to GitHub and commit it with the message `Improve background contrast`. Confirm the live site changes and still works.
PSYC 402 Encoding Strategies Memory Experiment — GitHub Pages deployment test.
