import { useState } from 'react';
import './App.css';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';
import Navbar from './components/logo'; // But you never used this - do you want to?
import logo from './assets/logo.png';
// Optional: Lucide icon example
import { Search } from 'lucide-react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

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

        <div className="relative z-10 w-full h-full">
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
                className="w-full py-4 px-6 rounded-full bg-gray-700/70 backdrop-blur-sm text-white text-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-8 h-8 text-white hover:text-purple-500" />
              </button>
            </div>
          </section>

          {/* Content Container */}
          <section className="container mx-auto px-4 mt-16">
            <div className="w-4/5 max-w-4xl mx-auto h-[450px] rounded-3xl border border-gray-600/50 bg-gray-800/20 backdrop-blur-sm ">
              {/* Content will go here */}
            </div>
          </section>
        </div>

        <div className="relative z-10 w-full h-full">

        </div>

      </main>
    </>
  );
}

export default App;