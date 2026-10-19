const BASE_URL = 'https://pokeapi.co/api/v2'

/** Сырая запись из response.results эндпоинта /pokemon */
interface PokemonRaw {
  name: string
  url: string
}

/** Ответ эндпоинта /pokemon (пагинация через limit/offset) */
interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<PokemonRaw>
}

/** Нормализованная запись покемона для использования в приложении */
export interface Pokemon {
  id: number
  name: string
}

/** Извлекает id из url вида https://pokeapi.co/api/v2/pokemon/25/ */
function extractId(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/$/)
  if (!match) {
    throw new Error(`Не удалось извлечь id из url: ${url}`)
  }
  return Number(match[1])
}

/**
 * Получает страницу списка покемонов.
 * Бросает Error при HTTP-ошибке или проблемах сети — обработчик выбирает стор.
 */
export async function getPokemonList(
  limit = 20,
  offset = 0,
): Promise<Array<Pokemon>> {
  let response: Response

  try {
    response = await fetch(
      `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    )
  } catch {
    // fetch бросает TypeError только при сетевом сбое (нет сети, DNS, CORS)
    throw new Error('Сетевая ошибка: не удалось связаться с сервером')
  }

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`)
  }

  const data: PokemonListResponse = await response.json()

  return data.results.map((raw) => ({
    id: extractId(raw.url),
    name: raw.name,
  }))
}
