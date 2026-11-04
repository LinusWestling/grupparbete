import { watch } from 'vue'

export function confirmQuizNavigation(store, target = globalThis.window) {
  return (
    !store.hasUnsyncedData.value ||
    !store.persistenceError?.value ||
    target.confirm(
      'Ditt quiz har osparade framsteg eller resultat. Vill du lämna sidan? Låt fliken vara öppen och återvänd till Utforska kunskap för att slutföra sparandet. Om du uppdaterar eller stänger fliken förloras osparade uppgifter.',
    )
  )
}

export function startQuizUnloadWarning(store, target = globalThis.window) {
  if (!target) return () => {}
  const warn = (event) => {
    if (!store.hasUnsyncedData.value || !store.persistenceError?.value) return
    event.preventDefault()
    event.returnValue = ''
  }
  const stop = watch(
    [store.hasUnsyncedData, store.persistenceError],
    ([unsynced, persistenceError]) => {
      target.removeEventListener('beforeunload', warn)
      if (unsynced && persistenceError) target.addEventListener('beforeunload', warn)
    },
    { immediate: true, flush: 'sync' },
  )
  return () => {
    stop()
    target.removeEventListener('beforeunload', warn)
  }
}
