import regl from 'regl'
import { CoreModule } from '@/graph/modules/core-module'
import drawLineFrag from '@/graph/modules/Lines/draw-curve-line.frag'
import drawLineVert from '@/graph/modules/Lines/draw-curve-line.vert'
import { defaultConfigValues } from '@/graph/variables'
import { destroyBuffer } from '@/graph/modules/Shared/buffer'
import { getCurveLineGeometry } from '@/graph/modules/Lines/geometry'

export class Lines extends CoreModule {
  private drawCurveCommand: regl.DrawCommand | undefined
  private pointsBuffer: regl.Buffer | undefined
  private colorBuffer: regl.Buffer | undefined
  private widthBuffer: regl.Buffer | undefined
  private arrowBuffer: regl.Buffer | undefined
  private curveLineGeometry: number[][] | undefined
  private curveLineBuffer: regl.Buffer | undefined

  public create (): void {
    this.updatePointsBuffer()
    this.updateColor()
    this.updateWidth()
    this.updateArrow()
    this.updateCurveLineGeometry()
  }

  public initPrograms (): void {
    const { reglInstance, config, store } = this

    this.drawCurveCommand = reglInstance({
      vert: drawLineVert,
      frag: drawLineFrag,

      attributes: {
        position: {
          buffer: () => this.curveLineBuffer,
          divisor: 0,
        },
        // points: {
        //   buffer: () => this.pointsBuffer,
        //   divisor: 1,
        //   offset: Float32Array.BYTES_PER_ELEMENT * 0,
        //   stride: Float32Array.BYTES_PER_ELEMENT * 2,
        //   type: 'uint16',
        // },
        pointA: {
          buffer: () => this.pointsBuffer,
          divisor: 1,
          offset: Float32Array.BYTES_PER_ELEMENT * 0,
          stride: Float32Array.BYTES_PER_ELEMENT * 4,
        },
        pointB: {
          buffer: () => this.pointsBuffer,
          divisor: 1,
          offset: Float32Array.BYTES_PER_ELEMENT * 2,
          stride: Float32Array.BYTES_PER_ELEMENT * 4,
        },
        color: {
          buffer: () => this.colorBuffer,
          divisor: 1,
          offset: Float32Array.BYTES_PER_ELEMENT * 0,
          stride: Float32Array.BYTES_PER_ELEMENT * 4,
        },
        width: {
          buffer: () => this.widthBuffer,
          divisor: 1,
          offset: Float32Array.BYTES_PER_ELEMENT * 0,
          stride: Float32Array.BYTES_PER_ELEMENT * 1,
        },
        arrow: {
          buffer: () => this.arrowBuffer,
          divisor: 1,
          offset: Float32Array.BYTES_PER_ELEMENT * 0,
          stride: Float32Array.BYTES_PER_ELEMENT * 1,
        },
      },
      uniforms: {
        positions: () => this.points?.currentPositionFbo,
        particleGreyoutStatus: () => this.points?.greyoutStatusFbo,
        transform: () => store.transform,
        pointsTextureSize: () => store.pointsTextureSize,
        nodeSizeScale: () => config.nodeSizeScale,
        widthScale: () => config.linkWidthScale,
        arrowSizeScale: () => config.linkArrowsSizeScale,
        spaceSize: () => store.adjustedSpaceSize,
        screenSize: () => store.screenSize,
        ratio: () => config.pixelRatio,
        linkVisibilityDistanceRange: () => config.linkVisibilityDistanceRange,
        linkVisibilityMinTransparency: () => config.linkVisibilityMinTransparency,
        greyoutOpacity: () => config.linkGreyoutOpacity,
        scaleNodesOnZoom: () => config.scaleNodesOnZoom,
        curvedWeight: () => config.curvedLinkWeight,
        curvedLinkControlPointDistance: () => config.curvedLinkControlPointDistance,
        curvedLinkSegments: () => config.curvedLinks ? config.curvedLinkSegments ?? defaultConfigValues.curvedLinkSegments : 1,
      },
      cull: {
        enable: true,
        face: 'back',
      },
      blend: {
        enable: true,
        func: {
          dstRGB: 'one minus src alpha',
          srcRGB: 'src alpha',
          dstAlpha: 'one minus src alpha',
          srcAlpha: 'one',
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
      },
      depth: {
        enable: false,
        mask: false,
      },
      count: () => this.curveLineGeometry?.length ?? 0,
      instances: () => this.data.linksNumber ?? 0,
      primitive: 'triangle strip',
    })
  }

  public draw (): void {
    if (!this.pointsBuffer || !this.colorBuffer || !this.widthBuffer || !this.curveLineBuffer) return
    this.drawCurveCommand?.()
  }

  public updatePointsBuffer (): void {
    const { reglInstance, data, store } = this
    if (data.linksNumber === undefined || data.links === undefined) return
    const instancePoints: [number, number][] = [] // new Float32Array(data.linksNumber * 2)
    for (let i = 0; i < data.linksNumber; i++) {
      const fromIndex = data.links[i * 2] as number
      const toIndex = data.links[i * 2 + 1] as number
      const fromX = fromIndex % store.pointsTextureSize
      const fromY = Math.floor(fromIndex / store.pointsTextureSize)
      const toX = toIndex % store.pointsTextureSize
      const toY = Math.floor(toIndex / store.pointsTextureSize)
      instancePoints[i * 2] = [fromX, fromY]
      instancePoints[i * 2 + 1] = [toX, toY]
    }
    this.pointsBuffer = reglInstance.buffer(instancePoints)
  }

  public updateColor (): void {
    const { reglInstance, data } = this
    this.colorBuffer = reglInstance.buffer(data.linkColors ?? [])
  }

  public updateWidth (): void {
    const { reglInstance, data } = this
    this.widthBuffer = reglInstance.buffer(data.linkWidths ?? [])
  }

  public updateArrow (): void {
    const { reglInstance, data } = this
    this.arrowBuffer = reglInstance.buffer(data.linkArrows ?? [])
  }

  public updateCurveLineGeometry (): void {
    const { reglInstance, config: { curvedLinks, curvedLinkSegments } } = this
    this.curveLineGeometry = getCurveLineGeometry(curvedLinks ? curvedLinkSegments ?? defaultConfigValues.curvedLinkSegments : 1)
    this.curveLineBuffer = reglInstance.buffer(this.curveLineGeometry)
  }

  public destroy (): void {
    destroyBuffer(this.pointsBuffer)
    destroyBuffer(this.colorBuffer)
    destroyBuffer(this.widthBuffer)
    destroyBuffer(this.arrowBuffer)
    destroyBuffer(this.curveLineBuffer)
  }
}
