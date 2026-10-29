# Zustand Study — соглашение проекта

## Стек и структура

- Vite + React + TypeScript + Zustand
- Архитектура: FSD (Feature-Sliced Design), алиас `@/` → `src/`
- TypeScript с `erasableSyntaxOnly: true` — нативные `enum` запрещены,
  вместо них union-типы или `as const` + union

## Правила типов (ОБЯЗАТЕЛЬНО)

1. **Всегда использовать `Nullable<T>` из `typescript-extended-types` для значений,
   которые могут быть `null` и/или `undefined`. НЕ заменять его на `T | null`
   или `T | null | undefined`.**

   ```ts
   // ✅ правильно
   data: Nullable<D>

   // ❌ неправильно
   data: D | null
   ```

2. Массивы описывать как `Array<T>`, а не `T[]`.

   ```ts
   // ✅ правильно
   items: Array<Pokemon>

   // ❌ неправильно
   items: Pokemon[]
   ```

3. Проверка отсутствующего значения — гвард `isNullish` из `typescript-extended-types`
   (не `value === null || value === undefined` вручную).

## Стиль кода

- Prettier: без `;`, одинарные кавычки (конфликтует с форматтером — не спорить)
- Форматирование и oxlint-фиксы применяются при сохранении в VS Code
- Комментарии на русском языке
