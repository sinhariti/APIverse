import logo from '../assets/logo.png';

function Header() {
  return (
    <header className="container mx-auto px-4 py-8 flex justify-between items-center">
      <div className="w-64">
        <a href='/'><img src={logo} alt="APIVerse" className="w-full" /></a>
      </div>
      <nav className="text-white font-mono text-xl flex gap-4">
        <a href="/" className="hover:text-purple-300 transition-colors">HOME</a>|
        <a href="/about" className="hover:text-purple-300 transition-colors">ABOUT</a>|
        <a href="/contact" className="hover:text-purple-300 transition-colors">CONTACT</a>
      </nav>
    </header>
  );
}

export default Header;
