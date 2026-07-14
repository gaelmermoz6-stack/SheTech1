import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParcoursList, useParcoursDetail } from '../hooks/useParcours';

const ACCENT = '#C45C7A';
const BG = '#F9F0F3';

export default function FormationsPage() {
  const navigate = useNavigate();
  const [selectedParcoursId, setSelectedParcoursId] = useState(null);
  const { data: parcours, isLoading } = useParcoursList();
  const { data: selectedParcours } = useParcoursDetail(selectedParcoursId);

  if (isLoading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Chargement des parcours...</div>;
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Titre principal */}
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a0f14', marginBottom: '32px' }}>
          🎓 Parcours d'apprentissage
        </h1>

        {/* Grille des parcours */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {parcours?.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedParcoursId(p.id)}
              style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '24px',
                border: selectedParcoursId === p.id ? `2px solid ${ACCENT}` : '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedParcoursId === p.id
                  ? '0 4px 12px rgba(196, 92, 122, 0.2)'
                  : '0 1px 3px rgba(0,0,0,0.05)',
                transform: selectedParcoursId === p.id ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <div style={{ marginBottom: '16px', fontSize: '28px' }}>🚀</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a0f14', marginBottom: '8px' }}>
                {p.titre}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5, margin: 0 }}>
                {p.description}
              </p>
              <div style={{ fontSize: '12px', color: ACCENT, fontWeight: 600, marginTop: '12px' }}>
                {p.formations?.length || 0} formation{p.formations?.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Détail du parcours sélectionné */}
        {selectedParcours && (
          <div style={{ background: '#fff', borderRadius: '8px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a0f14', marginBottom: '8px' }}>
                {selectedParcours.titre}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {selectedParcours.description}
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

            {/* Formations du parcours */}
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a0f14', marginBottom: '20px' }}>
              📚 Formations du parcours
            </h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {selectedParcours.formations?.map(formation => (
                <FormationCard key={formation.id} formation={formation} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormationCard({ formation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden',
    }}>
      <div
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderBottom: expanded ? '1px solid #e5e7eb' : 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1a0f14', margin: 0, marginBottom: '4px' }}>
            {formation.titre}
          </h4>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            {formation.modules?.length || 0} module{formation.modules?.length !== 1 ? 's' : ''} • Niveau: {formation.niveau}
          </p>
        </div>
        <span style={{ fontSize: '18px', color: ACCENT }}>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '16px', background: '#fff' }}>
          {formation.modules?.map(module => (
            <ModuleCard key={module.id} module={module} formationId={formation.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({ module, formationId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      marginBottom: '12px',
      background: module.couleur || '#C45C7A',
      borderRadius: '4px',
      overflow: 'hidden',
      color: '#fff',
    }}>
      <div
        style={{
          padding: '12px 14px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h5 style={{ fontSize: '13px', fontWeight: 700, margin: 0, marginBottom: '2px' }}>
            {module.icone || '📚'} {module.titre}
          </h5>
          <p style={{ fontSize: '11px', margin: 0, opacity: 0.9 }}>
            {module.cours?.length || 0} cours
          </p>
        </div>
        <span style={{ fontSize: '14px' }}>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.05)' }}>
          {module.cours?.map(cours => (
            <CoursCard key={cours.id} cours={cours} module={module} formationId={formationId} />
          ))}
        </div>
      )}
    </div>
  );
}

function CoursCard({ cours, module, formationId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      marginBottom: '8px',
      background: 'rgba(255,255,255,0.9)',
      color: '#1a0f14',
      borderRadius: '3px',
      overflow: 'hidden',
    }}>
      <div
        style={{
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>
            {cours.titre}
          </p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
            {cours.lecons?.length || 0} leçon{cours.lecons?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <span style={{ fontSize: '12px' }}>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.6)' }}>
          {cours.lecons?.map(lecon => (
            <LeconCard key={lecon.id} lecon={lecon} cours={cours} module={module} formationId={formationId} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeconCard({ lecon, cours, module, formationId }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        navigate(`/dashboard/formations/${formationId}/modules/${module.id}/cours/${cours.id}/lecons/${lecon.id}`);
      }}
      style={{
        padding: '8px 10px',
        marginBottom: '6px',
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '2px',
        cursor: 'pointer',
        fontSize: '11px',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#f3f4f6';
        e.currentTarget.style.borderColor = ACCENT;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#fff';
        e.currentTarget.style.borderColor = '#d1d5db';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 500, color: '#1a0f14', marginBottom: '2px' }}>
            📄 {lecon.titre}
          </p>
          <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>
            {lecon.type} • {lecon.dureeMinutes}min
          </p>
        </div>
        <span style={{ color: '#9ca3af', marginLeft: '8px' }}>→</span>
      </div>
    </div>
  );
}
