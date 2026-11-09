import { useMemo } from 'react'
import { useData } from './DataContext'
import { buildIndex, describeCondition } from './series'
import { driverName } from '../data/symbols'

// Everything a category page or card needs, built from whatever series have loaded.
export function computeCategory(cat, get) {
  const commodities = cat.commodities.map((s) => ({ symbol: s, series: get(s) }))
  const basket = cat.basket.map((s) => ({ symbol: s, series: get(s) }))
  const index = buildIndex(basket.map((b) => b.series))
  const driverKeys = cat.drivers || cat.commodities
  let drivers = driverKeys.map((k) => ({ label: driverName(k), series: get(k) }))
  let kind = 'prices'
  if (!driverKeys.length || !drivers.some((d) => d.series)) {
    // No price drivers for this category, so fall back to the supplier index.
    drivers = index ? [{ label: `${cat.name} supplier index`, series: index }] : []
    kind = 'stocks'
  }
  const condition = describeCondition(cat.name, drivers, { kind })
  return { commodities, basket, index, condition }
}

export function useCategoryData(cat) {
  const { get } = useData()
  return useMemo(() => computeCategory(cat, get), [cat, get])
}
