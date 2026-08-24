import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Button } from '../components/ui'
import { Mandala } from '../components/ui/Icons'

const NotFoundPage = ({ language, setLanguage }) => {
  const hi = language === 'hindi'

  return (
    <>
      <Header language={language} setLanguage={setLanguage} />
      <main>
        <section className="notfound">
          <Mandala className="notfound__mandala" aria-hidden="true" />
          <div className="notfound__inner">
            <p className="notfound__code">404</p>
            <h1 className="notfound__title">
              {hi ? 'पृष्ठ नहीं मिला' : 'Page not found'}
            </h1>
            <p className="notfound__body">
              {hi
                ? 'जिस पृष्ठ की आप तलाश कर रहे हैं वह हट चुका है या उसका पता बदल गया है।'
                : 'The page you are looking for has moved or no longer exists.'}
            </p>
            <Button to="/" size="lg">{hi ? 'होम पर लौटें' : 'Back to home'}</Button>
          </div>
        </section>
      </main>
      <Footer language={language} />
    </>
  )
}

export default NotFoundPage
