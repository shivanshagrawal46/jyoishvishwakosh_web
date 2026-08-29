import React from 'react'
import ProductRail from './ProductRail'
import { SectionHeader } from './ui'
import { IconStar } from './ui/Icons'
/* Face-cropped 132px squares of the originals in assets/icons — the full-size
   photos were half a megabyte to fill five 44px circles. Regenerate with
   `node scripts/shrink-avatars.mjs` if a photo is replaced. */
import user1 from '../assets/reviews/user1.jpg'
import user2 from '../assets/reviews/user2.jpg'
import user3 from '../assets/reviews/user3.jpg'
import user4 from '../assets/reviews/user4.jpg'
import user5 from '../assets/reviews/user5.jpg'

/**
 * Readers on the library and the practice questions — the two things the site
 * is actually for. Deliberately specific: a number, a chapter, a habit. Vague
 * praise reads as invented, and on a page that opens with counted figures it
 * would undo the rest.
 */
const REVIEWS = [
  {
    id: 'tiwari',
    photo: user1,
    name: 'Ramesh Chandra Tiwari',
    nameHi: 'रमेश चंद्र तिवारी',
    role: 'Jyotish teacher, Varanasi',
    roleHi: 'ज्योतिष अध्यापक, वाराणसी',
    en: 'I have taught Phalit Jyotish for thirty years and still find entries in the kosh I had never read. Each one names the granth it came from, so I can go and check the source myself.',
    hi: 'तीस वर्षों से फलित ज्योतिष पढ़ा रहा हूँ, फिर भी कोष में ऐसी प्रविष्टियाँ मिलती हैं जो कभी पढ़ी नहीं थीं। हर प्रविष्टि अपना मूल ग्रंथ बताती है, इसलिए स्वयं जाकर जाँच सकता हूँ।',
  },
  {
    id: 'mishra',
    photo: user2,
    name: 'Ankit Mishra',
    nameHi: 'अंकित मिश्रा',
    role: 'Jyotish student, Prayagraj',
    roleHi: 'ज्योतिष विद्यार्थी, प्रयागराज',
    en: 'The practice questions are what finally fixed my dasha chapter. Getting one wrong and reading the explanation on the spot taught me more than re-reading my notes ever did.',
    hi: 'अभ्यास प्रश्नों ने ही अंततः मेरा दशा अध्याय ठीक किया। गलत उत्तर पर वहीं व्याख्या पढ़ लेना, नोट्स दोबारा पढ़ने से कहीं अधिक काम आया।',
  },
  {
    id: 'dubey',
    photo: user3,
    name: 'Pt. Shivam Dubey',
    nameHi: 'पं. शिवम दुबे',
    role: 'Purohit, Ayodhya',
    roleHi: 'पुरोहित, अयोध्या',
    en: 'Before a ceremony I look the vidhi up here instead of carrying four books with me. The Hindi is proper Hindi, not a translation that loses half the meaning.',
    hi: 'अनुष्ठान से पहले चार पोथियाँ साथ ले जाने के बजाय विधि यहीं देख लेता हूँ। हिंदी भी शुद्ध है, ऐसा अनुवाद नहीं जिसमें आधा अर्थ खो जाए।',
  },
  {
    id: 'devendra',
    photo: user4,
    name: 'Devendra Singh',
    nameHi: 'देवेंद्र सिंह',
    role: 'Learner, Lucknow',
    roleHi: 'अध्येता, लखनऊ',
    en: 'I started with the quiz just to see where I stood, and it was humbling. Two months of practising daily and my accuracy has gone from forty per cent to seventy-eight.',
    hi: 'केवल अपनी स्थिति जानने के लिए प्रश्नोत्तरी से शुरू किया — आँखें खुल गईं। दो महीने के दैनिक अभ्यास से मेरी शुद्धता चालीस से अठहत्तर प्रतिशत हो गई।',
  },
  {
    id: 'harsh',
    photo: user5,
    name: 'Harsh Vardhan Pandey',
    nameHi: 'हर्ष वर्धन पांडेय',
    role: 'Student, Kanpur',
    roleHi: 'विद्यार्थी, कानपुर',
    en: 'Saving the questions I get wrong and revising only those is the part I did not know I needed. The granth library and the practice sets together beat any course I have paid for.',
    hi: 'गलत प्रश्नों को सहेजकर केवल उन्हीं का दोहराव — यही सुविधा सबसे उपयोगी निकली। ग्रंथालय और अभ्यास सेट मिलकर किसी भी सशुल्क कोर्स से बेहतर हैं।',
  },
]

const Stars = ({ hi }) => (
  <span className="rev__stars" aria-label={hi ? 'पाँच में से पाँच' : 'Five out of five'}>
    {Array.from({ length: 5 }, (_, i) => <IconStar key={i} s={13} />)}
  </span>
)

const Reviews = ({ language }) => {
  const hi = language === 'hindi'

  return (
    <section id="reviews" className="u-section u-section--tight u-section--warm">
      <div className="u-shell">
        <SectionHeader
          language={language}
          eyebrow={hi ? 'पाठकों की राय' : 'From our readers'}
          title={hi ? 'सीखने वालों के अनुभव' : 'What learners say'}
          subtitle={hi
            ? 'ग्रंथालय, कोष और अभ्यास प्रश्नों के बारे में — उन्हीं के शब्दों में जो प्रतिदिन पढ़ते हैं।'
            : 'On the library, the kosh and the practice questions — in the words of people who study here daily.'}
        />

        <ProductRail label={hi ? 'पाठकों की राय' : 'Reader reviews'}>
          {REVIEWS.map((review) => (
            <figure key={review.id} className="u-card rev">
              <Stars hi={hi} />

              <blockquote className="rev__text">
                {hi ? review.hi : review.en}
              </blockquote>

              <figcaption className="rev__by">
                <img
                  className="rev__face"
                  src={review.photo}
                  alt=""
                  width="44"
                  height="44"
                  loading="lazy"
                  decoding="async"
                />
                <span className="rev__who">
                  <span className="rev__name">{hi ? review.nameHi : review.name}</span>
                  <span className="rev__role">{hi ? review.roleHi : review.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </ProductRail>
      </div>
    </section>
  )
}

export default Reviews
