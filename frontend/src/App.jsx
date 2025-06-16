import { useState, useMemo } from "react";
import "./App.css";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import DotLoader from "./components/loader";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Content from "./components/Content";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const PORT = import.meta.env.VITE_API_BASE_URL;

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setSearchLoading(true);
      try {
        const res = await fetch(`${PORT}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (!res.ok) throw new Error("Search request failed");

        const data = await res.json();
        setSearchResults(data);
        setHasSearched(true);
      } catch (error) {
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
      setHasSearched(true);
    }
  };

  // Memoize the Graph component to avoid unnecessary re-renders
  // const memoizedGraph = useMemo(() => (
  //   <Content
  //     hasSearched={hasSearched}
  //     searchResults={searchResults}
  //     setSearchLoading={setSearchLoading}
  //     setSearchResults={setSearchResults}
  //     setHasSearched={setHasSearched}
  //   />
  // ), [hasSearched, searchResults]);

  return (
    <>
      <main className="relative">
        {/* Background Gradient  */}
        <ShaderGradientCanvas
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
          pointerEvents="none"
        >
          <ShaderGradient
            control="query"
            urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.5&cAzimuthAngle=180&cDistance=5&cPolarAngle=120&cameraZoom=1&color1=%237f5cff&color2=%23000000&color3=%23000000&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=40&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=0.7&positionX=0&positionY=0.9&positionZ=0&range=enabled&rangeEnd=35.3&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&toggleAxis=false&type=plane&uAmplitude=0&uDensity=1&uFrequency=5.5&uSpeed=0.5&uStrength=3&uTime=0&wireframe=false"
          />
        </ShaderGradientCanvas>

        <div className="relative z-10 w-full mb-16">
          <Header />
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
          <Content
            hasSearched={hasSearched}
            searchResults={searchResults}
            setSearchLoading={setSearchLoading}
            setSearchResults={setSearchResults}
            setHasSearched={setHasSearched}
          />
        </div>
        {searchLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
            <div className="text-center space-y-4">
              <DotLoader />
              <p className="text-white font-medium text-lg">
                Searching APIs...
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
