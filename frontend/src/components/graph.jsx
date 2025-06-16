import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// --- Font caching helper ---
let cachedFont = null;
let cachedFontPromise = null;
function loadFontOnce() {
  if (cachedFont) return Promise.resolve(cachedFont);
  if (!cachedFontPromise) {
    cachedFontPromise = new Promise((resolve, reject) => {
      new FontLoader().load(
        "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
        (font) => {
          cachedFont = font;
          resolve(font);
        },
        undefined,
        reject
      );
    });
  }
  return cachedFontPromise;
}

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

function Graph({ setSearchResults, setHasSearched , setSearchLoading}) {
  const canvasRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const drag = useRef({ down: false, startX: 0, startY: 0, camX: 0, camY: 0 });
  const hoveredText = useRef(null);
  const cameraRef = useRef();
  const PORT = import.meta.env.VITE_API_BASE_URL;

  // --- InstancedMesh state ---
  const instancedBoxRef = useRef(null);
  const instanceMetaRef = useRef([]); // Array of { label, textMesh }

  useEffect(() => {
    let textMeshes = [];
    let instanceMeta = [];
    let instancedBox = null;
    let instanceIdx = 0;
    let totalInstances = 0;
    let basePairs = [];
    let gridParams = {};
    let layersToAdd = [];
    let addedLayers = new Set();

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

    // --- InstancedMesh state ---
    instancedBoxRef.current = null;
    instanceMetaRef.current = [];

    loadFontOnce().then((font) => {
      // --- Grid and basePairs setup ---
      const n = Object.keys(apiCategories).length;
      const aspect = window.innerWidth / 450;
      const d = 10;
      const gridAspectRatio = 0.7;
      const cols = Math.ceil(Math.sqrt(n * gridAspectRatio));
      const rows = Math.ceil(n / cols);
      const gridWidth = d * 2 * aspect * 0.95;
      const gridHeight = d * 2 * 0.95;
      const spacingX = gridWidth / (cols);
      const spacingY = gridHeight / (rows - 1);

      gridParams = { aspect, d, cols, rows, gridWidth, gridHeight, spacingX, spacingY };

      basePairs = Object.entries(apiCategories).map(([text, count], idx) => {
        const displayText = text.charAt(0).toUpperCase() + text.slice(1);
        const size = getSize(count);
        const geom = new TextGeometry(displayText, { font, size, depth: 0.1 });
        geom.center();

        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geom, material);
        mesh.userData.label = displayText;
        mesh.userData.originalColor = material.color.clone();

        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const jitterX = (Math.random() - 0.5) * spacingX * 0.6;
        const jitterY = (Math.random() - 0.5) * spacingY * 0.5;
        const x = -gridWidth / 2 + col * spacingX + jitterX;
        const y = gridHeight / 2 - row * spacingY + jitterY;

        const basePos = new THREE.Vector3(x, y, 0);

        return { displayText, geom, material, mesh, basePos };
      });

      // --- Prepare layers: center first, then surrounding ---
      // Layers are sorted by Manhattan distance from (0,0)
      const layerCoords = [];
      const maxXi = 1, maxYi = 2;
      for (let xi = -maxXi; xi <= maxXi; xi++) {
        for (let yi = -maxYi; yi <= maxYi; yi++) {
          layerCoords.push({ xi, yi, dist: Math.abs(xi) + Math.abs(yi) });
        }
      }
      layerCoords.sort((a, b) => a.dist - b.dist);

      // Group by layer distance
      layersToAdd = [];
      let lastDist = -1, currentLayer = [];
      for (const { xi, yi, dist } of layerCoords) {
        if (dist !== lastDist) {
          if (currentLayer.length) layersToAdd.push(currentLayer);
          currentLayer = [];
          lastDist = dist;
        }
        currentLayer.push({ xi, yi });
      }
      if (currentLayer.length) layersToAdd.push(currentLayer);

      // --- Calculate totalInstances for InstancedMesh ---
      totalInstances = layerCoords.length * basePairs.length;
      const dummyBox = new THREE.BoxGeometry(1, 1, 0.3);
      const invisibleMat = new THREE.MeshBasicMaterial({ visible: false });
      instancedBox = new THREE.InstancedMesh(dummyBox, invisibleMat, totalInstances);
      instancedBox.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      instancedBox.frustumCulled = false;
      instancedBoxRef.current = instancedBox;
      scene.add(instancedBox);

      // --- Add only center layer first ---
      textMeshes = [];
      instanceMeta = [];
      instanceIdx = 0;
      addedLayers = new Set();

      function addLayer(layer) {
        for (const { xi, yi } of layer) {
          // Prevent double-adding
          const key = `${xi},${yi}`;
          if (addedLayers.has(key)) continue;
          addedLayers.add(key);

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

            // Compute bounding box for this text
            geom.computeBoundingBox();
            const bb = geom.boundingBox;
            const size = new THREE.Vector3().subVectors(bb.max, bb.min);

            // Set instance matrix for this box
            const matrix = new THREE.Matrix4();
            matrix.compose(
              new THREE.Vector3(target.x, target.y, target.z),
              new THREE.Quaternion(),
              new THREE.Vector3(size.x, size.y, 0.3)
            );
            instancedBox.setMatrixAt(instanceIdx, matrix);

            // Store per-instance metadata
            instanceMeta[instanceIdx] = {
              label: displayText,
              textMesh: mesh,
              target,
              phase: mesh.userData.phase,
              size
            };

            // Link mesh to instance index (for animation)
            mesh.userData.instanceIdx = instanceIdx;

            instanceIdx++;
          });
        }
        instancedBox.instanceMatrix.needsUpdate = true;
        instanceMetaRef.current = instanceMeta;
      }

      // Add center layer (xi=0, yi=0)
      addLayer(layersToAdd[0]);

      // --- Lazy load surrounding layers ---
      let layerIdx = 1;
      function scheduleNextLayer() {
        if (layerIdx >= layersToAdd.length) return;
        const nextLayer = layersToAdd[layerIdx];
        addLayer(nextLayer);
        layerIdx++;
        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(scheduleNextLayer, { timeout: 100 });
        } else {
          setTimeout(scheduleNextLayer, 30);
        }
      }
      scheduleNextLayer();
    });

    function animate(time) {
      requestAnimationFrame(animate);
      const t = time / 1000;
      if (textMeshes.length && instancedBoxRef.current && instanceMetaRef.current.length) {
        const instancedBox = instancedBoxRef.current;
        const instanceMeta = instanceMetaRef.current;
        const matrix = new THREE.Matrix4();

        textMeshes.forEach(mesh => {
          if (mesh.userData.target !== undefined && mesh.userData.instanceIdx !== undefined) {
            const floatY = Math.sin(t * 1 + mesh.userData.phase) * 0.3;
            const newY = mesh.userData.target.y + floatY;
            mesh.position.lerp(
              new THREE.Vector3(mesh.userData.target.x, newY, mesh.userData.target.z),
              0.02
            );

            const idx = mesh.userData.instanceIdx;
            const meta = instanceMeta[idx];
            if (meta) {
              matrix.compose(
                new THREE.Vector3(mesh.userData.target.x, newY, mesh.userData.target.z),
                new THREE.Quaternion(),
                new THREE.Vector3(meta.size.x, meta.size.y, 0.3)
              );
              instancedBox.setMatrixAt(idx, matrix);
            }
          }
        });
        instancedBox.instanceMatrix.needsUpdate = true;
      }
      renderer.render(scene, camera);
    }
    animate();

    // Hover highlight
    canvas.addEventListener("pointermove", (e) => {
      if (drag.current.down) return;
      if (!instancedBoxRef.current || !instanceMetaRef.current.length) return;
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObject(instancedBoxRef.current);

      if (hoveredText.current && (!intersects.length || hoveredText.current !== instanceMetaRef.current[intersects[0]?.instanceId]?.textMesh)) {
        hoveredText.current.material.color.copy(hoveredText.current.userData.originalColor);
        hoveredText.current = null;
        canvas.style.cursor = "default";
      }

      if (intersects.length) {
        const instanceId = intersects[0].instanceId;
        const mesh = instanceMetaRef.current[instanceId]?.textMesh;
        if (mesh && hoveredText.current !== mesh) {
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
      if (!instancedBoxRef.current || !instanceMetaRef.current.length) return;
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const hits = raycaster.current.intersectObject(instancedBoxRef.current);

      if (hits.length) {
        const instanceId = hits[0].instanceId;
        const categoryLabel = instanceMetaRef.current[instanceId]?.label;
        if (categoryLabel) {
          console.log("Clicked category:", categoryLabel);
          await filterByCategory(categoryLabel);
        }
      }
    };
    window.addEventListener("click", handleClick);

    async function filterByCategory(label) {
      setSearchLoading(true);
      try {
        const response = await fetch(`${PORT}/api/filter_by_categories`, {
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
      }finally{
        setSearchLoading(false);
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
