import { useState } from 'react';
import './App.css';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';
import logo from './assets/logo.png';
// Optional: Lucide icon example
import { Search } from 'lucide-react';
import { ApiCard } from './components/api-card';


const sampleApis = [
  {
    id: 1,
    name: "Weather API",
    category: "Weather",
    description: "Get real-time weather data for any location worldwide with detailed forecasts and historical data",
    endpoint: "https://api.weather.com/v1",
    hasAuth: true,
    hasCors: false,
    additionalInfo: "Provides comprehensive weather information including temperature, humidity, wind speed, and precipitation data.",
  },
  {
    id: 2,
    name: "User Management API",
    category: "Authentication",
    description: "Complete user authentication and management system with OAuth2 support",
    endpoint: "https://api.usermgmt.com/v2",
    hasAuth: true,
    hasCors: true,
    additionalInfo: "Secure user registration, login, profile management, and role-based access control.",
  },
  {
    id: 3,
    name: "Payment Gateway API",
    category: "Finance",
    description: "Process payments securely with support for multiple payment methods and currencies",
    endpoint: "https://api.payments.com/v1",
    hasAuth: true,
    hasCors: true,
    additionalInfo: "Supports credit cards, digital wallets, and bank transfers with PCI compliance.",
  },
  {
    id: 4,
    name: "Image Processing API",
    category: "Media",
    description: "Advanced image manipulation, resizing, filtering, and format conversion",
    endpoint: "https://api.imageproc.com/v1",
    hasAuth: false,
    hasCors: true,
    additionalInfo: "Batch processing, AI-powered enhancement, and real-time image transformations.",
  },
  {
    id: 5,
    name: "News Aggregator API",
    category: "News",
    description: "Access news articles from thousands of sources worldwide with real-time updates",
    endpoint: "https://api.newsagg.com/v1",
    hasAuth: true,
    hasCors: false,
    additionalInfo: "Categorized news, sentiment analysis, and customizable news feeds.",
  },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = sampleApis.filter(
        (api) =>
          api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          api.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          api.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setHasSearched(true);
    } else {
      setSearchResults(sampleApis);
      setHasSearched(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  return (
    <>
      <main className="relative">
        {/* Background Gradient  */}
        <ShaderGradientCanvas
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1
          }}
          pointerEvents="none"
        >
          <ShaderGradient
            control='query'
            urlString='https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.5&cAzimuthAngle=180&cDistance=5&cPolarAngle=120&cameraZoom=1&color1=%237f5cff&color2=%23000000&color3=%23000000&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=40&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=0.7&positionX=0&positionY=0.9&positionZ=0&range=enabled&rangeEnd=35.3&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&toggleAxis=false&type=plane&uAmplitude=0&uDensity=1&uFrequency=5.5&uSpeed=0.5&uStrength=3&uTime=0&wireframe=false'
          />
        </ShaderGradientCanvas>

        <div className="relative z-10 w-full h-auto mb-16">
          {/* Header */}
          <header className="container mx-auto px-4 py-8 flex justify-between items-center">
            <div className="w-64">
              <img src={logo} alt="APIVerse" className="w-full h-auto" />
            </div>
            <nav className="text-white font-mono text-xl flex gap-4">
              <a href="/about" className="hover:text-purple-300 transition-colors">ABOUT</a>|
              <a href="/contact" className="hover:text-purple-300 transition-colors">CONTACT</a>
            </nav>
          </header>

          {/* Search Section */}
          <section className="container mx-auto px-4 mt-16 flex justify-center">
            <div className="relative w-full max-w-3xl">
              <input
                type="text"
                placeholder="Search APIs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 px-6 rounded-full bg-gray-700/70 backdrop-blur-sm text-white text-2xl focus:outline-none focus:ring-0 hover:shadow-[0_0_30px_rgba(127,92,255,0.3)] transition-all duration-300"
              />
              <button
              onClick={handleSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
            >
              <Search className="w-8 h-8 text-white 
              hover:text-purple-300" />
            </button>
            </div>
          </section>

          {/* Content Container */}
          {!hasSearched && (
          <section className="container mx-auto px-4 mt-16">
            <div className="w-4/5 max-w-4xl mx-auto h-[450px] rounded-3xl border border-gray-600/50 bg-gray-800/20 backdrop-blur-sm ">
              {/* Content will go here */}
            </div>
          </section>
        )}
          {/* API Results */}
        {hasSearched && (
          <section className="container mx-auto px-4 mt-16 max-w-4xl mb-16">
            <div className="space-y-4">
              {searchResults.length > 0 ? (
                searchResults.map((api) => <ApiCard key={api.id} api={api} />)
              ) : (
                <div className="text-center text-white text-xl py-8">
                  No APIs found matching your search.
                </div>
              )}
            </div>
          </section>
        )}
        </div>

      </main>
    </>
  );
}

export default App;