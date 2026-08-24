import React from 'react'
import { Chip, SectionHeader } from './ui'
import { IconCalculator } from './ui/Icons'
import { CALC_TOOLS } from '../data/site'

const CalculationSection = ({ language }) => {
  const hi = language === 'hindi'

  return (
    <section id="calculations" className="u-section u-section--tight">
      <div className="u-shell">
        <SectionHeader
          language={language}
          eyebrow={hi ? 'गणना उपकरण' : 'Calculators'}
          title={hi ? 'अपनी संख्याएं जानें' : 'Know your numbers'}
          subtitle={hi
            ? 'मूलांक, भाग्यांक, राशि और दशा — जन्म विवरण से तुरंत गणना।'
            : 'Mulank, bhagyank, rashi and dasha — computed instantly from your birth details.'}
        />

        <div className="calc-strip">
          {CALC_TOOLS.map((tool) => (
            <Chip key={tool.id} to={tool.path} icon={<IconCalculator s={16} />}>
              {hi ? tool.nameHi : tool.name}
              {tool.badge && <span className="u-badge">{tool.badge}</span>}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CalculationSection
