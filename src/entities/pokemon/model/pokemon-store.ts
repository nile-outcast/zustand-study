import { isNullish } from 'typescript-extended-types'
import { create } from 'zustand'

import type { Pokemon, PokemonListResponse } from '@/entities/pokemon/types'
import { POKEMON_API_BASE_URL } from '@/shared/config/pokemon-api'
import { createApiRequest } from '@/shared/models/create-api-request'
import {
  createLoadingStageModel,
  type LoadingStageModel,
} from '@/shared/models/create-loading-stage-model'
import {
  createPaginationSlice,
  type PaginationSlice,
} from '@/shared/models/create-pagination-slice'
import type { ApiCallErrorResponse } from '@/shared/types/api-call'

interface PokemonState extends PaginationSlice {
  items: Array<Pokemon>
  loadingStage: LoadingStageModel
  loadingMoreStage: LoadingStageModel
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
  loadingStage: createLoadingStageModel(set, get, 'loadingStage'),
  loadingMoreStage: createLoadingStageModel(set, get, 'loadingMoreStage'),

  fetchPokemonList: async () => {
    if (get().loadingStage.isLoading) return

    get().loadingStage.loading()
    // Новая загрузка списка делает ошибку дозагрузки неактуальной
    get().loadingMoreStage.reset()

    const result = await pokemonListRequest.call({
      query: {
        limit: get().limit,
        offset: 0,
      },
    })

    if (result.isError) {
      if (result.isCancelled) {
        get().loadingStage.reset()

        return
      }

      get().loadingStage.error(toErrorMessage(result))

      return
    }

    get().loadingStage.success()

    set({
      items: normalizePokemonList(result.data),
      offset: get().limit,
      total: result.data.count,
      hasMore: !isNullish(result.data.next) && result.data.results.length > 0,
    })
  },

  fetchNextPage: async () => {
    // Защита от параллельных запросов и загрузки при отсутствии данных
    if (get().loadingMoreStage.isLoading || !get().hasMore) return

    get().loadingMoreStage.loading()

    const result = await pokemonListRequest.call({
      query: {
        limit: get().limit,
        offset: get().offset,
      },
    })

    if (result.isError) {
      if (result.isCancelled) {
        get().loadingMoreStage.reset()

        return
      }

      get().loadingMoreStage.error(toErrorMessage(result))

      return
    }

    get().loadingMoreStage.success()

    set({
      items: [...get().items, ...normalizePokemonList(result.data)],
      offset: get().offset + get().limit,
      total: result.data.count,
      hasMore: !isNullish(result.data.next) && result.data.results.length > 0,
    })
  },
}))
