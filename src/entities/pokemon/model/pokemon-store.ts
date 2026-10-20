import { create } from 'zustand'

import type { Pokemon, PokemonListResponse } from '@/entities/pokemon/types'
import { POKEMON_API_BASE_URL } from '@/shared/config/pokemon-api'
import { createApiRequest } from '@/shared/model/create-api-request'
import {
  createPaginationSlice,
  type PaginationSlice,
} from '@/shared/model/create-pagination-slice'
import type { ApiCallErrorResponse } from '@/shared/types/api-call'
import type { Nullable } from '@/shared/types/basic'

interface PokemonState extends PaginationSlice {
  items: Array<Pokemon>
  isLoading: boolean
  loadErrorMessage: Nullable<string>
  isLoadingMore: boolean
  loadMoreErrorMessage: Nullable<string>
  fetchPokemonList: () => Promise<void>
  fetchNextPage: () => Promise<void>
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
  ...createPaginationSlice(set, get, { limit: 40 }),
  items: [],
  isLoading: false,
  loadErrorMessage: null,
  isLoadingMore: false,
  loadMoreErrorMessage: null,

  fetchPokemonList: async () => {
    if (get().isLoading) return

    set({
      isLoading: true,
      loadErrorMessage: null,
      loadMoreErrorMessage: null,
    })

    const result = await pokemonListRequest.call({
      query: {
        limit: get().limit,
        offset: 0,
      },
    })

    if (result.isError) {
      if (result.isCancelled) {
        set({ isLoading: false })

        return
      }

      set({
        isLoading: false,
        loadErrorMessage: toErrorMessage(result),
      })

      return
    }

    set({
      isLoading: false,
      items: normalizePokemonList(result.data),
      offset: get().limit,
      total: result.data.count,
      hasMore: result.data.next !== null && result.data.results.length > 0,
    })
  },

  fetchNextPage: async () => {
    const state = get()

    // Защита от параллельных запросов и загрузки при отсутствии данных
    if (state.isLoadingMore || !state.hasMore) return

    set({
      isLoadingMore: true,
      loadMoreErrorMessage: null,
    })

    const result = await pokemonListRequest.call({
      query: {
        limit: state.limit,
        offset: state.offset,
      },
    })

    if (result.isError) {
      if (result.isCancelled) {
        set({ isLoadingMore: false })

        return
      }

      set({
        isLoadingMore: false,
        loadMoreErrorMessage: toErrorMessage(result),
      })

      return
    }

    set({
      isLoadingMore: false,
      items: [...get().items, ...normalizePokemonList(result.data)],
      offset: get().offset + get().limit,
      total: result.data.count,
      hasMore: result.data.next !== null && result.data.results.length > 0,
    })
  },
}))
