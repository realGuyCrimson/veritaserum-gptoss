'use client'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import { createNoise2D } from 'simplex-noise'
import { useTheme } from 'next-themes'

interface Point {
    x: number
    y: number
    wave: { x: number; y: number }
    cursor: {
        x: number
        y: number
        vx: number
        vy: number
    }
}

interface WavesProps {
    className?: string
    strokeColor?: string
    backgroundColor?: string
    pointerSize?: number
}

function Waves({
    className = "",
    strokeColor,
    backgroundColor,
    pointerSize = 0.5
}: WavesProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)
    const mouseRef = useRef({
        x: -10,
        y: 0,
        lx: 0,
        ly: 0,
        sx: 0,
        sy: 0,
        v: 0,
        vs: 0,
        a: 0,
        set: false,
    })
    const pathsRef = useRef<SVGPathElement[]>([])
    const linesRef = useRef<Point[][]>([])
    const noiseRef = useRef<((x: number, y: number) => number) | null>(null)
    const rafRef = useRef<number | null>(null)
    const boundingRef = useRef<DOMRect | null>(null)

    // Initialization
    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return

        noiseRef.current = createNoise2D()

        setSize()
        setLines()

        const currentContainer = containerRef.current
        window.addEventListener('resize', onResize)
        window.addEventListener('mousemove', onMouseMove)
        currentContainer.addEventListener('touchmove', onTouchMove, { passive: false })

        rafRef.current = requestAnimationFrame(tick)

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            window.removeEventListener('resize', onResize)
            window.removeEventListener('mousemove', onMouseMove)
            currentContainer?.removeEventListener('touchmove', onTouchMove)
        }
    }, [strokeColor])

    // Set SVG size
    const setSize = () => {
        if (!containerRef.current || !svgRef.current) return

        boundingRef.current = containerRef.current.getBoundingClientRect()
        const { width, height } = boundingRef.current

        svgRef.current.style.width = `${width}px`
        svgRef.current.style.height = `${height}px`
    }

    // Setup lines - more points for smoother curves
    const setLines = () => {
        if (!svgRef.current || !boundingRef.current || !strokeColor) return

        const { width, height } = boundingRef.current
        linesRef.current = []

        // Clear existing paths
        pathsRef.current.forEach(path => {
            path.remove()
        })
        pathsRef.current = []

        const xGap = 8
        const yGap = 8

        const oWidth = width + 200
        const oHeight = height + 30

        const totalLines = Math.ceil(oWidth / xGap)
        const totalPoints = Math.ceil(oHeight / yGap)

        const xStart = (width - xGap * totalLines) / 2
        const yStart = (height - yGap * totalPoints) / 2

        for (let i = 0; i < totalLines; i++) {
            const points: Point[] = []

            for (let j = 0; j < totalPoints; j++) {
                const point: Point = {
                    x: xStart + xGap * i,
                    y: yStart + yGap * j,
                    wave: { x: 0, y: 0 },
                    cursor: { x: 0, y: 0, vx: 0, vy: 0 },
                }

                points.push(point)
            }

            const path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            )
            path.classList.add('a__line')
            path.classList.add('js-line')
            path.setAttribute('fill', 'none')
            path.setAttribute('stroke', strokeColor)
            path.setAttribute('stroke-width', '1')

            svgRef.current.appendChild(path)
            pathsRef.current.push(path)
            linesRef.current.push(points)
        }
    }

    // Resize handler
    const onResize = () => {
        setSize()
        setLines()
    }

    // Mouse handler
    const onMouseMove = (e: MouseEvent) => {
        updateMousePosition(e.clientX, e.clientY)
    }

    // Touch handler
    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        updateMousePosition(touch.clientX, touch.clientY)
    }

    // Update mouse position
    const updateMousePosition = (x: number, y: number) => {
        if (!boundingRef.current) return

        const mouse = mouseRef.current
        mouse.x = x - boundingRef.current.left
        mouse.y = y - boundingRef.current.top

        if (!mouse.set) {
            mouse.sx = mouse.x
            mouse.sy = mouse.y
            mouse.lx = mouse.x
            mouse.ly = mouse.y
            mouse.set = true
        }
    }

    // Move points
    const movePoints = (time: number) => {
        const { current: lines } = linesRef
        const { current: mouse } = mouseRef
        const { current: noise } = noiseRef

        if (!noise) return

        lines.forEach((points) => {
            points.forEach((p: Point) => {
                const move = noise(
                    (p.x + time * 0.008) * 0.003,
                    (p.y + time * 0.003) * 0.002
                ) * 8

                p.wave.x = Math.cos(move) * 12
                p.wave.y = Math.sin(move) * 6

                const dx = p.x - mouse.sx
                const dy = p.y - mouse.sy
                const d = Math.hypot(dx, dy)
                const l = Math.max(175, mouse.vs)

                if (d < l) {
                    const s = 1 - d / l
                    const f = Math.cos(d * 0.001) * s

                    p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035
                    p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035
                }

                p.cursor.vx += (0 - p.cursor.x) * 0.01
                p.cursor.vy += (0 - p.cursor.y) * 0.01

                p.cursor.vx *= 0.95
                p.cursor.vy *= 0.95

                p.cursor.x += p.cursor.vx
                p.cursor.y += p.cursor.vy

                p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x))
                p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y))
            })
        })
    }

    // Get moved point coordinates
    const moved = (point: Point, withCursorForce = true) => {
        const coords = {
            x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
            y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
        }

        return coords
    }

    // Draw lines
    const drawLines = () => {
        const { current: lines } = linesRef
        const { current: paths } = pathsRef

        lines.forEach((points, lIndex) => {
            if (points.length < 2 || !paths[lIndex]) return;

            const firstPoint = moved(points[0], false)
            let d = `M ${firstPoint.x} ${firstPoint.y}`

            for (let i = 1; i < points.length; i++) {
                const current = moved(points[i])
                d += `L ${current.x} ${current.y}`
            }

            paths[lIndex].setAttribute('d', d)
        })
    }

    // Animation logic
    const tick = (time: number) => {
        const { current: mouse } = mouseRef

        mouse.sx += (mouse.x - mouse.sx) * 0.1
        mouse.sy += (mouse.y - mouse.sy) * 0.1

        const dx = mouse.x - mouse.lx
        const dy = mouse.y - mouse.ly
        const d = Math.hypot(dx, dy)

        mouse.v = d
        mouse.vs += (d - mouse.vs) * 0.1
        mouse.vs = Math.min(100, mouse.vs)

        mouse.lx = mouse.x
        mouse.ly = mouse.y

        mouse.a = Math.atan2(dy, dx)

        if (containerRef.current) {
            containerRef.current.style.setProperty('--x', `${mouse.sx}px`)
            containerRef.current.style.setProperty('--y', `${mouse.sy}px`)
        }

        movePoints(time)
        drawLines()

        rafRef.current = requestAnimationFrame(tick)
    }

    return (
        <div
            ref={containerRef}
            className={`waves-component fixed inset-0 -z-10 overflow-hidden ${className}`}
            style={{
                backgroundColor,
                '--x': '-0.5rem',
                '--y': '50%',
            } as React.CSSProperties}
        >
            <svg
                ref={svgRef}
                className="block w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
            />
            {strokeColor && <div
                className="pointer-dot pointer-events-none"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${pointerSize}rem`,
                    height: `${pointerSize}rem`,
                    background: strokeColor,
                    borderRadius: '50%',
                    transform: 'translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0)',
                    willChange: 'transform',
                }}
            />}
        </div>
    )
}

export function WavesBackground() {
  const { theme } = useTheme();
  const [colors, setColors] = React.useState({
    strokeColor: '#000000',
    backgroundColor: '#ffffff'
  });

  useEffect(() => {
    // We need to get the computed style of the body to get the actual HSL values of the CSS variables.
    const bodyStyles = getComputedStyle(document.body);
    const backgroundHsl = bodyStyles.getPropertyValue('--background').trim();
    const foregroundHsl = bodyStyles.getPropertyValue('--foreground').trim();
    
    // Convert HSL string to a format that can be used in the canvas
    const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n:number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    const parseHsl = (hslStr: string) => {
        if (!hslStr) return [0, 0, 0];
        const [h, s, l] = hslStr.split(' ').map(val => parseFloat(val));
        return [h, s, l];
    }
    
    const [bgH, bgS, bgL] = parseHsl(backgroundHsl);
    const [fgH, fgS, fgL] = parseHsl(foregroundHsl);

    setColors({
      backgroundColor: hslToHex(bgH, bgS, bgL),
      strokeColor: hslToHex(fgH, fgS, fgL)
    });
  }, [theme]);
  
  if (!colors.backgroundColor || !colors.strokeColor) {
      return null;
  }

  return (
    <Waves
      backgroundColor={colors.backgroundColor}
      strokeColor={colors.strokeColor}
    />
  )
}
