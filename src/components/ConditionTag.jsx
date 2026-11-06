export default function ConditionTag({ tag, level }) {
  return (
    <span className={`cond cond-${level}`}>
      <span className="cond-bars" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i < level ? 'on' : ''} />
        ))}
      </span>
      {tag}
    </span>
  )
}
