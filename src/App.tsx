import { useState, useCallback, useRef } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────
type SlotKey = 'breakfast' | 'lunch' | 'dinner'
type Tab = 'plan' | 'meals' | 'grocery'

interface Ingredient {
  name: string
  qty: string
  unit: string
  category: 'Produce' | 'Protein' | 'Dairy' | 'Grains' | 'Pantry' | 'Spices'
}

interface Meal {
  id: string
  name: string
  slot: SlotKey
  cuisine: string
  cal: number
  mins: number
  emoji: string
  img: string
  ingredients: Ingredient[]
}

type DayPlan = Record<SlotKey, Meal | null>
type WeekPlan = DayPlan[]

interface Drag {
  meal: Meal
  fromDay: number | null
  fromSlot: SlotKey | null
}

// ─── Data ───────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SLOT: Record<SlotKey, { label: string; time: string; accent: string; soft: string; pill: string }> = {
  breakfast: { label: 'Breakfast', time: '7–9 AM',   accent: '#C47C12', soft: '#FEF3DC', pill: '#F9C96A' },
  lunch:     { label: 'Lunch',     time: '12–2 PM',  accent: '#1E6B3A', soft: '#E6F5EE', pill: '#7DC9A0' },
  dinner:    { label: 'Dinner',    time: '6–8 PM',   accent: '#5B2D9E', soft: '#EDE6FA', pill: '#B49EE8' },
}

const CATEGORY_ORDER = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Spices'] as const
const CATEGORY_ICON: Record<string, string> = {
  Produce: '🥦', Protein: '🥩', Dairy: '🧀', Grains: '🌾', Pantry: '🫙', Spices: '🌶️',
}

const MEALS: Meal[] = [
  {
    id: 'b1', name: 'Avocado Toast', slot: 'breakfast', cuisine: 'Californian', cal: 320, mins: 10, emoji: '🥑',
    img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Sourdough bread', qty: '2', unit: 'slices', category: 'Grains' },
      { name: 'Avocado', qty: '1', unit: 'whole', category: 'Produce' },
      { name: 'Cherry tomatoes', qty: '6', unit: 'pieces', category: 'Produce' },
      { name: 'Lemon', qty: '½', unit: 'whole', category: 'Produce' },
      { name: 'Olive oil', qty: '1', unit: 'tbsp', category: 'Pantry' },
      { name: 'Chili flakes', qty: '1', unit: 'pinch', category: 'Spices' },
    ],
  },
  {
    id: 'b2', name: 'Yogurt Berry Bowl', slot: 'breakfast', cuisine: 'Mediterranean', cal: 280, mins: 5, emoji: '🫐',
    img: 'https://images.unsplash.com/photo-1610441009633-b6ca9c6d4be2?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Greek yogurt', qty: '200', unit: 'g', category: 'Dairy' },
      { name: 'Mixed berries', qty: '100', unit: 'g', category: 'Produce' },
      { name: 'Honey', qty: '1', unit: 'tbsp', category: 'Pantry' },
      { name: 'Granola', qty: '40', unit: 'g', category: 'Grains' },
      { name: 'Chia seeds', qty: '1', unit: 'tsp', category: 'Pantry' },
    ],
  },
  {
    id: 'b3', name: 'Shakshuka', slot: 'breakfast', cuisine: 'Middle Eastern', cal: 410, mins: 25, emoji: '🍳',
    img: 'https://images.unsplash.com/photo-1759216282765-04bcbaf08738?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Eggs', qty: '3', unit: 'large', category: 'Protein' },
      { name: 'Crushed tomatoes', qty: '400', unit: 'g', category: 'Pantry' },
      { name: 'Bell pepper', qty: '1', unit: 'whole', category: 'Produce' },
      { name: 'Onion', qty: '1', unit: 'medium', category: 'Produce' },
      { name: 'Garlic', qty: '3', unit: 'cloves', category: 'Produce' },
      { name: 'Cumin', qty: '1', unit: 'tsp', category: 'Spices' },
      { name: 'Paprika', qty: '1', unit: 'tsp', category: 'Spices' },
    ],
  },
  {
    id: 'b4', name: 'Acai Bowl', slot: 'breakfast', cuisine: 'Brazilian', cal: 360, mins: 8, emoji: '🍇',
    img: 'https://images.unsplash.com/photo-1627308594190-a057cd4bfac8?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Acai packets', qty: '2', unit: 'packs', category: 'Produce' },
      { name: 'Banana', qty: '1', unit: 'whole', category: 'Produce' },
      { name: 'Almond milk', qty: '120', unit: 'ml', category: 'Dairy' },
      { name: 'Strawberries', qty: '80', unit: 'g', category: 'Produce' },
      { name: 'Coconut flakes', qty: '2', unit: 'tbsp', category: 'Pantry' },
    ],
  },
  {
    id: 'l1', name: 'Caesar Salad', slot: 'lunch', cuisine: 'Italian-American', cal: 480, mins: 15, emoji: '🥗',
    img: 'https://images.unsplash.com/photo-1746211108786-ca20c8f80ecd?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Romaine lettuce', qty: '1', unit: 'head', category: 'Produce' },
      { name: 'Parmesan', qty: '40', unit: 'g', category: 'Dairy' },
      { name: 'Croutons', qty: '30', unit: 'g', category: 'Grains' },
      { name: 'Caesar dressing', qty: '3', unit: 'tbsp', category: 'Pantry' },
      { name: 'Lemon', qty: '½', unit: 'whole', category: 'Produce' },
      { name: 'Garlic', qty: '1', unit: 'clove', category: 'Produce' },
    ],
  },
  {
    id: 'l2', name: 'Lentil Soup', slot: 'lunch', cuisine: 'Turkish', cal: 390, mins: 30, emoji: '🍲',
    img: 'https://images.unsplash.com/photo-1605909388460-74ec8b204127?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Red lentils', qty: '200', unit: 'g', category: 'Pantry' },
      { name: 'Onion', qty: '1', unit: 'large', category: 'Produce' },
      { name: 'Carrot', qty: '2', unit: 'medium', category: 'Produce' },
      { name: 'Vegetable stock', qty: '1', unit: 'L', category: 'Pantry' },
      { name: 'Cumin', qty: '2', unit: 'tsp', category: 'Spices' },
      { name: 'Smoked paprika', qty: '1', unit: 'tsp', category: 'Spices' },
    ],
  },
  {
    id: 'l3', name: 'Chicken Banh Mi', slot: 'lunch', cuisine: 'Vietnamese', cal: 520, mins: 20, emoji: '🥖',
    img: 'https://images.unsplash.com/photo-1715925717150-2a6d181d8846?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Baguette roll', qty: '1', unit: 'whole', category: 'Grains' },
      { name: 'Chicken thigh', qty: '200', unit: 'g', category: 'Protein' },
      { name: 'Daikon radish', qty: '100', unit: 'g', category: 'Produce' },
      { name: 'Carrot', qty: '1', unit: 'medium', category: 'Produce' },
      { name: 'Jalapeño', qty: '1', unit: 'whole', category: 'Produce' },
      { name: 'Cilantro', qty: '15', unit: 'g', category: 'Produce' },
      { name: 'Sriracha mayo', qty: '2', unit: 'tbsp', category: 'Pantry' },
    ],
  },
  {
    id: 'l4', name: 'Buddha Bowl', slot: 'lunch', cuisine: 'Fusion', cal: 450, mins: 25, emoji: '🥙',
    img: 'https://images.unsplash.com/photo-1505576633757-0ac1084af824?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Brown rice', qty: '180', unit: 'g', category: 'Grains' },
      { name: 'Chickpeas', qty: '150', unit: 'g', category: 'Protein' },
      { name: 'Sweet potato', qty: '1', unit: 'medium', category: 'Produce' },
      { name: 'Baby spinach', qty: '60', unit: 'g', category: 'Produce' },
      { name: 'Hummus', qty: '3', unit: 'tbsp', category: 'Pantry' },
      { name: 'Tahini', qty: '1', unit: 'tbsp', category: 'Pantry' },
      { name: 'Lemon', qty: '½', unit: 'whole', category: 'Produce' },
    ],
  },
  {
    id: 'd1', name: 'Salmon Teriyaki', slot: 'dinner', cuisine: 'Japanese', cal: 590, mins: 25, emoji: '🐟',
    img: 'https://images.unsplash.com/photo-1691201090878-1b9eab935bdd?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Salmon fillet', qty: '200', unit: 'g', category: 'Protein' },
      { name: 'Soy sauce', qty: '3', unit: 'tbsp', category: 'Pantry' },
      { name: 'Mirin', qty: '2', unit: 'tbsp', category: 'Pantry' },
      { name: 'Brown sugar', qty: '1', unit: 'tbsp', category: 'Pantry' },
      { name: 'Sesame oil', qty: '1', unit: 'tsp', category: 'Pantry' },
      { name: 'Jasmine rice', qty: '160', unit: 'g', category: 'Grains' },
      { name: 'Edamame', qty: '100', unit: 'g', category: 'Produce' },
    ],
  },
  {
    id: 'd2', name: 'Pasta Arrabiata', slot: 'dinner', cuisine: 'Italian', cal: 560, mins: 20, emoji: '🍝',
    img: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Rigatoni', qty: '180', unit: 'g', category: 'Grains' },
      { name: 'San Marzano tomatoes', qty: '400', unit: 'g', category: 'Pantry' },
      { name: 'Garlic', qty: '4', unit: 'cloves', category: 'Produce' },
      { name: 'Olive oil', qty: '2', unit: 'tbsp', category: 'Pantry' },
      { name: 'Fresh basil', qty: '15', unit: 'g', category: 'Produce' },
      { name: 'Parmesan', qty: '30', unit: 'g', category: 'Dairy' },
      { name: 'Chili flakes', qty: '½', unit: 'tsp', category: 'Spices' },
    ],
  },
  {
    id: 'd3', name: 'Tikka Masala', slot: 'dinner', cuisine: 'Indian', cal: 680, mins: 40, emoji: '🍛',
    img: 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Chicken breast', qty: '300', unit: 'g', category: 'Protein' },
      { name: 'Tikka masala paste', qty: '3', unit: 'tbsp', category: 'Pantry' },
      { name: 'Coconut cream', qty: '200', unit: 'ml', category: 'Dairy' },
      { name: 'Crushed tomatoes', qty: '400', unit: 'g', category: 'Pantry' },
      { name: 'Basmati rice', qty: '160', unit: 'g', category: 'Grains' },
      { name: 'Naan bread', qty: '2', unit: 'pieces', category: 'Grains' },
      { name: 'Cilantro', qty: '15', unit: 'g', category: 'Produce' },
    ],
  },
  {
    id: 'd4', name: 'Beef Tacos', slot: 'dinner', cuisine: 'Mexican', cal: 620, mins: 25, emoji: '🌮',
    img: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop&auto=format',
    ingredients: [
      { name: 'Ground beef', qty: '250', unit: 'g', category: 'Protein' },
      { name: 'Corn tortillas', qty: '6', unit: 'pieces', category: 'Grains' },
      { name: 'Onion', qty: '1', unit: 'medium', category: 'Produce' },
      { name: 'Cilantro', qty: '15', unit: 'g', category: 'Produce' },
      { name: 'Lime', qty: '2', unit: 'whole', category: 'Produce' },
      { name: 'Sour cream', qty: '3', unit: 'tbsp', category: 'Dairy' },
      { name: 'Cotija cheese', qty: '40', unit: 'g', category: 'Dairy' },
      { name: 'Cumin', qty: '1', unit: 'tsp', category: 'Spices' },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const emptyWeek = (): WeekPlan =>
  Array.from({ length: 7 }, () => ({ breakfast: null, lunch: null, dinner: null }))

const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1 })()

type GroceryEntry = { qty: string; unit: string; category: string; sources: string[]; count: number }

function buildGrocery(plan: WeekPlan): Map<string, GroceryEntry> {
  const map = new Map<string, GroceryEntry>()
  plan.forEach((day, di) => {
    ;(['breakfast', 'lunch', 'dinner'] as SlotKey[]).forEach(s => {
      const meal = day[s]
      if (!meal) return
      meal.ingredients.forEach(ing => {
        const existing = map.get(ing.name)
        if (existing) {
          existing.count++
          existing.sources.push(`${DAYS[di]} ${SLOT[s].label}`)
        } else {
          map.set(ing.name, { qty: ing.qty, unit: ing.unit, category: ing.category, sources: [`${DAYS[di]} ${SLOT[s].label}`], count: 1 })
        }
      })
    })
  })
  return map
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>('plan')
  const [day, setDay] = useState(todayIdx)
  const [plan, setPlan] = useState<WeekPlan>(() => {
    const w = emptyWeek()
    w[0].breakfast = MEALS[0]; w[0].lunch = MEALS[4]; w[0].dinner = MEALS[8]
    w[1].breakfast = MEALS[1]; w[2].dinner = MEALS[10]; w[3].lunch = MEALS[6]
    return w
  })
  const [drag, setDrag] = useState<Drag | null>(null)
  const [overSlot, setOverSlot] = useState<string | null>(null)
  const [overTrash, setOverTrash] = useState(false)
  const [picker, setPicker] = useState<{ day: number; slot: SlotKey } | null>(null)
  const [pickerFilter, setPickerFilter] = useState<SlotKey | 'all'>('all')
  const [mealFilter, setMealFilter] = useState<SlotKey | 'all'>('all')
  const [detailMeal, setDetailMeal] = useState<Meal | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [qtyEdit, setQtyEdit] = useState<Map<string, string>>(new Map())
  const [catFilter, setCatFilter] = useState<string>('All')

  const openPicker = (day: number, slot: SlotKey) => {
    setPicker({ day, slot })
    setPickerFilter(slot)
  }
  const closePicker = () => setPicker(null)
  const assignMeal = (meal: Meal) => {
    if (!picker) return
    setPlan(prev => {
      const n = prev.map(d => ({ ...d })) as WeekPlan
      n[picker.day][picker.slot] = meal
      return n
    })
    closePicker()
  }

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onDragStart = useCallback((meal: Meal, fromDay: number | null, fromSlot: SlotKey | null) => {
    setDrag({ meal, fromDay, fromSlot })
  }, [])

  const onSlotOver = useCallback((e: React.DragEvent, key: string) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'
    setOverSlot(key); setOverTrash(false)
  }, [])

  const onSlotDrop = useCallback((e: React.DragEvent, toDay: number, toSlot: SlotKey) => {
    e.preventDefault()
    if (!drag) return
    setPlan(prev => {
      const next = prev.map(d => ({ ...d })) as WeekPlan
      const displaced = next[toDay][toSlot]
      next[toDay][toSlot] = drag.meal
      if (drag.fromDay !== null && drag.fromSlot !== null) next[drag.fromDay][drag.fromSlot] = displaced
      return next
    })
    setDrag(null); setOverSlot(null)
  }, [drag])

  const onTrashDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!drag || drag.fromDay === null || drag.fromSlot === null) return
    setPlan(prev => {
      const next = prev.map(d => ({ ...d })) as WeekPlan
      next[drag.fromDay!][drag.fromSlot!] = null
      return next
    })
    setDrag(null); setOverTrash(false); setOverSlot(null)
  }, [drag])

  const onDragEnd = useCallback(() => {
    setDrag(null); setOverSlot(null); setOverTrash(false)
  }, [])

  const clearSlot = (d: number, s: SlotKey) => {
    setPlan(prev => { const n = prev.map(x => ({ ...x })) as WeekPlan; n[d][s] = null; return n })
  }

  // ── Grocery ───────────────────────────────────────────────────────────────
  const grocery = buildGrocery(plan)
  const groceryList = [...grocery.entries()]
  const filtered = catFilter === 'All' ? groceryList : groceryList.filter(([, v]) => v.category === catFilter)
  const checkedCount = [...grocery.keys()].filter(k => checked.has(k)).length
  const totalCount = grocery.size

  const activeCategories = ['All', ...CATEGORY_ORDER.filter(c => groceryList.some(([, v]) => v.category === c))]

  const totalMeals = plan.reduce((a, d) => a + (['breakfast','lunch','dinner'] as SlotKey[]).filter(s => d[s]).length, 0)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1A2E10 0%, #0D1A08 100%)', padding: '20px 0' }}>
      <div style={{
        width: 390, height: 852,
        background: '#F8F6F1',
        borderRadius: 50,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 60px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
      }}>

        {/* ── Status bar ── */}
        <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', background: '#F8F6F1', flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2E10', letterSpacing: '-0.2px' }}>9:41</span>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {[4,3,3,2].map((h, i) => <div key={i} style={{ width: 3.5, height: 8 + h * 2, background: '#1A2E10', borderRadius: 1, opacity: i < 3 ? 1 : 0.3 }} />)}
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none" style={{ marginLeft: 3 }}><path d="M7.5 2C9.8 2 11.9 3 13.4 4.6L15 3C13.1 1.1 10.4 0 7.5 0S1.9 1.1 0 3l1.6 1.6C3.1 3 5.2 2 7.5 2z" fill="#1A2E10"/><path d="M7.5 5c1.5 0 2.9.6 3.9 1.6L13 5c-1.4-1.5-3.4-2.5-5.5-2.5S2.4 3.5 1 5l1.6 1.6C3.6 5.6 5 5 7.5 5z" fill="#1A2E10"/><circle cx="7.5" cy="9.5" r="1.5" fill="#1A2E10"/></svg>
            <div style={{ width: 24, height: 12, border: '1.5px solid rgba(26,46,16,0.5)', borderRadius: 3, padding: '1.5px', marginLeft: 2 }}>
              <div style={{ width: '80%', height: '100%', background: '#1A2E10', borderRadius: 1.5 }} />
            </div>
          </div>
        </div>

        {/* ── Header ── */}
        <div style={{ padding: '4px 26px 16px', background: '#F8F6F1', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#9E9A94', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <h1 style={{ margin: '3px 0 0', fontFamily: "'Fraunces', Georgia, serif", fontSize: 30, fontWeight: 700, color: '#1A2E10', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {tab === 'plan' ? 'Week Planner' : tab === 'meals' ? 'Meal Library' : 'Grocery List'}
              </h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: '#1A2E10', lineHeight: 1 }}>{totalMeals}</div>
              <div style={{ fontSize: 10, color: '#9E9A94', fontWeight: 500, letterSpacing: '0.04em' }}>MEALS PLANNED</div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* ════════ PLAN TAB ════════ */}
          {tab === 'plan' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Day strip */}
              <div style={{ display: 'flex', padding: '0 20px 12px', gap: 4, flexShrink: 0 }}>
                {DAYS.map((d, i) => {
                  const count = (['breakfast','lunch','dinner'] as SlotKey[]).filter(s => plan[i][s]).length
                  const sel = i === day
                  const isToday = i === todayIdx
                  return (
                    <button key={d} onClick={() => setDay(i)} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      padding: '8px 0 6px', border: 'none', cursor: 'pointer', borderRadius: 14,
                      background: sel ? '#1A2E10' : isToday ? 'rgba(26,46,16,0.07)' : 'transparent',
                      transition: 'background 0.15s',
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: sel ? 'rgba(255,255,255,0.6)' : '#9E9A94' }}>{d}</span>
                      <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: sel ? '#FFFFFF' : '#1A2E10', lineHeight: 1 }}>{i + 1}</span>
                      <div style={{ width: 16, height: 4, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                        {count > 0 && Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                          <div key={j} style={{ width: 4, height: 4, borderRadius: 2, background: sel ? 'rgba(255,255,255,0.55)' : '#8BC49E' }} />
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Day label row */}
              <div style={{ padding: '0 24px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: '#1A2E10' }}>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][day]}
                </span>
                {/* Trash zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setOverTrash(true) }}
                  onDragLeave={() => setOverTrash(false)}
                  onDrop={onTrashDrop}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: overTrash ? '#FEE4DC' : drag ? '#F5EDE8' : '#EDEAE4',
                    border: `1.5px ${drag ? 'dashed' : 'solid'} ${overTrash ? '#D96040' : '#DDD8D0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    transition: 'all 0.15s', transform: overTrash ? 'scale(1.08)' : 'scale(1)',
                    cursor: drag ? 'copy' : 'default',
                  }}
                >
                  {overTrash ? '🔥' : '🗑️'}
                </div>
              </div>

              {/* Meal slots */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
                {(['breakfast','lunch','dinner'] as SlotKey[]).map(s => {
                  const cfg = SLOT[s]
                  const meal = plan[day][s]
                  const key = `${day}-${s}`
                  const isOver = overSlot === key
                  const isSrc = drag?.meal.id === meal?.id && drag?.fromDay === day && drag?.fromSlot === s

                  return (
                    <div
                      key={s}
                      onDragOver={e => onSlotOver(e, key)}
                      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverSlot(null) }}
                      onDrop={e => onSlotDrop(e, day, s)}
                      style={{
                        marginBottom: 12, borderRadius: 20,
                        border: `1.5px solid ${isOver ? cfg.accent : '#E6E2DA'}`,
                        background: isOver ? cfg.soft : '#FFFFFF',
                        transition: 'all 0.15s',
                        boxShadow: isOver ? `0 0 0 4px ${cfg.soft}` : '0 1px 8px rgba(0,0,0,0.04)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Slot header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ background: cfg.soft, borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                            {s === 'breakfast' ? '☀️' : s === 'lunch' ? '🌿' : '🌙'}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: cfg.accent, letterSpacing: '0.02em' }}>{cfg.label}</div>
                            <div style={{ fontSize: 10, color: '#B0AB9E', marginTop: 1 }}>{cfg.time}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {meal && (
                            <button onClick={() => clearSlot(day, s)} style={{
                              width: 26, height: 26, borderRadius: 13, background: '#F5F2EC',
                              border: 'none', cursor: 'pointer', color: '#B0AB9E', fontSize: 15, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>×</button>
                          )}
                          <button
                            onClick={() => meal ? openPicker(day, s) : openPicker(day, s)}
                            style={{
                              height: 26, padding: '0 10px', borderRadius: 13,
                              background: meal ? '#F5F2EC' : cfg.accent,
                              border: 'none', cursor: 'pointer',
                              color: meal ? cfg.accent : '#FFFFFF',
                              fontSize: 11, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 3,
                            }}
                          >
                            {meal ? '↻ swap' : '+ add'}
                          </button>
                        </div>
                      </div>

                      {/* Meal card or empty state */}
                      {meal ? (
                        <div
                          draggable
                          onDragStart={() => onDragStart(meal, day, s)}
                          onDragEnd={onDragEnd}
                          style={{
                            margin: '0 10px 10px', borderRadius: 14, overflow: 'hidden',
                            display: 'flex', cursor: 'grab', opacity: isSrc ? 0.25 : 1,
                            background: '#F8F6F1', border: '1px solid #EAE6DE',
                            transition: 'opacity 0.15s',
                          }}
                        >
                          <img
                            src={meal.img} alt={meal.name}
                            style={{ width: 90, height: 90, objectFit: 'cover', flexShrink: 0, background: cfg.soft }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          <div style={{ padding: '11px 12px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: '#1A2E10', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meal.name}</div>
                            <div style={{ fontSize: 11, color: '#9E9A94', marginTop: 3 }}>{meal.cuisine}</div>
                            <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                              <span style={{ fontSize: 10, background: cfg.soft, color: cfg.accent, borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>🔥 {meal.cal} kcal</span>
                              <span style={{ fontSize: 10, background: '#F0EDE8', color: '#5A5650', borderRadius: 6, padding: '2px 8px', fontWeight: 500 }}>⏱ {meal.mins}m</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: '#D4CFC8', fontSize: 13, cursor: 'grab' }}>⠿</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openPicker(day, s)}
                          style={{
                            margin: '0 10px 10px', borderRadius: 12, height: 52, width: 'calc(100% - 20px)',
                            border: `1.5px dashed ${isOver ? cfg.accent : '#DDD8D0'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            background: isOver ? cfg.soft : 'transparent', cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ width: 22, height: 22, borderRadius: 11, background: isOver ? cfg.accent : '#EAE6DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 13, color: isOver ? '#FFF' : '#9E9A94', lineHeight: 1 }}>+</span>
                          </div>
                          <span style={{ fontSize: 12, color: isOver ? cfg.accent : '#9E9A94', fontWeight: 500 }}>
                            {isOver ? `Drop here` : `Add ${cfg.label.toLowerCase()}`}
                          </span>
                        </button>
                      )}
                    </div>
                  )
                })}

                {/* Drag-to-swap hint */}
                {plan[day].breakfast || plan[day].lunch || plan[day].dinner ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '4px 0 2px' }}>
                    <div onDragOver={e => { e.preventDefault(); setOverTrash(true) }} onDragLeave={() => setOverTrash(false)} onDrop={onTrashDrop}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: `1.5px dashed ${overTrash ? '#D96040' : '#DDD8D0'}`, background: overTrash ? '#FEE4DC' : 'transparent', transition: 'all 0.15s', cursor: 'default' }}>
                      <span style={{ fontSize: 14 }}>{overTrash ? '🔥' : '🗑️'}</span>
                      <span style={{ fontSize: 11, color: overTrash ? '#D96040' : '#B0AB9E', fontWeight: 500 }}>Drag a meal here to remove</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* ── Meal Picker Sheet ── */}
          {picker && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {/* Backdrop */}
              <div onClick={closePicker} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,6,0.45)', backdropFilter: 'blur(2px)' }} />

              {/* Sheet */}
              <div style={{ position: 'relative', background: '#FFFFFF', borderRadius: '28px 28px 0 0', maxHeight: '75%', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)' }}>
                {/* Handle + header */}
                <div style={{ padding: '12px 20px 10px', flexShrink: 0 }}>
                  <div style={{ width: 36, height: 4, background: '#E0DDD6', borderRadius: 2, margin: '0 auto 14px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#9E9A94', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][picker.day]}
                      </div>
                      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: '#1A2E10', margin: '2px 0 0' }}>
                        Choose {SLOT[picker.slot].label}
                      </h3>
                    </div>
                    <button onClick={closePicker} style={{ width: 32, height: 32, borderRadius: 16, background: '#F5F2EC', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9E9A94', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>

                  {/* Filter chips */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }}>
                    {(['all','breakfast','lunch','dinner'] as const).map(f => (
                      <button key={f} onClick={() => setPickerFilter(f)} style={{
                        flexShrink: 0, padding: '5px 13px', borderRadius: 20,
                        border: `1.5px solid ${pickerFilter === f ? '#1A2E10' : '#E6E2DA'}`,
                        background: pickerFilter === f ? '#1A2E10' : 'transparent',
                        color: pickerFilter === f ? '#FFFFFF' : '#5A5650',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}>
                        {f === 'all' ? 'All' : SLOT[f].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meal list */}
                <div style={{ overflowY: 'auto', padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(pickerFilter === 'all' ? MEALS : MEALS.filter(m => m.slot === pickerFilter)).map(m => {
                    const cfg = SLOT[m.slot]
                    const isActive = plan[picker.day][picker.slot]?.id === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => assignMeal(m)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 0, borderRadius: 16, overflow: 'hidden',
                          background: isActive ? cfg.soft : '#F8F6F1',
                          border: `1.5px solid ${isActive ? cfg.accent : '#EAE6DE'}`,
                          cursor: 'pointer', textAlign: 'left', padding: 0,
                          boxShadow: isActive ? `0 0 0 2px ${cfg.soft}` : 'none',
                          transition: 'all 0.12s',
                        }}
                      >
                        <img
                          src={m.img} alt={m.name}
                          style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0, background: cfg.soft }}
                          onError={e => { (e.target as HTMLImageElement).style.background = cfg.soft }}
                        />
                        <div style={{ padding: '10px 14px', flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: cfg.accent, letterSpacing: '0.05em', textTransform: 'uppercase', background: cfg.soft, borderRadius: 5, padding: '1px 6px' }}>{cfg.label}</span>
                            {isActive && <span style={{ fontSize: 9, fontWeight: 700, color: cfg.accent }}>✓ Selected</span>}
                          </div>
                          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: '#1A2E10', lineHeight: 1.2 }}>{m.name}</div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 5, alignItems: 'center' }}>
                            <span style={{ fontSize: 10, color: '#9E9A94' }}>{m.cuisine}</span>
                            <span style={{ fontSize: 10, color: '#9E9A94' }}>·</span>
                            <span style={{ fontSize: 10, color: '#9E9A94' }}>🔥 {m.cal} kcal</span>
                            <span style={{ fontSize: 10, color: '#9E9A94' }}>·</span>
                            <span style={{ fontSize: 10, color: '#9E9A94' }}>⏱ {m.mins}m</span>
                          </div>
                        </div>
                        <div style={{ padding: '0 14px', color: isActive ? cfg.accent : '#D4CFC8', fontSize: 16, fontWeight: 700 }}>
                          {isActive ? '✓' : '›'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════════ MEALS TAB ════════ */}
          {tab === 'meals' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 16px' }}>
              {/* Filter row */}
              <div style={{ display: 'flex', gap: 6, padding: '0 20px 14px', overflowX: 'auto' }}>
                {(['all','breakfast','lunch','dinner'] as const).map(f => (
                  <button key={f} onClick={() => setMealFilter(f)} style={{
                    flexShrink: 0, padding: '6px 14px', borderRadius: 20,
                    border: `1.5px solid ${mealFilter === f ? '#1A2E10' : '#E6E2DA'}`,
                    background: mealFilter === f ? '#1A2E10' : '#FFFFFF',
                    color: mealFilter === f ? '#FFFFFF' : '#5A5650',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    {f === 'all' ? '✦ All meals' : SLOT[f].label}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(mealFilter === 'all' ? MEALS : MEALS.filter(m => m.slot === mealFilter)).map(m => {
                  const cfg = SLOT[m.slot]
                  const isInPlan = plan.some(d => Object.values(d).some(v => v?.id === m.id))
                  return (
                    <button
                      key={m.id}
                      onClick={() => setDetailMeal(m)}
                      style={{
                        borderRadius: 18, overflow: 'hidden', background: '#FFFFFF',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer',
                        border: isInPlan ? `1.5px solid ${cfg.accent}` : '1.5px solid #F0EDE6',
                        textAlign: 'left', padding: 0, transition: 'transform 0.1s, box-shadow 0.1s',
                      }}
                    >
                      <div style={{ position: 'relative', height: 120 }}>
                        <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: cfg.soft }} onError={e => { (e.target as HTMLImageElement).style.background = cfg.soft }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 55%)' }} />
                        <div style={{ position: 'absolute', top: 8, left: 8, background: cfg.soft, borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: cfg.accent }}>{cfg.label}</div>
                        {isInPlan && (
                          <div style={{ position: 'absolute', top: 8, right: 8, background: cfg.accent, borderRadius: 8, padding: '2px 7px', fontSize: 9, fontWeight: 700, color: '#FFF' }}>✓ Planned</div>
                        )}
                        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 24, height: 24, borderRadius: 12, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 11, color: '#1A2E10', fontWeight: 700 }}>›</span>
                        </div>
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: '#1A2E10', lineHeight: 1.2 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#9E9A94', marginTop: 2 }}>{m.cuisine}</div>
                        <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                          <span style={{ fontSize: 10, background: cfg.soft, color: cfg.accent, borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>🔥 {m.cal}</span>
                          <span style={{ fontSize: 10, background: '#F0EDE8', color: '#5A5650', borderRadius: 6, padding: '2px 8px', fontWeight: 500 }}>⏱ {m.mins}m</span>
                        </div>
                        <div style={{ marginTop: 9, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {m.ingredients.slice(0, 3).map((ing, i) => (
                            <span key={i} style={{ fontSize: 10, color: '#6A6660', background: '#F5F2EC', borderRadius: 6, padding: '2px 7px', lineHeight: 1.4 }}>{ing.name}</span>
                          ))}
                          {m.ingredients.length > 3 && (
                            <span style={{ fontSize: 10, color: '#9E9A94', padding: '2px 4px', lineHeight: 1.4 }}>+{m.ingredients.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Meal Detail Sheet ── */}
          {detailMeal && (() => {
            const m = detailMeal
            const cfg = SLOT[m.slot]
            return (
              <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {/* Backdrop */}
                <div onClick={() => setDetailMeal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,6,0.5)', backdropFilter: 'blur(3px)' }} />

                {/* Sheet */}
                <div style={{ position: 'relative', background: '#FFFFFF', borderRadius: '30px 30px 0 0', maxHeight: '88%', display: 'flex', flexDirection: 'column', boxShadow: '0 -12px 48px rgba(0,0,0,0.2)' }}>

                  {/* Hero image */}
                  <div style={{ position: 'relative', height: 200, flexShrink: 0, borderRadius: '30px 30px 0 0', overflow: 'hidden' }}>
                    <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', background: cfg.soft }} onError={e => { (e.target as HTMLImageElement).style.background = cfg.soft }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

                    {/* Close button */}
                    <button onClick={() => setDetailMeal(null)} style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 17, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', color: '#FFFFFF', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>×</button>

                    {/* Meal type badge */}
                    <div style={{ position: 'absolute', top: 14, left: 14, background: cfg.soft, borderRadius: 10, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: cfg.accent }}>{cfg.label} · {cfg.time}</div>

                    {/* Title on image */}
                    <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18 }}>
                      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: 1.1 }}>{m.name}</h2>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '4px 0 0' }}>{m.cuisine}</p>
                    </div>
                  </div>

                  {/* Scrollable body */}
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 0, margin: '16px 18px 0', borderRadius: 16, overflow: 'hidden', border: '1px solid #EAE6DE' }}>
                      {[
                        { icon: '🔥', label: 'Calories', value: `${m.cal} kcal` },
                        { icon: '⏱', label: 'Cook time', value: `${m.mins} min` },
                        { icon: '🥄', label: 'Ingredients', value: `${m.ingredients.length} items` },
                      ].map((s, i) => (
                        <div key={i} style={{ flex: 1, padding: '12px 8px', background: i % 2 === 0 ? '#F8F6F1' : '#FFFFFF', borderLeft: i > 0 ? '1px solid #EAE6DE' : 'none', textAlign: 'center' }}>
                          <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
                          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: '#1A2E10' }}>{s.value}</div>
                          <div style={{ fontSize: 10, color: '#9E9A94', marginTop: 1, fontWeight: 500 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Ingredients */}
                    <div style={{ padding: '18px 18px 0' }}>
                      <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: '#1A2E10', margin: '0 0 10px' }}>Ingredients</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {m.ingredients.map((ing, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#F8F6F1', borderRadius: 12, border: '1px solid #EAE6DE' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 6, height: 6, borderRadius: 3, background: cfg.accent, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#1A2E10' }}>{ing.name}</span>
                            </div>
                            <span style={{ fontSize: 12, color: '#9E9A94', fontFamily: "'DM Mono', monospace" }}>{ing.qty} {ing.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add to plan section */}
                    <div style={{ padding: '18px 18px 0' }}>
                      <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: '#1A2E10', margin: '0 0 10px' }}>Add to plan</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
                        {DAYS.map((d, i) => {
                          const slotFull = plan[i][m.slot] !== null
                          const hasMeal = plan[i][m.slot]?.id === m.id
                          return (
                            <button key={i} onClick={() => {
                              if (hasMeal) clearSlot(i, m.slot)
                              else setPlan(prev => { const n = prev.map(x => ({ ...x })) as WeekPlan; n[i][m.slot] = m; return n })
                            }} style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                              padding: '8px 0', borderRadius: 12,
                              background: hasMeal ? cfg.accent : slotFull ? '#F5F2EC' : cfg.soft,
                              border: `1.5px solid ${hasMeal ? cfg.accent : slotFull ? '#E6E2DA' : cfg.pill}`,
                              cursor: 'pointer',
                            }}>
                              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', color: hasMeal ? 'rgba(255,255,255,0.7)' : '#9E9A94', textTransform: 'uppercase' }}>{d}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: hasMeal ? '#FFFFFF' : slotFull ? '#C0BAB0' : cfg.accent }}>{hasMeal ? '✓' : slotFull ? '·' : '+'}</span>
                            </button>
                          )
                        })}
                      </div>
                      <p style={{ fontSize: 11, color: '#B0AB9E', margin: '8px 0 0', textAlign: 'center' }}>
                        Adds to <strong style={{ color: cfg.accent }}>{cfg.label}</strong> slot · tap again to remove
                      </p>
                    </div>

                    <div style={{ height: 28 }} />
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ════════ GROCERY TAB ════════ */}
          {tab === 'grocery' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {grocery.size === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>🛒</div>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: '#1A2E10', margin: '0 0 8px' }}>Your list is empty</h3>
                  <p style={{ fontSize: 13, color: '#9E9A94', margin: '0 0 20px', lineHeight: 1.6 }}>Plan meals and your grocery list builds itself automatically.</p>
                  <button onClick={() => setTab('plan')} style={{ padding: '10px 24px', background: '#1A2E10', color: '#FFF', border: 'none', borderRadius: 24, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Go to Planner</button>
                </div>
              ) : (
                <>
                  {/* Progress banner */}
                  <div style={{ padding: '0 20px 18px' }}>
                    <div style={{ borderRadius: 20, overflow: 'hidden', background: '#1A2E10', padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
                            {checkedCount === totalCount && totalCount > 0 ? "All done! 🎉" : `${totalCount - checkedCount} left to grab`}
                          </div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{checkedCount} of {totalCount} items ticked off</div>
                        </div>
                        {checkedCount > 0 && (
                          <button onClick={() => setChecked(new Set())} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 10, cursor: 'pointer' }}>
                            Clear
                          </button>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#8BC49E', borderRadius: 3, width: `${(checkedCount / Math.max(totalCount, 1)) * 100}%`, transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Category sections */}
                  <div style={{ padding: '0 20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {CATEGORY_ORDER.map(cat => {
                      const items = groceryList.filter(([, v]) => v.category === cat)
                      if (items.length === 0) return null
                      const allDone = items.every(([name]) => checked.has(name))
                      return (
                        <div key={cat}>
                          {/* Category header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: allDone ? '#E8E4DE' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                              {CATEGORY_ICON[cat]}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: allDone ? '#B0AB9E' : '#1A2E10', letterSpacing: '-0.1px' }}>{cat}</span>
                            <span style={{ fontSize: 11, color: '#B0AB9E', fontWeight: 500 }}>
                              {items.filter(([n]) => checked.has(n)).length}/{items.length}
                            </span>
                          </div>

                          {/* Item rows — seamless card */}
                          <div style={{ background: '#FFFFFF', borderRadius: 18, overflow: 'hidden', border: '1px solid #EAE6DE' }}>
                            {items.map(([name, data], idx) => {
                              const done = checked.has(name)
                              const qty = qtyEdit.get(name) ?? data.qty
                              return (
                                <div
                                  key={name}
                                  onClick={() => setChecked(p => { const n = new Set(p); n.has(name) ? n.delete(name) : n.add(name); return n })}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '13px 16px',
                                    borderTop: idx > 0 ? '1px solid #F2EEE8' : 'none',
                                    background: done ? '#FAFAF7' : '#FFFFFF',
                                    cursor: 'pointer', transition: 'background 0.12s',
                                  }}
                                >
                                  {/* Circle checkbox */}
                                  <div style={{
                                    width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                                    background: done ? '#1A2E10' : 'transparent',
                                    border: `2px solid ${done ? '#1A2E10' : '#D4D0C8'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.18s',
                                  }}>
                                    {done && (
                                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                        <path d="M1 4l3.5 3L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>

                                  {/* Name */}
                                  <span style={{
                                    flex: 1, fontSize: 14, fontWeight: 500,
                                    color: done ? '#B8B4AE' : '#1A2E10',
                                    textDecorationLine: done ? 'line-through' : 'none',
                                    textDecorationColor: '#C8C4BC',
                                    transition: 'color 0.12s',
                                  }}>{name}</span>

                                  {/* Qty pill — tappable to edit */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }} onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', alignItems: 'center', background: done ? 'transparent' : '#F5F2EC', borderRadius: 8, padding: '3px 8px', border: `1px solid ${done ? 'transparent' : '#E6E2DA'}` }}>
                                      <input
                                        value={qty}
                                        onChange={e => setQtyEdit(p => new Map(p).set(name, e.target.value))}
                                        style={{
                                          width: 28, textAlign: 'right', fontSize: 12, fontWeight: 700,
                                          color: done ? '#C0BAB0' : '#1A2E10',
                                          background: 'transparent', border: 'none', outline: 'none',
                                          fontFamily: "'DM Mono', monospace", padding: 0,
                                        }}
                                      />
                                      <span style={{ fontSize: 11, color: done ? '#C0BAB0' : '#6A6660', marginLeft: 2, fontFamily: "'DM Mono', monospace" }}>{data.unit}</span>
                                    </div>
                                    {data.count > 1 && (
                                      <div style={{ width: 18, height: 18, borderRadius: 9, background: '#E6F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: '#1E6B3A' }}>{data.count}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom nav ── */}
        <div style={{
          height: 72, flexShrink: 0, background: '#FFFFFF',
          borderTop: '1px solid #EAE6DE',
          display: 'flex', alignItems: 'center',
          padding: '0 8px 8px',
        }}>
          {([
            { id: 'plan', label: 'Planner', icon: (active: boolean) => (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="4" width="18" height="16" rx="3" stroke={active ? '#1A2E10' : '#B0AB9E'} strokeWidth="1.8"/>
                <path d="M2 8h18" stroke={active ? '#1A2E10' : '#B0AB9E'} strokeWidth="1.8"/>
                <path d="M7 2v3M15 2v3" stroke={active ? '#1A2E10' : '#B0AB9E'} strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="6" y="12" width="3" height="3" rx="1" fill={active ? '#1A2E10' : '#B0AB9E'}/>
                <rect x="11" y="12" width="3" height="3" rx="1" fill={active ? '#1A2E10' : '#B0AB9E'}/>
              </svg>
            )},
            { id: 'meals', label: 'Meals', icon: (active: boolean) => (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8" stroke={active ? '#1A2E10' : '#B0AB9E'} strokeWidth="1.8"/>
                <circle cx="11" cy="11" r="4" stroke={active ? '#1A2E10' : '#B0AB9E'} strokeWidth="1.8"/>
                <circle cx="11" cy="11" r="1.5" fill={active ? '#1A2E10' : '#B0AB9E'}/>
              </svg>
            )},
            { id: 'grocery', label: 'Grocery', icon: (active: boolean) => (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 3h2l2.5 10h9l2-7H7.5" stroke={active ? '#1A2E10' : '#B0AB9E'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="18" r="1.5" fill={active ? '#1A2E10' : '#B0AB9E'}/>
                <circle cx="15" cy="18" r="1.5" fill={active ? '#1A2E10' : '#B0AB9E'}/>
              </svg>
            )},
          ] as const).map(({ id, label, icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer',
              }}>
                <div style={{
                  width: 44, height: 30, borderRadius: 15,
                  background: active ? 'rgba(26,46,16,0.08)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}>
                  {icon(active)}
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? '#1A2E10' : '#B0AB9E', letterSpacing: '0.02em' }}>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Home indicator */}
        <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', flexShrink: 0 }}>
          <div style={{ width: 100, height: 4, background: '#1A2E10', borderRadius: 2, opacity: 0.18 }} />
        </div>
      </div>
    </div>
  )
}
