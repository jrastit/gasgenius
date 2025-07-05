import { svg, TemplateResult } from 'lit'

interface Point {
  x: number
  y: number
}

interface LineSegment {
  start: number
  end: number
}

const MARGIN_ERROR = 0.1
const DOT_SIZE_FACTOR = 2.5
const QR_MARGIN = 7

function areDotsAdjacent(y1: number, y2: number, size: number): boolean {
  if (y1 === y2) return false
  return Math.abs(y1 - y2) <= size + MARGIN_ERROR
}

async function createQRMatrix(
  data: string,
  level: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H'
): Promise<boolean[][]> {
  const QRCodeLib = await import('qrcode').catch(() => {})

  if (!QRCodeLib) {
    throw new Error("for use qrcode install lib 'qrcode'")
  }

  const qrData = QRCodeLib.create(data, { errorCorrectionLevel: level }).modules.data
  const dataArray = Array.from(qrData)
  const matrixSize = Math.sqrt(dataArray.length)

  const matrix: boolean[][] = []
  for (let i = 0; i < matrixSize; i++) {
    const row = dataArray.slice(i * matrixSize, (i + 1) * matrixSize).map((value) => Boolean(value))
    matrix.push(row)
  }

  return matrix
}

function isPositionPattern(i: number, j: number, matrixSize: number): boolean {
  return (
    (i < QR_MARGIN && j < QR_MARGIN) ||
    (i > matrixSize - (QR_MARGIN + 1) && j < QR_MARGIN) ||
    (i < QR_MARGIN && j > matrixSize - (QR_MARGIN + 1))
  )
}

function isInLogoArea(i: number, j: number, start: number, end: number): boolean {
  return i > start && i < end && j > start && j < end
}

export const QRCodeGenerator = {
  async render(
    content: string,
    dimension: number,
    iconDimension: number
  ): Promise<TemplateResult[]> {
    const elements: TemplateResult[] = []
    const qrMatrix = await createQRMatrix(content, 'H')
    const cellDimension = dimension / qrMatrix.length

    this.renderCornerElements(elements, qrMatrix.length, cellDimension)

    const clearAreaSize = Math.floor((iconDimension + 25) / cellDimension)
    const middleStart = qrMatrix.length / 2 - clearAreaSize / 2
    const middleEnd = qrMatrix.length / 2 + clearAreaSize / 2 - 1

    const pointCoordinates: Point[] = []
    for (let i = 0; i < qrMatrix.length; i++) {
      for (let j = 0; j < qrMatrix.length; j++) {
        if (!qrMatrix[i][j]) continue

        if (
          !isPositionPattern(i, j, qrMatrix.length) &&
          !isInLogoArea(i, j, middleStart, middleEnd)
        ) {
          pointCoordinates.push({
            x: i * cellDimension + cellDimension / 2,
            y: j * cellDimension + cellDimension / 2,
          })
        }
      }
    }

    const pointsByX = this.groupPointsByX(pointCoordinates)

    this.renderIsolatedDots(elements, pointsByX, cellDimension)
    this.renderConnectedLines(elements, pointsByX, cellDimension)

    return elements
  },

  renderCornerElements(elements: TemplateResult[], matrixSize: number, cellSize: number): void {
    const cornerPositions = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]

    cornerPositions.forEach((pos) => {
      const xOffset = (matrixSize - QR_MARGIN) * cellSize * pos.x
      const yOffset = (matrixSize - QR_MARGIN) * cellSize * pos.y
      const cornerRadius = 0.45

      for (let i = 0; i < 3; i++) {
        const elemSize = cellSize * (QR_MARGIN - i * 2)
        const color = '#141414'
        const transparent = 'transparent'
        const strokeWidth = 5

        const fill = i === 2 ? color : transparent
        const stroke = color
        const width = i === 0 ? elemSize - strokeWidth : elemSize
        const height = i === 0 ? elemSize - strokeWidth : elemSize
        const rx = i === 0 ? (elemSize - strokeWidth) * cornerRadius : elemSize * cornerRadius
        const ry = rx
        const x = i === 0 ? yOffset + cellSize * i + strokeWidth / 2 : yOffset + cellSize * i
        const y = i === 0 ? xOffset + cellSize * i + strokeWidth / 2 : xOffset + cellSize * i
        const strokeWidthVal = i === 0 ? strokeWidth : 0

        elements.push(svg`
          <rect
            fill=${fill}
            width=${width}
            height=${height}
            rx=${rx}
            ry=${ry}
            stroke=${stroke}
            stroke-width=${strokeWidthVal}
            x=${x}
            y=${y}
          />
        `)
      }
    })
  },

  groupPointsByX(points: Point[]): Map<number, number[]> {
    const groupedPoints = new Map<number, number[]>()

    points.forEach((point) => {
      if (!groupedPoints.has(point.x)) {
        groupedPoints.set(point.x, [])
      }
      groupedPoints.get(point.x)?.push(point.y)
    })

    return groupedPoints
  },

  renderIsolatedDots(
    elements: TemplateResult[],
    pointsByX: Map<number, number[]>,
    cellSize: number
  ): void {
    const color = '#141414'
    const radius = cellSize / DOT_SIZE_FACTOR

    for (const [x, ys] of pointsByX.entries()) {
      const isolatedYs = ys.filter((y) =>
        ys.every((otherY) => !areDotsAdjacent(y, otherY, cellSize))
      )

      for (const y of isolatedYs) {
        elements.push(svg`<circle cx=${x} cy=${y} fill=${color} r=${radius} />`)
      }
    }
  },

  renderConnectedLines(
    elements: TemplateResult[],
    pointsByX: Map<number, number[]>,
    cellSize: number
  ): void {
    const color = '#141414'
    const lineWidth = cellSize / (DOT_SIZE_FACTOR / 2)

    for (const [x, ys] of pointsByX.entries()) {
      if (ys.length <= 1) continue

      const connectedYs = ys.filter((y) =>
        ys.some((otherY) => areDotsAdjacent(y, otherY, cellSize))
      )

      if (connectedYs.length === 0) continue

      connectedYs.sort((a, b) => a - b)
      const lineSegments: LineSegment[] = []
      let currentSegment: LineSegment | null = null

      for (const y of connectedYs) {
        if (!currentSegment) {
          currentSegment = { start: y, end: y }
          continue
        }

        if (areDotsAdjacent(currentSegment.end, y, cellSize)) {
          currentSegment.end = y
        } else {
          lineSegments.push(currentSegment)
          currentSegment = { start: y, end: y }
        }
      }

      if (currentSegment) {
        lineSegments.push(currentSegment)
      }

      for (const segment of lineSegments) {
        elements.push(svg`
          <line
            x1=${x}
            x2=${x}
            y1=${segment.start}
            y2=${segment.end}
            stroke=${color}
            stroke-width=${lineWidth}
            stroke-linecap="round"
          />
        `)
      }
    }
  },
}
