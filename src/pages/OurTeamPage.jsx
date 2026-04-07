import React, { useEffect, useState } from 'react';
import { apiUrl } from '../lib/api';

function OurTeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      try {
        setLoading(true);
        const response = await fetch(apiUrl('/api/team'));
        if (!response.ok) {
          throw new Error('Failed to load team.');
        }

        const data = await response.json();
        if (!cancelled) {
          setMembers(Array.isArray(data.members) ? data.members : []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTeam();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="our-team-page">
      <div className="our-team-shell">
        {loading ? (
          <div className="our-team-state">Loading team members...</div>
        ) : error ? (
          <div className="our-team-state error">{error}</div>
        ) : members.length === 0 ? (
          <div className="our-team-state">No team members have been added yet.</div>
        ) : (
          <div className="our-team-grid our-team-grid-minimal">
            {members.map((member) => (
              <article key={member.id || member.slug || member.name} className="our-team-avatar-card" aria-label={`${member.name} - ${member.role}`}>
                <div className="our-team-avatar-frame">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="our-team-avatar-photo"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="our-team-avatar-placeholder">
                      <i className="fas fa-user" />
                    </div>
                  )}
                </div>
                <div className="our-team-avatar-copy">
                  <h2>{member.name}</h2>
                  <p>{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default OurTeamPage;
