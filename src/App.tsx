import {
  ArrowLeftRight,
  BarChart3,
  BellRing,
  Bot,
  BriefcaseBusiness,
  Coins,
  CreditCard,
  Landmark,
  Repeat2,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const fintechTypes = [
  { label: ['Digital', 'Wallets'], Icon: Wallet },
  { label: ['Peer-to-Peer', 'Payments'], Icon: ArrowLeftRight },
  { label: ['Insurance', 'Apps'], Icon: ShieldCheck },
  { label: ['P2P', 'Lending'], Icon: Landmark },
  { label: ['Digital', 'Banking'], Icon: CreditCard },
  { label: ['Personal', 'Finance'], Icon: Coins },
  { label: ['Trading', 'Platforms'], Icon: TrendingUp },
  { label: ['Investment', 'Apps'], Icon: BriefcaseBusiness },
  { label: ['Crypto', 'Wallets'], Icon: Repeat2 },
  { label: ['Banking', 'Solutions'], Icon: BarChart3 },
];

const features = [
  { title: 'Real-time push notifications', className: 'card-top-left' },
  { title: 'Customer support chatbots', className: 'card-top-right' },
  { title: 'Secure authentication and authorization', className: 'card-mid-left' },
  { title: 'Integration with payment methods and banks', className: 'card-mid-right' },
  { title: 'Financial dashboards and analytics', className: 'card-bottom-left' },
  { title: 'Automation and Machine Learning', className: 'card-bottom-right' },
];

export default function App() {
  return (
    <div className="nexora-shell">
      <section className="fintech-types-section">
        <h1 className="section-title">Popular Types of Fintech Apps</h1>

        <div className="types-grid">
          {fintechTypes.map(({ label, Icon }) => (
            <div key={label.join('-')} className="type-card">
              <div className="type-icon-wrap">
                <Icon size={58} strokeWidth={2.3} />
              </div>

              <div className="type-copy">
                {label.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <h2 className="section-title feature-title">Must-Have Features for Fintech Apps</h2>

        <div className="feature-map">
          <div className="map-center" aria-label="center icon">
            <div className="center-core">
              <div className="gear-ring">
                <div className="gear-nucleus">
                  <div className="gear-outer" />
                  <div className="gear-inner" />
                  <div className="gear-dollar" aria-hidden="true">
                    <span>$</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {features.map(({ title, className }) => (
            <div key={title} className={`feature-card ${className}`}>
              <span className="feature-text">{title}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="bottom-logo">HKTech</div>
    </div>
  );
}
