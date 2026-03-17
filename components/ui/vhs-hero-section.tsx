"use client"

import { gsap } from "gsap"
import { Canvas, useFrame } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Points } from "three"
import type { ShaderMaterial } from "three"
import type * as THREE from "three"

interface DistortionBackgroundProps {
  mousePosition: { x: number; y: number }
}

function DistortionBackground({ mousePosition }: DistortionBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
      uResolution: {
        value: [
          typeof window !== "undefined" ? window.innerWidth : 1,
          typeof window !== "undefined" ? window.innerHeight : 1,
        ],
      },
      uNoiseScale: { value: 8.0 },
      uDistortionStrength: { value: 0.3 },
    }),
    [],
  )

  const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uDistortionStrength;

    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float n1 = noise(uv * 10.0 + uTime * 0.5);
      float n2 = noise(uv * 20.0 - uTime * 0.3);
      pos.z += sin(pos.x * 5.0 + uTime * 2.0) * uDistortionStrength * n1;
      pos.z += cos(pos.y * 8.0 + uTime * 1.5) * uDistortionStrength * n2;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uNoiseScale;
    uniform float uDistortionStrength;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    vec3 distortedNoise(vec2 uv) {
      vec2 st = uv * uNoiseScale;
      float time = uTime * 0.5;
      vec2 q = vec2(fbm(st + vec2(0.0, 0.0)), fbm(st + vec2(5.2, 1.3)));
      vec2 r = vec2(
        fbm(st + 4.0 * q + vec2(1.7 - time * 0.15, 9.2)),
        fbm(st + 4.0 * q + vec2(8.3 - time * 0.126, 2.8))
      );
      float f = fbm(st + r);
      float mouseDistance = length(uv - (uMouse * 0.5 + 0.5));
      float mouseEffect = 1.0 - smoothstep(0.0, 0.6, mouseDistance);
      float glitch = step(0.98, random(vec2(floor(uTime * 10.0), floor(uv.y * 50.0))));
      f += glitch * 0.5;
      vec3 color = vec3(0.0);
      color.r = f * f * f + 0.6 * f * f + 0.5 * f;
      color.g = f * f * f * f + 0.4 * f * f + 0.2 * f;
      color.b = f * f * f * f * f * f + 0.7 * f * f + 0.5 * f;
      color += random(uv * 100.0 + time) * 0.1;
      color += mouseEffect * vec3(0.3, 0.1, 0.2);
      color += sin(uv.y * 800.0) * 0.04;
      return color;
    }

    void main() {
      vec2 uv = vUv;
      float aberration = 0.005;
      vec3 color;
      color.r = distortedNoise(uv + vec2(aberration, 0.0)).r;
      color.g = distortedNoise(uv).g;
      color.b = distortedNoise(uv - vec2(aberration, 0.0)).b;
      color += random(uv + uTime) * 0.1;
      float vignette = 1.0 - length(uv - 0.5) * 1.2;
      color *= vignette;
      color = pow(color, vec3(1.2));
      color *= 1.3;
      gl_FragColor = vec4(color, 0.95);
    }
  `

  useFrame((state) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    materialRef.current.uniforms.uMouse.value = [mousePosition.x, mousePosition.y]
    materialRef.current.uniforms.uDistortionStrength.value = 0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[25, 25, 100, 100]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
      />
    </mesh>
  )
}

interface NoiseParticlesProps {
  count: number
  mousePosition: { x: number; y: number }
}

function NoiseParticles({ count, mousePosition }: NoiseParticlesProps) {
  const pointsRef = useRef<Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 20
      positions[i3 + 1] = (Math.random() - 0.5) * 20
      positions[i3 + 2] = (Math.random() - 0.5) * 10

      const colorChoice = Math.random()
      if (colorChoice < 0.33) {
        colors[i3] = 1.0
        colors[i3 + 1] = 0.0
        colors[i3 + 2] = 0.0
      } else if (colorChoice < 0.66) {
        colors[i3] = 1.0
        colors[i3 + 1] = 1.0
        colors[i3 + 2] = 1.0
      } else {
        colors[i3] = 0.0
        colors[i3 + 1] = 1.0
        colors[i3 + 2] = 1.0
      }

      sizes[i] = Math.random() * 0.03 + 0.01
    }

    return { positions, colors, sizes }
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] += (Math.random() - 0.5) * 0.02
      positions[i3 + 1] += (Math.random() - 0.5) * 0.02
      positions[i3 + 2] += Math.sin(state.clock.elapsedTime * 3 + i * 0.1) * 0.01

      const mouseInfluence =
        1 / (1 + Math.abs(positions[i3] - mousePosition.x * 10) + Math.abs(positions[i3 + 1] - mousePosition.y * 10))
      if (mouseInfluence > 0.1) {
        positions[i3] += (Math.random() - 0.5) * 0.1
        positions[i3 + 1] += (Math.random() - 0.5) * 0.1
      }

      if (Math.abs(positions[i3]) > 10) positions[i3] *= -0.8
      if (Math.abs(positions[i3 + 1]) > 10) positions[i3 + 1] *= -0.8
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[particles.sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} vertexColors transparent opacity={0.8} sizeAttenuation blending={2} />
    </points>
  )
}

interface GlitchTextProps {
  text: string
  className?: string
  fontSize?: string
  fontFamily?: string
  fontWeight?: string
  color?: string
  glitchIntensity?: number
  glitchFrequency?: number
}

function GlitchText({
  text,
  className = "",
  fontSize = "4rem",
  fontFamily = "inherit",
  fontWeight = "900",
  color = "#ffffff",
  glitchIntensity = 0.8,
  glitchFrequency = 100,
}: GlitchTextProps) {
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!textRef.current) return

    const element = textRef.current
    const originalText = text
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"

    const glitchAnimation = () => {
      if (Math.random() > 1 - glitchIntensity * 0.05) {
        const glitchedText = originalText
          .split("")
          .map((char) => {
            if (Math.random() > 1 - glitchIntensity * 0.2) {
              return glitchChars[Math.floor(Math.random() * glitchChars.length)]
            }
            return char
          })
          .join("")

        element.textContent = glitchedText

        setTimeout(() => {
          element.textContent = originalText
        }, 50 + Math.random() * (100 * glitchIntensity))
      }
    }

    const interval = setInterval(glitchAnimation, glitchFrequency)
    const tween = gsap.to(element, {
      textShadow: `${2 * glitchIntensity}px 0 #ff0000, ${-2 * glitchIntensity}px 0 #00ffff`,
      duration: 0.1,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    })

    return () => {
      clearInterval(interval)
      tween.kill()
    }
  }, [text, glitchIntensity, glitchFrequency])

  return (
    <h1
      ref={textRef}
      className={className}
      style={{
        margin: 0,
        fontSize,
        fontFamily,
        fontWeight,
        color,
        textAlign: "center",
        textShadow: `2px 0 #ff0000, -2px 0 #00ffff, 0 0 20px rgba(255, 255, 255, 0.5)`,
      }}
    >
      {text}
    </h1>
  )
}

function VhsButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        minWidth: 194,
        height: 46,
        padding: "0 32px",
        border: "1px solid rgba(239, 68, 68, 0.9)",
        background: isHovered ? "rgba(220, 38, 38, 0.30)" : "rgba(220, 38, 38, 0.15)",
        color: isHovered ? "#ffffff" : "rgb(248, 113, 113)",
        boxShadow: "0 0 20px rgba(239, 68, 68, 0.16)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        fontFamily: "'Courier New', monospace",
        fontSize: "0.95rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: "pointer",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
        borderRadius: 0,
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        transition: "all 300ms ease",
      }}
    >
      <span style={{ position: "relative", zIndex: 2 }}>{">"} SAIBA_MAIS {"<"}</span>
      <span
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "linear-gradient(to right, transparent, rgba(239, 68, 68, 0.2), transparent)",
          transform: isHovered ? "translateX(100%)" : "translateX(-100%)",
          transition: "transform 500ms ease",
        }}
      />
    </button>
  )
}

function MusicButton() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = 0.55
  }, [])

  const toggleAudio = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("Nao foi possivel iniciar a musica.", error)
      setIsPlaying(false)
    }
  }

  return (
    <>
      <audio ref={audioRef} loop preload="metadata" src="/audio/convite.mp3" onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} />
      <button
        type="button"
        onClick={toggleAudio}
        aria-label={isPlaying ? "Parar musica" : "Tocar musica"}
        title="Use public/audio/convite.mp3"
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 80,
          width: 50,
          height: 50,
          border: "1px solid rgba(255, 255, 255, 0.28)",
          borderRadius: 999,
          background: isPlaying ? "rgba(220, 38, 38, 0.34)" : "rgba(15, 15, 20, 0.68)",
          color: "#ffffff",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          cursor: "pointer",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          display: "grid",
          placeItems: "center",
          padding: 0,
          transition: "transform 200ms ease, background 200ms ease, border-color 200ms ease",
        }}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="4.5" height="12" rx="1" fill="currentColor" />
            <rect x="10.5" y="3" width="4.5" height="12" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ marginLeft: 2 }}>
            <path d="M4 2.8L15 9L4 15.2V2.8Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  )
}

export default function DistortHero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2
    const y = (event.clientY / window.innerHeight - 0.5) * 2
    setMousePosition({ x, y })
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 250)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, subtitleRef.current, buttonRef.current], {
        opacity: 0,
        y: 100,
        scale: 0.8,
        filter: "blur(10px)",
      })

      gsap.set(canvasRef.current, {
        opacity: 0,
        scale: 1.2,
      })

      const tl = gsap.timeline({ delay: 0.2 })

      tl.to(canvasRef.current, {
        opacity: 1,
        scale: 1,
        duration: 2,
        ease: "power4.out",
      })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.5,
            ease: "back.out(2)",
          },
          "-=1.5",
        )
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power3.out",
          },
          "-=1",
        )
        .to(
          buttonRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
          },
          "-=0.6",
        )

      const glitchTl = gsap.timeline({ repeat: -1, repeatDelay: 2 })
      glitchTl
        .to(heroRef.current, {
          filter: "hue-rotate(180deg) saturate(2)",
          duration: 0.1,
        })
        .to(heroRef.current, {
          filter: "none",
          duration: 0.1,
        })
        .to(heroRef.current, {
          x: 5,
          duration: 0.05,
        })
        .to(heroRef.current, {
          x: -5,
          duration: 0.05,
        })
        .to(heroRef.current, {
          x: 0,
          duration: 0.05,
        })

      const mouseChaos = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30
        const y = (e.clientY / window.innerHeight - 0.5) * 30

        gsap.to(titleRef.current, {
          x: x * 0.1,
          y: y * 0.05,
          rotationX: y * 0.02,
          rotationY: x * 0.02,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      window.addEventListener("mousemove", mouseChaos)

      return () => {
        window.removeEventListener("mousemove", mouseChaos)
      }
    }, heroRef)

    return () => ctx.revert()
  }, [isLoaded])

  return (
    <section
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "#000000",
      }}
    >
      <div ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100vw",
            height: "100dvh",
            display: "block",
            background: "linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)",
          }}
        >
          <DistortionBackground mousePosition={mousePosition} />
          <NoiseParticles count={800} mousePosition={mousePosition} />
        </Canvas>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          opacity: 0.2,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        ref={heroRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div ref={titleRef}>
            <GlitchText
              text="ALICE LIMA"
              fontSize="clamp(5rem, 12vw, 12rem)"
              fontFamily="'Courier New', monospace"
              fontWeight="900"
              color="#ffffff"
              glitchIntensity={0.9}
              glitchFrequency={80}
              className="leading-none tracking-tighter"
            />
          </div>

          <div className="mt-4">
            <GlitchText
              text="12 ANOS"
              fontSize="clamp(3rem, 6vw, 3rem)"
              fontFamily="'Courier New', monospace"
              fontWeight="500"
              color="#ff0000"
              glitchIntensity={0.6}
              glitchFrequency={150}
              className="tracking-widest opacity-80"
            />
          </div>

          <p
            ref={subtitleRef}
            style={{
              margin: "24px auto 48px",
              maxWidth: "900px",
              fontFamily: "'Courier New', monospace",
              fontSize: "clamp(1rem, 2.4vw, 2rem)",
              lineHeight: 1.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#f87171",
              textShadow: "0 0 10px rgba(255, 0, 0, 0.5), 2px 0 #00ffff, -2px 0 #ff0000",
            }}
          >
            {">"} Sabado, 21 de Marco {"<"}
            <br />
            {">"} as 12h30 {"<"}
          </p>

          <div ref={buttonRef} style={{ display: "flex", justifyContent: "center" }}>
            <VhsButton />
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 32, left: 32, zIndex: 30 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: "0.16em", color: "#dcdcdc" }}>
          {">"} CONVITE
        </div>
      </div>

      <div style={{ position: "absolute", top: 32, right: 32, zIndex: 30 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: "0.16em", color: "#c5e9ee" }}>
          2026 {"<"}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 30 }}>
        <div className="animate-pulse" style={{ width: 1, height: 64, background: "linear-gradient(to bottom, rgba(239,68,68,0.6), transparent)" }} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 15,
          pointerEvents: "none",
          opacity: 0.1,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)",
        }}
      />

      <MusicButton />
    </section>
  )
}

export const Component = () => {
  return <DistortHero />
}
