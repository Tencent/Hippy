import { ref, computed } from '@vue/composition-api'

export const darkMode = ref(false)

export function useDarkMode () {
  return {
    darkMode: computed(() => darkMode.value),
  }
}

export const isDarkMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export const onDarkModeChange = (cb: (isDarkMode: boolean) => void) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const listener = (e) => cb(e.matches)
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', listener)
  } else if (typeof media.addListener === 'function') {
    media.addListener(listener)
  }
}
