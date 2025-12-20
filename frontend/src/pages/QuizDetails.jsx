import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import API_URL from '../config';

const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        
        const response = await fetch(`${API_URL}/api/history/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDetails(data);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>Loading details...</div>;
  if (!details) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>Details not found.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/history')}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        <ArrowLeft size={20} /> Back to History
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Quiz Results</h2>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)' }}>
            <span>Score: <span style={{ color: 'var(--accent-primary)' }}>{details.summary.score}</span></span>
            <span>Time: {Math.round(details.summary.time_taken)}s</span>
            <span>Level: {details.summary.level}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {details.answers.map((answer, index) => (
          <div 
            key={index}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: answer.is_correct ? '1px solid var(--success)' : '1px solid var(--error)'
            }}
          >
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              {index + 1}. {answer.question_text}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: answer.is_correct ? 'var(--success)' : 'var(--error)'
              }}>
                {answer.is_correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <span>Your Answer: {answer.user_answer || 'Skipped'}</span>
              </div>
              
              {!answer.is_correct && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginLeft: '1.75rem' }}>
                  <span>Correct Answer: {answer.correct_answer}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizDetails;
