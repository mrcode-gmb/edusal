import type { FC } from 'react';

export const ProfessionalAlignment: FC = () => {
  const professionalDisciplines = [
    {
      discipline: 'Computing & IT',
      focus: 'Software engineering, cybersecurity, data systems & cloud architecture',
      alignment: 'Industry skill rubrics mapped to global and regional technology standards',
    },
    {
      discipline: 'Engineering & Built Environment',
      focus: 'Mechanical, electrical, civil & agricultural engineering',
      alignment: 'Workshop and laboratory milestone verification aligned with practical competencies',
    },
    {
      discipline: 'Accounting & Financial Sciences',
      focus: 'Audit, financial management, taxation & enterprise ERP systems',
      alignment: 'Structured skill validations mapped to chartered accounting pathways',
    },
    {
      discipline: 'Management & Administrative Sciences',
      focus: 'Business administration, HR analytics, marketing & project delivery',
      alignment: 'Evidence-backed leadership rubrics and operational case studies',
    },
  ];

  return (
    <section className="standards-section">
      <div className="container-custom">
        <div className="standards-card">
          <div className="standards-header">
            <span className="standards-eyebrow">Professional Ecosystem Alignment</span>
            <h2 className="standards-title">Standards you can trust</h2>
            <p className="standards-lead">
              Nexus Edutech Consult Ltd's pathway and skill-validation framework is being developed in consultation with Nigerian professional and chartered bodies. Formal partnership charters will be published as agreements are finalized.
            </p>
          </div>

          <div className="disciplines-grid">
            {professionalDisciplines.map((item, idx) => (
              <div key={idx} className="discipline-item">
                <div className="discipline-header">
                  <span className="discipline-dot"></span>
                  <h4 className="discipline-name">{item.discipline}</h4>
                </div>
                <p className="discipline-focus">{item.focus}</p>
                <div className="discipline-alignment-box">
                  <span className="align-icon">✦</span>
                  <span className="align-text">{item.alignment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
