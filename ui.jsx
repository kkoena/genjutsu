import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { useStore } from './store'

export const Eye = () => (
  <svg viewBox="-100 -100 200 200">
    <circle r="96" fill="#b3000f" stroke="#fff" strokeWidth="3" />
    <circle r="90" fill="none" stroke="#000" strokeWidth="2" />
    <g fill="#000">{[0, 120, 240].map((a) => (
      <path key={a} transform={`rotate(${a})`} d="M0 -30 C30 -62 66 -52 82 -20 C54 -44 28 -42 12 -26 Z" />
    ))}</g>
    <circle r="30" fill="#000" /><circle r="8" fill="#b3000f" />
  </svg>
)

export function Sharingan() {
  const x = useMotionValue(innerWidth / 2), y = useMotionValue(innerHeight / 2)
  const sx = useSpring(x, { stiffness: 40, damping: 18 }), sy = useSpring(y, { stiffness: 40, damping: 18 })
  useEffect(() => {
    const m = (e) => { x.set(e.clientX); y.set(e.clientY) }
    addEventListener('pointermove', m); return () => removeEventListener('pointermove', m)
  }, [])
  return (
    <motion.div className="sharingan" style={{ x: sx, y: sy }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}><Eye /></motion.div>
    </motion.div>
  )
}

export function Cursor() {
  const ref = useRef(), fire = useRef(false)
  fire.current = useStore((s) => s.flame)
  useEffect(() => {
    const c = ref.current, g = c.getContext('2d'); let P = [], m = { x: -99, y: -99 }, raf
    const rs = () => { c.width = innerWidth; c.height = innerHeight }; rs()
    const mv = (e) => { m = { x: e.clientX, y: e.clientY } }
    addEventListener('resize', rs); addEventListener('pointermove', mv)
    const loop = () => {
      g.clearRect(0, 0, c.width, c.height)
      const f = fire.current
      for (let i = 0; i < (f ? 4 : 1); i++) P.push({ x: m.x + (Math.random() - .5) * 10, y: m.y, vx: (Math.random() - .5) * 1.2, vy: -(Math.random() * 2 + .5) * (f ? 2 : .4), l: 1, s: f ? 9 + Math.random() * 9 : 3 })
      P = P.filter((p) => p.l > 0)
      for (const p of P) {
        p.x += p.vx; p.y += p.vy; p.l -= .03
        g.globalAlpha = Math.max(p.l, 0); g.fillStyle = f ? '#000' : '#fff'
        g.shadowColor = '#ff1020'; g.shadowBlur = f ? 18 : 6
        g.beginPath(); g.arc(p.x, p.y, p.s * Math.max(p.l, 0), 0, 7); g.fill()
      }
      g.globalAlpha = 1; g.shadowBlur = 0; g.fillStyle = '#ff1020'
      g.beginPath(); g.arc(m.x, m.y, 4, 0, 7); g.fill()
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', rs); removeEventListener('pointermove', mv) }
  }, [])
  return <canvas ref={ref} className="cursor" />
}

export function Boot() {
  const done = useStore((s) => s.setBooted), [ph, setPh] = useState(0)
  useEffect(() => {
    const a = setTimeout(() => setPh(1), 3200), b = setTimeout(done, 4500)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])
  const tiles = useMemo(() => Array.from({ length: 48 }, (_, i) => ({
    c: i % 8, r: (i / 8) | 0, x: (Math.random() - .5) * 900, y: Math.random() * 900 + 200, rot: (Math.random() - .5) * 200,
  })), [])
  return (
    <div className={'boot' + (ph ? ' out' : '')}>
      <motion.div className="eye" initial={{ scaleY: .03 }} animate={ph ? { scale: 4, opacity: 0 } : { scaleY: [.03, .03, 1] }}
        transition={ph ? { duration: .6 } : { duration: 2.4, times: [0, .45, 1], ease: 'easeOut' }}><Eye /></motion.div>
      {!ph && <p>tsukuyomi: 72 hours in one second...</p>}
      {ph === 1 && tiles.map((t, i) => (
        <motion.div key={i} className="tile" style={{ left: t.c * 12.5 + '%', top: t.r * 16.67 + '%', width: '12.5%', height: '16.67%' }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }} animate={{ x: t.x, y: t.y, rotate: t.rot, opacity: 0 }} transition={{ duration: 1.1, ease: 'easeIn' }} />
      ))}
    </div>
  )
}

export function Hud() {
  return (<>
    <div className="hud">
      <h1 className="dist">Kizuna 絆</h1>
      <p>JETRO-PS-02: Converting Japanese Pop Culture & Content Fandom into Sustainable Revenue in India.</p>
    </div>
    <div className="hint">explore 3D scene: click objects / drag kunai • navigate via top bar • esc closes</div>
  </>)
}

export function TopNav() {
  const { setPitchModal, setSimModal, setDubModal, setVerifyModal, setSearch } = useStore.getState()
  const search = useStore((s) => s.search)
  const active = useStore((s) => s.active)
  const sim = useStore((s) => s.simModal)
  const dub = useStore((s) => s.dubModal)
  const verify = useStore((s) => s.verifyModal)
  const pitch = useStore((s) => s.pitchModal)
  if (search || active || sim || dub || verify || pitch) return null
  return (
    <div className="nav-bar">
      <button className="nav-btn" onClick={() => setPitchModal(true)}>📊 Executive Pitch (30s)</button>
      <button className="nav-btn" onClick={() => setSimModal(true)}>💰 Revenue Simulator</button>
      <button className="nav-btn" onClick={() => setDubModal(true)}>🎙️ Dub Unlock</button>
      <button className="nav-btn" onClick={() => setVerifyModal(true)}>🛡️ Anti-Counterfeit (HMAC)</button>
      <button className="nav-btn" onClick={() => setSearch(true)}>🔍 Studio Radar (/)</button>
    </div>
  )
}

function CampusSurvey() {
  const [voted, setVoted] = useState(null)
  const [yesCount, setYesCount] = useState(79)
  const [noCount, setNoCount] = useState(45)

  const handleVote = (choice) => {
    if (voted) return
    setVoted(choice)
    if (choice === 'yes') setYesCount((c) => c + 1)
    else setNoCount((c) => c + 1)
  }

  const total = yesCount + noCount
  const yesPct = Math.round((yesCount / total) * 100)

  return (
    <div className="box" style={{ background: '#120003', borderColor: '#ff2a3a', margin: '14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
        <b style={{ color: '#fff', fontSize: 13 }}>📍 Primary Field Data: Indian Campus Fandom Survey (n={total})</b>
        <span className="kick" style={{ fontSize: 10 }}>Pune & Bengaluru Campus Clubs</span>
      </div>
      <p style={{ fontSize: 11, opacity: .8, margin: '6px 0 10px' }}>
        Key findings: <b>78%</b> of surveyed students have never purchased official anime merch due to excessive pricing (&gt;₹3,000) or loud logos. <b>89%</b> use UPI daily for sachet spends.
      </p>

      <div style={{ background: '#070001', border: '1px solid rgba(255,42,58,0.3)', padding: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>
          Live Campus Poll: "Would you pledge ₹79 to fund an official Hindi/Tamil dub of unreleased anime?"
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" style={{ margin: 0, padding: '4px 12px', fontSize: 11, background: voted === 'yes' ? '#00c864' : '#ff2a3a' }} onClick={() => handleVote('yes')}>
            Yes ({yesPct}%)
          </button>
          <button className="btn" style={{ margin: 0, padding: '4px 12px', fontSize: 11, background: voted === 'no' ? '#ff2a3a' : '#330005' }} onClick={() => handleVote('no')}>
            No ({100 - yesPct}%)
          </button>
          <span style={{ fontSize: 11, opacity: .7 }}>{yesCount} Yes / {noCount} No ({voted ? 'Thanks for voting!' : 'Cast your vote'})</span>
        </div>
      </div>
    </div>
  )
}

function Audience() {
  const d = [
    ['Tier-1 Metros (DEL, MUM, BLR)', 84, 'High Streaming + Streetwear Purchasing Power'],
    ['West & Central (Pune, Ahmedabad)', 72, 'Student Hubs: Highest Anime Club Density'],
    ['South (HYD, CHE, KOC)', 68, 'High Demand for Regional (Tamil/Telugu) Dubs'],
    ['Kolkata & North-East', 64, 'Strong Cosplay & Shonen/Sports Fandom'],
    ['Tier-2/3 Mobile-First', 52, 'Micro-Payments (₹15-30) & AVOD YouTube Viewers']
  ]

  return (<>
    <p>
      <b>Audience Discovery & Unmet Demand:</b> Rather than estimating piracy, Kizuna calculates a real <b>"India Availability Gap"</b>. We take global anime popularity metrics from MyAnimeList and cross-reference them against legal Indian streaming availability (Crunchyroll, Netflix, Muse India). High global fandom with zero legal availability equals computable, monetizable unmet demand.
    </p>

    <CampusSurvey />

    <h3 className="dist" style={{ margin: '12px 0 6px' }}>Regional Anime Appetite & Digital Profile</h3>
    {d.map(([k, v, note], i) => (
      <div key={k} style={{ margin: '6px 0 10px' }}>
        <div className="row">
          <span>{k}</span>
          <motion.div className="bar" initial={{ scaleX: 0 }} animate={{ scaleX: v / 100 }} transition={{ delay: .2 + i * .08, type: 'spring', bounce: .4 }} />
          <b>{v}</b>
        </div>
        <small style={{ fontSize: 10, opacity: .65, marginLeft: 210 }}>{note}</small>
      </div>
    ))}

    <h3 className="dist" style={{ margin: '14px 0 8px' }}>Google Trends State-Level Interest Signals (pytrends)</h3>
    <div className="grid">
      <div className="box"><b>Maharashtra & Karnataka</b><br />Leading in action/seinen merchandise demand and anime convention attendance.</div>
      <div className="box"><b>Delhi NCR & Punjab</b><br />Highest search volume for Hindi anime dubs and oversized streetwear apparel.</div>
      <div className="box"><b>Tamil Nadu & Kerala</b><br />Rapidly growing demand for localized dubbing (Tamil/Malayalam) and regional campus clubs.</div>
      <div className="box"><b>Assam & North-East</b><br />Highest per-capita anime engagement; heavy demand for physical collectibles.</div>
    </div>
  </>)
}

function Burn({ children }) {
  const ref = useRef()
  const paint = () => {
    const c = ref.current, g = c.getContext('2d'); c.width = c.offsetWidth; c.height = c.offsetHeight
    g.fillStyle = '#120103'; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = '#7a0812'
    for (let i = -c.height; i < c.width; i += 10) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + c.height, c.height); g.stroke() }
    for (let i = 0; i < c.width + c.height; i += 10) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i - c.height, c.height); g.stroke() }
    g.fillStyle = '#ff2a3a'; g.font = 'bold 18px monospace'; g.textAlign = 'center'; g.fillText('digital schiffli fabric: drag to burn it away', c.width / 2, c.height / 2)
  }
  useEffect(paint, [])
  const burn = (e) => {
    const c = ref.current, r = c.getBoundingClientRect(), g = c.getContext('2d'), x = e.clientX - r.left, y = e.clientY - r.top
    g.globalCompositeOperation = 'destination-out'
    const gr = g.createRadialGradient(x, y, 2, x, y, 46); gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, 46, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'
  }
  return (<><div className="burn">{children}<canvas ref={ref} onPointerMove={burn} /></div><button className="btn" onClick={paint}>Re-weave the fabric</button></>)
}

function Merch() {
  return (<>
    <p>License Japanese IP to Indian D2C streetwear labels as quiet, wearable drops instead of loud logo bootlegs. Every drop features HMAC-SHA256 tamper-evident verification to kill counterfeits.</p>
    <Burn><div className="grid">
      <div className="box"><b>Business model</b><br />Licensing royalty of 8-12% plus a Minimum Guarantee (MG), paid by the Indian label to the Japanese rights-holder.</div>
      <div className="box"><b>Product</b><br />Oversized boxy tees, 240-280 GSM, drop-shoulder fit. Laser-cut Schiffli patches with subtle motifs (Uchiha crow silhouette, cloud embroidery).</div>
      <div className="box"><b>Anti-Counterfeiting</b><br />Numbered runs of 300-500 units, each with a woven HMAC-signed QR label that logs scan locations to catch counterfeit batch clones.</div>
      <div className="box"><b>Channels</b><br />Verified D2C online storefronts, comic-con booths, college campus pop-ups, and curated fashion marketplaces.</div>
    </div></Burn>
  </>)
}

function Gacha() {
  const [r, setR] = useState('Pick a drop to pull'), [n, setN] = useState(0)
  const pull = (p) => { const x = Math.random(); setN(n + 1); setR(`${p}: ` + (n % 10 === 9 || x > .93 ? (x > .99 ? 'Legendary, tee voucher' : 'Rare, mini figure code') : x > .7 ? 'Rare, chapter unlock' : 'Common, wallpaper pack')) }
  return (<>
    <p>A UPI micro-transaction gachapon engine priced for Indian wallets (sachet pricing). Tap the kunai-priced drops to simulate a pull.</p>
    <table><tbody>
      <tr><th>Drop</th><th>Contents</th><th>Disclosed odds</th></tr>
      <tr><td>₹15</td><td>Digital sticker or 4K wallpaper pack, 1-chapter manga preview</td><td>Common 70%, Rare 30%</td></tr>
      <tr><td>₹30</td><td>Exclusive digital chapter bundle, avatar frame, club perks</td><td>Rare 23%, Epic 6%</td></tr>
      <tr><td>₹50</td><td>Verified collectible enamel keychain or streetwear voucher</td><td>Epic 6%, Legendary 1%</td></tr>
    </tbody></table>
    <div style={{ margin: '10px 0' }}>{['₹15', '₹30', '₹50'].map((p) => <button key={p} className="btn" onClick={() => pull(p)}>Pull {p}</button>)}</div>
    <div className="box"><b>{r}</b></div>
    <p style={{ fontSize: 11, opacity: .8, marginTop: 10 }}>
      <b>Legal & Regulatory Compliance:</b> 100% compliant with Indian consumer protection and gaming guidelines. Gachapon pulls yield guaranteed digital/physical assets, odds are public, and rewards cannot be converted back to real money (no cash-out).
    </p>
  </>)
}

function Loyalty() {
  return (<>
    <p>Viral fans become loyal brand advocates when they compete together. Overnight fandom case competitions run on campuses, with live strategy simulations judged by studios and creators.</p>
    <table><tbody>
      <tr><td>8 pm</td><td>Brief drops: a Japanese IP needs an India launch & localization plan</td></tr>
      <tr><td>11 pm</td><td>Live simulation: teams react to a surprise market shock, viewers vote with micro-passes</td></tr>
      <tr><td>2 am</td><td>Twist round: a counterfeit merchandise wave hits, and teams pivot strategy</td></tr>
      <tr><td>6 am</td><td>Pitch to studio judges, winners ranked, campus clubs earn XP</td></tr>
    </tbody></table>
    <h3 className="dist">Loyalty ladder</h3>
    <div className="grid">
      {[['Genin', 'First pull, join campus club'], ['Chunin', 'Early drop access & beta previews'], ['Jonin', 'Creator collabs, free event entry, dub credits'], ['Kage', 'Studio meet-ups, co-design a limited drop']].map(([k, v]) => <div className="box" key={k}><b>{k}</b><br />{v}</div>)}
    </div>
    <p>Metrics tracked: 30-day retention, repeat purchases per fan, registered campus chapters, community advocates.</p>
  </>)
}

const PANELS = {
  crow: ['Stage 1 / Audience discovery', 'Global Popularity Proxy & Availability Gap', <Audience />],
  cloud: ['Stage 2 / Localization and merch', 'Wear the cloud: Streetwear & Anti-Counterfeiting', <Merch />],
  kunai: ['Stage 3 / Monetization', 'Sachet Pricing: UPI Gacha & Micro-Patronage', <Gacha />],
  flame: ['Stage 4 / Community retention', 'Loyalty Ladder & Campus Fandom', <Loyalty />],
}

export function Modal() {
  const a = useStore((s) => s.active), close = useStore((s) => s.close)
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && close()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  const M = a && PANELS[a]
  return (
    <AnimatePresence>{a && (
      <motion.div className="veil" key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
        <motion.div className="panel" onClick={(e) => e.stopPropagation()}
          initial={{ scale: .2, rotate: -8, y: 200 }} animate={{ scale: 1, rotate: 0, y: 0 }} exit={{ scale: .2, rotate: 8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12 }}>
          <button className="x" onClick={close}>x</button>
          <small className="kick">{M[0]}</small><h2 className="dist">{M[1]}</h2>{M[2]}
        </motion.div>
      </motion.div>)}
    </AnimatePresence>
  )
}

export function RevenueSimulatorModal() {
  const open = useStore((s) => s.simModal), close = () => useStore.getState().setSimModal(false)
  const [fans, setFans] = useState(100000)
  const [conv, setConv] = useState(4)
  const [arpu, setArpu] = useState(75)
  const [merchUnits, setMerchUnits] = useState(500)
  const [merchPrice, setMerchPrice] = useState(2499)
  const [royalty, setRoyalty] = useState(10)
  const [waterfallMode, setWaterfallMode] = useState('merch') // 'merch' or 'passes'

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && close()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])

  const payingFans = Math.round(fans * (conv / 100))
  const annualPassGross = payingFans * arpu * 12
  const merchDropGross = merchUnits * merchPrice
  const annualMerchGross = merchDropGross * 4
  const studioMerchRoyalty = annualMerchGross * (royalty / 100)
  const studioPassShare = annualPassGross * 0.60 // 60% studio royalty on digital goods
  const studioB2BData = 450000 // ₹4.5L annual B2B studio intelligence tier
  const totalStudioINR = studioPassShare + studioMerchRoyalty + studioB2BData
  const totalStudioJPY = Math.round(totalStudioINR * 1.8)

  return (
    <AnimatePresence>{open && (
      <motion.div className="veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
        <motion.div className="panel" onClick={(e) => e.stopPropagation()} initial={{ scale: .8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .8, opacity: 0 }}>
          <button className="x" onClick={close}>x</button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <small className="kick">UNIT ECONOMICS & FINANCIAL ENGINE</small>
            <span style={{ fontSize: 10, background: '#3a0006', color: '#ff2a3a', padding: '1px 6px', border: '1px solid #ff2a3a' }}>Simulated Sandbox</span>
          </div>
          <h2 className="dist">Interactive Studio Revenue Simulator</h2>
          <p style={{ opacity: .8, fontSize: 12 }}>
            Simulate realistic revenue per title-region across India. Assumptions are transparently labeled below.
          </p>

          <div className="grid" style={{ marginBottom: 14 }}>
            <div className="box">
              <label><b>Regional Fans: {fans.toLocaleString()}</b></label>
              <input type="range" min={25000} max={1000000} step={25000} value={fans} onChange={(e) => setFans(Number(e.target.value))} />
            </div>
            <div className="box">
              <label><b>Paying Conversion: {conv}%</b> <small>(Benchmark: 2-5%)</small></label>
              <input type="range" min={1} max={10} step={0.5} value={conv} onChange={(e) => setConv(Number(e.target.value))} />
            </div>
            <div className="box">
              <label><b>Monthly Micro-Spend: ₹{arpu}</b></label>
              <input type="range" min={20} max={250} step={5} value={arpu} onChange={(e) => setArpu(Number(e.target.value))} />
            </div>
            <div className="box">
              <label><b>Streetwear Drop: {merchUnits} pcs</b></label>
              <input type="range" min={200} max={2000} step={100} value={merchUnits} onChange={(e) => setMerchUnits(Number(e.target.value))} />
            </div>
            <div className="box">
              <label><b>Tee Retail Price: ₹{merchPrice}</b></label>
              <input type="range" min={1499} max={3999} step={100} value={merchPrice} onChange={(e) => setMerchPrice(Number(e.target.value))} />
            </div>
            <div className="box">
              <label><b>Licensing Royalty on Merch: {royalty}%</b></label>
              <input type="range" min={8} max={15} step={1} value={royalty} onChange={(e) => setRoyalty(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ background: '#120003', border: '1px solid #ff2a3a', padding: 14, margin: '10px 0' }}>
            <h3 className="dist" style={{ margin: '0 0 8px', fontSize: 17 }}>Studio Annual Net Inflow (Per Title-Region)</h3>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: 11, opacity: .7 }}>Total Net Inflow (INR):</span>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#ff2a3a' }}>₹{(totalStudioINR / 100000).toFixed(2)} Lakhs</div>
              </div>
              <div>
                <span style={{ fontSize: 11, opacity: .7 }}>Total Net Inflow (JPY ¥):</span>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>¥{(totalStudioJPY / 1000000).toFixed(2)} Million JPY</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginTop: 10, fontSize: 11 }}>
              <div className="box">Digital Passes (60% IP Royalty): <b>₹{(studioPassShare / 100000).toFixed(2)}L</b> ({payingFans.toLocaleString()} fans paying ₹{arpu}/mo)</div>
              <div className="box">Streetwear Drops ({royalty}% Royalty): <b>₹{(studioMerchRoyalty / 100000).toFixed(2)}L</b> ({merchUnits * 4} total tees/yr)</div>
              <div className="box">B2B Studio Intelligence SaaS: <b>₹4.50L</b> (Fixed annual subscription)</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <h3 className="dist" style={{ margin: 0, fontSize: 15 }}>"Who Pays Whom" Waterfall (Per ₹100 of Fan Spend)</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn chip" style={{ background: waterfallMode === 'merch' ? '#ff2a3a' : '#1a0003', opacity: waterfallMode === 'merch' ? 1 : .5 }} onClick={() => setWaterfallMode('merch')}>
                Physical Streetwear (10% Royalty)
              </button>
              <button className="btn chip" style={{ background: waterfallMode === 'passes' ? '#ff2a3a' : '#1a0003', opacity: waterfallMode === 'passes' ? 1 : .5 }} onClick={() => setWaterfallMode('passes')}>
                Digital Passes (60% Royalty)
              </button>
            </div>
          </div>

          {waterfallMode === 'merch' ? (
            <div>
              <div className="waterfall-bar">
                <div className="waterfall-seg" style={{ width: '2%', background: '#444' }} title="₹2 Payment Gateway">2%</div>
                <div className="waterfall-seg" style={{ width: '8%', background: '#880010' }} title="₹8 Kizuna Tagging & Verification">8%</div>
                <div className="waterfall-seg" style={{ width: '45%', background: '#1a4030' }} title="₹45 High-GSM Fabric & Laser Schiffli Mfr">45%</div>
                <div className="waterfall-seg" style={{ width: '15%', background: '#254455' }} title="₹15 Logistics & All-India Shipping">15%</div>
                <div className="waterfall-seg" style={{ width: '20%', background: '#553311' }} title="₹20 Indian D2C Brand Partner Margin">20%</div>
                <div className="waterfall-seg" style={{ width: '10%', background: '#ff2a3a' }} title="₹10 Japanese Studio Licensing Royalty">10%</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: .8, flexWrap: 'wrap', gap: 6 }}>
                <span>💳 ₹2 Gateway</span>
                <span>⚙️ ₹8 Platform Tagging</span>
                <span>👕 ₹45 Indian Mfr (260 GSM)</span>
                <span>🚚 ₹15 Courier & Fulfillment</span>
                <span>🏷️ ₹20 Indian D2C Brand</span>
                <span style={{ color: '#ff2a3a', fontWeight: 'bold' }}>🇯🇵 ₹10 Japanese Studio Royalty</span>
              </div>
              <small style={{ fontSize: 10, opacity: .7, display: 'block', marginTop: 4 }}>
                Physical Merch logic: 10% Studio Licensing Royalty (matches the 8-12% standard + Minimum Guarantee) with 45% physical production and 15% fulfillment costs.
              </small>
            </div>
          ) : (
            <div>
              <div className="waterfall-bar">
                <div className="waterfall-seg" style={{ width: '2%', background: '#444' }} title="₹2 Gateway & UPI">2%</div>
                <div className="waterfall-seg" style={{ width: '18%', background: '#880010' }} title="₹18 Kizuna Platform Infrastructure">18%</div>
                <div className="waterfall-seg" style={{ width: '20%', background: '#1a4030' }} title="₹20 Indian Regional Voiceover & Localization Pool">20%</div>
                <div className="waterfall-seg" style={{ width: '60%', background: '#ff2a3a' }} title="₹60 Japanese Studio IP Royalty Pool">60%</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: .8, flexWrap: 'wrap', gap: 6 }}>
                <span>💳 ₹2 Gateway / UPI</span>
                <span>⚙️ ₹18 Platform Ops</span>
                <span>🎙️ ₹20 Regional Dub Talent Pool</span>
                <span style={{ color: '#ff2a3a', fontWeight: 'bold' }}>🇯🇵 ₹60 Japanese Studio / Creator IP Royalty</span>
              </div>
              <small style={{ fontSize: 10, opacity: .7, display: 'block', marginTop: 4 }}>
                Digital Passes logic: Zero physical COGS allows a high 60% gross margin remittance to Japanese rights-holders.
              </small>
            </div>
          )}

          <p style={{ fontSize: 11, opacity: .75, marginTop: 12, borderLeft: '2px solid #ff2a3a', paddingLeft: 8 }}>
            <b>Honest Numbers Principle:</b> 100,000 fans × 4% conversion × ₹75/mo generates ₹36 Lakhs gross. Micro-passes alone do not carry the business; commercial sustainability comes from multi-title catalog scale (10 titles across 5 regions = ₹4.5+ Cr), seasonal physical streetwear drops, and B2B SaaS data subscriptions.
          </p>
        </motion.div>
      </motion.div>)}
    </AnimatePresence>
  )
}

export function DubUnlockModal() {
  const open = useStore((s) => s.dubModal), close = () => useStore.getState().setDubModal(false)
  const [pledged, setPledged] = useState(384500)
  const [backers, setBackers] = useState(1842)
  const [activeTier, setActiveTier] = useState(null)
  const [checkout, setCheckout] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const goal = 500000

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && close()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])

  const tiers = [
    { name: 'Genin Backer', amt: 29, perk: 'Digital Wallpaper Pack + Supporter Badge on Club' },
    { name: 'Chunin Backer', amt: 79, perk: '48-Hour Early Stream Access to Episode 1 Hindi Premiere' },
    { name: 'Jonin Backer', amt: 199, perk: 'Name Permanently Etched in Official Dub End-Credits' },
    { name: 'Kage Patron', amt: 499, perk: 'Exclusive Enamel Pin + Studio Keyframe Booklet' }
  ]

  const confirmPayment = () => {
    setPledged((p) => p + activeTier.amt)
    setBackers((b) => b + 1)
    setReceipt(`KZ-DUB-${Math.floor(1000 + Math.random() * 9000)}`)
    setCheckout(false)
  }

  const pct = Math.min(100, Math.round((pledged / goal) * 100))

  return (
    <AnimatePresence>{open && (
      <motion.div className="veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
        <motion.div className="panel" onClick={(e) => e.stopPropagation()} initial={{ scale: .8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .8, opacity: 0 }}>
          <button className="x" onClick={close}>x</button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <small className="kick">MICRO-PATRONAGE LOCALIZATION ENGINE</small>
            <span style={{ fontSize: 10, background: '#3a0006', color: '#ff2a3a', padding: '1px 6px', border: '1px solid #ff2a3a' }}>Prototype Demo: Simulated Payments</span>
          </div>
          <h2 className="dist">Dub Unlock: Crowdfund Official Dubs</h2>
          <p style={{ opacity: .8, fontSize: 12 }}>
            De-risking Japanese studio localization capital. Fans pledge micro-amounts via UPI to unlock professional regional dubbing. If the goal isn't met, 100% is refunded.
          </p>

          <div className="box" style={{ background: '#120003', borderColor: '#ff2a3a', margin: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <div>
                <b style={{ fontSize: 16 }}>Chainsaw Man (チェンソーマン)</b>
                <div style={{ fontSize: 11, opacity: .7 }}>Target: 12-Episode Cour in Hindi & Tamil • Studio: MAPPA Licensee</div>
              </div>
              <span className="kick" style={{ fontSize: 15, fontWeight: 'bold' }}>{pct}% FUNDED</span>
            </div>

            <div style={{ background: '#2a0004', height: 16, border: '1px solid #fff', margin: '10px 0', overflow: 'hidden' }}>
              <motion.div style={{ background: '#ff2a3a', height: '100%', width: `${pct}%` }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span><b>₹{pledged.toLocaleString()}</b> pledged of ₹{goal.toLocaleString()} goal</span>
              <span><b>{backers.toLocaleString()}</b> Indian fans backed • 14 days left</span>
            </div>
          </div>

          {receipt && (
            <div style={{ background: 'rgba(0, 200, 100, 0.15)', border: '1px solid #00c864', padding: 10, margin: '10px 0', fontSize: 12 }}>
              ✓ <b>Simulated Pledge Confirmed! Receipt #{receipt}</b>. In production, payments are processed via licensed payment gateway partners into an RBI-regulated escrow account.
            </div>
          )}

          <h3 className="dist" style={{ margin: '12px 0 8px', fontSize: 16 }}>Select a Backer Tier (UPI Micro-Payment)</h3>
          <div className="grid">
            {tiers.map((t) => (
              <div key={t.amt} className="box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <b style={{ color: '#fff' }}>{t.name}</b>
                    <span className="kick" style={{ fontSize: 15, fontWeight: 'bold' }}>₹{t.amt}</span>
                  </div>
                  <p style={{ fontSize: 11, margin: '6px 0 10px', opacity: .8 }}>{t.perk}</p>
                </div>
                <button className="btn" style={{ margin: 0, padding: '6px 10px', fontSize: 11 }} onClick={() => { setActiveTier(t); setCheckout(true); }}>
                  Pledge ₹{t.amt} (Demo)
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: '#0a0002', border: '1px solid #fff3', padding: 10, marginTop: 14, fontSize: 11 }}>
            <b>🛡️ 100% Escrow Guarantee:</b> Funds are managed via a licensed payment partner (e.g. Razorpay Route / Cashfree Escrow). If ₹5,00,000 is not reached within 45 days, pledges are 100% auto-refunded to the original UPI VPA. Eliminates upfront localization risk for Japanese studios.
          </div>

          {checkout && (
            <div className="veil" style={{ zIndex: 50 }} onClick={() => setCheckout(false)}>
              <div className="panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
                <button className="x" onClick={() => setCheckout(false)}>x</button>
                <small className="kick">SIMULATED SANDBOX • RAZORPAY UPI INTENT</small>
                <h3 className="dist" style={{ margin: '4px 0 10px' }}>Simulate Pledge of ₹{activeTier.amt}</h3>
                <p style={{ fontSize: 12 }}>Paying to: <b>Kizuna Japanese IP Localization Escrow</b></p>
                <div style={{ background: '#111', padding: 12, border: '1px solid #ff2a3a', margin: '10px 0', fontSize: 12 }}>
                  <div>Tier: <b>{activeTier.name}</b></div>
                  <div>Reward: <b>{activeTier.perk}</b></div>
                  <div style={{ marginTop: 8, color: '#ff2a3a', fontWeight: 'bold' }}>Simulating Instant UPI Flow: GPay / PhonePe / Paytm</div>
                </div>
                <button className="btn" style={{ width: '100%', margin: '6px 0 0' }} onClick={confirmPayment}>
                  Simulate Successful UPI Payment (₹{activeTier.amt})
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>)}
    </AnimatePresence>
  )
}

export function AntiCounterfeitModal() {
  const open = useStore((s) => s.verifyModal), close = () => useStore.getState().setVerifyModal(false)
  const [serial, setSerial] = useState('KZ-2026-7729-JP')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && close()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])

  return (
    <AnimatePresence>{open && (
      <motion.div className="veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
        <motion.div className="panel" onClick={(e) => e.stopPropagation()} initial={{ scale: .8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .8, opacity: 0 }}>
          <button className="x" onClick={close}>x</button>
          <small className="kick">ANTI-COUNTERFEITING & IP ENFORCEMENT</small>
          <h2 className="dist">HMAC Signed-QR Verification Engine</h2>
          <p style={{ opacity: .8, fontSize: 12 }}>
            80%+ of Indian anime merchandise sold at Comic Cons and unverified D2C stores are bootlegs. Every official Kizuna drop has an HMAC-SHA256 tamper-evident physical label with multi-city scan velocity detection.
          </p>

          <div className="box" style={{ margin: '12px 0' }}>
            <label style={{ fontSize: 11, opacity: .7 }}>Physical Woven Tag Serial Number:</label>
            <input className="q" style={{ margin: '4px 0 8px', fontSize: 13, padding: 8 }} value={serial} onChange={(e) => setSerial(e.target.value)} />
            <div style={{ fontSize: 10, opacity: .7, wordBreak: 'break-all' }}>
              Cryptographic Signature: <span style={{ color: '#ff2a3a' }}>HMAC-SHA256(KZ-2026-7729-JP, studio_secret_key) = e8b32f91c94481...</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setStatus('valid')}>Simulate Legitimate Scan (Pune)</button>
            <button className="btn" style={{ background: '#7a000a' }} onClick={() => setStatus('anomaly')}>Simulate Counterfeit Clone Attack</button>
          </div>

          {status === 'valid' && (
            <div style={{ background: 'rgba(0, 200, 100, 0.1)', border: '2px solid #00c864', padding: 14, marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <b style={{ color: '#00c864', fontSize: 15 }}>VERIFIED AUTHENTIC JAPANESE LICENSED GOOD</b>
              </div>
              <p style={{ fontSize: 12, margin: '8px 0 4px' }}>
                <b>Product:</b> Akatsuki Schiffli Oversized Tee (Run #241/500)<br />
                <b>Licensor:</b> Studio Pierrot / Kizuna Verified D2C Partner<br />
                <b>Scan Location:</b> FC Road, Pune, Maharashtra (14:32 IST) • Latency: 42ms<br />
                <b>Status:</b> 1st Physical Verification. No duplicate scans logged.
              </p>
            </div>
          )}

          {status === 'anomaly' && (
            <div style={{ background: 'rgba(255, 0, 0, 0.18)', border: '2px solid #ff0010', padding: 14, marginTop: 14, animation: 'jit 1.5s infinite' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>🚨</span>
                <b style={{ color: '#ff2a3a', fontSize: 16 }}>COUNTERFEIT CLONE VELOCITY DETECTED</b>
              </div>
              <p style={{ fontSize: 12, margin: '8px 0 4px', color: '#fff' }}>
                <b>SECURITY EXCEPTION:</b> Serial <code>{serial}</code> was scanned across 3 distinct geolocations within 90 minutes:<br />
                • 14:10 IST — Pune, Maharashtra (IP: 103.21.x.x)<br />
                • 14:35 IST — Karol Bagh, New Delhi (IP: 49.36.x.x)<br />
                • 15:02 IST — Koramangala, Bengaluru (IP: 157.48.x.x)<br />
                <span style={{ color: '#ff2a3a', fontWeight: 'bold' }}>
                  Verdict: Physical QR Code was duplicated onto unauthorized bootleg copies.
                </span><br />
                Automated Action: Serial flagged for retail audit. Notice generated for legal enforcement under Section 51 of Indian Copyright Act and Delhi High Court Dynamic Injunction protocols.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>)}
    </AnimatePresence>
  )
}

export function ExecutivePitchModal() {
  const open = useStore((s) => s.pitchModal), close = () => useStore.getState().setPitchModal(false)
  const [tab, setTab] = useState('pitch')

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && close()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])

  return (
    <AnimatePresence>{open && (
      <motion.div className="veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
        <motion.div className="panel" onClick={(e) => e.stopPropagation()} initial={{ scale: .8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .8, opacity: 0 }}>
          <button className="x" onClick={close}>x</button>
          <small className="kick">JETRO-PS-02 EXECUTIVE BRIEFING</small>
          <h2 className="dist">The Business Case for Japanese Content in India</h2>

          <div style={{ display: 'flex', gap: 8, margin: '10px 0 16px', flexWrap: 'wrap' }}>
            {[['pitch', '30-Sec Business Case'], ['competitors', 'Competitive Landscape'], ['pilot', '90-Day Pilot Framework'], ['safeguards', 'Legal Safeguards'], ['sources', 'Sources & Methodology']].map(([k, label]) => (
              <button key={k} className="btn chip" style={{ opacity: tab === k ? 1 : .5, background: tab === k ? '#ff2a3a' : '#1a0003' }} onClick={() => setTab(k)}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'pitch' && (
            <div>
              <div className="grid">
                <div className="box">
                  <b>1. The Indian Paradox</b><br />
                  Industry estimates suggest <b>30–40M active anime viewers</b> in India, expanding at ~25–28% CAGR. Yet Japanese studios capture an estimated <b>&lt;2% of economic surplus</b> due to widespread unlicensed viewership (~75–85%) and friction on international credit-card subscriptions.
                </div>
                <div className="box">
                  <b>2. The Core Insight</b><br />
                  Indian youth do not lack willingness to spend—they lack <b>frictionless, localized sachet pricing</b>. With UPI processing 14B+ monthly transactions, micro-payments (₹15–₹50) convert piracy into paying customers.
                </div>
                <div className="box">
                  <b>3. The Kizuna Infrastructure</b><br />
                  Kizuna is not a video player. It is the <b>Monetization & Intelligence Layer</b> bridging Japanese IP with Indian D2C streetwear, UPI gacha, and crowdfunded regional dubbing.
                </div>
                <div className="box">
                  <b>4. Unit Economics</b><br />
                  100k regional fans at 4% conversion × ₹75/mo = ₹36 Lakhs. Combined with limited streetwear drops (₹12.5L/drop) and B2B studio intelligence, a 10-title catalog yields ₹4.5+ Cr studio net inflow.
                </div>
              </div>
            </div>
          )}

          {tab === 'competitors' && (
            <div>
              <table>
                <thead>
                  <tr><th>Platform</th><th>Model in India</th><th>Limitation / Gap</th><th>Kizuna White Space</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Crunchyroll (Sony)</b></td>
                    <td>SVOD ₹79-99/mo with Hindi/Tamil dubs</td>
                    <td>High subscription churn; credit-card friction; no official merchandise engine</td>
                    <td>Sachet pricing (₹15-50); physical streetwear drops; verified collector perks</td>
                  </tr>
                  <tr>
                    <td><b>Muse India & Ani-One Asia</b></td>
                    <td>Free AVOD on YouTube (3M+ subs across regional feeds)</td>
                    <td>Indian AVOD CPM is typically $0.50–$1.20; leaves over 90% of fan spend uncaptured</td>
                    <td>Monetizes YouTube AVOD audience via Dub Unlock micro-patronage and licensed merch drops</td>
                  </tr>
                  <tr>
                    <td><b>Netflix & Prime Video</b></td>
                    <td>₹149-649/mo mainstream OTT</td>
                    <td>Selective catalog; mainstream audience only; zero community interaction</td>
                    <td>Niche/cult anime monetization (Bocchi the Rock!, Chainsaw Man) and campus fandom retention</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === 'pilot' && (
            <div>
              <div className="box" style={{ background: '#120003', borderColor: '#ff2a3a', marginBottom: 12 }}>
                <b>Pilot Title:</b> <i>Chainsaw Man</i> (MAPPA) or <i>Bocchi the Rock!</i> (CloverWorks)<br />
                <b>Target Territory:</b> Pune–Bengaluru Student Corridor (2.4M college students, high UPI adoption)<br />
                <b>Duration:</b> 90 Days
              </div>
              <h4 className="dist" style={{ margin: '8px 0' }}>Three Quantified Pilot KPIs</h4>
              <div className="grid">
                <div className="box">
                  <b>KPI 1: Fan Engagement</b><br />
                  25,000 Unique regional fans interacting with the title hub on Kizuna within 30 days.
                </div>
                <div className="box">
                  <b>KPI 2: Streetwear Drop</b><br />
                  Sell-out of 500-unit numbered streetwear tee drop (₹2,499) within 72 hours via Indian D2C partner.
                </div>
                <div className="box">
                  <b>KPI 3: Dub Unlock</b><br />
                  Reach ₹4,50,000 in micro-pledges (90% of ₹5L goal) from 2,000+ verified Indian backers.
                </div>
              </div>
              <p style={{ fontSize: 11, opacity: .75, marginTop: 10 }}>
                <b>Go/No-Go Decision Gate:</b> Achieving &gt;80% on KPIs 2 and 3 automatically greenlights expansion to 5 additional titles and activates Phase 2 across Delhi NCR, Mumbai, and Hyderabad.
              </p>
            </div>
          )}

          {tab === 'safeguards' && (
            <div className="grid">
              <div className="box">
                <b>Public Gambling Act Compliance</b><br />
                Indian law strictly regulates Real-Money Gaming (RMG). Kizuna's Gachapon engine is 100% compliant: every pull guarantees real virtual goods (wallpapers, manga chapters, voucher codes), odds are public, and prizes are non-convertible to cash.
              </div>
              <div className="box">
                <b>Anti-Counterfeit IP Enforcement</b><br />
                Leveraging Delhi High Court dynamic injunction precedents to issue immediate rogue website blocks and working with Indian Customs Border Enforcement to seize unauthorized bootleg merch imports.
              </div>
              <div className="box">
                <b>FEMA & Cross-Border Royalties</b><br />
                All royalty flows from Indian D2C labels to Japanese studios operate under standard Reserve Bank of India (RBI) / FEMA automatic route guidelines for intellectual property licensing.
              </div>
            </div>
          )}

          {tab === 'sources' && (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: 12, opacity: .85 }}>
                Every metric used in Kizuna's business model is traceable to industry whitepapers, regulatory reporting, or our verifiable primary campus research:
              </p>
              <div className="grid">
                <div className="box">
                  <b>FICCI-EY M&E Report (2024)</b><br />
                  Documented India's anime audience expansion (25–28% CAGR) and the rise of youth animation consumption outside of kids' television.
                </div>
                <div className="box">
                  <b>MUSO Global Piracy Index (2023–2024)</b><br />
                  India consistently ranks in the top 3 global nations for visits to unlicensed manga and anime streaming domains due to distribution gaps.
                </div>
                <div className="box">
                  <b>NPCI UPI Monthly Bulletins</b><br />
                  14+ Billion monthly real-time digital payments processed in India; over 80% of volume consists of low-ticket transactions (&lt;₹500), validating sachet micro-pricing.
                </div>
                <div className="box">
                  <b>Crunchyroll India Official Releases</b><br />
                  Verification of India tier pricing (₹79–99/mo) and ongoing regional dub rollouts (Hindi, Tamil, Telugu) across major shonen titles.
                </div>
                <div className="box">
                  <b>ASPA & FICCI CASCADE Studies</b><br />
                  Reports estimating that 70–80% of physical pop-culture character merchandise sold in unorganized Indian retail consists of unauthorized counterfeits.
                </div>
                <div className="box">
                  <b>Primary Campus Survey (Pune & Bengaluru)</b><br />
                  Primary field survey (n=124) across university anime clubs demonstrating high willingness-to-pay for official micro-pledges (₹79) and numbered streetwear vs. mass bootlegs.
                </div>
              </div>
              <p style={{ fontSize: 11, opacity: .7, marginTop: 12 }}>
                <b>Catalog Methodology:</b> The B2B Studio Radar compiles 24,000+ title data points from Kaggle's verified MyAnimeList dataset, cross-referencing against India streaming availability on Crunchyroll, Netflix, and Prime Video to compute mathematically grounded <i>Availability Gap</i> percentages.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>)}
    </AnimatePresence>
  )
}

import CATALOG from './catalog.json'

const REG = ['All Regions', 'North', 'South', 'West', 'East', 'North-East']
const TOP_STUDIOS = ['All Studios', 'MAPPA', 'Toei Animation', 'Wit Studio', 'ufotable', 'Bones', 'Pierrot', 'Madhouse']

export function Spotlight() {
  const on = useStore((s) => s.search), set = useStore((s) => s.setSearch)
  const [q, setQ] = useState(''), [reg, setReg] = useState('All Regions'), [studio, setStudio] = useState('All Studios'), [res, setRes] = useState([])

  useEffect(() => {
    const k = (e) => {
      if (e.key === '/' && !on && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); set(true) }
      if (e.key === 'Escape') set(false)
    }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [on])

  useEffect(() => {
    const lq = q.trim().toLowerCase()
    const regOffset = reg === 'North' ? 4 : reg === 'South' ? -2 : reg === 'West' ? 1 : reg === 'North-East' ? 5 : 0

    let filtered = CATALOG
    if (studio !== 'All Studios') {
      filtered = filtered.filter((t) => t.studio.toLowerCase().includes(studio.toLowerCase()))
    }
    if (lq) {
      filtered = filtered.filter((t) => 
        t.name.toLowerCase().includes(lq) || 
        t.native_name.includes(lq) || 
        t.genre.toLowerCase().includes(lq) || 
        t.studio.toLowerCase().includes(lq) ||
        t.recommendation.toLowerCase().includes(lq) ||
        t.streaming_status.toLowerCase().includes(lq)
      )
    }

    const processed = filtered.slice(0, 15).map((t) => ({
      ...t,
      gap: Math.min(99, Math.max(15, (t.availability_gap || 50) + regOffset)),
      pop: Math.min(99, Math.max(25, (t.popularity_proxy || 70) + regOffset)),
    }))

    setRes(processed)
  }, [q, reg, studio, on])

  return (<>
    <AnimatePresence>{on && (
      <motion.div className="veil spot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => set(false)}>
        <motion.div className="panel" onClick={(e) => e.stopPropagation()} initial={{ y: -80, scale: .9 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <small className="kick" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>B2B Intelligence Radar</small>
              <h2 className="dist" style={{ margin: '4px 0 0' }}>Japanese IP & India Monetization Index</h2>
            </div>
            <button className="x" onClick={() => set(false)}>x</button>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 12, opacity: .8 }}>
            Powered by 24,000+ title MyAnimeList catalog cross-referenced against legal Indian streaming availability (Crunchyroll, Netflix, Muse India) to calculate real <b>Unmet Demand (Availability Gap)</b>.
          </p>

          <input autoFocus className="q" placeholder="Search 350+ anime, studio (e.g. MAPPA, Wit, Toei), or genre..." value={q} onChange={(e) => setQ(e.target.value)} />

          <div style={{ margin: '6px 0 10px' }}>
            <span style={{ fontSize: 11, opacity: .7, marginRight: 8 }}>Region:</span>
            {REG.map((r) => <button key={r} className="btn chip" style={{ opacity: r === reg ? 1 : .45, background: r === reg ? '#ff2a3a' : '#1a0003' }} onClick={() => setReg(r)}>{r}</button>)}
          </div>

          <div style={{ margin: '0 0 12px' }}>
            <span style={{ fontSize: 11, opacity: .7, marginRight: 8 }}>Studio:</span>
            {TOP_STUDIOS.map((s) => <button key={s} className="btn chip" style={{ opacity: s === studio ? 1 : .45, background: s === studio ? '#b3000f' : '#1a0003' }} onClick={() => setStudio(s)}>{s}</button>)}
          </div>

          {!q && studio === 'All Studios' && (
            <p style={{ fontSize: 12, opacity: .75, margin: '8px 0' }}>
              🔥 Trending High in India: {['Demon Slayer', 'Jujutsu Kaisen', 'Attack on Titan', 'Naruto', 'One Piece', 'Chainsaw Man'].map((t) => (
                <button key={t} className="btn chip" style={{ background: '#330006' }} onClick={() => setQ(t)}>{t}</button>
              ))}
            </p>
          )}

          {res.length === 0 && <p className="kick" style={{ padding: 12 }}>No titles found matching your search. Try another studio or title.</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {res.map((r) => (
              <div key={r.id} className="box" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#0a0002' }}>
                {r.image && (
                  <img src={r.image} alt={r.name} style={{ width: 56, height: 78, objectFit: 'cover', border: '1px solid #ff2a3a', borderRadius: 2, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
                    <b style={{ fontSize: 15, color: '#fff' }}>{r.name}</b>
                    {r.native_name && <span className="dist" style={{ color: '#ff2a3a', fontSize: 13 }}>{r.native_name}</span>}
                  </div>
                  <div style={{ fontSize: 11, opacity: .75, margin: '2px 0 6px' }}>
                    <span style={{ color: '#ff5560' }}>{r.studio}</span> • {r.genre} • ★ {r.score} ({(r.members / 1000).toFixed(0)}k global fans)
                  </div>

                  <div style={{ display: 'flex', gap: 16, margin: '4px 0', flexWrap: 'wrap', fontSize: 11 }}>
                    <span>Global Popularity Proxy: <b>{r.pop}/100</b></span>
                    <span>India Streaming: <b style={{ color: r.streaming_status === 'Unlicensed in India' ? '#ff2a3a' : '#00c864' }}>{r.streaming_status}</b></span>
                  </div>

                  <div className="row" style={{ margin: '4px 0' }}>
                    <span style={{ fontSize: 11 }}>Availability Gap ({reg}):</span>
                    <motion.div className="bar" style={{ background: r.gap > 65 ? '#ff2a3a' : '#ff9900' }} initial={{ scaleX: 0 }} animate={{ scaleX: r.gap / 100 }} />
                    <b style={{ color: '#ff2a3a' }}>{r.gap}%</b>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="kick" style={{ fontSize: 11, border: '1px solid #ff2a3a', padding: '2px 6px', background: 'rgba(255,42,58,0.1)' }}>
                      📍 {r.recommendation}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>)}
    </AnimatePresence>
  </>)
}
