import { IBigFloat } from '@1inch-community/models'
import { smartFormatNumber } from '../formatters'

const BigFloatRegExp = /^BigFloat\((-?\d+(\.\d+)?)\)$/

/**
 * A high-precision fixed-point arithmetic class for financial and token-based calculations.
 *
 * Internally uses `bigint` and a fixed decimal precision (`FIXED_DECIMALS`) to avoid floating-point errors.
 * Supports construction from `string`, `number`, or `bigint + decimals`, and provides accurate math operations.
 *
 * Main features:
 * - Accurate addition, subtraction, multiplication, and division
 * - Stable `toString()`, `toFixed()`, and adaptive `toFixedSmart()`
 * - Conversion to/from `bigint` with desired precision
 * - JSON serialization/deserialization via `toJSON` and `parseJSON`
 * - Comparison utilities (`isEqualTo`, `isLessThan`, etc.)
 *
 * ⚠️ Limitations:
 * - `number` inputs may lose precision (use `string` or `bigint` when accuracy is critical)
 * - Scientific notation (`1e-8`) is not supported in string inputs
 *
 * @example
 * const a = BigFloat.from("1.2345")
 * const b = BigFloat.fromBigInt(12345n, 4)
 * const sum = a.plus(b)
 * console.log(sum.toFixed(2)) // → "2.47"
 */
export class BigFloat implements IBigFloat {
  protected static readonly FIXED_DECIMALS: number = 50

  /**
   * Creates a BigFloat instance from a number, string, or bigint with optional decimals.
   *
   * Overloads:
   * - `from(string)` — parses a decimal string, e.g. "123.45"
   * - `from(number)` — converts a number to BigFloat (not recommended for high precision)
   * - `from(bigint, decimals)` — creates a BigFloat from an integer with specified decimals
   *
   * @param value The input value: string, number, or bigint
   * @param decimals (Optional) Number of decimals if `value` is a bigint
   * @returns A new BigFloat instance
   * @throws If the input is invalid or decimals are missing for bigint
   *
   * @example
   * BigFloat.from("0.001")       // string input
   * BigFloat.from(0.001)         // number input
   * BigFloat.from(1000n, 8)      // bigint + decimals
   */
  static from(value: string): IBigFloat
  static from(value: number): IBigFloat
  static from(value: bigint, decimals: number): IBigFloat
  static from(value: bigint | string | number, decimals?: number): IBigFloat {
    if (typeof value === 'number') {
      return this.fromString(value.toString())
    }
    if (typeof value === 'string') {
      return this.fromString(value)
    }
    if (typeof value === 'bigint' && decimals !== undefined) {
      return this.fromBigInt(value, decimals)
    }
    throw new BigFloatError(`Invalid Big Float making: ${value.toString()}`)
  }

  /**
   * Creates a BigFloat from a bigint value and its decimal precision.
   *
   * The bigint is interpreted as a number with `decimals` digits after the decimal point.
   * It will be scaled to the internal FIXED_DECIMALS representation.
   *
   * @param value The raw bigint value (e.g. 1000n for "0.00001" with 8 decimals)
   * @param decimals Number of decimal digits the value represents
   * @returns A new BigFloat instance with normalized internal precision
   * @throws If `decimals` is negative or exceeds FIXED_DECIMALS
   *
   * @example
   * BigFloat.fromBigInt(1000n, 8) // → BigFloat("0.00001")
   */
  static fromBigInt(value: bigint, decimals: number): IBigFloat {
    if (decimals < 0) {
      throw new BigFloatError('decimals must be greater than 0')
    }
    if (decimals > BigFloat.FIXED_DECIMALS) {
      throw new BigFloatError('decimals exceeds maximum allowed value')
    }
    if (!Number.isFinite(decimals) || !Number.isInteger(decimals)) {
      throw new BigFloatError('decimals must be a finite integer')
    }
    const decimalsDelta = BigFloat.FIXED_DECIMALS - decimals
    const normalizeValue = value * BigInt(10) ** BigInt(decimalsDelta)
    return new BigFloat(normalizeValue)
  }

  /**
   * Parses a decimal string into a BigFloat instance.
   *
   * The string must represent a valid decimal number (e.g. "123.45", "-0.001").
   * Leading/trailing whitespace is ignored.
   *
   * @param value Decimal string to parse
   * @returns A new BigFloat representing the parsed value
   * @throws If the string is not a valid decimal number
   *
   * @example
   * BigFloat.fromString("0.0001")     // → BigFloat(0.0001)
   * BigFloat.fromString("-123.456")   // → BigFloat(-123.456)
   */
  static fromString(value: string): IBigFloat {
    const trimmedInput = value.trim()
    const numberRegex = /^-?\d+(\.\d+)?$/
    if (!numberRegex.test(trimmedInput)) {
      throw new BigFloatError(`Invalid input: "${value}" is not a valid number`)
    }
    const [intPart, fracPart = ''] = trimmedInput.split('.')
    const decimals = fracPart.length
    return this.fromBigInt(BigInt(intPart + fracPart), decimals)
  }

  /**
   * Parses a serialized BigFloat string from JSON.
   *
   * The input must match the format `"BigFloat(<number>)"`, e.g. `"BigFloat(123.45)"`.
   *
   * @param json JSON string containing a serialized BigFloat
   * @returns A BigFloat instance reconstructed from the string
   * @throws If the input does not match the expected format
   *
   * @example
   * BigFloat.parseJSON("BigFloat(0.0001)") // → BigFloat(0.0001)
   */
  static parseJSON(json: string): IBigFloat {
    const match = BigFloatRegExp.exec(json)
    if (!match) {
      throw new BigFloatError(`Invalid BigFloat JSON format: "${json}"`)
    }
    const numberStr = match[1]
    return BigFloat.fromString(numberStr)
  }

  /**
   * Checks if a string matches the serialized BigFloat format.
   *
   * Expected format: `"BigFloat(<number>)"`, e.g. `"BigFloat(123.45)"`.
   * This method is optimized for quick validation during JSON parsing.
   *
   * @param json String to validate
   * @returns `true` if the string is a valid serialized BigFloat, otherwise `false`
   *
   * @example
   * BigFloat.isBigFloat("BigFloat(1.23)") // → true
   * BigFloat.isBigFloat("123.45")         // → false
   */
  static isBigFloat(json: string): boolean {
    try {
      if (!json.startsWith('BigFloat(')) return false // performance optimization for json parsing
      return BigFloatRegExp.test(json)
    } catch {
      return false
    }
  }

  /**
   * Returns a BigFloat instance representing zero.
   *
   * Internally equals `0n` scaled to FIXED_DECIMALS.
   *
   * @returns A BigFloat with value 0
   *
   * @example
   * const zero = BigFloat.zero() // → BigFloat(0)
   */
  static zero(): IBigFloat {
    return new BigFloat(0n)
  }

  /**
   * Creates a BigFloat representing the maximum unsigned integer for a given bit length.
   *
   * The result is calculated as `2^len - 1` and scaled using `fromBigInt(..., 0)`.
   * Useful for defining uint-like bounds such as uint128, uint160, uint256, etc.
   *
   * @param len Bit length (e.g. 128, 160, 256)
   * @returns A BigFloat representing the maximum unsigned integer for the given bit length
   * @throws If `len` is negative
   *
   * @example
   * BigFloat.uint(128) // → BigFloat("340282366920938463463374607431768211455")
   */
  static uint(len: number): IBigFloat {
    return BigFloat.fromBigInt(2n ** BigInt(len) - 1n, 0)
  }

  protected constructor(readonly value: bigint) {}

  /**
   * Converts the BigFloat to a normalized decimal string.
   *
   * The internal bigint value is scaled down using FIXED_DECIMALS precision,
   * and returned as a human-readable decimal string (e.g. "123.456").
   * Leading zeros are removed from the integer part, and trailing zeros are trimmed from the fractional part.
   *
   * @returns Normalized decimal string representation of the BigFloat
   *
   * @example
   * BigFloat.fromBigInt(123456n, 3).toString() // → "123.456"
   * BigFloat.zero().toString()                 // → "0"
   */
  toString(): string {
    return toString(this, BigFloat.FIXED_DECIMALS)
  }

  /**
   * Serializes the BigFloat to a JSON-friendly string format.
   *
   * The output is a string in the form `"BigFloat(<number>)"`, where `<number>` is the decimal representation.
   * This format can later be parsed using `BigFloat.parseJSON()`.
   *
   * @returns A string representation suitable for JSON serialization
   *
   * @example
   * JSON.stringify({ amount: BigFloat.fromString("0.001") })
   * // → '{"amount":"BigFloat(0.001)"}'
   */
  toJSON() {
    return `BigFloat(${this.toString()})`
  }

  /**
   * Converts the BigFloat to a bigint with the specified decimal scale.
   *
   * The result is the internal value rescaled to match the target `decimals`.
   * This is useful for exporting values to tokens or systems with a specific decimal precision.
   *
   * @param decimals Target number of decimals for the output bigint
   * @returns Rescaled bigint representing the same value
   *
   * @example
   * BigFloat.fromString("0.0001").toWei(8) // → 10000n
   * BigFloat.fromString("123.45").toWei(0) // → 123n
   * BigFloat.from(1n, 18).toWei(18) // → 1n
   * BigFloat.from(1n, token.decimals).toWei(token.decimals) // → 1n
   */
  toWei(decimals: number): bigint {
    return toWei(this, decimals, BigFloat.FIXED_DECIMALS)
  }

  /**
   * Converts the BigFloat to a decimal string with fixed precision.
   *
   * Rounds the value to the specified number of digits after the decimal point using round-half-up logic.
   * Pads with trailing zeros if needed.
   *
   * @param precision Number of digits after the decimal point (must be ≥ 0)
   * @returns Decimal string with exactly `precision` digits
   * @throws If `precision` is negative
   *
   * @example
   * BigFloat.fromString("1.23456").toFixed(2) // → "1.23"
   * BigFloat.fromString("1.23556").toFixed(2) // → "1.24"
   * BigFloat.fromString("1.2").toFixed(4)     // → "1.2000"
   * BigFloat.fromString("1.5").toFixed(0)     // → "2"
   */
  toFixed(precision: number): string {
    return toFixed(this, precision)
  }

  /**
   * Converts the BigFloat to a smart-formatted string with adaptive precision and thousand separators.
   *
   * - Trims leading and trailing insignificant zeros
   * - Preserves the first non-zero digit after the decimal point, plus `precision` digits
   * - Adds spaces as thousand separators (e.g. "12 345.67")
   *
   * This is useful for displaying numbers compactly without losing meaningful digits.
   *
   * @param precision Number of significant digits after the first non-zero decimal digit
   * @returns Formatted string with adaptive precision
   * @throws If `precision` is negative
   *
   * @example
   * BigFloat.fromString("1234.56789").toFixedSmart(2)    // → "1 234.56"
   * BigFloat.fromString("0.00001234").toFixedSmart(2)    // → "0.000012"
   * BigFloat.fromString("12.00001234").toFixedSmart(2)   // → "12.00"
   */
  toFixedSmart(precision: number): string {
    return toFixedSmart(this, precision)
  }

  /**
   * Adds another BigFloat to the current value.
   *
   * @param other The BigFloat to add
   * @returns A new BigFloat representing the sum
   *
   * @example
   * BigFloat.from("1.2").plus(BigFloat.from("0.8")) // → BigFloat("2.0")
   */
  plus(other: IBigFloat): IBigFloat {
    return new BigFloat(this.value + other.value)
  }

  /**
   * Subtracts another BigFloat from the current value.
   *
   * @param other The BigFloat to subtract
   * @returns A new BigFloat representing the difference
   *
   * @example
   * BigFloat.from("5").minus(BigFloat.from("2")) // → BigFloat("3")
   */
  minus(other: IBigFloat): IBigFloat {
    return new BigFloat(this.value - other.value)
  }

  /**
   * Multiplies the current BigFloat by another.
   *
   * The result is automatically scaled back to FIXED_DECIMALS precision.
   *
   * @param other The BigFloat to multiply by
   * @returns A new BigFloat representing the product
   *
   * @example
   * BigFloat.from("0.1").times(BigFloat.from("0.2")) // → BigFloat("0.02")
   */
  times(other: IBigFloat): IBigFloat {
    const resultValue = (this.value * other.value) / BigInt(10) ** BigInt(BigFloat.FIXED_DECIMALS)
    return new BigFloat(resultValue)
  }

  /**
   * Divides the current BigFloat by another.
   *
   * The result is scaled to FIXED_DECIMALS precision.
   *
   * @param other The BigFloat to divide by
   * @returns A new BigFloat representing the quotient
   * @throws If `other` is zero
   *
   * @example
   * BigFloat.from("1").dividedBy(BigFloat.from("4")) // → BigFloat("0.25")
   */
  dividedBy(other: IBigFloat): IBigFloat {
    if (other.value === 0n) {
      throw new BigFloatError('Division by zero')
    }
    const scaledValue = this.value * BigInt(10) ** BigInt(BigFloat.FIXED_DECIMALS)
    const resultValue = scaledValue / other.value
    return new BigFloat(resultValue)
  }

  /**
   * Returns the absolute (non-negative) value of the BigFloat.
   *
   * If the current value is negative, returns its positive counterpart.
   *
   * @returns A new BigFloat with the same magnitude but always positive
   *
   * @example
   * BigFloat.from("-1.23").absoluteValue() // → BigFloat("1.23")
   * BigFloat.from("0.5").absoluteValue()   // → BigFloat("0.5")
   */
  absoluteValue(): IBigFloat {
    return new BigFloat(this.value < 0n ? -this.value : this.value)
  }

  /**
   * Checks if this BigFloat is exactly equal to another.
   *
   * Comparison is based on the raw internal value with FIXED_DECIMALS precision.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if values are exactly equal, otherwise `false`
   *
   * @example
   * BigFloat.from("1.000").isEqualTo(BigFloat.from("1")) // → true
   * BigFloat.from("1.0001").isEqualTo(BigFloat.from("1")) // → false
   */
  isEqualTo(other: IBigFloat): boolean {
    return this.value === other.value
  }

  /**
   * Checks if this BigFloat is strictly less than another.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if this < other, otherwise `false`
   *
   * @example
   * BigFloat.from("1").isLessThan(BigFloat.from("2")) // → true
   */
  isLessThan(other: IBigFloat): boolean {
    return this.value < other.value
  }

  /**
   * Checks if this BigFloat is less than or equal to another.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if this ≤ other, otherwise `false`
   *
   * @example
   * BigFloat.from("2").isLessThanOrEqualTo(BigFloat.from("2")) // → true
   */
  isLessThanOrEqualTo(other: IBigFloat): boolean {
    return this.value <= other.value
  }

  /**
   * Checks if this BigFloat is strictly greater than another.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if this > other, otherwise `false`
   *
   * @example
   * BigFloat.from("3").isGreaterThan(BigFloat.from("1")) // → true
   */
  isGreaterThan(other: IBigFloat): boolean {
    return this.value > other.value
  }

  /**
   * Checks if this BigFloat is greater than or equal to another.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if this ≥ other, otherwise `false`
   *
   * @example
   * BigFloat.from("2").isGreaterThanOrEqualTo(BigFloat.from("2")) // → true
   */
  isGreaterThanOrEqualTo(other: IBigFloat): boolean {
    return this.value >= other.value
  }

  /**
   * Checks if the BigFloat value is negative.
   *
   * @returns `true` if the value is less than zero, otherwise `false`
   *
   * @example
   * BigFloat.from("-1").isNegative() // → true
   * BigFloat.from("0").isNegative()  // → false
   */
  isNegative(): boolean {
    return this.value < 0n
  }

  /**
   * Checks if the BigFloat value is exactly zero.
   *
   * @returns `true` if the value is 0, otherwise `false`
   *
   * @example
   * BigFloat.from("0.000").isZero() // → true
   * BigFloat.from("0.01").isZero()  // → false
   */
  isZero(): boolean {
    return this.value === 0n
  }
}

function normalizeNumber(input: string): string {
  if (!input.includes('.')) {
    return input.replace(/^0+/, '') || '0'
  }
  const [intPart, fracPart] = input.split('.')
  const normalizedIntPart = intPart.replace(/^0+/, '') || '0'
  const normalizedFracPart = fracPart.replace(/0+$/, '')
  if (normalizedFracPart === '') {
    return normalizedIntPart
  }
  return `${normalizedIntPart}.${normalizedFracPart}`
}

function toString(value: IBigFloat, max: number): string {
  const factor = BigInt(10) ** BigInt(max)
  const intPart = value.value / factor
  const fracPart = value.value % factor
  const absFracPart = fracPart < 0n ? -fracPart : fracPart
  const formattedFracPart = absFracPart.toString().padStart(max, '0')
  return normalizeNumber(
    `${value.value < 0n && intPart >= 0n ? '-' : ''}${intPart}.${formattedFracPart}`
  )
}

function toWei(value: IBigFloat, decimals: number, max: number): bigint {
  const scaleDelta = decimals - max
  if (scaleDelta === 0) {
    return value.value
  }

  if (scaleDelta > 0) {
    const factor = BigInt(10) ** BigInt(scaleDelta)
    return value.value * factor
  } else {
    const factor = BigInt(10) ** BigInt(-scaleDelta)
    return value.value / factor
  }
}

function toFixed(value: IBigFloat, precision: number): string {
  if (precision < 0) {
    throw new BigFloatError('Precision must be a non-negative integer')
  }

  const strValue = value.toString()
  const [intPart, fracPart = ''] = strValue.split('.')
  if (fracPart.length < precision) {
    return `${intPart}.${fracPart.padEnd(precision, '0')}`
  }
  if (precision === 0) {
    return (BigInt(intPart) + (fracPart[0] >= '5' ? 1n : 0n)).toString()
  }
  const roundedFracPart = (
    BigInt(fracPart.slice(0, precision)) + (fracPart[precision] >= '5' ? 1n : 0n)
  ).toString()
  if (roundedFracPart.length > precision) {
    return `${BigInt(intPart) + 1n}.${roundedFracPart.slice(1)}`
  }
  return `${intPart}.${roundedFracPart.padStart(precision, '0')}`
}

function toFixedSmart(value: IBigFloat, precision: number): string {
  if (precision < 0) {
    throw new BigFloatError('Precision must be a non-negative integer')
  }
  const str = value.toString()
  return smartFormatNumber(str, precision)
}

class BigFloatError extends Error {
  constructor(message: string) {
    super(message)
  }
}
