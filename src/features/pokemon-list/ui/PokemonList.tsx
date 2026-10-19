import { usePokemonStore } from '@/entities/pokemon/model/pokemon-store'
import { useEffect } from 'react'
import './PokemonList.css'

export function PokemonList() {
  const isLoading = usePokemonStore((state) => state.isLoading())
  const isError = usePokemonStore((state) => state.isError())
  const isSuccess = usePokemonStore((state) => state.isSuccess())
  const items = usePokemonStore((state) => state.items)
  const errorMessage = usePokemonStore((state) => state.errorMessage)
  const fetchPokemonList = usePokemonStore((state) => state.fetchPokemonList)

    useEffect(() => {
    void fetchPokemonList()
  }, [fetchPokemonList])

  if (isLoading) {
    return <p className="pokemon-list__status">Загрузка покемонов…</p>
  }

  if (isError) {
    return (
      <div className="pokemon-list__error">
        <p>Не удалось загрузить покемонов: {errorMessage}</p>
        <button
          type="button"
          className="pokemon-list__retry"
          onClick={() => void fetchPokemonList()}
        >
          Повторить
        </button>
      </div>
    )
  }

  if (!isSuccess) {
    return null
  }

  return (
    <ul className="pokemon-list">
      {items.map((pokemon) => (
        <li key={pokemon.id} className="pokemon-list__item">
          <span className="pokemon-list__id">#{String(pokemon.id).padStart(3, '0')}</span>
          <span className="pokemon-list__name">{pokemon.name}</span>
        </li>
      ))}
    </ul>
  )
}
