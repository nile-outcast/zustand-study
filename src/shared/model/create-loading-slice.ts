import type { FetchStatus } from '@/shared/types/fetch-status'
import type { SliceCreator } from '@/shared/types/slice-creator'

/**
 * Микшируется в стор плоским слоем через спред:
 * `...createLoadingSlice(set, get)`.
 */
export interface LoadingSlice {
  status: FetchStatus
  // Экшены по именам статусов
  loading: () => void
  success: () => void
  error: () => void
  reset: () => void
  // Предикаты
  isInitial: () => boolean
  isLoading: () => boolean
  isSuccess: () => boolean
  isError: () => boolean
  isFinished: () => boolean
}

/**
 * Переиспользуемый срез «статус загрузки».
 *
 * Сигнатура — через SliceCreator<LoadingSlice>: обычная функция двух
 * аргументов, без StoreApi. set/get типизированы собственным типом
 * среза — срез не зависит от целевого стора и не может читать чужие
 * поля через get().
 */
export const createLoadingSlice: SliceCreator<LoadingSlice> = (set, get) => ({
  status: 'initial',

  loading: () => set({ status: 'loading' }),
  success: () => set({ status: 'success' }),
  error: () => set({ status: 'error' }),
  reset: () => set({ status: 'initial' }),

  isInitial: () => get().status === 'initial',
  isLoading: () => get().status === 'loading',
  isSuccess: () => get().status === 'success',
  isError: () => get().status === 'error',
  isFinished: () => get().status === 'success' || get().status === 'error',
})
