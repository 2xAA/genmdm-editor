import { onMounted, onBeforeUnmount } from "vue";

export function useRedrawOnColorschemeChange(redraw: () => void) {
  const handleColorSchemeChange = () => {
    requestAnimationFrame(redraw);
  };

  onMounted(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleColorSchemeChange);
  });

  onBeforeUnmount(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeEventListener("change", handleColorSchemeChange);
  });
}
