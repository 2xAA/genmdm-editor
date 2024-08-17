// Define the key mappings
const keys: string[] = ["zsxdcvgbhnjm,l.;/", "q2w3er5t6y7ui9o0p[=]"];

const mapping: { [key: string]: number } = keys
  .map((string, i) =>
    Object.fromEntries(string.split("").map((x, j) => [x, j + i * 12])),
  )
  .reduce((o, x) => ({ ...o, ...x }), {});

// Define the maximum number of octaves
const MAX_OCTAVES = 7;

// Type definitions for the callback functions
type NoteOnCallback = (note: number, velocity: number) => void;
type NoteOffCallback = (note: number) => void;

export class MDMKeyboard {
  private _octave: number;
  private _keysDownOctave: { [key: string]: number };
  private _noteOn: NoteOnCallback;
  private _noteOff: NoteOffCallback;
  public velocity: number;

  constructor(
    noteOn: NoteOnCallback = () => {},
    noteOff: NoteOffCallback = () => {},
  ) {
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

  get octave(): number {
    return this._octave + 1;
  }

  set octave(value: number) {
    this._octave = value;
  }

  private keydown(e: KeyboardEvent): void {
    if (e.target instanceof HTMLInputElement) {
      return;
    }

    e.preventDefault();

    const { key } = e;

    if (key === "ArrowLeft") {
      this.velocity = Math.max(0, this.velocity - 1);
      console.log("<", this.velocity);
      return;
    }

    if (key === "ArrowRight") {
      this.velocity = Math.min(127, this.velocity + 1);
      console.log(">", this.velocity);
      return;
    }

    if (e.repeat) {
      return;
    }

    if (key === "ArrowUp") {
      this._octave = (this._octave + 1) % MAX_OCTAVES;
      return;
    }

    if (key === "ArrowDown") {
      this._octave = this._octave > 0 ? this._octave - 1 : MAX_OCTAVES - 1;
      return;
    }

    if (key in mapping) {
      this._noteOn(this.octave * 12 + mapping[key], this.velocity);
      this._keysDownOctave[key] = this._octave;
    }
  }

  private keyup(e: KeyboardEvent): void {
    if (e.target instanceof HTMLInputElement) {
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
