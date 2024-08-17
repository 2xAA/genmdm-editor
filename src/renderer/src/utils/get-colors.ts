function getColors(): { background: string; foreground: string } {
  const colors = { background: "", foreground: "" };
  const keys = Object.keys(colors);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    Object.defineProperty(colors, key, {
      get() {
        return getComputedStyle(document.documentElement).getPropertyValue(
          `--${key}-color`,
        );
      },
    });
  }

  return colors;
}

export { getColors };
