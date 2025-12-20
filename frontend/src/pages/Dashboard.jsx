import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Zap, Shield, Target } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const difficulties = [
    {
      level: 'Beginner',
      time: 20,
      icon: <Shield size={48} color="#10B981" />,
      color: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10B981',
      description: 'Relaxed pace. 20s per question.'
    },
    {
      level: 'Moderate',
      time: 10,
      icon: <Target size={48} color="#F59E0B" />,
      color: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#F59E0B',
      description: 'Standard challenge. 10s per question.'
    },
    {
      level: 'Expert',
      time: 5,
      icon: <Zap size={48} color="#EF4444" />,
      color: 'rgba(239, 68, 68, 0.1)',
      borderColor: '#EF4444',
      description: 'Fast & Furious! 5s per question.'
    }
  ];

  const startQuiz = (difficulty) => {
    navigate('/quiz', { state: { timeLimit: difficulty.time, level: difficulty.level } });
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={item} style={{ marginBottom: '2rem' }}>
        Welcome back, <span className="highlight">{user.name}</span>!
      </motion.h1>
      
      <motion.div variants={item} className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Level Progress</h3>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            Level {Math.floor(user.xp / 100) + 1}
          </span>
        </div>
        <div className="xp-bar-container">
          <motion.div 
            className="xp-bar-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(user.xp % 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          ></motion.div>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {user.xp % 100} / 100 XP to next level
        </p>
      </motion.div>

      <motion.h2 variants={item} style={{ marginBottom: '1.5rem' }}>Select Difficulty</motion.h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {difficulties.map((diff) => (
          <motion.div 
            key={diff.level}
            variants={item} 
            className="card" 
            whileHover={{ scale: 1.03, borderColor: diff.borderColor, borderWidth: '2px', borderStyle: 'solid' }}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              cursor: 'pointer',
              border: '2px solid transparent'
            }}
            onClick={() => startQuiz(diff)}
          >
            <div style={{ background: diff.color, padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
              {diff.icon}
            </div>
            <h3>{diff.level}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {diff.description}
            </p>
            <button className="btn" style={{ width: '100%', backgroundColor: diff.borderColor }}>Start</button>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
            <Trophy size={24} color="var(--warning)" />
          </div>
          <div>
            <h3>Leaderboard</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              See how you stack up against others.
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/leaderboard')} className="btn btn-secondary">View Rankings</button>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
