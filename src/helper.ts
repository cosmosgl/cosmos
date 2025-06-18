import { color as d3Color } from 'd3-color'
import regl from 'regl'
import DOMPurify from 'dompurify'

export const isFunction = <T>(a: T): boolean => typeof a === 'function'
export const isArray = <T>(a: unknown | T[]): a is T[] => Array.isArray(a)
export const isObject = <T>(a: T): boolean => (a instanceof Object)
export const isAClassInstance = <T>(a: T): boolean => {
  if (a instanceof Object) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (a as T & Object).constructor.name !== 'Function' && (a as T & Object).constructor.name !== 'Object'
  } else return false
}
export const isPlainObject = <T>(a: T): boolean => isObject(a) && !isArray(a) && !isFunction(a) && !isAClassInstance(a)

export function getRgbaColor (value: string | [number, number, number, number]): [number, number, number, number] {
  let rgba: [number, number, number, number]
  if (isArray(value)) {
    rgba = value
  } else {
    const color = d3Color(value)
    const rgb = color?.rgb()
    rgba = [rgb?.r || 0, rgb?.g || 0, rgb?.b || 0, color?.opacity ?? 1]
  }

  return [
    rgba[0] / 255,
    rgba[1] / 255,
    rgba[2] / 255,
    rgba[3],
  ]
}

export function rgbToBrightness (r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function readPixels (reglInstance: regl.Regl, fbo: regl.Framebuffer2D): Float32Array {
  let resultPixels = new Float32Array()
  reglInstance({ framebuffer: fbo })(() => {
    resultPixels = reglInstance.read()
  })

  return resultPixels
}

export function clamp (num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

export function isNumber (value: number | undefined | null | typeof NaN): boolean {
  return value !== undefined && value !== null && !Number.isNaN(value)
}

/**
 * Sanitizes HTML content to prevent XSS attacks using DOMPurify
 *
 * This function is used internally to sanitize HTML content before setting innerHTML,
 * such as in attribution text. It uses a safe default configuration that allows
 * only common safe HTML elements and attributes.
 *
 * @param html The HTML string to sanitize
 * @param options Optional DOMPurify configuration options to override defaults
 * @returns Sanitized HTML string safe for innerHTML usage
 */
export function sanitizeHtml (html: string, options?: DOMPurify.Config): string {
  return DOMPurify.sanitize(html, {
    // Default configuration: allow common safe HTML elements and attributes
    ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'span', 'div', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'class', 'id', 'style'],
    ALLOW_DATA_ATTR: false,
    ...options,
  })
}
