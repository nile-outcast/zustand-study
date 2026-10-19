import { create } from 'zustand'

import type { Pokemon, PokemonListResponse } from '@/entities/pokemon/types'
import { POKEMON_API_BASE_URL } from '@/shared/config/pokemon-api'
import { createApiRequest } from '@/shared/model/create-api-request'
import {
  createLoadingSlice,
  type LoadingSlice,
} from '@/shared/model/create-loading-slice'
import type { ApiCallErrorResponse } from '@/shared/types/api-call'
import type { Nullable } from '@/shared/types/basic'

interface PokemonState extends LoadingSlice {
  items: Array<Pokemon>
  errorMessage: Nullable<string>
  fetchPokemonList: () => Promise<void>
}

function normalizePokemonList(response: PokemonListResponse): Array<Pokemon> {
  return response.results.map((raw) => ({
    id: Number(raw.url.match(/\/pokemon\/(\d+)\/$/)?.[1] ?? 0),
    name: raw.name,
  }))
}

function toErrorMessage(response: ApiCallErrorResponse<Error>): string {
  if (response.data) {
    return `Ошибка сервера: ${response.data.message}`
  }

  return 'Неизвестная ошибка'
}

const pokemonListRequest = createApiRequest<PokemonListResponse, Error>(
  `/pokemon`,
  {
    baseUrl: POKEMON_API_BASE_URL,
  },
)

export const usePokemonStore = create<PokemonState>()((set, get) => ({
  ...createLoadingSlice(set, get),
  items: [],
  errorMessage: null,

  fetchPokemonList: async () => {
    if (get().isLoading()) return

    get().loading()

    const result = await pokemonListRequest.call({
      query: {
        limit: 20,
        offset: 0,
      },
    })

    if (result.isError) {
      if (result.isCancelled) return

      set({
        errorMessage: toErrorMessage(result),
      })
      get().error()

      return
    }

    set({
      items: normalizePokemonList(result.data),
    })
    get().success()
  },
}))
