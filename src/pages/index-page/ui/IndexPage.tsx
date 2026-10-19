import { usePokemonStore } from '@/entities/pokemon/model/pokemon-store'
import { Counter } from '@/features/counter'
import { PokemonList } from '@/features/pokemon-list'
import { useEffect } from 'react'
import './IndexPage.css'

export function IndexPage() {
  const fetchPokemonList = usePokemonStore((state) => state.fetchPokemonList)

  useEffect(() => {
    void fetchPokemonList()
  }, [fetchPokemonList])

  return (
    <section className="index-page">
      <h1>Zustand Study</h1>
      <p>
        Edit <code>src/features/counter</code> and save to test <code>HMR</code>
      </p>
      <Counter />
      <h2>Pokemon (первые 20)</h2>
      <PokemonList />
    </section>
  )
}
