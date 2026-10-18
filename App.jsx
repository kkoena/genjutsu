import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, Float, Html, Sparkles } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody } from '@react-three/rapier'
import { Bloom, ChromaticAberration, EffectComposer, Glitch, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import * as THREE from 'three'
import { useStore } from './store'
import { AntiCounterfeitModal, Boot, Cursor, DubUnlockModal, ExecutivePitchModal, Hud, Modal, RevenueSimulatorModal, Sharingan, Spotlight, TopNav } from './ui'

const Dark = ({ edge = '#ff2a3a' }) => (<>
  <meshStandardMaterial color="#070707" flatShading metalness={.7} roughness={.3} emissive="#2a0004" />
  <Edges color={edge} threshold={15} />
</>)

function Moon() {
  const ref = useRef()
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256
    const g = c.getContext('2d'); g.fillStyle = '#b3121c'; g.fillRect(0, 0, 512, 256)
    for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(40,0,5,${Math.random() * .35})`; g.beginPath(); g.arc(Math.random() * 512, Math.random() * 256, Math.random() * 26 + 3, 0, 7); g.fill() }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }, [])
  useFrame((_, d) => { ref.current.rotation.y += d * .03 })
  return (
    <group position={[0, 0, -20]}>
      <mesh ref={ref}><sphereGeometry args={[9, 64, 64]} /><meshBasicMaterial map={tex} color="#ff4d4d" toneMapped={false} /></mesh>
      <mesh scale={1.05}><sphereGeometry args={[9, 32, 32]} /><meshBasicMaterial color="#ff0010" transparent opacity={.14} side={THREE.BackSide} toneMapped={false} /></mesh>
      <pointLight position={[0, 0, 8]} intensity={150} color="#ff1a1a" distance={60} />
    </group>
  )
}

function Crow() {
  const shattered = useStore((s) => s.active === 'crow')
  const body = useRef(), wl = useRef(), wr = useRef(), shards = useRef([])
  const parts = useMemo(() => Array.from({ length: 36 }, () => ({ d: new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).multiplyScalar(7), s: Math.random() * .2 + .08, r: Math.random() * 3 })), [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, k = 1 - Math.exp(-5 * dt)
    body.current.scale.setScalar(THREE.MathUtils.lerp(body.current.scale.x, shattered ? .001 : 1, k))
    wl.current.rotation.z = Math.PI / 2 + Math.sin(t * 6) * .5; wr.current.rotation.z = -Math.PI / 2 - Math.sin(t * 6) * .5
    shards.current.forEach((m, i) => {
      if (!m) return
      const p = parts[i]; m.position.lerp(shattered ? p.d : new THREE.Vector3(), k * .6)
      m.rotation.x += dt * p.r; m.rotation.y += dt * p.r; m.scale.setScalar(shattered ? 1 : .001)
    })
  })
  return (<group>
    <group ref={body}>
      <mesh scale={[.55, .4, 1.1]} rotation={[0, 0, 0]}><octahedronGeometry args={[1]} /><Dark /></mesh>
      <mesh position={[0, .2, 1.05]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[.28, .8, 4]} /><Dark edge="#fff" /></mesh>
      <mesh ref={wl} position={[-.6, .1, 0]} scale={[1, 1, .1]}><coneGeometry args={[.7, 1.8, 3]} /><Dark /></mesh>
      <mesh ref={wr} position={[.6, .1, 0]} scale={[1, 1, .1]}><coneGeometry args={[.7, 1.8, 3]} /><Dark /></mesh>
    </group>
    {parts.map((p, i) => (<mesh key={i} ref={(m) => (shards.current[i] = m)} scale={.001}><boxGeometry args={[p.s, p.s * 2.4, p.s * .3]} /><Dark /></mesh>))}
  </group>)
}

function Cloud() {
  const puffs = [[-.8, -.1, .55], [0, .3, .75], [.85, -.05, .6], [.3, -.4, .5], [-.35, -.4, .45]]
  return (<group scale={[1, 1, .22]}>{puffs.map(([x, y, r], i) => (
    <group key={i} position={[x, y, 0]}>
      <mesh scale={1.16}><sphereGeometry args={[r, 24, 24]} /><meshBasicMaterial color="#fff" side={THREE.BackSide} /></mesh>
      <mesh><sphereGeometry args={[r, 24, 24]} /><meshStandardMaterial color="#b0000f" emissive="#600008" roughness={.8} /></mesh>
    </group>))}</group>)
}

function Kunai() {
  return (<group>
    <mesh position={[0, .75, 0]} scale={[1, 1, .25]}><coneGeometry args={[.3, 1.5, 4]} /><meshStandardMaterial color="#d8d8d8" metalness={1} roughness={.2} emissive="#330005" /><Edges color="#fff" /></mesh>
    <mesh position={[0, -.3, 0]}><cylinderGeometry args={[.08, .08, .9, 8]} /><Dark /></mesh>
    <mesh position={[0, -.95, 0]}><torusGeometry args={[.22, .05, 10, 24]} /><meshStandardMaterial color="#ff2a3a" emissive="#ff0010" emissiveIntensity={1.5} toneMapped={false} /></mesh>
  </group>)
}

function Flame() {
  const N = 450, geo = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)), [])
  const life = useMemo(() => Float32Array.from({ length: N }, Math.random), [])
  const soft = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(1, '#000'); g.fillStyle = r; g.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])
  useFrame((_, dt) => {
    const a = geo.attributes.position.array
    for (let i = 0; i < N; i++) {
      life[i] += dt * (.5 + (i % 7) * .08)
      if (life[i] > 1) { life[i] = 0; a[i * 3] = (Math.random() - .5) * .9; a[i * 3 + 1] = -.8; a[i * 3 + 2] = (Math.random() - .5) * .4 }
      a[i * 3 + 1] += dt * (.9 + (i % 5) * .25); a[i * 3] += Math.sin(life[i] * 12 + i) * dt * .5
    }
    geo.attributes.position.needsUpdate = true
  })
  return (<group>
    <points geometry={geo}><pointsMaterial size={.75} alphaMap={soft} transparent color="#ff1020" blending={THREE.AdditiveBlending} depthWrite={false} opacity={.35} toneMapped={false} /></points>
    <points geometry={geo}><pointsMaterial size={.42} alphaMap={soft} transparent color="#000" depthWrite={false} /></points>
  </group>)
}

function Body({ id, label, pos, r = 1.3, drag, children }) {
  const rb = useRef(), g = useRef(), kick = useRef(0), dragging = useRef(false), down = useRef(null)
  const { open, triggerGlitch, setFlame } = useStore.getState()
  const [hov, setHov] = useState(false)
  useEffect(() => {
    rb.current.setLinvel({ x: (Math.random() - .5) * 3, y: (Math.random() - .5) * 3, z: 0 }, true)
    const up = (e) => {
      dragging.current = false
      if (down.current && Math.hypot(e.clientX - down.current[0], e.clientY - down.current[1]) < 6) {
        kick.current = 1
        rb.current.applyImpulse({ x: (Math.random() - .5) * 14, y: (Math.random() - .5) * 14, z: 0 }, true)
        rb.current.applyTorqueImpulse({ x: Math.random() * 6, y: Math.random() * 6, z: (Math.random() - .5) * 30 }, true)
        open(id)
      }
      down.current = null
    }
    addEventListener('pointerup', up); return () => removeEventListener('pointerup', up)
  }, [])
  useFrame(({ pointer, viewport }, dt) => {
    const b = rb.current
    if (dragging.current) {
      const p = b.translation()
      b.setLinvel({ x: (pointer.x * viewport.width / 2 - p.x) * 12, y: (pointer.y * viewport.height / 2 - p.y) * 12, z: 0 }, true)
    }
    if (drag) {
      const v = b.linvel()
      if (Math.hypot(v.x, v.y) > .5) { const a = Math.atan2(v.y, v.x) - Math.PI / 2; b.setRotation({ x: 0, y: 0, z: Math.sin(a / 2), w: Math.cos(a / 2) }, true); b.setAngvel({ x: 0, y: 0, z: 0 }, true) }
    }
    kick.current = THREE.MathUtils.lerp(kick.current, 0, 1 - Math.exp(-4 * dt))
    g.current.scale.setScalar(1 + kick.current * .6 + (hov ? .12 : 0))
  })
  return (
    <RigidBody ref={rb} position={[pos[0], pos[1], 0]} colliders={false} restitution={1} friction={0} linearDamping={.25} angularDamping={.6}
      enabledTranslations={[true, true, false]}
      onCollisionEnter={({ other }) => {
        if (drag && other.rigidBodyObject?.name === 'wall') { const v = rb.current.linvel(); if (Math.hypot(v.x, v.y) > 9) triggerGlitch() }
      }}>
      <BallCollider args={[r]} />
      <Float speed={2} floatIntensity={.6} rotationIntensity={.5}>
        <group ref={g}
          onPointerDown={(e) => { e.stopPropagation(); down.current = [e.nativeEvent.clientX, e.nativeEvent.clientY]; if (drag) dragging.current = true }}
          onPointerOver={() => { setHov(true); if (id === 'flame') setFlame(true) }}
          onPointerOut={() => { setHov(false); if (id === 'flame') setFlame(false) }}>
          {children}
          <mesh><sphereGeometry args={[r]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
          <Html center position={[0, -r - .35, 0]} className="tag">{label}</Html>
        </group>
      </Float>
    </RigidBody>
  )
}

function Walls() {
  const { viewport: v } = useThree(), w = v.width / 2, h = v.height / 2
  return (
    <RigidBody type="fixed" name="wall" colliders={false}>
      <CuboidCollider args={[w + 1, .5, 5]} position={[0, h + .5, 0]} />
      <CuboidCollider args={[w + 1, .5, 5]} position={[0, -h - .5, 0]} />
      <CuboidCollider args={[.5, h + 1, 5]} position={[-w - .5, 0, 0]} />
      <CuboidCollider args={[.5, h + 1, 5]} position={[w + .5, 0, 0]} />
    </RigidBody>
  )
}

function FX() {
  const g = useStore((s) => s.glitch), off = useMemo(() => new THREE.Vector2(), [])
  useFrame(() => off.set(g ? .012 : .0015, g ? .012 : .0015))
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={.2} intensity={1.1} mipmapBlur />
      <ChromaticAberration offset={off} radialModulation={false} modulationOffset={0} />
      <Glitch active={g} delay={[0, 0]} duration={[.6, 1]} strength={[.3, 1]} mode={GlitchMode.CONSTANT_WILD} />
      <Noise opacity={.08} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={.2} darkness={.9} />
    </EffectComposer>
  )
}

function Scene() {
  const { viewport: v } = useThree(), x = v.width * .27, y = v.height * .2
  return (<>
    <color attach="background" args={['#030002']} />
    <ambientLight intensity={.5} color="#ff5560" /><directionalLight position={[3, 4, 6]} intensity={1.4} />
    <Moon /><Sparkles count={120} scale={[20, 12, 6]} size={3} speed={.3} color="#ff2a3a" />
    <Physics gravity={[0, 0, 0]}>
      <Walls />
      <Body id="crow" label="Audience discovery" pos={[-x, y]}><Crow /></Body>
      <Body id="cloud" label="Localization + merch" pos={[x, y]}><Cloud /></Body>
      <Body id="kunai" label="Monetization (drag me)" pos={[-x, -y]} drag><Kunai /></Body>
      <Body id="flame" label="Community retention" pos={[x, -y]}><Flame /></Body>
    </Physics>
    <FX />
  </>)
}

export default function App() {
  const booted = useStore((s) => s.booted), active = useStore((s) => s.active)
  return (<>
    <div className={'stage' + (active ? ' dim' : '')}>
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }} dpr={[1, 1.75]}><Suspense fallback={null}><Scene /></Suspense></Canvas>
    </div>
    <TopNav /><Sharingan /><Hud /><Modal /><RevenueSimulatorModal /><DubUnlockModal /><AntiCounterfeitModal /><ExecutivePitchModal /><Spotlight /><Cursor />{!booted && <Boot />}
  </>)
}
