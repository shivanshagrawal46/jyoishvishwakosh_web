import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAstroShopCategories } from '../services/api'
import ProductRail from './ProductRail'
import { SectionHeader, Skeleton } from './ui'
import { IconGem } from './ui/Icons'

const imageUrlOf = (path) =>
  path ? (path.startsWith('http') ? path : `https://jyotishvishwakosh.in${path}`) : null

const CardSkeleton = () => (
  <div className="catcard" aria-hidden="true">
    <Skeleton w="76px" h="76px" r="50%" />
    <Skeleton w="72%" h="14px" />
  </div>
)

const AstroShop = ({ language }) => {
  const hi = language === 'hindi'
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAstroShopCategories()
      .then((result) => { if (!cancelled) setCategories(result || []) })
      .catch(() => { if (!cancelled) setCategories([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (!loading && categories.length === 0) return null

  return (
    <section id="astroshop" className="u-section u-section--tight u-section--warm">
      <div className="u-shell">
        <SectionHeader
          language={language}
          eyebrow={hi ? 'एस्ट्रो शॉप' : 'Astro Shop'}
          title={hi ? 'शुद्ध रत्न, रुद्राक्ष और यंत्र' : 'Authentic gemstones, rudraksha and yantra'}
          subtitle={hi
            ? 'ज्योतिषीय परामर्श के अनुसार चुने गए, प्रमाणित और अभिमंत्रित।'
            : 'Chosen to match your chart — certified and energised before dispatch.'}
          linkTo="/astroshop"
          linkLabel={hi ? 'पूरी दुकान' : 'Browse shop'}
        />

        <ProductRail label={hi ? 'शॉप श्रेणियां' : 'Shop categories'}>
          {loading
            ? Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} />)
            : categories.map((category) => {
              const img = imageUrlOf(category.image)
              return (
                <Link key={category._id} to="/astroshop" className="catcard">
                  <span className="catcard__medallion">
                    {img
                      ? <img src={img} alt="" loading="lazy" decoding="async" />
                      : <IconGem s={30} />}
                  </span>
                  <span className="catcard__name">{category.name}</span>
                </Link>
              )
            })}
        </ProductRail>
      </div>
    </section>
  )
}

export default AstroShop
