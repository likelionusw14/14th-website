import { useEffect, useState } from 'react';
import RetroHeader from './components/RetroHeader';
import RetroNav from './components/RetroNav';
import RetroGuestbook from './components/RetroGuestbook';
import RetroFooter from './components/RetroFooter';
import './RetroPage.css';

const SPARKLE_CHARS = ['*', '+', '*', '+', '*'];

export default function RetroPage() {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; char: string; delay: number }[]>([]);

  useEffect(() => {
    // 별 장식 랜덤 배치
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 95,
      y: Math.random() * 100,
      char: SPARKLE_CHARS[i % SPARKLE_CHARS.length],
      delay: Math.random() * 3,
    }));
    setSparkles(items);
  }, []);

  return (
    <div className="retro-page" id="home">
      {/* 별 장식 */}
      {sparkles.map(s => (
        <span
          key={s.id}
          className="retro-sparkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animationDelay: `${s.delay}s`,
            color: ['#ffff00', '#ff00ff', '#00ffff', '#ff0000', '#00ff00'][s.id % 5],
          }}
        >
          {s.char}
        </span>
      ))}

      <div className="retro-container">
        <RetroHeader />
        <RetroNav />

        {/* 메인 콘텐츠 */}
        <div className="retro-content">
          {/* 사이드바 */}
          <div className="retro-sidebar">
            <div className="retro-sidebar-title">MENU</div>
            <ul>
              <li><a href="#home">홈</a></li>
              <li><a href="#intro">동아리소개</a></li>
              <li><a href="#members">회원명단</a></li>
              <li><a href="#guestbook">방명록</a></li>
              <li><a href="#links">링크모음</a></li>
            </ul>

            <hr className="retro-hr" />

            <div className="retro-sidebar-title">LINKS</div>
            <ul id="links">
              <li><a href="/" style={{ fontSize: 11 }}>현대판 사이트</a></li>
              <li><span style={{ fontSize: 11, color: '#808080' }}>네이버</span></li>
              <li><span style={{ fontSize: 11, color: '#808080' }}>다음</span></li>
              <li><span style={{ fontSize: 11, color: '#808080' }}>싸이월드</span></li>
            </ul>

            <hr className="retro-hr" />

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{
                display: 'inline-block',
                background: '#ff0000',
                color: '#fff',
                fontSize: 10,
                padding: '2px 6px',
                fontWeight: 'bold',
              }}>
                NEW!
              </span>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="retro-main" id="intro">
            <h2 style={{
              color: '#000080',
              fontSize: 18,
              borderBottom: '2px solid #000080',
              paddingBottom: 4,
              marginBottom: 12,
            }}>
              동아리 소개
            </h2>

            <div className="retro-welcome">
              <p>
                <span className="retro-rainbow" style={{ fontWeight: 'bold', fontSize: 15 }}>
                  안녕하세요~!! 멋쟁이사자처럼 수원대학교입니다!
                </span>
              </p>
              <p>
                저희 동아리는 프로그래밍을 사랑하는 학생들이 모여
                함께 성장하고 꿈을 키워가는 곳입니다~^^
              </p>
              <p>
                - 매주 정기 모임을 통한 스터디 진행<br />
                - 해커톤 참가 및 프로젝트 개발<br />
                - 선배님들의 든든한 멘토링
              </p>
              <p style={{ color: '#ff0000', fontWeight: 'bold' }}>
                *** 현재 14기 모집중!! 많은 지원 바랍니다~ ***
              </p>

              <hr className="retro-hr" />

              <h2 id="members" style={{
                color: '#000080',
                fontSize: 18,
                borderBottom: '2px solid #000080',
                paddingBottom: 4,
                marginBottom: 12,
              }}>
                회원 명단
              </h2>

              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '2px solid #000080',
                fontSize: 12,
              }}>
                <thead>
                  <tr style={{ background: '#000080', color: '#fff' }}>
                    <th style={{ padding: '4px 8px', border: '1px solid #4040c0' }}>No.</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #4040c0' }}>이름</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #4040c0' }}>직책</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #4040c0' }}>한마디</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1', '김사자', '회장', '화이팅~!!'],
                    ['2', '이멋쟁이', '부회장', '열공합시다^^'],
                    ['3', '박코딩', '총무', '회비 내세요ㅋㅋ'],
                    ['4', '최개발', '스터디장', 'C언어 최고~'],
                    ['5', '정디자인', '홍보', '홈피 예쁘죠?ㅎㅎ'],
                  ].map(([no, name, role, msg]) => (
                    <tr key={no} style={{ background: parseInt(no) % 2 === 0 ? '#e8e8ff' : '#fff' }}>
                      <td style={{ padding: '3px 8px', border: '1px solid #c0c0c0', textAlign: 'center' }}>{no}</td>
                      <td style={{ padding: '3px 8px', border: '1px solid #c0c0c0', textAlign: 'center' }}>{name}</td>
                      <td style={{ padding: '3px 8px', border: '1px solid #c0c0c0', textAlign: 'center' }}>{role}</td>
                      <td style={{ padding: '3px 8px', border: '1px solid #c0c0c0' }}>{msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p style={{ fontSize: 11, color: '#808080', marginTop: 8, textAlign: 'center' }}>
                ※ 위 명단은 1999년 당시 가상의 회원 명단입니다 ※
              </p>
            </div>
          </div>
        </div>

        {/* 방명록 */}
        <RetroGuestbook />

        {/* 푸터 */}
        <RetroFooter />
      </div>
    </div>
  );
}
