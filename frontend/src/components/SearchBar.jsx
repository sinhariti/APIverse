import { Search } from 'lucide-react';

function SearchBar({ searchQuery, setSearchQuery, handleSearch }) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="container mx-auto px-4 mt-6 flex justify-center">
      <div className="relative w-full max-w-3xl">
        <input
          type="text"
          placeholder="Search APIs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full py-4 px-6 rounded-full bg-gray-700/70 backdrop-blur-sm text-white text-2xl focus:outline-none focus:ring-0 hover:shadow-[0_0_30px_rgba(127,92,255,0.3)] transition-all duration-300"
        />
        <button
          onClick={handleSearch}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
        >
          <Search className="w-8 h-8 text-white hover:text-purple-300" />
        </button>
      </div>
    </section>
  );
}

export default SearchBar;
