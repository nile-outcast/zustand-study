import { Counter } from '@/features/counter'
import { PokemonList } from '@/features/pokemon-list'
import './IndexPage.css'

export function IndexPage() {
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
