import Icon from './Icon';
import Reveal from './Reveal';
import { whyCards } from '../data/content';
import { useApp } from '../context/AppContext';

export default function WhyChoose() {
  const { t } = useApp();

  return (
    <section className="section section--soft" id="why-choose">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <span className="eyebrow">{t('Why Choose GoldenGlow')}</span>
          <h2 className="h2">{t('Why Choose GoldenGlow')}</h2>
          <p className="sub">{t('Built around clarity, industry focus and responsible hiring.')}</p>
        </Reveal>

        <div className="why-grid">
          {whyCards.map((card, i) => (
            <Reveal className="why-card" key={card.title.en} delay={i * 60}>
              <span className="why-card__icon">
                <Icon name={card.icon} size={21} />
              </span>
              <h3>{t(card.title)}</h3>
              <p>{t(card.text)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
