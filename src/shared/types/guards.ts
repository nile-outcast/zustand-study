import type { BaseObject } from './basic'

type Nil = null | undefined

/**
 * Проверка на «отсутствующее значение» (null или undefined).
 * Аналог оператора ?? — оба считают эти значения nil.
 */
export function isNil<T>(value: T | Nil): value is Nil {
  return value === null || value === undefined
}

/**
 * Проверка на строку.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Проверка на число (исключает NaN).
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * Проверка на boolean.
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Проверка на обычный объект (без null, массивов и прототипов).
 */
export function isObject(value: unknown): value is BaseObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

/**
 * Проверка на функцию.
 */
export function isFunction(
  value: unknown,
): value is (...args: never[]) => unknown {
  return typeof value === 'function'
}

/**
 * Проверка на пустую строку.
 */
export function isEmptyString(value: string | null | undefined): value is '' {
  return value === ''
}

/**
 * Проверка на пустой массив.
 */
export function isEmptyArray<T = unknown>(value: T[]): value is Array<never> {
  return Array.isArray(value) && value.length === 0
}

/**
 * Проверка на пустой объект.
 */
export function isEmptyObject(value: BaseObject): value is BaseObject<never> {
  return isObject(value) && Object.keys(value).length === 0
}
