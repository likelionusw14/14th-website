export default function RetroNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="retro-nav">
      <button className="retro-nav-btn" onClick={() => scrollTo('home')}>HOME</button>
      <button className="retro-nav-btn" onClick={() => scrollTo('intro')}>동아리소개</button>
      <button className="retro-nav-btn" onClick={() => scrollTo('members')}>회원명단</button>
      <button className="retro-nav-btn" onClick={() => scrollTo('guestbook')}>방명록</button>
      <button className="retro-nav-btn" onClick={() => scrollTo('links')}>링크모음</button>
      <a className="retro-nav-btn" href="/" style={{ textDecoration: 'none' }}>현대판사이트</a>
    </nav>
  );
}
