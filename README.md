# halachicapplications.com

The Halachic Applications website, served by GitHub Pages from this repository.

| Page | File |
| --- | --- |
| Home (`/`) | `index.html` |
| Shemesh, the zmanim alarm clock (`/shemesh/`) | `shemesh/index.html` |
| Shemesh download and install steps (`/shemesh/download/`) | `shemesh/download/index.html` |
| Old Alarm Clock links (`/alarm-clock/`, `/alarm-clock/download/`) | redirect pages in `alarm-clock/` |
| Shabbos List (`/shabbos-list/`) | `shabbos-list/index.html` |

- Shared styles are in `css/site.css`, the menu and copy buttons in `js/site.js`, and Shemesh's zmanim arc in `js/dayarc.js`.
- Screenshots and logos are in `img/`, the Shemesh APK in `downloads/`.
- The header and footer are repeated in each page. If you change one, change them all.
- `CNAME` tells GitHub Pages to serve the site at halachicapplications.com. Don't delete it.

## Release a new Shemesh version

1. Copy the new APK into `downloads/` as `halachic-alarm-clock-<version>.apk` and delete the old one.
2. Search all the pages for the old version number and update it: the download link and box in `shemesh/download/index.html`, and the version chips in `index.html`, `shemesh/index.html` and the download page.
3. Commit and push. The live site updates in about a minute.

## Preview locally

Run `python -m http.server 8080 --bind 127.0.0.1` in this folder and open http://127.0.0.1:8080.
