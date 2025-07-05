/**
 * Interface for high-precision decimal arithmetic with fixed decimal scale.
 *
 * This interface defines the core contract for the `BigFloat` implementation,
 * which provides safe and predictable arithmetic operations using `bigint` under the hood.
 *
 * All operations follow the internal scaling defined by `FIXED_DECIMALS`
 * and produce immutable, consistent results.
 *
 * @see {@link import("@1inch-community/core/math").BigFloat | BigFloat} for implementation and static helpers (e.g. from(), parseJSON(), zero())
 *
 * ## Notes:
 * - Use `BigFloat` directly to create instances via static factory methods
 * - This interface is useful for abstracting logic or mocking in tests
 *
 * @example
 * import { BigFloat } from '@1inch-community/core/math'
 *
 * const a: IBigFloat = BigFloat.from("0.01")
 * const b: IBigFloat = BigFloat.from("0.02")
 * const sum = a.plus(b)
 * console.log(sum.toString()) // "0.03"
 */
export interface IBigFloat {
  /**
   * @internal
   * Internal value scaled to FIXED_DECIMALS
   * default FIXED_DECIMALS = 50
   * */
  readonly value: bigint

  /**
   * Checks if the BigFloat value is exactly zero.
   *
   * @returns `true` if the value is 0, otherwise `false`
   *
   * @example
   * BigFloat.from("0.000").isZero() // → true
   * BigFloat.from("0.01").isZero()  // → false
   */
  isZero(): boolean

  /**
   * Checks if the BigFloat value is negative.
   *
   * @returns `true` if the value is less than zero, otherwise `false`
   *
   * @example
   * BigFloat.from("-1").isNegative() // → true
   * BigFloat.from("0").isNegative()  // → false
   */
  isNegative(): boolean

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
  isEqualTo(other: IBigFloat): boolean

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
  absoluteValue(): IBigFloat

  /**
   * Checks if this BigFloat is strictly greater than another.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if this > other, otherwise `false`
   *
   * @example
   * BigFloat.from("3").isGreaterThan(BigFloat.from("1")) // → true
   */
  isGreaterThan(other: IBigFloat): boolean

  /**
   * Checks if this BigFloat is greater than or equal to another.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if this ≥ other, otherwise `false`
   *
   * @example
   * BigFloat.from("2").isGreaterThanOrEqualTo(BigFloat.from("2")) // → true
   */
  isGreaterThanOrEqualTo(other: IBigFloat): boolean

  /**
   * Checks if this BigFloat is strictly less than another.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if this < other, otherwise `false`
   *
   * @example
   * BigFloat.from("1").isLessThan(BigFloat.from("2")) // → true
   */
  isLessThan(other: IBigFloat): boolean

  /**
   * Checks if this BigFloat is less than or equal to another.
   *
   * @param other The BigFloat to compare with
   * @returns `true` if this ≤ other, otherwise `false`
   *
   * @example
   * BigFloat.from("2").isLessThanOrEqualTo(BigFloat.from("2")) // → true
   */
  isLessThanOrEqualTo(other: IBigFloat): boolean

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
  dividedBy(other: IBigFloat): IBigFloat

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
  times(other: IBigFloat): IBigFloat

  /**
   * Subtracts another BigFloat from the current value.
   *
   * @param other The BigFloat to subtract
   * @returns A new BigFloat representing the difference
   *
   * @example
   * BigFloat.from("5").minus(BigFloat.from("2")) // → BigFloat("3")
   */
  minus(other: IBigFloat): IBigFloat

  /**
   * Adds another BigFloat to the current value.
   *
   * @param other The BigFloat to add
   * @returns A new BigFloat representing the sum
   *
   * @example
   * BigFloat.from("1.2").plus(BigFloat.from("0.8")) // → BigFloat("2.0")
   */
  plus(other: IBigFloat): IBigFloat

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
  toFixed(precision: number): string

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
  toFixedSmart(precision: number): string

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
  toWei(decimals: number): bigint

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
  toJSON(): string

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
  toString(): string
}
