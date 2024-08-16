const keys = ["zsxdcvgbhnjm,l.;/", "q2w3er5t6y7ui9o0p[=]"];

const mapping = keys
  .map((string, i) =>
    Object.fromEntries(string.split("").map((x, j) => [x, j + i * 12])),
  )
  .reduce((o, x) => ({ ...o, ...x }), {});

const MAX_OCTAVES = 7;

export class MDMKeyboard {
  constructor(noteOn = () => {}, noteOff = () => {}) {
    this._octave = 0;
    this._noteOn = noteOn;
    this._noteOff = noteOff;
    this._keysDownOctave = Object.fromEntries(
      keys.map((string) => string.split("").map((x) => [x, 0])).flat(),
    );
    this.velocity = 127;
    window.addEventListener("keydown", this.keydown.bind(this));
    window.addEventListener("keyup", this.keyup.bind(this));
  }

  get octave() {
    return this._octave + 1;
  }

  set octave(value) {
    this._octave = value;
  }

  keydown(e) {
    if (e.target.tagName === "INPUT") {
      return;
    }

    e.preventDefault();

    const { key } = e;

    if (key === "ArrowLeft") {
      if (this.velocity - 1 < 0) {
        this.velocity = 0;
      } else {
        this.velocity -= 1;
      }

      console.log("<", this.velocity);

      return;
    }

    if (key === "ArrowRight") {
      if (this.velocity + 1 > 127) {
        this.velocity = 127;
      } else {
        this.velocity += 1;
      }

      console.log(">", this.velocity);

      return;
    }

    if (e.repeat) {
      return;
    }

    if (key === "ArrowUp") {
      this.octave = (this._octave + 1) % MAX_OCTAVES;
      return;
    }

    if (key === "ArrowDown") {
      if (this._octave - 1 < 0) {
        this._octave = MAX_OCTAVES - 1;
      } else {
        this._octave -= 1;
      }

      return;
    }

    if (key in mapping) {
      this._noteOn(this.octave * 12 + mapping[key], this.velocity);
      this._keysDownOctave[key] = this.octave;
    }
  }

  keyup(e) {
    if (e.target.tagName === "INPUT") {
      return;
    } else if (e.repeat) {
      return;
    }

    e.preventDefault();

    const { key } = e;
    if (key in mapping) {
      const octave = this._keysDownOctave[key];
      this._noteOff(octave * 12 + mapping[key]);
    }
  }
}
