import { getPokemonList, type Pokemon } from '@/shared/api/pokemon'
import {
  createLoadingSlice,
  type LoadingSlice,
} from '@/shared/model/create-loading-slice'
import { create } from 'zustand'

interface PokemonState extends LoadingSlice {
  items: Array<Pokemon>
  errorMessage: string | null
  fetchPokemonList: () => Promise<void>
}

export const usePokemonStore = create<PokemonState>()((set, get) => ({
  ...createLoadingSlice(set, get),
  items: [],
  errorMessage: null,

  fetchPokemonList: async () => {
    // Защита от повторных запросов во время загрузки
    if (get().isLoading()) return

    get().loading()

    try {
      const items = await getPokemonList(20, 0)
      set({ items })
      get().success()
    } catch (err) {
      set({
        errorMessage: err instanceof Error ? err.message : 'Неизвестная ошибка',
      })
      get().error()
    }
  },
}))
