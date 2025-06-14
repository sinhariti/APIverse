import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const apiCategories = [
  "Weather", "Finance", "Images", "Animals", "Development",
  "News", "Music", "Sports", "Movies", "Geolocation", "Travel",
  "Health", "Education", "Gaming", "Social Media"
];

function Graph() {
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
        const n = apiCategories.length;
        const cols = Math.ceil(Math.sqrt(n));
        const rows = Math.ceil(n / cols);
        const spacingX = (d * 2 * aspect) / cols;
        const spacingY = (d * 2) / rows;

        const basePairs = apiCategories.map((text, idx) => {
          const geom = new TextGeometry(text, { font, size: 0.8, depth: 0.1 });
          geom.center();

          const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
          const mesh = new THREE.Mesh(geom, material);
          mesh.userData.label = text;
          mesh.userData.originalColor = material.color.clone();

          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const randX = Math.sin(idx * 1.3) * spacingX * 0.3;
          const randY = Math.cos(idx * 0.7) * spacingY * 0.3;

          const basePos = new THREE.Vector3(
            (col - (cols - 1) / 2) * spacingX + randX,
            ((rows - 1) / 2 - row) * spacingY + randY,
            0
          );

          return { text, geom, material, mesh, basePos };
        });

        for (let xi = -1; xi <= 1; xi++) {
          for (let yi = -1; yi <= 1; yi++) {
            basePairs.forEach(({ text, geom, material, basePos }) => {
              const mesh = new THREE.Mesh(geom.clone(), material.clone());
              mesh.userData.label = text;
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
              boxMesh.userData.label = text;
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
          const floatY = Math.sin(t * 2 + mesh.userData.phase) * 0.3;
          const newY = mesh.userData.target.y + floatY;
          mesh.position.lerp(
            new THREE.Vector3(mesh.userData.target.x, newY, mesh.userData.target.z),
            0.05
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
    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const hits = raycaster.current.intersectObjects(clickBoxes);
      if (hits.length) {
        alert(`You clicked on "${hits[0].object.userData.label}"`);
      }
    });

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
