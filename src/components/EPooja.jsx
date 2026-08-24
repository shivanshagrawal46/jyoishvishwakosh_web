import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchPoojas } from '../services/api'
import ProductRail from './ProductRail'
import { EmptyState, SectionHeader, Skeleton } from './ui'
import { IconPin } from './ui/Icons'

const imageUrlOf = (path) =>
  path ? (path.startsWith('http') ? path : `https://jyotishvishwakosh.in${path}`) : null

const CardSkeleton = () => (
  <article className="u-card pcard" aria-hidden="true">
    <Skeleton w="82px" h="82px" r="50%" />
    <Skeleton w="82%" h="14px" />
    <Skeleton w="56%" h="11px" />
    <div className="pcard__foot"><Skeleton w="118px" h="31px" r="999px" /></div>
  </article>
)

const EPooja = ({ language }) => {
  const hi = language === 'hindi'
  const navigate = useNavigate()
  const [poojas, setPoojas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchPoojas(1)
      .then((result) => {
        if (cancelled) return
        const list = (result?.poojas || []).filter((p) => p.is_last_day === true)
        setPoojas(list)
      })
      .catch(() => { if (!cancelled) setPoojas([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (!loading && poojas.length === 0) return null

  return (
    <section id="epooja" className="u-section u-section--tight u-section--warm">
      <div className="u-shell">
        <SectionHeader
          language={language}
          eyebrow={hi ? 'ई-पूजा' : 'E-Pooja'}
          title={hi ? 'आपके नाम से, मंदिर में पूजा' : 'Pooja in your name, at the temple'}
          subtitle={hi
            ? 'पंडित जी आपके संकल्प के साथ पूजा करेंगे — वीडियो और प्रसाद घर तक।'
            : 'A pandit performs the ritual in your name — video and prasad delivered to you.'}
          linkTo="/e-pooja"
          linkLabel={hi ? 'सभी पूजा' : 'All poojas'}
        />

        <ProductRail label={hi ? 'ई-पूजा सेवाएं' : 'E-pooja services'}>
          {loading
            ? Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)
            : poojas.map((pooja) => {
              const img = imageUrlOf(pooja.image_url)
              return (
                <article key={pooja._id} className="u-card u-card--hover pcard">
                  <Link to={`/e-pooja/${pooja.slug}`} className="pcard__medallion">
                    {img
                      ? <img src={img} alt="" loading="lazy" decoding="async" />
                      : <span className="pcard__ph" aria-hidden="true" />}
                  </Link>

                  <h3 className="pcard__title">
                    <Link to={`/e-pooja/${pooja.slug}`}>{pooja.title}</Link>
                  </h3>

                  {pooja.temple_location && (
                    <p className="pcard__meta">
                      <IconPin s={12} /><span>{pooja.temple_location}</span>
                    </p>
                  )}

                  <div className="pcard__foot">
                    {pooja.price !== undefined && (
                      pooja.price === 0
                        ? <span className="pcard__free">{hi ? 'निःशुल्क' : 'Free'}</span>
                        : <span className="pcard__price tnum">₹{pooja.price.toLocaleString('en-IN')}</span>
                    )}
                    <button
                      type="button"
                      className="u-btn u-btn--primary u-btn--sm"
                      onClick={() => navigate('/order', {
                        state: { category: 'pooja', productName: pooja.title, totalAmount: pooja.price },
                      })}
                    >
                      {hi ? 'बुक करें' : 'Book'}
                    </button>
                  </div>
                </article>
              )
            })}
        </ProductRail>

        {!loading && poojas.length === 0 && (
          <EmptyState
            title={hi ? 'अभी कोई पूजा नहीं' : 'No poojas right now'}
            body={hi ? 'जल्द ही नई पूजा सेवाएं जोड़ी जाएंगी।' : 'New pooja services are added regularly.'}
          />
        )}
      </div>
    </section>
  )
}

export default EPooja
