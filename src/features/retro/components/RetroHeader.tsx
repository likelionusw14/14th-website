import { useState } from 'react';

export default function RetroHeader() {
  const [hitCount] = useState(() => Math.floor(Math.random() * 3000) + 4000);

  const digits = hitCount.toString().padStart(6, '0').split('');

  return (
    <>
      {/* 공지 배너 */}
      <div className="retro-notice">
        [긴급공지] 서버실 구석에서 동아리 극초기 홈페이지 데이터를 복구했습니다!!!
      </div>

      {/* 마퀴 */}
      <div className="retro-marquee-wrapper">
        <div className="retro-marquee-text">
          ★☆★ 환영합니다!! 멋쟁이사자처럼 수원대학교 홈페이지에 오신 것을 진심으로 환영합니다~!!
          ♡♡♡ 방가방가~^^ 우리 동아리 많이 사랑해주세요~ ★☆★
          Welcome to LikeLion USW Homepage!! Since 1999 ★☆★
        </div>
      </div>

      {/* 타이틀 */}
      <div className="retro-title-area">
        <div className="retro-title">
          ~ 멋쟁이사자처럼 ~
        </div>
        <div className="retro-subtitle">
          Suwon Univ. LikeLion Homepage ♡ Est. 1999
        </div>
      </div>

      {/* Under Construction */}
      <div className="retro-construction">
        !! UNDER CONSTRUCTION !! 공사중입니다 !!
      </div>

      {/* 히트 카운터 */}
      <div className="retro-hit-counter">
        당신은 <b style={{ color: '#ff0000' }}>{hitCount.toLocaleString()}</b>번째 방문자입니다!
        <br />
        <div className="retro-hit-digits" style={{ marginTop: 4 }}>
          {digits.map((d, i) => (
            <span key={i} className="retro-hit-digit">{d}</span>
          ))}
        </div>
      </div>
    </>
  );
}
