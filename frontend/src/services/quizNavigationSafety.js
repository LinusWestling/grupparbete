import { watch } from 'vue'

export function confirmQuizNavigation(store, target = globalThis.window) {
  return (
    !store.hasUnsyncedData.value ||
    store.locallySaved?.value ||
    target.confirm(
      'Your quiz has unsaved progress or results. Leave this page? Keep this tab open and return to Explore skills to finish saving. Refreshing or closing this tab will lose unsaved data.',
    )
  )
}

export function startQuizUnloadWarning(store, target = globalThis.window) {
  if (!target) return () => {}
  const warn = (event) => {
    if (!store.hasUnsyncedData.value || store.locallySaved?.value) return
    event.preventDefault()
    event.returnValue = ''
  }
  const stop = watch(
    store.hasUnsyncedData,
    (unsynced) => {
      target.removeEventListener('beforeunload', warn)
      if (unsynced) target.addEventListener('beforeunload', warn)
    },
    { immediate: true, flush: 'sync' },
  )
  return () => {
    stop()
    target.removeEventListener('beforeunload', warn)
  }
}
