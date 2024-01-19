import { defineStore } from 'pinia';
import { ref } from 'vue';

const storeKey = 'src/pages/app';

/**
 * app store
 */
export const useAppStore = defineStore(storeKey, () => {
  const ssrMsg = ref('');

  // simulate async function
  const getSsrMsg = (): Promise<void> => new Promise((resolve) => {
    setTimeout(() => {
      ssrMsg.value = 'with SSR';
      resolve();
    }, 300);
  });

  return {
    ssrMsg,
    getSsrMsg,
  };
});
