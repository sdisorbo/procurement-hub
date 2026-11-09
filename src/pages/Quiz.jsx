import { useMemo, useState } from 'react'
import { QUESTIONS, ADVICE } from '../data/quiz'
import { CATEGORIES } from '../data/categories'
import { SYMBOLS } from '../data/symbols'
import { useData } from '../lib/DataContext'
import { describeCondition, pctChange } from '../lib/series'

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Turns a question into a shuffled one with the right index tracked.
const prep = (q) => {
  const order = shuffle(q.options.map((text, i) => ({ text, ok: i === q.answer })))
  return { ...q, options: order.map((o) => o.text), answer: order.findIndex((o) => o.ok) }
}

function conditionQuestions(get) {
  const rows = CATEGORIES.map((c) => {
    const drivers = c.commodities.map((s) => ({ s, ser: get(s) })).filter((d) => d.ser)
    const cond = describeCondition(c.name, drivers.map((d) => d.s), drivers.map((d) => d.ser))
    return { c, cond, drivers }
  }).filter((r) => r.cond)

  const out = []

  // 1. Strategy for the current tag of a random category
  const pick = shuffle(rows).slice(0, 2)
  pick.forEach(({ c, cond }) => {
    const bucket = cond.level >= 3 ? 'up' : cond.level === 2 ? 'flat' : 'down'
    const adv = ADVICE[bucket]
    out.push(
      prep({
        topic: 'Current conditions',
        q: `${c.name} currently reads as "${cond.tag}". Its price drivers moved ${cond.avg3 >= 0 ? '+' : ''}${cond.avg3.toFixed(1)}% over three months. What is the strongest opening move?`,
        options: [adv.right, ...adv.wrong],
        answer: 0,
        why: adv.why,
      }),
    )
  })

  // 2. Which category moved the most
  const sorted = [...rows].sort((a, b) => Math.abs(b.cond.avg3) - Math.abs(a.cond.avg3))
  const top = sorted[0]
  const others = shuffle(sorted.slice(3)).slice(0, 3)
  if (top && others.length === 3) {
    out.push(
      prep({
        topic: 'Current conditions',
        q: 'Which category has the biggest three month move in its price drivers right now, up or down?',
        options: [top.c.name, ...others.map((o) => o.c.name)],
        answer: 0,
        why: `${top.c.name} moved ${top.cond.avg3 >= 0 ? '+' : ''}${top.cond.avg3.toFixed(1)}% on average across ${top.c.commodities.map((s) => SYMBOLS[s].name).join(', ')}.`,
      }),
    )
  }

  // 3. Direction of a single commodity
  const single = shuffle(rows.flatMap((r) => r.drivers))[0]
  if (single) {
    const ch = pctChange(single.ser, 63)
    out.push(
      prep({
        topic: 'Current conditions',
        q: `Over the last three months, ${SYMBOLS[single.s].name} is...`,
        options: ['Up more than 3%', 'Roughly flat (within 3%)', 'Down more than 3%', 'Not enough data to say'].slice(0, 3),
        answer: ch > 3 ? 0 : ch < -3 ? 2 : 1,
        why: `It moved ${ch >= 0 ? '+' : ''}${ch.toFixed(1)}% over about 63 trading days.`,
      }),
    )
  }
  return out
}

const buildRound = (get, size = 10) => {
  const dyn = conditionQuestions(get)
  const stat = shuffle(QUESTIONS).slice(0, Math.max(0, size - dyn.length)).map(prep)
  return shuffle([...stat, ...dyn])
}

const loadBest = () => {
  try {
    return Number(localStorage.getItem('proc-quiz-best')) || 0
  } catch {
    return 0
  }
}
const saveBest = (n) => {
  try {
    localStorage.setItem('proc-quiz-best', String(n))
  } catch {
    /* storage unavailable */
  }
}

export default function Quiz() {
  const { get, status } = useData()
  const [round, setRound] = useState(null)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [answers, setAnswers] = useState([])
  const [best, setBest] = useState(loadBest)

  const start = () => {
    setRound(buildRound(get))
    setI(0)
    setPicked(null)
    setAnswers([])
  }

  const done = round && i >= round.length
  const score = answers.filter(Boolean).length
  const q = round && !done ? round[i] : null

  const choose = (idx) => {
    if (picked != null) return
    setPicked(idx)
    setAnswers((a) => [...a, idx === q.answer])
  }

  const next = () => {
    const nextI = i + 1
    if (nextI >= round.length) {
      const final = answers.filter(Boolean).length
      if (final > best) {
        setBest(final)
        saveBest(final)
      }
    }
    setI(nextI)
    setPicked(null)
  }

  const streak = useMemo(() => {
    let s = 0
    for (let k = answers.length - 1; k >= 0 && answers[k]; k--) s++
    return s
  }, [answers])

  if (!round) {
    return (
      <div className="page">
        <h1>Quiz</h1>
        <p className="lede">Ten scenario questions on sourcing strategy and tactics, plus a few on what the markets are doing right now.</p>
        <div className="quiz-card">
          <p>Best score: <strong>{best}/10</strong></p>
          {status === 'none' && <p className="note">Prices are unavailable right now, so the questions about current markets will be skipped.</p>}
          <button className="btn" onClick={start}>Start a round</button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="page">
        <h1>Round complete</h1>
        <div className="quiz-card">
          <div className="score">{score}<span>/{round.length}</span></div>
          <p className="muted">Best: {Math.max(best, score)}/10</p>
          <button className="btn" onClick={start}>Another round</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="quiz-top">
        <span className="muted">Question {i + 1} of {round.length}</span>
        <span className="muted">Score {score} · Streak {streak}</span>
      </div>
      <div className="bar"><i style={{ width: `${(i / round.length) * 100}%` }} /></div>
      <div className="quiz-card">
        <span className="topic">{q.topic}</span>
        <h2 className="quiz-q">{q.q}</h2>
        <div className="opts">
          {q.options.map((o, idx) => {
            let cls = 'opt'
            if (picked != null) {
              if (idx === q.answer) cls += ' right'
              else if (idx === picked) cls += ' wrong'
              else cls += ' dim'
            }
            return (
              <button key={idx} className={cls} onClick={() => choose(idx)} disabled={picked != null}>
                <span className="letter">{String.fromCharCode(65 + idx)}</span>
                {o}
              </button>
            )
          })}
        </div>
        {picked != null && (
          <div className="why">
            <strong>{picked === q.answer ? 'Correct.' : 'Not quite.'}</strong> {q.why}
            <div>
              <button className="btn" onClick={next}>{i + 1 === round.length ? 'See score' : 'Next'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
