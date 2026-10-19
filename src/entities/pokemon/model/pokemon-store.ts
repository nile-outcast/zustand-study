import { getPokemonList, type Pokemon } from '@/shared/api/pokemon'
import type { FetchStatus } from '@/shared/types/fetch-status'
import { create } from 'zustand'

interface PokemonState {
  status: FetchStatus
  items: Array<Pokemon>
  error: string | null
  fetchPokemonList: () => Promise<void>
}

export const usePokemonStore = create<PokemonState>((set, get) => ({
  status: 'initial',
  items: [],
  error: null,

  fetchPokemonList: async () => {
    // Защита от повторных запросов во время загрузки
    if (get().status === 'loading') return

    set({ status: 'loading', error: null })

    try {
      const items = await getPokemonList(20, 0)
      set({ status: 'success', items })
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Неизвестная ошибка',
      })
    }
  },
}))
