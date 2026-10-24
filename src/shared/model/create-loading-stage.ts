import type { StoreApi } from 'zustand'

import type { Nullable } from '@/shared/types/basic'
import type { FetchStatus } from '@/shared/types/fetch-status'

/**
 * Данные стадии загрузки.
 *
 * Единственный источник правды — стор. Новое поле добавляется сюда,
 * оттуда попадает в публичный интерфейс и автоматически сохраняется
 * между пересозданиями объекта стадии.
 */
interface LoadingStageData {
  loadStatus: FetchStatus
  errorMessage: Nullable<string>
}

/**
 * Начальные данные стадии загрузки.
 */
export const INITIAL_DATA: LoadingStageData = {
  loadStatus: 'initial',
  errorMessage: null,
}

/**
 * Публичный интерфейс стадии загрузки.
 *
 * Данные (`loadStatus`, `errorMessage`) — обычные поля. Предикаты — геттеры,
 * читающие стор при каждом обращении.
 */
export interface LoadingStage extends Readonly<LoadingStageData> {
  readonly isLoading: boolean
  readonly isSuccess: boolean
  readonly isInitial: boolean
  readonly isError: boolean
  readonly isFinished: boolean
  loading: () => void
  success: () => void
  error: (message?: Nullable<string>) => void
  reset: () => void
}

/**
 * Создаёт вложенную под-модель «стадия загрузки».
 *
 * В отличие от `createLoadingSlice`, который микшируется в стор плоским
 * слоем, вся под-модель лежит в одной ключ-области (`path`) и доступна как
 * `get().reloadingStage.isLoading`.
 *
 * Как это работает:
 * - значение статуса лежит в поле `loadStatus` самого объекта стадии;
 * - предикаты — геттеры, читающие `get()[path].loadStatus` при каждом обращении;
 * - экшены создают новый объект стадии и кладут его в стор по ключу `path`.
 *   Новая ссылка нужна, чтобы zustand увидел изменение и уведомил
 *   подписчиков (`useStore((s) => s.reloadingStage.isLoading)`).
 *
 * @example
 * ```ts
 * interface CommentsStore {
 *   comments: Array<Comment>
 *   reloadingStage: LoadingStage
 *   loadingMoreStage: LoadingStage
 *   loadMoreComments: () => Promise<Nullable<CommentsResponse>>
 * }
 *
 * export const useCommentsStore = create<CommentsStore>()((set, get) => ({
 *   comments: [],
 *   reloadingStage: createLoadingStage(set, get, 'reloadingStage'),
 *   loadingMoreStage: createLoadingStage(set, get, 'loadingMoreStage'),
 *
 *   async loadMoreComments() {
 *     if (get().loadingMoreStage.isLoading) return null
 *
 *     get().loadingMoreStage.loading()
 *     const response = await fetchComments()
 *
 *     if (response.isError) get().loadingMoreStage.error()
 *     else get().loadingMoreStage.success()
 *
 *     return response
 *   },
 * }))
 * ```
 */
export function createLoadingStage<Store, Key extends keyof Store>(
  set: StoreApi<Store>['setState'],
  get: StoreApi<Store>['getState'],
  path: Key,
): LoadingStage {
  const getLoadStatus = (): FetchStatus => {
    return (get()[path] as LoadingStageData).loadStatus
  }

  const setStage = (data: LoadingStageData) => {
    set({ [path]: makeStage(data) } as unknown as Partial<Store>)
  }

  // Обычная функция-конструктор, а не стрелочная: вызывается из setStage
  // раньше своего объявления (hoisting), поэтому здесь нужен hoisted вид.
  function makeStage(data: LoadingStageData): LoadingStage {
    return {
      ...data,

      get isInitial() {
        return getLoadStatus() === 'initial'
      },
      get isLoading() {
        return getLoadStatus() === 'loading'
      },
      get isSuccess() {
        return getLoadStatus() === 'success'
      },
      get isError() {
        return getLoadStatus() === 'error'
      },
      get isFinished() {
        const status = getLoadStatus()

        return status === 'success' || status === 'error'
      },

      loading: () =>
        setStage({
          loadStatus: 'loading',
          errorMessage: null,
        }),

      success: () =>
        setStage({
          loadStatus: 'success',
          errorMessage: null,
        }),

      error: (message) =>
        setStage({
          loadStatus: 'error',
          errorMessage: message ?? null,
        }),

      reset: () => setStage(INITIAL_DATA),
    }
  }

  return makeStage(INITIAL_DATA)
}
