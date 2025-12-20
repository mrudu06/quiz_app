import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trophy, Calendar, ChevronRight } from 'lucide-react';
import API_URL from '../config';

const PreviousQuizzes = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        
        const response = await fetch(`${API_URL}/api/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAttempts(data);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>Loading history...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>Previous Quizzes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {attempts.map((attempt) => (
          <div 
            key={attempt.id}
            onClick={() => navigate(`/history/${attempt.id}`)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '1.5rem',
              borderRadius: '1rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'transform 0.2s',
              border: '1px solid var(--border-color)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.875rem' 
                }}>
                  {attempt.level}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} />
                  {new Date(attempt.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={16} color="var(--warning)" />
                  <span>{attempt.score} pts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--info)" />
                  <span>{Math.round(attempt.time_taken)}s</span>
                </div>
              </div>
            </div>
            <ChevronRight color="var(--text-secondary)" />
          </div>
        ))}
        {attempts.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No quizzes taken yet.</div>
        )}
      </div>
    </div>
  );
};

export default PreviousQuizzes;
