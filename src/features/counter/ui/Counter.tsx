import { useCounterStore } from '@/entities/counter/model/counter-store'
import './Counter.css'

export function Counter() {
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)
  const decrement = useCounterStore((state) => state.decrement)
  const reset = useCounterStore((state) => state.reset)

  return (
    <div className="counter">
      <button type="button" className="counter__btn" onClick={decrement}>
        −
      </button>
      <span className="counter__value">Count is {count}</span>
      <button type="button" className="counter__btn" onClick={increment}>
        +
      </button>
      <button type="button" className="counter__btn counter__btn--reset" onClick={reset}>
        Reset
      </button>
    </div>
  )
}
