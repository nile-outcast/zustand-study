import { useCallback, useEffect, useRef } from 'react'

import { usePokemonStore } from '@/entities/pokemon/model/pokemon-store'
import type { Nullable } from '@/shared/types/basic'

import './PokemonList.css'

export function PokemonList() {
  const isLoading = usePokemonStore((state) => state.isLoading)
  const loadErrorMessage = usePokemonStore((state) => state.loadErrorMessage)
  const isLoadingMore = usePokemonStore((state) => state.isLoadingMore)
  const loadMoreErrorMessage = usePokemonStore(
    (state) => state.loadMoreErrorMessage,
  )
  const items = usePokemonStore((state) => state.items)
  const fetchPokemonList = usePokemonStore((state) => state.fetchPokemonList)
  const fetchNextPage = usePokemonStore((state) => state.fetchNextPage)

  const sentinelRef = useRef<HTMLLIElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)

  useEffect(() => {
    void fetchPokemonList()
  }, [fetchPokemonList])

  // Callback ref: observer создаётся при появлении sentinel в DOM.
  // fetchNextPage создаётся вместе со стором, его ссылка стабильна,
  // поэтому колбэк не пересоздаётся при дозагрузке страниц.
  const setSentinelRef = useCallback(
    (el: Nullable<HTMLLIElement>) => {
      sentinelRef.current = el

      if (!el) {
        observerRef.current?.disconnect()
        observerRef.current = null

        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            void fetchNextPage()
          }
        },
        { rootMargin: '200px' },
      )

      observer.observe(el)
      observerRef.current = observer
    },
    [fetchNextPage],
  )

  // Sentinel может остаться во вьюпорте после дозагрузки — нового события
  // пересечения не будет. Перезаряжаем наблюдателя на том же элементе,
  // чтобы он снова сообщил о видимости.
  useEffect(() => {
    const el = sentinelRef.current
    const observer = observerRef.current

    if (!el || !observer) return

    observer.unobserve(el)
    observer.observe(el)
  }, [isLoadingMore])

  if (isLoading) {
    return (
      <div className="pokemon-list__centered">
        <p className="pokemon-list__status">Загрузка покемонов…</p>
      </div>
    )
  }

  if (loadErrorMessage) {
    return (
      <div className="pokemon-list__centered">
        <div className="pokemon-list__error">
          <p>Не удалось загрузить покемонов: {loadErrorMessage}</p>
          <button
            type="button"
            className="pokemon-list__retry"
            onClick={() => void fetchPokemonList()}
          >
            Повторить
          </button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <ul className="pokemon-list">
      {items.map((pokemon) => (
        <li key={pokemon.id} className="pokemon-list__item">
          <span className="pokemon-list__id">
            #{String(pokemon.id).padStart(3, '0')}
          </span>
          <span className="pokemon-list__name">{pokemon.name}</span>
        </li>
      ))}

      {loadMoreErrorMessage ? (
        <li className="pokemon-list__more-error">
          <p className="pokemon-list__status">
            Не удалось догрузить: {loadMoreErrorMessage}
          </p>
          <button
            type="button"
            className="pokemon-list__retry"
            onClick={() => void fetchNextPage()}
          >
            Дозагрузить
          </button>
        </li>
      ) : (
        <li ref={setSentinelRef} className="pokemon-list__sentinel" />
      )}

      {isLoadingMore && (
        <li className="pokemon-list__status pokemon-list__status--inline">
          Загрузка…
        </li>
      )}
    </ul>
  )
}
