import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Trophy, Star, Clock, Activity, LogOut, Edit2, Lock, Bell, X } from 'lucide-react';
import API_URL from '../config';

const Profile = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    totalTime: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = user?.token;
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Stats
        const historyRes = await fetch(`${API_URL}/api/history`, { headers });
        if (historyRes.ok) {
          const history = await historyRes.json();
          const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
          const totalTime = history.reduce((acc, curr) => acc + curr.time_taken, 0);
          
          setStats({
            quizzesTaken: history.length,
            averageScore: history.length > 0 ? Math.round(totalScore / history.length) : 0,
            totalTime: Math.round(totalTime / 60),
            recentActivity: history.slice(0, 3)
          });
        }

        // Fetch Settings
        const userRes = await fetch(`${API_URL}/api/user`, { headers });
        if (userRes.ok) {
            const userData = await userRes.json();
            setNotificationsEnabled(userData.notifications_enabled);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleToggleNotifications = async () => {
    try {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);
        
        const token = user?.token;
        await fetch(`${API_URL}/api/user/settings`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notifications_enabled: newState })
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        setNotificationsEnabled(!notificationsEnabled); // Revert on error
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.new !== passwordData.confirm) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
    }

    try {
        const token = user?.token;
        const response = await fetch(`${API_URL}/api/change-password`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                current_password: passwordData.current,
                new_password: passwordData.new
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordData({ current: '', new: '', confirm: '' });
                setMessage({ type: '', text: '' });
            }, 1500);
        } else {
            setMessage({ type: 'error', text: data.message || 'Failed to update password' });
        }
    } catch (error) {
        setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const level = Math.floor((user?.xp || 0) / 100) + 1;
  const nextLevelXp = level * 100;
  const progress = ((user?.xp || 0) % 100);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2rem', 
          marginBottom: '2rem',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          zIndex: 0
        }} />
        
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
          zIndex: 1
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{user?.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Level {level}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{user?.xp || 0} / {nextLevelXp} XP</span>
            </div>
            <div className="xp-bar-container">
              <motion.div 
                className="xp-bar-fill" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard icon={<Trophy color="#F59E0B" />} label="Total XP" value={user?.xp || 0} delay={0.1} />
        <StatCard icon={<Activity color="#10B981" />} label="Quizzes Taken" value={stats.quizzesTaken} delay={0.2} />
        <StatCard icon={<Star color="#6366F1" />} label="Avg. Score" value={stats.averageScore} delay={0.3} />
        <StatCard icon={<Clock color="#EC4899" />} label="Time Spent" value={`${stats.totalTime}m`} delay={0.4} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Activity */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--accent-primary)" />
            Recent Activity
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p>Loading activity...</p>
            ) : stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem',
                  borderLeft: `4px solid ${activity.score > 0 ? 'var(--success)' : 'var(--error)'}`
                }}>
                  <div>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{activity.level} Quiz</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', color: activity.score > 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
                      +{activity.score} XP
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {Math.round(activity.time_taken)}s
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No recent activity.</p>
            )}
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--accent-primary)" />
            Account
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
                onClick={() => setShowPasswordModal(true)}
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Lock size={16} /> Change Password
            </button>
            
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0.75rem 1rem', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '0.5rem' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={16} />
                    <span>Notifications</span>
                </div>
                <label className="switch">
                    <input 
                        type="checkbox" 
                        checked={notificationsEnabled} 
                        onChange={handleToggleNotifications}
                    />
                    <span className="slider round"></span>
                </label>
            </div>

            <button 
              onClick={logout} 
              className="btn" 
              style={{ 
                width: '100%', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: '#EF4444', 
                border: '1px solid #EF4444',
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </motion.div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="card"
                    style={{ width: '100%', maxWidth: '400px', position: 'relative' }}
                >
                    <button 
                        onClick={() => setShowPasswordModal(false)}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                    
                    <h3 style={{ marginBottom: '1.5rem' }}>Change Password</h3>
                    
                    {message.text && (
                        <div style={{ 
                            padding: '0.75rem', 
                            borderRadius: '0.5rem', 
                            marginBottom: '1rem',
                            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: message.type === 'error' ? '#EF4444' : '#10B981',
                            fontSize: '0.9rem'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Current Password</label>
                            <input 
                                type="password" 
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>New Password</label>
                            <input 
                                type="password" 
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <button type="submit" className="btn" style={{ marginTop: '1rem' }}>Update Password</button>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, delay }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="card"
    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}
  >
    <div style={{ 
      padding: '1rem', 
      borderRadius: '1rem', 
      backgroundColor: 'var(--bg-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</p>
    </div>
  </motion.div>
);

export default Profile;