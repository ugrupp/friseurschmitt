# Friseur Schmitt

> Website: https://www.friseurschmitt.de

## Build-Workflow

### Überblick

Der komplette Sourcecode liegt in `/src` und wird während des Build-Prozesses nach `/build` kompiliert. Darin liegen die `index.html` sowie die `sub.html` (mit alternativen Elementen). Der `build`-Ordner bildet also das auslieferbare HTML/CSS/JS-Paket. 

**Wichtig:** Das Paket muss direkt im Stammverzeichnis `/` liegen, da sonst die Pfade zu CSS, JS und den Bildern nicht stimmen.

Es werden im Development eine Reihe von Präprozessoren ausgeführt. Das erlaubt uns, folgende Abstraktionen einzusetzen:

```
Pug => HTML
SASS => CSS
ES6 => JavaScript
SVG => Optimized SVG-Sprite
```

### System-Voraussetzungen

* `npm`
* `node.js`
* `git`

### Installing

Zunächst das Repository lokal clonen:

```
$ git clone https://github.com/ugrupp/friseurschmitt.git
```

Dann im Projektverzeichnis die benötigten Pakete installieren:

```
$ cd friseurschmitt
$ npm install
```

### Development & Deployment

Der Workflow basiert auf `gulp`. Es gibt zwei Haupt-Tasks, die jeweils vom Projektverzeichnis aus ausgeführt werden können:

#### Default

```
$ gulp
```

Ausgeführte Tasks:

* HTML (Pug)
* JS (Linting, Browserify, Babel, Minification, Sourcemaps)
* CSS (Linting, SASS, Autoprefixer, Minification)
* Assets (SVG Optimization & Sprite, kopieren sonstiger Bilder, kopieren der Fonts)
* Watch
* Browsersync

#### Production

```
$ gulp production
```

Ausgeführte Tasks:

* HTML (s.o.)
* CSS (s.o.)
* JS (s.o.)
* Assets (s.o.)

### SVG

Wir nutzen hier einen SVG Workflow, der alle SVGs in einen externen SVG-Sprite zusammenführt. Dabei werden die SVGs zudem noch optimiert. Es ist zu beachten, dass die SVGs keine wichtigen Anweisungen in `<defs>`-Tags beinhalten dürfen, da diese bei der eingesetzten SVG-Sprite-Methode nicht berücksichtigt werden.

## Authors

* Urs Grupp, https://www.21sieben.de
* hanfweihnacht GbR, http://hanfweihnacht.de/
