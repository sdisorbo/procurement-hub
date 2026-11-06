import { useMemo } from 'react'
import { useData } from './DataContext'
import { buildIndex, describeCondition } from './series'

export function useCategoryData(cat) {
  const { get } = useData()
  return useMemo(() => {
    const commodities = cat.commodities.map((s) => ({ symbol: s, series: get(s) }))
    const basket = cat.basket.map((s) => ({ symbol: s, series: get(s) }))
    const index = buildIndex(basket.map((b) => b.series))
    const condition = describeCondition(
      cat.name,
      cat.commodities,
      commodities.map((c) => c.series),
    )
    return { commodities, basket, index, condition }
  }, [cat, get])
}
