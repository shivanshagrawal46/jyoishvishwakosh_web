import React from 'react'
import { Button } from './ui'
import { IconPhone, IconWhatsapp } from './ui/Icons'
import { CONTACT } from '../data/site'

/** Mobile-only sticky bar: call and WhatsApp are always one thumb-reach away. */
const ConsultBar = ({ language }) => {
  const hi = language === 'hindi'

  return (
    <>
      <div className="consultbar-spacer" aria-hidden="true" />
      <div className="consultbar">
        <Button variant="ghost" href={`tel:${CONTACT.phone}`}>
          <IconPhone s={16} />
          {hi ? 'कॉल करें' : 'Call now'}
        </Button>
        <Button href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
          <IconWhatsapp s={16} />
          {hi ? 'ज्योतिषी से बात करें' : 'Talk to astrologer'}
        </Button>
      </div>
    </>
  )
}

export default ConsultBar
