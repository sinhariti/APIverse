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

    const tilesGroup = new THREE.Group();
    const clickBoxes = [];
    const textMeshes = [];

    // new FontLoader().load(
    //   "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    //   (font) => {
    //     const n = apiCategories.length;
    //     const cols = Math.ceil(Math.sqrt(n));
    //     const rows = Math.ceil(n / cols);
    //     const spacingX = (d * 2 * aspect) / cols;
    //     const spacingY = (d * 2) / rows;


    //     apiCategories.forEach((text, idx) => {
    //       const geom = new TextGeometry(text, { font, size: 0.7, depth: 0.2 });
    //       geom.center();

    //       const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    //       const mesh = new THREE.Mesh(geom, material);
    //       mesh.userData.label = text;
    //       mesh.userData.originalColor = material.color.clone();
    //       textMeshes.push(mesh);

    //       const row = Math.floor(idx / cols);
    //       const col = idx % cols;
    //       const randX = Math.sin(idx * 1.3) * spacingX * 0.3;
    //       const randY = Math.cos(idx * 0.7) * spacingY * 0.3;

    //       const position = new THREE.Vector3(
    //         (col - (cols - 1) / 2) * spacingX + randX,
    //         ((rows - 1) / 2 - row) * spacingY + randY,
    //         0
    //       );
    //       const offset = new THREE.Vector3(
    //         (Math.random() - 0.5) * 40,
    //         (Math.random() - 0.5) * 30,
    //         0
    //       );
    //       mesh.position.copy(offset);
    //       mesh.userData.target = position.clone();

    //       tilesGroup.add(mesh);

    //       // Invisible interaction box
    //       geom.computeBoundingBox();
    //       const bb = geom.boundingBox;
    //       const boxSize = new THREE.Vector3().subVectors(bb.max, bb.min);
    //       const boxGeom = new THREE.BoxGeometry(boxSize.x, boxSize.y, 0.3);
    //       const boxMesh = new THREE.Mesh(
    //         boxGeom,
    //         new THREE.MeshBasicMaterial({ visible: false })
    //       );
    //       boxMesh.position.copy(position);
    //       boxMesh.userData.label = text;
    //       boxMesh.userData.textMesh = mesh;
    //       clickBoxes.push(boxMesh);
    //       scene.add(boxMesh);
    //     });

    //     // Tile in a 5x5 grid
    //     for (let xi = -1; xi <= 2; xi++) {
    //       for (let yi = -1; yi <= 2; yi++) {
    //         if (xi === 0 && yi === 0) continue;
    //         const copy = tilesGroup.clone(true);
    //         copy.position.set(xi * d * 2 * aspect, yi * d * 2, 0);
    //         scene.add(copy);
    //       }
    //     }

    //     scene.add(tilesGroup);
    //   }
    // );

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
          scene.add(boxMesh);
          clickBoxes.push(boxMesh);
        });
      }
    }
  }
);


    function animate() {
      requestAnimationFrame(animate);
      textMeshes.forEach(mesh => {
        if (mesh.userData.target) {
          mesh.position.lerp(mesh.userData.target, 0.05);
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
          mesh.material.color.set(0xffcc00);
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
      className=" max-w-full h-[450px] rounded-3xl border border-gray-600/50 bg-gray-800/20 backdrop-blur-sm"
    />
  );
}

export default Graph;






// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { FontLoader } from "three/addons/loaders/FontLoader.js";
// import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// const apiCategories = [
//   "Weather", "Finance", "Images", "Animals", "Development",
//   "News", "Music", "Sports", "Movies", "Geolocation", "Travel", "Health", "Education", "Gaming", "Social Media",
// ];

// function Graph() {
//   const canvasRef = useRef();
//   const meshesRef = useRef([]);
//   const raycaster = useRef(new THREE.Raycaster());
//   const mouse = useRef(new THREE.Vector2());

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const scene = new THREE.Scene();
//     const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
//     renderer.setSize(window.innerWidth, 450);
//     renderer.setPixelRatio(window.devicePixelRatio);

//     // Orthographic camera setup
//     const aspect = window.innerWidth / 450;
//     const d = 10;
//     const camera = new THREE.OrthographicCamera(
//       -d * aspect, d * aspect,
//        d, -d,
//        0.1, 1000
//     );
//     camera.position.set(0, 0, 20);

//     scene.add(new THREE.AmbientLight(0xffffff, 1));

//     const fontLoader = new FontLoader();
//     fontLoader.load(
//       "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
//       (font) => {
//         const n = apiCategories.length;
//         const cols = Math.ceil(Math.sqrt(n));
//         const rows = Math.ceil(n / cols);
//         const spacingX = (d * 2 * aspect) / cols;
//         const spacingY = (d * 2) / rows;

//         apiCategories.forEach((text, idx) => {
//           const geom = new TextGeometry(text, { font, size: 0.8, depth: 0.2 });
//           geom.center();

//           const mesh = new THREE.Mesh(geom, new THREE.MeshNormalMaterial());

//           const row = Math.floor(idx / cols);
//           const col = idx % cols;
          
//           const randX = Math.sin(idx * 1.3) * spacingX * 0.3;  // controlled randomness
//           const randY = Math.cos(idx * 0.7) * spacingY * 0.3;

//           mesh.position.set(
//             (col - (cols - 1) / 2) * spacingX + randX,
//             ((rows - 1) / 2 - row) * spacingY + randY,
//             1
//           );
//           mesh.userData.label = text;
//           meshesRef.current.push(mesh);
//           scene.add(mesh);
//         });
//       }
//     );

//     const clock = new THREE.Clock();
//     function animate() {
//       requestAnimationFrame(animate);
//       meshesRef.current.forEach((mesh, i) => {
//         mesh.position.y += Math.sin(clock.getElapsedTime() + i) * 0.002;
//       });
//       renderer.render(scene, camera);
//     }
//     animate();

//     function onResize() {
//       renderer.setSize(window.innerWidth, 450);
//       const newAspect = window.innerWidth / 450;
//       camera.left = -d * newAspect;
//       camera.right = d * newAspect;
//       camera.updateProjectionMatrix();
//     }
//     window.addEventListener("resize", onResize);

//     function onClick(event) {
//       const rect = canvas.getBoundingClientRect();
//       mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       raycaster.current.setFromCamera(mouse.current, camera);
//       const hits = raycaster.current.intersectObjects(meshesRef.current);
//       if (hits.length) {
//         const name = hits[0].object.userData.label;
//         alert(`You clicked on "${name}"`);
//       }
//     }
//     canvas.addEventListener("click", onClick);

//     return () => {
//       window.removeEventListener("resize", onResize);
//       canvas.removeEventListener("click", onClick);
//       renderer.dispose();
//       scene.clear();
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="w-4/5 max-w-4xl mx-auto h-[450px] rounded-3xl border border-gray-600/50 bg-gray-800/20 backdrop-blur-sm"
//     />
//   );
// }

// export default Graph;

