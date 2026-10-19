import { usePokemonStore } from '@/entities/pokemon/model/pokemon-store'
import './PokemonList.css'

export function PokemonList() {
  const status = usePokemonStore((state) => state.status)
  const items = usePokemonStore((state) => state.items)
  const error = usePokemonStore((state) => state.error)
  const fetchPokemonList = usePokemonStore((state) => state.fetchPokemonList)

  if (status === 'loading') {
    return <p className="pokemon-list__status">Загрузка покемонов…</p>
  }

  if (status === 'error') {
    return (
      <div className="pokemon-list__error">
        <p>Не удалось загрузить покемонов: {error}</p>
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

  if (status !== 'success') {
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
