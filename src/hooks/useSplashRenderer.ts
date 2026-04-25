import { useEffect, useRef, useCallback } from 'react'
  import type { ImageItem, JellysplashConfig } from '../types'
  import { drawSplash } from '../lib/renderer'

  interface UseSplashRendererOptions {
    images: ImageItem[]
    config: JellysplashConfig
  }

  export function useSplashRenderer({ images, config }: UseSplashRendererOptions) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const draw = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const { outputWidth: W, outputHeight: H } = config
      canvas.width  = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      drawSplash(ctx, W, H, images, config)
    }, [images, config])

    useEffect(() => {
      draw()
    }, [draw])

    const exportPng = useCallback(() => {
      const { outputWidth: W, outputHeight: H } = config
      const offscreen = document.createElement('canvas')
      offscreen.width  = W
      offscreen.height = H
      const ctx = offscreen.getContext('2d')
      if (!ctx) return
      drawSplash(ctx, W, H, images, config)
      offscreen.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `jellysplash-${W}x${H}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    }, [images, config])

    return { canvasRef, exportPng }
  }
