# halachicapplications.com

The Halachic Applications website, served by GitHub Pages from this repository.

- `index.html` is the whole site. Screenshots are in `img/`, the Alarm Clock APK in `downloads/`.
- `CNAME` tells GitHub Pages to serve the site at halachicapplications.com. Don't delete it.

## Release a new Alarm Clock version

1. Copy the new APK into `downloads/` as `halachic-alarm-clock-<version>.apk` and delete the old one.
2. In `index.html`, search for the old version number and update it (download link, version chip, download box).
3. Commit and push. The live site updates in about a minute.
