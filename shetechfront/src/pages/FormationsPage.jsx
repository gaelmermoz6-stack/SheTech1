import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormations, useFormationDetail } from '../hooks/useFormations';

const ACCENT = '#C45C7A';
const BG = '#F9F0F3';

export default function FormationsPage() {
  const navigate = useNavigate();
  const [selectedFormationId, setSelectedFormationId] = useState(null);
  const { data: formations, isLoading } = useFormations();
  const { data: selectedFormation } = useFormationDetail(selectedFormationId);

  if (isLoading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Chargement des formations...</div>;
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a0f14', marginBottom: '24px' }}>
          📚 Formations
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {formations?.map(formation => (
            <div
              key={formation.id}
              onClick={() => setSelectedFormationId(formation.id)}
              style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '20px',
                border: selectedFormationId === formation.id ? `2px solid ${ACCENT}` : '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedFormationId === formation.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => {
                if (selectedFormationId !== formation.id) {
                  e.currentTarget.style.borderColor = ACCENT;
                }
              }}
              onMouseLeave={e => {
                if (selectedFormationId !== formation.id) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a0f14', marginBottom: '8px' }}>
                {formation.titre}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5 }}>
                {formation.description.substring(0, 100)}...
              </p>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                Niveau: <span style={{ fontWeight: 600, color: '#374151' }}>{formation.niveau}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Détail de la formation sélectionnée */}
        {selectedFormation && (
          <div style={{ marginTop: '40px', background: '#fff', borderRadius: '8px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a0f14', marginBottom: '8px' }}>
              {selectedFormation.titre}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>
              {selectedFormation.description}
            </p>

            {/* Modules */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a0f14', marginBottom: '16px' }}>
                📖 Modules ({selectedFormation.modules?.length || 0})
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {selectedFormation.modules?.map(module => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleCard({ module }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: module.couleur || '#C45C7A',
          color: '#fff',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '4px' }}>
            {module.icone || '📚'} {module.titre}
          </h4>
          <p style={{ fontSize: '12px', margin: 0, opacity: 0.9 }}>
            {module.cours?.length || 0} cours
          </p>
        </div>
        <span style={{ fontSize: '18px' }}>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '16px', background: '#fff' }}>
          {module.cours?.map(cours => (
            <CoursCard key={cours.id} cours={cours} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}

function CoursCard({ cours, module }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
      <div
        style={{
          padding: '12px',
          cursor: 'pointer',
          background: '#f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, marginBottom: '2px' }}>
            {cours.titre}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            {cours.lecons?.length || 0} leçons
          </p>
        </div>
        <span style={{ fontSize: '14px' }}>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '12px', background: '#fff' }}>
          {cours.lecons?.map(lecon => (
            <LeconCard key={lecon.id} lecon={lecon} cours={cours} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeconCard({ lecon, cours, module }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        // À adapter selon ta structure de route
        navigate(`/dashboard/formations/${module.formationId}/modules/${module.id}/cours/${cours.id}/lecons/${lecon.id}`);
      }}
      style={{
        padding: '10px 12px',
        marginBottom: '8px',
        background: '#fafbfc',
        border: '1px solid #e5e7eb',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#f3f4f6';
        e.currentTarget.style.borderColor = '#C45C7A';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#fafbfc';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontWeight: 500, color: '#1a0f14' }}>
            📄 {lecon.titre}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
            {lecon.type} • {lecon.dureeMinutes}min
          </p>
        </div>
        <span style={{ color: '#9ca3af' }}>→</span>
      </div>
    </div>
  );
}
