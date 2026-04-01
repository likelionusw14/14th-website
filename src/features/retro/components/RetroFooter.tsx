export default function RetroFooter() {
  return (
    <>
      {/* 현대판 사이트 링크 */}
      <div className="retro-modern-link">
        <a href="/">&gt;&gt;&gt; 현대판 홈페이지로 이동하기 &lt;&lt;&lt;</a>
      </div>

      {/* 푸터 */}
      <footer className="retro-footer">
        <div className="retro-ie-badge">
          Best viewed in Internet Explorer 5.0 | 800x600 | 16bit Color
        </div>
        <br />

        <div style={{ margin: '8px 0' }}>
          {'[ '}
          <a href="https://web.archive.org" target="_blank" rel="noopener noreferrer">웹의 역사</a>
          {' | '}
          <a href="/">멋사 수원대 (현대판)</a>
          {' | '}
          <span style={{ color: '#808080' }}>야후! 코리아</span>
          {' | '}
          <span style={{ color: '#808080' }}>하이텔</span>
          {' | '}
          <span style={{ color: '#808080' }}>천리안</span>
          {' ]'}
        </div>

        <div style={{ marginTop: 10 }}>
          Copyright &copy; 1999 멋쟁이사자처럼 수원대학교. All rights reserved.
          <br />
          E-mail: <span style={{ color: '#00ffff' }}>likelion_usw@hanmail.net</span>
          <br />
          <span style={{ fontSize: 10, color: '#808080', marginTop: 4, display: 'block' }}>
            (이 페이지는 만우절 이벤트 페이지입니다 ^^)
          </span>
        </div>
      </footer>
    </>
  );
}
