import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/shared/context/AuthContext';

interface GuestbookEntry {
  id: number;
  nickname: string;
  content: string;
  likes: number;
  createdAt: string;
}

export default function RetroGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/guestbook?page=${page}&limit=10`);
      const data = await res.json();
      setEntries(data.entries);
      setTotalPages(data.totalPages);
    } catch {
      // 조용히 실패
    }
  }, [page]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '작성에 실패했습니다.');
        return;
      }

      setNickname('');
      setContent('');
      setPage(1);
      await fetchEntries();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: number) => {
    if (likedIds.has(id)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/guestbook/${id}/like`, {
        method: 'POST',
      });

      if (!res.ok) {
        if (res.status === 409) {
          setLikedIds(prev => new Set(prev).add(id));
        }
        return;
      }

      const updated = await res.json();
      setLikedIds(prev => new Set(prev).add(id));
      setEntries(prev => prev.map(e => e.id === id ? { ...e, likes: updated.likes } : e));
    } catch {
      // 조용히 실패
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div id="guestbook" className="retro-guestbook">
      <div className="retro-guestbook-title">
        ~ 방명록 ~ Guest Book ~
      </div>

      <p style={{ fontSize: 12, marginBottom: 10, color: '#808080', textAlign: 'center' }}>
        90년대 감성으로 글을 남겨주세요! 가장 콘셉트에 잡아먹힌 글에 투표해주세요~^^
      </p>

      {/* 작성 폼 */}
      <form className="retro-guestbook-form" onSubmit={handleSubmit}>
        <div className="retro-form-row">
          <label className="retro-form-label">닉네임:</label>
          <input
            className="retro-form-input"
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
            placeholder="닉네임을 입력하세요~"
            required
          />
        </div>
        <div className="retro-form-row">
          <label className="retro-form-label">한마디:</label>
          <textarea
            className="retro-form-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={200}
            placeholder="방가방가~^^ 퍼가요~♡"
            required
          />
        </div>
        {error && <div className="retro-error">{error}</div>}
        <div style={{ textAlign: 'right' }}>
          <button className="retro-form-submit" type="submit" disabled={submitting}>
            {submitting ? '등록중...' : '글남기기'}
          </button>
        </div>
      </form>

      {/* 엔트리 목록 */}
      {entries.map(entry => (
        <div key={entry.id} className="retro-entry">
          <div className="retro-entry-header">
            <span className="retro-entry-nickname">{entry.nickname}</span>
            <span className="retro-entry-date">{formatDate(entry.createdAt)}</span>
          </div>
          <div className="retro-entry-content">{entry.content}</div>
          <div className="retro-entry-footer">
            <button
              className={`retro-like-btn ${likedIds.has(entry.id) ? 'liked' : ''}`}
              onClick={() => handleLike(entry.id)}
              disabled={likedIds.has(entry.id)}
            >
              {likedIds.has(entry.id) ? '투표완료' : '투표하기'}
              <span className="retro-like-count">[{entry.likes}]</span>
            </button>
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: 30, fontSize: 13, color: '#808080' }}>
          아직 방명록이 비어있습니다. 첫 번째 글을 남겨주세요~!!
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="retro-pagination">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>&lt; 이전</button>
          <span> [{page} / {totalPages}] </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>다음 &gt;</button>
        </div>
      )}
    </div>
  );
}
