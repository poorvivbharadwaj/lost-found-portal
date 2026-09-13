import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PossibleMatchesPanel from '../components/admin/PossibleMatchesPanel';
import ChangeCredentialsModal from '../components/admin/ChangeCredentialsModal';
import OfficeSettingsModal from '../components/admin/OfficeSettingsModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Sidebar from '../components/layout/Sidebar';
import { CATEGORIES } from '../utils/helpers';
import {
  getDashboardStats,
  getAdminLostItems,
  getAdminFoundItems,
  approveLostItem,
  approveFoundItem,
  deleteAdminLostItem,
  deleteAdminFoundItem,
  rejectLostItem,
  rejectFoundItem,
  updateAdminLostItem,
  updateAdminFoundItem,
  archiveAdminLostItem,
  archiveAdminFoundItem,
} from '../utils/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('lost');
  const [activeTab, setActiveTab] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirmState, setConfirmState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [officeSettingsOpen, setOfficeSettingsOpen] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [lostPage, setLostPage] = useState(1);
  const [foundPage, setFoundPage] = useState(1);
  const [lostTotalPages, setLostTotalPages] = useState(1);
  const [foundTotalPages, setFoundTotalPages] = useState(1);
  const [lostTotal, setLostTotal] = useState(0);
  const [foundTotal, setFoundTotal] = useState(0);
  const PAGE_SIZE = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const baseParams = activeTab !== 'all' ? { status: activeTab } : {};
      if (searchQuery.trim()) baseParams.q = searchQuery.trim();
      baseParams.sort = sortOrder;

      const [statsRes, lostRes, foundRes] = await Promise.all([
        getDashboardStats(),
        getAdminLostItems({ ...baseParams, page: lostPage, limit: PAGE_SIZE }),
        getAdminFoundItems({ ...baseParams, page: foundPage, limit: PAGE_SIZE }),
      ]);
      setStats(statsRes.data.stats);
      setLostItems(lostRes.data.items || []);
      setFoundItems(foundRes.data.items || []);
      setLostTotalPages(lostRes.data.totalPages || 1);
      setFoundTotalPages(foundRes.data.totalPages || 1);
      setLostTotal(lostRes.data.total || 0);
      setFoundTotal(foundRes.data.total || 0);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, sortOrder, lostPage, foundPage]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadData();
  }, [loadData, navigate]);

  useEffect(() => {
    setLostPage(1);
    setFoundPage(1);
  }, [activeTab, searchQuery, sortOrder]);

  const openEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      ...item,
      lostDate: item.lostDate ? new Date(item.lostDate).toISOString().slice(0, 10) : '',
      foundDate: item.foundDate ? new Date(item.foundDate).toISOString().slice(0, 10) : '',
    });
  };

  const closeEdit = () => {
    setEditingItem(null);
    setEditForm({});
    setEditImageFile(null);
  };

  const handleEditChange = (key, value) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = (value, label) => {
    if (!value) return;
    navigator.clipboard?.writeText(value)
      .then(() => toast.success(`${label} copied`))
      .catch(() => toast.error('Copy failed, please copy manually'));
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const fields = {};
      if (activeType === 'lost') {
        fields.itemName = editForm.itemName;
        fields.description = editForm.description;
        fields.category = editForm.category;
        fields.lastSeenLocation = editForm.lastSeenLocation || '';
        fields.email = editForm.email;
        fields.phone = editForm.phone;
        if (editForm.lostDate) fields.lostDate = editForm.lostDate;
      } else {
        fields.finderName = editForm.finderName;
        fields.description = editForm.description;
        fields.category = editForm.category;
        fields.foundLocation = editForm.foundLocation || '';
        fields.contactEmail = editForm.contactEmail;
        fields.contactPhone = editForm.contactPhone;
        if (editForm.foundDate) fields.foundDate = editForm.foundDate;
      }

      // If a new image was chosen, send multipart/form-data so the backend can
      // upload it to Cloudinary; otherwise send a plain JSON payload as before.
      let payload = fields;
      if (editImageFile) {
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined) formData.append(key, value);
        });
        formData.append('image', editImageFile);
        payload = formData;
      }

      if (activeType === 'lost') {
        await updateAdminLostItem(editingItem._id, payload);
      } else {
        await updateAdminFoundItem(editingItem._id, payload);
      }
      toast.success('Item updated successfully');
      closeEdit();
      loadData();
    } catch (err) {
      toast.error('Failed to save changes');
    }
  };

  const handleArchive = async (id, type) => {
    try {
      if (type === 'lost') await archiveAdminLostItem(id);
      else await archiveAdminFoundItem(id);
      toast.success('Item archived from public view');
      loadData();
    } catch (err) {
      toast.error('Failed to archive item');
    }
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === 'lost') await approveLostItem(id);
      else await approveFoundItem(id);
      toast.success('Approved!');
      loadData();
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id, type) => {
    try {
      if (type === 'lost') await rejectLostItem(id);
      else await rejectFoundItem(id);
      toast.success('Rejected!');
      loadData();
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  const handleDelete = (id, type) => {
    setConfirmState({
      title: 'Permanently delete this item?',
      message: 'This will remove the report and its image forever. This action cannot be undone.',
      danger: true,
      confirmLabel: 'Delete Permanently',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
          if (type === 'lost') await deleteAdminLostItem(id);
          else await deleteAdminFoundItem(id);
          toast.success('Deleted!');
          loadData();
        } catch (err) {
          toast.error('Failed to delete');
        } finally {
          setConfirmState(null);
        }
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const items = activeType === 'lost' ? lostItems : foundItems;

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'var(--bg-base)',
      paddingBottom: 60,
      fontFamily: "'Inter', sans-serif",
    },
    navbar: {
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-bright)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      rowGap: 10,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    navTitle: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 800,
      fontSize: 18,
      color: 'var(--text-primary)',
    },
    navRight: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    },
    logoutBtn: {
      padding: '7px 16px',
      borderRadius: 8,
      background: 'rgba(239,68,68,0.1)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.25)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
    },
    archiveBtn: {
      padding: '7px 16px',
      borderRadius: 8,
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid var(--border-bright)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
    },
    settingsBtn: {
      padding: '7px 16px',
      borderRadius: 8,
      background: 'var(--gold-bg)',
      color: 'var(--accent)',
      border: '1px solid var(--border-bright)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    },
    backBtn: {
      padding: '7px 16px',
      borderRadius: 8,
      background: 'var(--gold-bg)',
      color: 'var(--accent)',
      border: '1px solid var(--border-bright)',
      fontSize: 13,
      textDecoration: 'none',
      display: 'inline-block',
    },
    content: {
      maxWidth: 1000,
      margin: '0 auto',
      padding: '24px 20px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 14,
      marginBottom: 28,
    },
    statCard: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-bright)',
      borderRadius: 14,
      padding: '16px 20px',
      textAlign: 'center',
    },
    tabBar: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-bright)',
      borderRadius: 14,
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    itemCard: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-bright)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 12,
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
    },
    actionBtn: (color) => ({
      padding: '6px 14px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      marginRight: 6,
      marginTop: 6,
      background: color === 'green'
        ? 'var(--found-bg)'
        : color === 'red'
        ? 'rgba(239,68,68,0.15)'
        : color === 'blue'
        ? 'rgba(59,130,246,0.15)'
        : 'var(--lost-bg)',
      color: color === 'green'
        ? 'var(--found)'
        : color === 'red'
        ? '#f87171'
        : color === 'blue'
        ? '#60a5fa'
        : 'var(--lost)',
    }),
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 12,
    color: 'var(--text-primary)',
    padding: '12px 14px',
    fontSize: 14,
    outline: 'none',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 110,
    resize: 'vertical',
  };

  return (
    <div style={styles.page}>

      <div style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
          >
            ☰
          </button>
          <img className="logo-hover" src="/logos/lf-logo-circle.png" alt="SNPSU" style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 7, flexShrink: 0 }} />
          <span style={styles.navTitle}>Admin Dashboard</span>
        </div>
        <div style={styles.navRight}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            👤 {admin ? admin.username : 'Admin'}
          </span>
          <button style={styles.archiveBtn} onClick={() => navigate('/admin/archive')}>
            Archive
          </button>
          <button
            style={styles.settingsBtn}
            onClick={() => setSettingsOpen(true)}
            aria-label="Open admin settings"
          >
            ⚙️ Settings
          </button>
          <button
            style={styles.settingsBtn}
            onClick={() => setOfficeSettingsOpen(true)}
            aria-label="Edit Campus Office contact information"
          >
            🏫 Office Info
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
          <a href="/" style={styles.backBtn}>
            Back to Portal
          </a>
        </div>
      </div>

      <div style={styles.content}>

        <p className="section-label" style={{ marginBottom: 10 }}>Dashboard Overview</p>

        <div style={styles.statsGrid}>
          <div style={styles.statCard} className="glass">
            <div style={{ fontSize: 28, color: '#B91C1C', fontWeight: 800 }}>
              {stats ? stats.totalLost : 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Total Lost
            </div>
          </div>
          <div style={styles.statCard} className="glass">
            <div style={{ fontSize: 28, color: '#166534', fontWeight: 800 }}>
              {stats ? stats.totalFound : 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Total Found
            </div>
          </div>
          <div style={styles.statCard} className="glass">
            <div style={{ fontSize: 28, color: '#94a3b8', fontWeight: 800 }}>
              {stats ? stats.pendingLost : 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Pending Lost
            </div>
          </div>
          <div style={styles.statCard} className="glass">
            <div style={{ fontSize: 28, color: '#94a3b8', fontWeight: 800 }}>
              {stats ? stats.pendingFound : 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Pending Found
            </div>
          </div>
          <div style={styles.statCard} className="glass">
            <div style={{ fontSize: 28, color: '#6D28D9', fontWeight: 800 }}>
              {stats ? stats.matchedItems : 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Matches
            </div>
          </div>
          <div style={styles.statCard} className="glass">
            <div style={{ fontSize: 28, color: '#f97316', fontWeight: 800 }}>
              {stats ? ((stats.archivedLost || 0) + (stats.archivedFound || 0)) : 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Archived
            </div>
          </div>
        </div>

        <p className="section-label" style={{ marginBottom: 10 }}>Manage Reports</p>

        <div style={styles.tabBar}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', marginRight: 4 }}>
            FILTER:
          </span>
          {['all', 'pending', 'approved', 'rejected', 'archived'].map(function(tab) {
            return (
              <button
                key={tab}
                onClick={function() {
                  setActiveTab(tab);
                  setTimeout(loadData, 100);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  background: activeTab === tab
                    ? 'var(--gold-bg)'
                    : 'transparent',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {tab === 'archived' ? 'Archived' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button
              onClick={function() { setActiveType('lost'); }}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: activeType === 'lost'
                  ? 'rgba(185,28,28,0.15)'
                  : 'transparent',
                color: activeType === 'lost' ? '#B91C1C' : 'var(--text-muted)',
              }}
            >
              Lost ({lostTotal})
            </button>
            <button
              onClick={function() { setActiveType('found'); }}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: activeType === 'found'
                  ? 'rgba(22,101,52,0.15)'
                  : 'transparent',
                color: activeType === 'found' ? '#166534' : 'var(--text-muted)',
              }}
            >
              Found ({foundTotal})
            </button>
            <button
              onClick={function() { setActiveType('matches'); }}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: activeType === 'matches'
                  ? 'rgba(109,40,217,0.15)'
                  : 'transparent',
                color: activeType === 'matches' ? 'var(--match)' : 'var(--text-muted)',
              }}
            >
              🎯 Matches {stats?.pendingMatches > 0 ? `(${stats.pendingMatches})` : ''}
            </button>
          </div>
        </div>

        {activeType !== 'matches' && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, description..."
              style={{ ...inputStyle, flex: 1, minWidth: 200, margin: 0 }}
            />
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={{ ...inputStyle, width: 150, margin: 0 }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        )}

        {activeType === 'matches' ? (
          <PossibleMatchesPanel onActioned={loadData} />
        ) : (
        <>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div className="spinner" style={{ width: 28, height: 28, border: '3px solid var(--border-bright)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading items…</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              No items found
            </p>
          </div>
        ) : (
          items.map(function(item) {
            return (
              <div key={item._id} style={{ ...styles.itemCard, cursor: 'default' }} className="item-card">

                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    '📦'
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}>
                    <span className={activeType === 'lost' ? 'badge badge-lost' : 'badge badge-found'}>
                      {activeType === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <span className={`badge badge-${item.status || 'pending'}`}>
                      {item.status || 'pending'}
                    </span>
                    {item.matched && (
                      <span className="badge badge-match">
                        Matched
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                  }}>
                    {item.itemName || (activeType === 'lost' ? 'Lost Item' : 'Found Item')}
                  </div>

                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                    lineHeight: 1.5,
                  }}>
                    {item.description}
                  </div>

                  <ReporterContactBox
                    email={activeType === 'lost' ? item.email : item.contactEmail}
                    phone={activeType === 'lost' ? item.phone : item.contactPhone}
                    onCopy={copyToClipboard}
                  />

                  <div style={{ marginTop: 8 }}>
                      <button
                      style={styles.actionBtn('blue')}
                      onClick={function() {
                        openEdit(item);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    {item.status !== 'approved' && item.status !== 'archived' && item.status !== 'resolved' && (
                      <button
                        style={styles.actionBtn('green')}
                        onClick={function() {
                          handleApprove(item._id, activeType);
                        }}
                      >
                        ✅ Approve
                      </button>
                    )}
                    {item.status === 'pending' && (
                      <button
                        style={styles.actionBtn('yellow')}
                        onClick={function() {
                          handleReject(item._id, activeType);
                        }}
                      >
                        ❌ Reject
                      </button>
                    )}
                    {item.status !== 'archived' && item.status !== 'resolved' && (
                      <button
                        style={styles.actionBtn('blue')}
                        onClick={function() {
                          handleArchive(item._id, activeType);
                        }}
                      >
                        🗄️ Archive
                      </button>
                    )}
                    <button
                      style={styles.actionBtn('red')}
                      onClick={function() {
                        handleDelete(item._id, activeType);
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}

        {!loading && items.length > 0 && (activeType === 'lost' ? lostTotalPages : foundTotalPages) > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 20 }}>
            <button
              onClick={() => (activeType === 'lost' ? setLostPage(p => Math.max(1, p - 1)) : setFoundPage(p => Math.max(1, p - 1)))}
              disabled={(activeType === 'lost' ? lostPage : foundPage) <= 1}
              className="btn-ghost"
              style={{ padding: '7px 14px', fontSize: 13, opacity: (activeType === 'lost' ? lostPage : foundPage) <= 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Page {activeType === 'lost' ? lostPage : foundPage} of {activeType === 'lost' ? lostTotalPages : foundTotalPages}
            </span>
            <button
              onClick={() => (activeType === 'lost' ? setLostPage(p => Math.min(lostTotalPages, p + 1)) : setFoundPage(p => Math.min(foundTotalPages, p + 1)))}
              disabled={(activeType === 'lost' ? lostPage >= lostTotalPages : foundPage >= foundTotalPages)}
              className="btn-ghost"
              style={{ padding: '7px 14px', fontSize: 13, opacity: (activeType === 'lost' ? lostPage >= lostTotalPages : foundPage >= foundTotalPages) ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        )}
        </>
        )}

        {activeType !== 'matches' && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={loadData}
            style={{
              padding: '10px 28px',
              borderRadius: 10,
              background: 'var(--gold-bg)',
              color: 'var(--accent)',
              border: '1px solid var(--border-bright)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
        )}

        {editingItem && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 20, padding: 26, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: 18, margin: 0 }}>Edit {activeType === 'lost' ? 'Lost' : 'Found'} Item</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 20, cursor: 'pointer' }} onClick={closeEdit}>×</button>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {activeType === 'lost' ? (
                  <>
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Item Name</label>
                    <input value={editForm.itemName || ''} onChange={e => handleEditChange('itemName', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Description</label>
                    <textarea value={editForm.description || ''} onChange={e => handleEditChange('description', e.target.value)} rows={4} style={textareaStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Category</label>
                    <select value={editForm.category || 'other'} onChange={e => handleEditChange('category', e.target.value)} style={inputStyle}>
                      {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Last Seen Location</label>
                    <input value={editForm.lastSeenLocation || ''} onChange={e => handleEditChange('lastSeenLocation', e.target.value)} style={inputStyle} placeholder="e.g. Library, 2nd floor" />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Reporter Email</label>
                    <input value={editForm.email || ''} onChange={e => handleEditChange('email', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Reporter Phone</label>
                    <input value={editForm.phone || ''} onChange={e => handleEditChange('phone', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Lost Date</label>
                    <input type="date" value={editForm.lostDate || ''} onChange={e => handleEditChange('lostDate', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Replace Image (optional)</label>
                    <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} style={inputStyle} />
                  </>
                ) : (
                  <>
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Finder Name</label>
                    <input value={editForm.finderName || ''} onChange={e => handleEditChange('finderName', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Description</label>
                    <textarea value={editForm.description || ''} onChange={e => handleEditChange('description', e.target.value)} rows={4} style={textareaStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Category</label>
                    <select value={editForm.category || 'other'} onChange={e => handleEditChange('category', e.target.value)} style={inputStyle}>
                      {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Found Location</label>
                    <input value={editForm.foundLocation || ''} onChange={e => handleEditChange('foundLocation', e.target.value)} style={inputStyle} placeholder="e.g. Room No 405" />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Contact Email</label>
                    <input value={editForm.contactEmail || ''} onChange={e => handleEditChange('contactEmail', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Contact Phone</label>
                    <input value={editForm.contactPhone || ''} onChange={e => handleEditChange('contactPhone', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Found Date</label>
                    <input type="date" value={editForm.foundDate || ''} onChange={e => handleEditChange('foundDate', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Replace Image (optional)</label>
                    <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} style={inputStyle} />
                  </>
                )}
              </div>

              <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={closeEdit} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveEdit} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#B4922A', color: '#fff', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .admin-edit-input { width: 100%; background: var(--bg-card); border: 1px solid var(--border-bright); border-radius: 12px; color: var(--text-primary); padding: 12px 14px; font-size: 14px; }
        `}</style>

        {confirmState && (
          <ConfirmDialog
            {...confirmState}
            onCancel={() => setConfirmState(null)}
          />
        )}

        {settingsOpen && (
          <ChangeCredentialsModal
            onClose={() => setSettingsOpen(false)}
            onCredentialsChanged={() => {
              setSettingsOpen(false);
              logout();
              navigate('/admin/login', { replace: true });
            }}
          />
        )}

        {officeSettingsOpen && (
          <OfficeSettingsModal onClose={() => setOfficeSettingsOpen(false)} />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      </div>
    </div>
  );
}

/**
 * "Reporter Contact Details" — admin-only view of a report's private email
 * and phone. This data is only ever shown here, inside the authenticated
 * Admin Dashboard; the backend never returns it through any public API.
 */
function ReporterContactBox({ email, phone, onCopy }) {
  return (
    <div style={{
      marginTop: 4,
      marginBottom: 4,
      background: 'var(--gold-bg)',
      border: '1px solid var(--border-bright)',
      borderRadius: 8,
      padding: '8px 10px',
    }}>
      <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: '0 0 6px' }}>
        🔒 Reporter Contact Details
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 11.5, color: email ? 'var(--text-primary)' : 'var(--text-dim)', fontStyle: email ? 'normal' : 'italic' }}>
            ✉️ {email || 'Not provided'}
          </span>
          {email && (
            <button
              type="button"
              onClick={() => onCopy(email, 'Email')}
              style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border-bright)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
            >
              Copy
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 11.5, color: phone ? 'var(--text-primary)' : 'var(--text-dim)', fontStyle: phone ? 'normal' : 'italic' }}>
            📞 {phone || 'Not provided'}
          </span>
          {phone && (
            <button
              type="button"
              onClick={() => onCopy(phone, 'Phone')}
              style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border-bright)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
            >
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}