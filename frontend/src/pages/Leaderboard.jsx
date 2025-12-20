import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Calendar } from 'lucide-react';

const Leaderboard = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const sortedHistory = storedHistory.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.time - b.time;
    });
    setHistory(sortedHistory);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Trophy size={32} color="var(--warning)" />
        <h2>Leaderboard</h2>
      </div>
      
      {history.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
          No quizzes taken yet. Be the first to set a record!
        </p>
      ) : (
        <motion.table 
          variants={container}
          initial="hidden"
          animate="show"
        >
          <thead>
            <tr>
              <th>Rank</th>
              <th>Score</th>
              <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> Time</div></th>
              <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> Date</div></th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <motion.tr 
                key={index} 
                variants={item}
                style={{ 
                  backgroundColor: index < 3 ? `rgba(245, 158, 11, ${0.1 - index * 0.03})` : 'transparent'
                }}
              >
                <td>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{entry.score}</td>
                <td>{entry.time.toFixed(1)}s</td>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(entry.date).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      )}
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default Leaderboard;