import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";


const apiCategories = {
  'ai': 5,
  'development': 12,
  'images': 15,
  'entertainment': 11,
  'music': 13,
  'sports': 10,
  'news': 5,
  'social': 4,
  'games': 5,
  'health': 9,
  'weather': 5,
  'maps': 4,
  'geography': 12,
  'finance': 9,
  'cryptocurrency': 9,
  'payments': 5,
  'security': 5,
  'email': 3,
  'users': 5,
  'animals': 8,
  'database': 6,
  'search': 6,
  'statistics': 9,
  'real-time': 4,
  'iot': 2,
  'automotive': 2,
  'characters': 8,
  'translations': 2
};
// const dummyapiCategories = {'ai': 2, 'automotive': 2, 'translations': 2, 'data': 22, 'stats': 4, 'addresses': 2, 'transactions': 2, 'quotes': 16, 'characters': 8, 'episodes': 4, 'deaths': 2, 'metadata': 3, 'cdn': 3, 'images': 15, 'covid-19': 7, 'tracking': 3, 'coronavirus': 2, 'real-time': 4, 'statistics': 5, 'users': 5, 'automation': 2, 'restful': 4, 'email': 3, 'games': 3, 'regions': 2, 'cities': 2, 'countries': 2, 'geography': 2, 'json': 6, 'cybersecurity': 2, 'iot': 2, 'mcu': 2, 'movies': 5, 'trading': 7, 'nba': 2, 'basketball': 2, 'sports': 3, 'standings': 3, 'nlp': 3, 'search': 6, 'news': 3, 'read': 2, 'payments': 3, 'cards': 3, 'sets': 2, 'tcg': 2, 'pun': 2, 'christmas': 2, 'spooky': 2, 'dark': 2, 'programming': 3, 'integrations': 2, 'testing': 3, 'rest': 5, 'items': 2, 'monsters': 2, 'commbreeds': 3, 'cats': 3, 'locations': 6, 'developers': 3, 'companies': 2, 'database': 6, 'country': 3, 'cryptocurrency': 9, 'price': 2, 'insights': 2, 'volume': 2, 'currency': 2, 'datasets': 2, 'dogs': 3, 'nutrition': 2, 'species': 2, 'health': 2, 'placeholder': 2, 'livescore': 2, 'football': 3, 'holidays': 2, 'artists': 4, 'inspiration': 2, 'joke': 2, 'malware': 3, 'maps': 2, 'math': 2, 'memes': 3, 'shows': 2, 'music': 11, 'songs': 2, 'social': 2, 'events': 2, 'environment': 2, 'forecast': 2, 'url': 2, 'transport': 2, 'weather': 3, 'alerts': 2}
const getSize = (count) => {
  // Adjust min/max as needed for your visualization
  const minSize = 0.4;
  const maxSize = 1.5;
  const minCount = 1;
  const maxCount = Math.max(...Object.values(apiCategories));
  // Linear scaling
  return minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
};

function Graph({ setSearchResults, setHasSearched }) {
  const canvasRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const drag = useRef({ down: false, startX: 0, startY: 0, camX: 0, camY: 0 });
  const hoveredText = useRef(null);
  const cameraRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, 450);
    renderer.setPixelRatio(window.devicePixelRatio);

    const aspect = window.innerWidth / 450;
    const d = 10;
    const camera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect,
      d, -d,
      0.1, 1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 0, 20);
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const clickBoxes = [];
    const textMeshes = [];

    new FontLoader().load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        // --- Distribute texts in a jittered grid covering the canvas ---
        const n = Object.keys(apiCategories).length;
        const aspect = window.innerWidth / 450;
        const d = 10;
        // Define desired grid shape (width:height ratio)
        const gridAspectRatio = 0.7; // Adjust (smaller = more vertical layout)
        const cols = Math.ceil(Math.sqrt(n * gridAspectRatio));
        const rows = Math.ceil(n / cols);
        const gridWidth = d * 2 * aspect * 0.95;
        const gridHeight = d * 2 * 0.95;
        const spacingX = gridWidth / (cols);
        const spacingY = gridHeight / (rows - 1);

        const basePairs = Object.entries(apiCategories).map(([text, count], idx) => {
          const displayText = text.charAt(0).toUpperCase() + text.slice(1);
          const size = getSize(count);
          const geom = new TextGeometry(displayText, { font, size, depth: 0.1 });
          geom.center();

          const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
          const mesh = new THREE.Mesh(geom, material);
          mesh.userData.label = displayText;
          mesh.userData.originalColor = material.color.clone();

          // Grid position with jitter
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const jitterX = (Math.random() - 0.5) * spacingX * 0.6;
          const jitterY = (Math.random() - 0.5) * spacingY * 0.5;
          const x = -gridWidth / 2 + col * spacingX + jitterX;
          const y = gridHeight / 2 - row * spacingY + jitterY;

          const basePos = new THREE.Vector3(x, y, 0);

          return { displayText, geom, material, mesh, basePos };
        });
        // --- END: Replace spiral with jittered grid ---

        for (let xi = -1; xi <= 1; xi++) {
          for (let yi = -2; yi <= 2; yi++) {
            basePairs.forEach(({ displayText, geom, material, basePos }) => {
              const mesh = new THREE.Mesh(geom.clone(), material.clone());
              mesh.userData.label = displayText;
              mesh.userData.originalColor = mesh.material.color.clone();

              const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                0
              );
              const target = basePos.clone().add(new THREE.Vector3(
                xi * d * 2 * aspect,
                yi * d * 2,
                0
              ));
              mesh.position.copy(offset);
              mesh.userData.target = target;
              mesh.userData.phase = Math.random() * Math.PI * 2;
              scene.add(mesh);
              textMeshes.push(mesh);

              // Create matching interaction box
              geom.computeBoundingBox();
              const bb = geom.boundingBox;
              const size = new THREE.Vector3().subVectors(bb.max, bb.min);
              const boxGeom = new THREE.BoxGeometry(size.x, size.y, 0.3);
              const boxMesh = new THREE.Mesh(
                boxGeom,
                new THREE.MeshBasicMaterial({ visible: false })
              );
              boxMesh.position.copy(target);
              boxMesh.userData.label = displayText;
              boxMesh.userData.textMesh = mesh;
              boxMesh.userData.phase = mesh.userData.phase;
              scene.add(boxMesh);
              clickBoxes.push(boxMesh);

              // Link box to mesh
              mesh.userData.boxMesh = boxMesh;
            });
          }
        }
      }
    );

    function animate(time) {
      requestAnimationFrame(animate);
      const t = time / 1000;
      textMeshes.forEach(mesh => {
        if (mesh.userData.target) {
          const floatY = Math.sin(t * 1 + mesh.userData.phase) * 0.3;
          const newY = mesh.userData.target.y + floatY;
          mesh.position.lerp(
            new THREE.Vector3(mesh.userData.target.x, newY, mesh.userData.target.z),
            0.02
          );

          if (mesh.userData.boxMesh) {
            mesh.userData.boxMesh.position.set(
              mesh.userData.target.x,
              newY,
              mesh.userData.target.z
            );
          }
        }
      });
      renderer.render(scene, camera);
    }
    animate();

    // Hover highlight
    canvas.addEventListener("pointermove", (e) => {
      if (drag.current.down) return;
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(clickBoxes);

      if (hoveredText.current && (!intersects.length || hoveredText.current !== intersects[0].object.userData.textMesh)) {
        hoveredText.current.material.color.copy(hoveredText.current.userData.originalColor);
        hoveredText.current = null;
        canvas.style.cursor = "default";
      }

      if (intersects.length) {
        const mesh = intersects[0].object.userData.textMesh;
        if (hoveredText.current !== mesh) {
          if (hoveredText.current) {
            hoveredText.current.material.color.copy(hoveredText.current.userData.originalColor);
          }
          hoveredText.current = mesh;
          mesh.material.color.set(0xaf93fd);
          canvas.style.cursor = "pointer";
        }
      }
    });

    // Drag camera
    canvas.addEventListener("mousedown", (e) => {
      drag.current.down = true;
      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;
      drag.current.camX = cameraRef.current.position.x;
      drag.current.camY = cameraRef.current.position.y;
    });

    window.addEventListener("mousemove", (e) => {
      if (!drag.current.down) return;
      const dx = (e.clientX - drag.current.startX) / window.innerWidth * d * 2 * aspect;
      const dy = -(e.clientY - drag.current.startY) / 450 * d * 2;
      cameraRef.current.position.x = drag.current.camX - dx;
      cameraRef.current.position.y = drag.current.camY - dy;
    });

    window.addEventListener("mouseup", () => {
      drag.current.down = false;
    });

    // Click detection
    const handleClick = async (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const hits = raycaster.current.intersectObjects(clickBoxes);

      if (hits.length) {
        const categoryLabel = hits[0].object.userData.label;
        console.log("Clicked category:", categoryLabel);
        await filterByCategory(categoryLabel);
      }
    };
    window.addEventListener("click", handleClick);

    async function filterByCategory(label) {
      try {
        const response = await fetch("http://localhost:8000/api/filter_by_categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categories: label,
          }),
        });

        if (!response.ok) {
          throw new Error("category request failed");
        }

        const data = await response.json();
        setSearchResults(data);
        setHasSearched(true);
        console.log("API Response:", data);
        // Handle the response as needed
      } catch (error) {
        console.error("Error calling API:", error);
        setSearchResults([]);
        setHasSearched(true);
      }
    }

    const onResize = () => {
      renderer.setSize(window.innerWidth, 450);
      const as = window.innerWidth / 450;
      cameraRef.current.left = -d * as;
      cameraRef.current.right = d * as;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", handleClick);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full h-[450px] rounded-3xl border border-gray-600/50 bg-gray-800/20 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(127,92,255,0.3)] transition-all duration-300"
    />
  );
}


export default Graph;
