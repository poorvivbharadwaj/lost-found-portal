import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getPossibleMatches, confirmMatch, ignoreMatch } from '../../utils/api';
import { formatDate } from '../../utils/helpers';

const FIELD_LABELS = {
  category: '🏷️ Category',
  description: '📝 Description',
  keywords: '🔑 Keywords',
  date: '📅 Date proximity',
};

function MiniItemCard({ item, type }) {
  const isLost = type === 'lost';
  return (
    <div style={{
      flex: 1, minWidth: 180, padding: 14, borderRadius: 10,
      background: isLost ? 'var(--lost-bg)' : 'var(--found-bg)',
      border: `1px solid ${isLost ? 'rgba(185,28,28,0.2)' : 'rgba(22,101,52,0.2)'}`,
    }}>
      <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`} style={{ marginBottom: 8, display: 'inline-block' }}>
        {isLost ? 'Lost' : 'Found'}
      </span>
      <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
        {isLost ? item.itemName : (item.description?.slice(0, 40) || 'Found item')}
      </p>
      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
        {item.description?.slice(0, 100)}{item.description?.length > 100 ? '…' : ''}
      </p>
      <p style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
        {formatDate(isLost ? item.lostDate : item.foundDate)} · {item.category}
      </p>
    </div>
  );
}

export default function PossibleMatchesPanel({ onActioned }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPossibleMatches('pending');
      setMatches(res.data.matches || []);
    } catch (err) {
      toast.error('Unable to load possible matches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async (id) => {
    setActioningId(id);
    try {
      await confirmMatch(id);
      toast.success('Match confirmed! Both reporters have been notified.');
      setMatches(prev => prev.filter(m => m._id !== id));
      onActioned?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to confirm match.');
    } finally {
      setActioningId(null);
    }
  };

  const handleIgnore = async (id) => {
    setActioningId(id);
    try {
      await ignoreMatch(id);
      toast.success('Match ignored.');
      setMatches(prev => prev.filter(m => m._id !== id));
      onActioned?.();
    } catch (err) {
      toast.error('Unable to ignore match.');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Loading possible matches…</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>🎯</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600 }}>No possible matches right now</p>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
          New candidates appear automatically when lost/found reports are created or approved.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {matches.map(match => (
        <div key={match._id} className="commitment-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-match">Score: {match.score}%</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(match.matchedFields || []).map(f => (
                  <span key={f} style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: 999 }}>
                    {FIELD_LABELS[f] || f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <MiniItemCard item={match.lostItem} type="lost" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-dim)' }}>⇄</div>
            <MiniItemCard item={match.foundItem} type="found" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleConfirm(match._id)}
              disabled={actioningId === match._id}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {actioningId === match._id ? 'Working…' : '✅ Confirm Match'}
            </button>
            <button
              onClick={() => handleIgnore(match._id)}
              disabled={actioningId === match._id}
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              ✕ Ignore
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
