import { describe, expect, it } from 'vitest'
import { BigFloat } from './big-float'

describe('BigFloat', () => {
  it('from', () => {
    const a = BigFloat.from('0.001')
    const b = BigFloat.from(0.001)
    const c = BigFloat.from(1n, 3)
    const d = BigFloat.from(' 0.0001 ')
    const i = BigFloat.from(1n, 4)
    expect(a.isEqualTo(b)).toBeTruthy()
    expect(a.isEqualTo(c)).toBeTruthy()
    expect(a.isEqualTo(d)).not.toBeTruthy()
    expect(d.isEqualTo(i)).toBeTruthy()
    expect(() => BigFloat.from(1n as any)).toThrow('Invalid Big Float making: 1')
  })

  it('fromBigInt', () => {
    const bigFloat = BigFloat.fromBigInt(1000n, 8)
    const value = Reflect.get(bigFloat, 'value')
    expect(value).toBe(1000000000000000000000000000000000000000000000n)
  })

  it('fromBigInt negative number', () => {
    const bigFloat = BigFloat.fromBigInt(-1000n, 8)
    const value = Reflect.get(bigFloat, 'value')
    expect(value).toBe(-1000000000000000000000000000000000000000000000n)
  })

  it('fromBigInt big decimals', () => {
    expect(() => BigFloat.fromBigInt(1000n, 101)).toThrow('decimals exceeds maximum allowed value')
  })

  it('fromBigInt decimals decimals less than zero', () => {
    expect(() => BigFloat.fromBigInt(1000n, -1)).toThrow('decimals must be greater than 0')
  })

  it('fromBigInt throws on NaN and Infinity decimals', () => {
    expect(() => BigFloat.fromBigInt(1n, NaN)).toThrow('decimals must be a finite integer')
    expect(() => BigFloat.fromBigInt(1n, Infinity)).toThrow(
      'decimals exceeds maximum allowed value'
    )
    expect(() => BigFloat.fromBigInt(1n, -Infinity)).toThrow('decimals must be greater than 0')
  })

  it('fromString', () => {
    const stringNumber1 = '0.00001'
    const stringNumber2 = '000.01'
    const bigFloat1 = BigFloat.fromString(stringNumber1)
    const bigFloat2 = BigFloat.fromString(stringNumber2)
    const str1 = bigFloat1.toString()
    const str2 = bigFloat2.toString()
    expect(str1).toBe(stringNumber1)
    expect(str2).toBe('0.01')
    expect(() => BigFloat.fromString('000.')).toThrow('Invalid input: "000." is not a valid number')
  })

  it('fromString negative number', () => {
    const stringNumber = '-0.00001'
    const bigFloat = BigFloat.fromString(stringNumber)
    const str = bigFloat.toString()
    expect(str).toBe(stringNumber)
  })

  it('fromString should reject scientific notation', () => {
    expect(() => BigFloat.fromString('1e-6')).toThrow()
  })

  it('isNegative for positive and negative values', () => {
    expect(BigFloat.fromString('-1').isNegative()).toBe(true)
    expect(BigFloat.fromString('0').isNegative()).toBe(false)
    expect(BigFloat.fromString('1').isNegative()).toBe(false)
  })

  it('from number with precision issues', () => {
    expect(BigFloat.from(0.1).toString()).toBe('0.1')
    expect(BigFloat.from(1.0000000000000001).toString()).toBe('1')
  })

  it('from number should throw on NaN or Infinity', () => {
    expect(() => BigFloat.from(NaN)).toThrow()
    expect(() => BigFloat.from(Infinity)).toThrow()
    expect(() => BigFloat.from(-Infinity)).toThrow()
  })

  it('equals', () => {
    const a = BigFloat.fromString('2.5')
    const b = BigFloat.fromBigInt(25n, 1) // 2.5
    const c = BigFloat.fromString('2.50')
    expect(a.isEqualTo(b)).toBe(true)
    expect(a.isEqualTo(c)).toBe(true)
    expect(b.isEqualTo(c)).toBe(true)
  })

  it('toString', () => {
    const bigFloat1 = BigFloat.fromBigInt(1000n, 8)
    const bigFloat2 = BigFloat.fromBigInt(1000n, 18)
    const bigFloat3 = BigFloat.fromBigInt(1000n, 0)
    const str1 = bigFloat1.toString()
    const str2 = bigFloat2.toString()
    const str3 = bigFloat3.toString()
    expect(str1).toBe('0.00001')
    expect(str2).toBe('0.000000000000001')
    expect(str3).toBe('1000')
  })

  it('toJSON', () => {
    const bigFloat = BigFloat.fromBigInt(1000n, 8)
    const str = JSON.stringify({ value: bigFloat })
    expect(str).toBe('{"value":"BigFloat(0.00001)"}')
  })

  it('toFixed', () => {
    const bigFloat1 = BigFloat.fromBigInt(1000n, 8)
    const bigFloat2 = BigFloat.fromBigInt(-1000000000000n, 8)
    const bigFloat3 = BigFloat.fromBigInt(123456789n, 8)
    const bigFloat4 = BigFloat.fromBigInt(166648777n, 8)
    const bigFloat5 = BigFloat.from('1.2366')
    expect(bigFloat1.toFixed(2)).toBe('0.00')
    expect(bigFloat1.toFixed(9)).toBe('0.000010000')
    expect(bigFloat2.toFixed(2)).toBe('-10000.00')
    expect(bigFloat2.toFixed(5)).toBe('-10000.00000')
    expect(bigFloat3.toFixed(1)).toBe('1.2')
    expect(bigFloat3.toFixed(2)).toBe('1.23')
    expect(bigFloat3.toFixed(3)).toBe('1.235')
    expect(bigFloat3.toFixed(4)).toBe('1.2346')
    expect(bigFloat4.toFixed(0)).toBe('2')
    expect(bigFloat4.toFixed(1)).toBe('1.7')
    expect(bigFloat4.toFixed(3)).toBe('1.666')
    expect(bigFloat4.toFixed(4)).toBe('1.6665')
    expect(bigFloat5.toFixed(2)).toBe('1.24')
    expect(() => bigFloat4.toFixed(-1)).toThrow('Precision must be a non-negative integer')
  })

  it('toFixed round overflow', () => {
    const f = BigFloat.from('0.999999999999999999999')
    expect(f.toFixed(2)).toBe('1.00')
  })

  it('parseJSON', () => {
    const bigFloat = BigFloat.fromBigInt(1000n, 8)
    const str = JSON.stringify({ value: bigFloat })
    const obj = JSON.parse(str)
    const bigFloatRestore = BigFloat.parseJSON(obj.value)
    expect(bigFloatRestore.toString()).toBe('0.00001')
  })

  it('parseJSON invalid value', () => {
    expect(() => BigFloat.parseJSON('123')).toThrow('Invalid BigFloat JSON format: "123"')
    expect(() => BigFloat.parseJSON('BigFloat(0.1')).toThrow(
      'Invalid BigFloat JSON format: "BigFloat(0.1"'
    )
  })

  it('isBigFloat', () => {
    expect(BigFloat.isBigFloat('BigFloat(0.1)')).toBe(true)
    expect(BigFloat.isBigFloat('BigFloat(0)')).toBe(true)
    expect(BigFloat.isBigFloat('BigFloat(0')).toBe(false)
    expect(BigFloat.isBigFloat('BigFloat()')).toBe(false)
    expect(BigFloat.isBigFloat('123')).toBe(false)
  })

  it('isBigFloat performance test', () => {
    console.time('bigFloat performance full')
    for (let i = 0; i < 10_000; i++) {
      BigFloat.isBigFloat('BigFloat(0.1)')
      for (let j = 0; j < 10_000; j++) {
        BigFloat.isBigFloat('123')
      }
      BigFloat.isBigFloat('BigFloat(0.1)')
    }
    console.timeEnd('bigFloat performance full')
  })

  it('toWei', () => {
    const value = 1000n
    const decimals = 8
    const bigFloat = BigFloat.fromBigInt(value, decimals)
    const bigIntValue = bigFloat.toWei(decimals)
    expect(bigIntValue).toBe(value)
  })

  it('toWei with change of decimals', () => {
    const value = 1000000000n
    const decimals = 8
    const newDecimals = 18
    const bigFloat = BigFloat.fromBigInt(value, decimals)
    const bigIntValue = bigFloat.toWei(newDecimals)
    expect(bigIntValue).toBe(value * 10n ** BigInt(newDecimals - decimals))
  })

  it('add', () => {
    const addExpect = (bigFloat1: BigFloat, bigFloat2: BigFloat, result: string) => {
      console.log(bigFloat1.toString(), '+', bigFloat2.toString())
      expect(bigFloat1.plus(bigFloat2).toString()).toBe(result)
    }

    addExpect(BigFloat.fromBigInt(100n, 8), BigFloat.fromBigInt(400n, 18), '0.0000010000000004')
    addExpect(
      BigFloat.fromBigInt(123123123123123123n, 8),
      BigFloat.fromBigInt(44444444444444444444444444444444444n, 18),
      '44444445675675675.675675674444444444'
    )
  })

  it('add negative number', () => {
    const addExpect = (bigFloat1: BigFloat, bigFloat2: BigFloat, result: string) => {
      console.log(bigFloat1.toString(), '+', bigFloat2.toString())
      expect(bigFloat1.plus(bigFloat2).toString()).toBe(result)
    }

    addExpect(BigFloat.fromBigInt(-100n, 8), BigFloat.fromBigInt(-400n, 18), '-0.0000010000000004')
    addExpect(
      BigFloat.fromBigInt(-123123123123123123n, 8),
      BigFloat.fromBigInt(-44444444444444444444444444444444444n, 18),
      '-44444445675675675.675675674444444444'
    )
  })

  it('sub', () => {
    const subExpect = (bigFloat1: BigFloat, bigFloat2: BigFloat, result: string) => {
      console.log(bigFloat1.toString(), '-', bigFloat2.toString())
      expect(bigFloat1.minus(bigFloat2).toString()).toBe(result)
    }

    subExpect(BigFloat.fromBigInt(100n, 8), BigFloat.fromBigInt(400n, 18), '0.0000009999999996')
    subExpect(
      BigFloat.fromBigInt(123123123123123123n, 8),
      BigFloat.fromBigInt(44444444444444444444444444444444444n, 18),
      '-44444443213213213.213213214444444444'
    )
    subExpect(
      BigFloat.fromBigInt(44444444444444444444444444444444444n, 18),
      BigFloat.fromBigInt(123123123123123123n, 8),
      '44444443213213213.213213214444444444'
    )
  })

  it('sub negative number', () => {
    const subExpect = (bigFloat1: BigFloat, bigFloat2: BigFloat, result: string) => {
      console.log(bigFloat1.toString(), '-', bigFloat2.toString())
      expect(bigFloat1.minus(bigFloat2).toString()).toBe(result)
    }

    subExpect(BigFloat.fromBigInt(-100n, 8), BigFloat.fromBigInt(-400n, 18), '-0.0000009999999996')
    subExpect(
      BigFloat.fromBigInt(-123123123123123123n, 8),
      BigFloat.fromBigInt(-44444444444444444444444444444444444n, 18),
      '44444443213213213.213213214444444444'
    )
    subExpect(
      BigFloat.fromBigInt(-44444444444444444444444444444444444n, 18),
      BigFloat.fromBigInt(-123123123123123123n, 8),
      '-44444443213213213.213213214444444444'
    )
  })

  it('mul', () => {
    const mulExpect = (bigFloat1: BigFloat, bigFloat2: BigFloat, result: string) => {
      console.log(bigFloat1.toString(), '*', bigFloat2.toString())
      expect(bigFloat1.times(bigFloat2).toString()).toBe(result)
    }

    mulExpect(
      BigFloat.fromBigInt(100n, 8),
      BigFloat.fromBigInt(400n, 18),
      '0.0000000000000000000004'
    )
    mulExpect(
      BigFloat.fromBigInt(123123123123123123n, 8),
      BigFloat.fromBigInt(44444444444444444444444444444444444n, 18),
      '54721388054721387999999999.99999999945278611945278612'
    )
    mulExpect(BigFloat.from(0.001), BigFloat.from(0.02), '0.00002')
    mulExpect(BigFloat.from('0.000000000001'), BigFloat.from(0.5), '0.0000000000005')
    mulExpect(BigFloat.from('0.000000000001'), BigFloat.from(123), '0.000000000123')
  })

  it('mul negative number', () => {
    const mulExpect = (bigFloat1: BigFloat, bigFloat2: BigFloat, result: string) => {
      console.log(bigFloat1.toString(), '*', bigFloat2.toString())
      expect(bigFloat1.times(bigFloat2).toString()).toBe(result)
    }

    mulExpect(
      BigFloat.fromBigInt(-100n, 8),
      BigFloat.fromBigInt(-400n, 18),
      '0.0000000000000000000004'
    )
    mulExpect(
      BigFloat.fromBigInt(-123123123123123123n, 8),
      BigFloat.fromBigInt(-44444444444444444444444444444444444n, 18),
      '54721388054721387999999999.99999999945278611945278612'
    )
    mulExpect(BigFloat.from(0.001), BigFloat.from(0.02), '0.00002')
    mulExpect(BigFloat.from('-0.000000000001'), BigFloat.from(0.5), '-0.0000000000005')
    mulExpect(BigFloat.from('-0.000000000001'), BigFloat.from(123), '-0.000000000123')
  })

  it('mul on zero', () => {
    const bigFloat1 = BigFloat.fromBigInt(-1000n, 8)
    const bigFloat2 = BigFloat.zero()
    expect(bigFloat1.times(bigFloat2).isZero()).toBe(true)
  })

  it('div', () => {
    const divExpect = (bigFloat1: BigFloat, bigFloat2: BigFloat, result: string) => {
      console.log(bigFloat1.toString(), '/', bigFloat2.toString())
      expect(bigFloat1.dividedBy(bigFloat2).toString()).toBe(result)
    }

    divExpect(BigFloat.fromBigInt(100n, 8), BigFloat.fromBigInt(400n, 18), '2500000000')
    divExpect(
      BigFloat.fromBigInt(123123123123123123n, 8),
      BigFloat.fromBigInt(44444444444444444444444444444444444n, 18),
      '0.00000002770270270270270267500000000000000027702702'
    )
    divExpect(
      BigFloat.fromBigInt(44444444444444444444444444444444444n, 18),
      BigFloat.fromBigInt(123123123123123123n, 8),
      '36097560.97560975613365853658536585333365853658536585333365'
    )
  })

  it('div negative number', () => {
    const divExpect = (bigFloat1: BigFloat, bigFloat2: BigFloat, result: string) => {
      console.log(bigFloat1.toString(), '/', bigFloat2.toString())
      expect(bigFloat1.dividedBy(bigFloat2).toString()).toBe(result)
    }

    divExpect(BigFloat.fromBigInt(-100n, 8), BigFloat.fromBigInt(-400n, 18), '2500000000')
    divExpect(
      BigFloat.fromBigInt(-123123123123123123n, 8),
      BigFloat.fromBigInt(-44444444444444444444444444444444444n, 18),
      '0.00000002770270270270270267500000000000000027702702'
    )
    divExpect(
      BigFloat.fromBigInt(-44444444444444444444444444444444444n, 18),
      BigFloat.fromBigInt(-123123123123123123n, 8),
      '36097560.97560975613365853658536585333365853658536585333365'
    )
  })

  it('div on zero', () => {
    const bigFloat1 = BigFloat.fromBigInt(-1000n, 8)
    const bigFloat2 = BigFloat.zero()
    expect(() => bigFloat1.dividedBy(bigFloat2)).toThrow('Division by zero')
  })

  it('abs', () => {
    const bigFloat1 = BigFloat.fromBigInt(-1000n, 8)
    const bigFloat2 = BigFloat.fromString('-0.00001')
    expect(bigFloat1.absoluteValue().toString()).toBe('0.00001')
    expect(bigFloat2.absoluteValue().toString()).toBe('0.00001')
  })

  it('percentage calculation', () => {
    const bigFloatTarget = BigFloat.fromString('10000')
    const bigFloatPercent = BigFloat.fromString('25')
    const bigFloatFull = BigFloat.fromString('100')
    const result = bigFloatPercent.times(bigFloatTarget).dividedBy(bigFloatFull).toString()
    expect(result).toBe('2500')
  })

  it('arithmetic mean', () => {
    const a = BigFloat.fromString('10.5')
    const b = BigFloat.fromString('20.5')
    const c = BigFloat.fromString('30.5')
    const d = BigFloat.fromString('40.5')

    const sum = a.plus(b).plus(c).plus(d)
    const average = sum.dividedBy(BigFloat.fromBigInt(4n, 0))

    expect(average.toString()).toBe('25.5')
  })

  it('currency conversion', () => {
    const amount = BigFloat.fromString('100.25')
    const rate = BigFloat.fromString('1.1')
    const result = amount.times(rate)
    expect(result.toString()).toBe('110.275')
  })

  it('square of a number', () => {
    const x = BigFloat.fromString('12.34')
    const square = x.times(x)
    expect(square.toString()).toBe('152.2756')
  })

  it('product of a series', () => {
    const x1 = BigFloat.fromString('1.1')
    const x2 = BigFloat.fromString('2.2')
    const x3 = BigFloat.fromString('3.3')

    const product = x1.times(x2).times(x3)
    expect(product.toString()).toBe('7.986')
  })

  it('comparison methods', () => {
    const a = BigFloat.from('1.00001')
    const b = BigFloat.from('1.00001')
    const c = BigFloat.from('1.00002')
    const d = BigFloat.from('0.99999')

    expect(a.isLessThan(c)).toBe(true)
    expect(c.isLessThan(a)).toBe(false)

    expect(a.isLessThanOrEqualTo(c)).toBe(true)
    expect(a.isLessThanOrEqualTo(b)).toBe(true)
    expect(c.isLessThanOrEqualTo(a)).toBe(false)

    expect(c.isGreaterThan(a)).toBe(true)
    expect(a.isGreaterThan(c)).toBe(false)

    expect(c.isGreaterThanOrEqualTo(a)).toBe(true)
    expect(a.isGreaterThanOrEqualTo(b)).toBe(true)
    expect(a.isGreaterThanOrEqualTo(c)).toBe(false)

    expect(d.isLessThan(a)).toBe(true)
    expect(d.isLessThanOrEqualTo(a)).toBe(true)
    expect(d.isGreaterThan(a)).toBe(false)
    expect(d.isGreaterThanOrEqualTo(a)).toBe(false)
  })

  it('zero returns 0', () => {
    const zero1 = BigFloat.zero()
    const zero2 = BigFloat.from(0)
    const zero3 = BigFloat.from(0n, 0)
    expect(zero1.toString()).toBe('0')
    expect(zero1.isZero()).toBe(true)
    expect(zero1.isEqualTo(zero2)).toBe(true)
    expect(zero1.isEqualTo(zero3)).toBe(true)
  })

  it('uint is correct', () => {
    const value1 = BigFloat.uint(128)
    expect(value1.toWei(0)).toBe(340282366920938463463374607431768211455n)
  })

  it('uint with invalid bit length', () => {
    expect(BigFloat.uint(0).isZero()).toBe(true)
    expect(() => BigFloat.uint(-1)).toThrow()
  })

  it('maxUint256 is correct', () => {
    const max1 = BigFloat.uint(256)
    const max2 = BigFloat.uint(256)
    expect(max1.toWei(0)).toBe(2n ** 256n - 1n)
    expect(max2.toWei(18)).toBe(
      115792089237316195423570985008687907853269984665640564039457584007913129639935000000000000000000n
    )
  })

  it('toFixedSmart formats correctly', () => {
    const value1 = BigFloat.fromString('1234.56789')
    const value2 = BigFloat.fromString('12.00001234')
    const value3 = BigFloat.fromString('0.00001234')
    const value4 = BigFloat.fromString('0.00001234')
    expect(value1.toFixedSmart(2)).toBe('1 234.56')
    expect(value2.toFixedSmart(2)).toBe('12.00')
    expect(value3.toFixedSmart(2)).toBe('0.000012')
    expect(value4.toFixedSmart(8)).toBe('0.00001234')
    expect(() => value4.toFixedSmart(-1)).toThrow('Precision must be a non-negative integer')
  })

  it('invalid string', () => {
    expect(() => {
      BigFloat.fromString('test')
    }).toThrow('Invalid input: "test" is not a valid number')
  })
})
