function getColors() {
  return {
    background: getComputedStyle(document.body).getPropertyValue(
      "--background-color",
    ),

    foreground: getComputedStyle(document.body).getPropertyValue(
      "--foreground-color",
    ),
  };
}

export { getColors };
