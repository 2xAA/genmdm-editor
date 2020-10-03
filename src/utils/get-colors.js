function getColors() {
  return {
    background: getComputedStyle(document.documentElement).getPropertyValue(
      "--background-color"
    ),

    foreground: getComputedStyle(document.documentElement).getPropertyValue(
      "--foreground-color"
    )
  };
}

export { getColors };
