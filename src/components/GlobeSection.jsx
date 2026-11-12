import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { globePhrases } from '../data/content';

const DOHA = { lat: 25.29, lon: 51.53, label: 'Doha' };
const HUBS = [
  { lat: 24.71, lon: 46.68, label: 'Riyadh', place: 'up', dx: 0 },
  { lat: 28.61, lon: 77.2, label: 'Delhi', place: 'up', dx: 2 },
  { lat: 24.86, lon: 67.0, label: 'Karachi', place: 'up', dx: -9 },
  { lat: 27.71, lon: 85.32, label: 'Kathmandu', place: 'down', dx: 8 },
  { lat: 6.93, lon: 79.86, label: 'Colombo', place: 'down', dx: 4 },
];

/** Convert latitude/longitude to a point on a sphere of the given radius. */
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(0.55, 'rgba(120,180,255,0.35)');
  gradient.addColorStop(1, 'rgba(120,180,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function GlobeSection() {
  const { t } = useApp();
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Rotate the headline through the global workforce messages.
  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = setInterval(() => setPhraseIndex((i) => (i + 1) % globePhrases.length), 3600);
    return () => clearInterval(id);
  }, [reduceMotion]);

  // Keep the hub labels in the selected language without rebuilding the scene.
  useEffect(() => {
    const layer = containerRef.current?.querySelector('.globe-labels');
    if (!layer) return;
    HUBS.forEach((hub, i) => {
      if (layer.children[i]) layer.children[i].textContent = t(hub.label);
    });
  }, [t]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    // WebGL availability check with graceful fallback.
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) {
      setFailed(true);
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.15, 3.35);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 700;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const radius = 6 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0x9fb8dd,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    const pivot = new THREE.Group();
    pivot.rotation.z = 0.28;
    scene.add(pivot);

    const earthGeometry = new THREE.SphereGeometry(1, 72, 72);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: new THREE.Color(0x224466),
      shininess: 14,
    });
    const earth = new THREE.Mesh(earthGeometry, material);
    // Fixed orientation: the globe does not spin. Doha is rotated to face the
    // camera so the gold marker always sits on Qatar.
    const dohaVector = latLonToVector3(DOHA.lat, DOHA.lon, 1);
    // + PI turns the point toward the camera (+Z) rather than away from it.
    const facing = Math.atan2(-dohaVector.z, dohaVector.x) + Math.PI;
    earth.rotation.y = facing;
    pivot.add(earth);

    const textures = [];
    const loader = new THREE.TextureLoader();
    let disposed = false;

    loader.load(
      '/textures/earth-map.jpg',
      (texture) => {
        if (disposed) return;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        material.map = texture;
        material.needsUpdate = true;
        textures.push(texture);
        // Only reveal the canvas once the earth has its map, so slower
        // machines never show a blank white sphere.
        setReady(true);
      },
      undefined,
      () => setFailed(true)
    );

    loader.load('/textures/earth-specular.jpg', (texture) => {
      if (disposed) return;
      material.specularMap = texture;
      material.specular = new THREE.Color(0x365b8c);
      material.needsUpdate = true;
      textures.push(texture);
    });

    loader.load('/textures/earth-normal.jpg', (texture) => {
      if (disposed) return;
      material.normalMap = texture;
      material.normalScale = new THREE.Vector2(0.55, 0.55);
      material.needsUpdate = true;
      textures.push(texture);
    });

    // Latitude / longitude wireframe
    const gridGeometry = new THREE.SphereGeometry(1.004, 44, 24);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f8ff0,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    // Child of the earth so the graticule rotates with the continents.
    earth.add(new THREE.Mesh(gridGeometry, gridMaterial));

    // Connection arcs from Doha to international hubs
    const arcs = [];
    const arcGroup = new THREE.Group();
    arcGroup.rotation.y = facing;
    pivot.add(arcGroup);
    const start = latLonToVector3(DOHA.lat, DOHA.lon, 1.008);

    HUBS.forEach((hub, i) => {
      const end = latLonToVector3(hub.lat, hub.lon, 1.008);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const length = mid.length();
      mid.normalize().multiplyScalar(1 + length * 0.32);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(64);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineDashedMaterial({
        color: i % 3 === 0 ? 0xf5b82e : 0x69a8ff,
        dashSize: 0.055,
        gapSize: 0.055,
        transparent: true,
        opacity: 0.85,
        linewidth: 1,
      });
      const line = new THREE.Line(geometry, lineMaterial);
      line.computeLineDistances();
      line.userData.offset = Math.random() * 0.12;
      arcGroup.add(line);
      arcs.push(line);

      const hubDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.011, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xa9cfff, transparent: true, opacity: 0.9 })
      );
      hubDot.position.copy(end);
      arcGroup.add(hubDot);

      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: makeGlowTexture(),
          color: 0x8dc0ff,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      glow.position.copy(end);
      glow.scale.setScalar(0.075);
      arcGroup.add(glow);
    });

    // Small place names, one per hub, projected onto the canvas. The globe is
    // fixed, so the labels only need repositioning on resize; a dot on the far
    // side of the earth fades out instead of floating over the globe face.
    const labelLayer = document.createElement('div');
    labelLayer.className = 'globe-labels';
    container.appendChild(labelLayer);
    const labelNodes = HUBS.map((hub) => {
      const el = document.createElement('span');
      el.className = `globe-label globe-label--${hub.place}`;
      el.style.marginLeft = `${hub.dx}px`;
      el.textContent = t(hub.label);
      el.dataset.hub = hub.label;
      labelLayer.appendChild(el);
      return { el, local: latLonToVector3(hub.lat, hub.lon, 1.01) };
    });
    const viewDirection = camera.position.clone().normalize();

    const placeLabels = () => {
      scene.updateMatrixWorld(true);
      // The camera is not part of the scene graph, so its inverse matrix is only
      // filled in by renderer.render(). Update it here so the very first frame
      // (before or without a render loop) already projects correctly.
      camera.updateMatrixWorld();
      camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
      labelNodes.forEach(({ el, local }) => {
        const world = local.clone().applyMatrix4(arcGroup.matrixWorld);
        const normal = world.clone().normalize();
        const projected = world.clone().project(camera);
        el.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`;
        el.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`;
        el.style.opacity = normal.dot(viewDirection) > 0.25 ? '1' : '0';
      });
    };

    // Highlighted Doha hub
    const dohaGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        color: 0xf5b82e,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    dohaGlow.position.copy(start);
    dohaGlow.scale.setScalar(0.16);
    arcGroup.add(dohaGlow);

    const dohaDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd978 })
    );
    dohaDot.position.copy(start);
    arcGroup.add(dohaDot);

    // Lighting
    scene.add(new THREE.AmbientLight(0x94a9c9, 0.85));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(3.2, 1.6, 2.4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x2f6ed6, 0.55);
    rimLight.position.set(-3, -1.4, -2.6);
    scene.add(rimLight);

    // Sizing
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      placeLabels();
    };
    resize();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    // Pause when off-screen or when the tab is hidden.
    let inView = true;
    let frameId;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      // Re-project every frame: the page can settle into its final width after
      // the first resize (fonts, lazy sections), and the labels must follow.
      placeLabels();
      if (!reduceMotion) {
        dohaGlow.scale.setScalar(0.15 + Math.sin(elapsed * 1.6) * 0.015);
        dohaDot.scale.setScalar(1 + Math.sin(elapsed * 1.6) * 0.15);
      }
      renderer.render(scene, camera);
      if (!reduceMotion && inView && !document.hidden) {
        frameId = requestAnimationFrame(renderFrame);
      } else {
        frameId = null;
      }
    };

    const startLoop = () => {
      if (frameId == null) {
        clock.start();
        frameId = requestAnimationFrame(renderFrame);
      }
    };
    const stopLoop = () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    renderFrame();

    // With reduced motion the loop runs once, so settle the label positions
    // again after the rest of the page has finished laying out.
    const settleTimer = reduceMotion ? setTimeout(placeLabels, 400) : null;

    let intersectionObserver;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            inView = entry.isIntersecting;
            if (inView && !document.hidden) startLoop();
            else stopLoop();
          });
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);
    }

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (inView) startLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      stopLoop();
      if (settleTimer) clearTimeout(settleTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      intersectionObserver?.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', resize);

      scene.traverse((object) => {
        if (object.isMesh || object.isLine || object.isPoints || object.isSprite) {
          object.geometry?.dispose?.();
          const mats = Array.isArray(object.material) ? object.material : [object.material];
          mats.forEach((mat) => {
            if (!mat) return;
            Object.values(mat).forEach((value) => {
              if (value && value.isTexture) value.dispose();
            });
            mat.dispose();
          });
        }
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      if (labelLayer.parentNode === container) container.removeChild(labelLayer);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reduceMotion]);

  const phrase = globePhrases[phraseIndex];

  return (
    <section className="section globe-section" id="global">
      <div className="container globe-grid">
        <div className="globe-canvas-wrap">
          <div
            ref={containerRef}
            style={{ position: 'absolute', inset: 0, opacity: ready ? 1 : 0, transition: 'opacity .6s ease' }}
            aria-hidden="true"
          />
          {(!ready || failed) && <div className="globe-fallback" role="img" aria-label={t('Global workforce map')} />}
        </div>

        <div className="globe-copy">
          <span className="eyebrow">{t('Global Workforce')}</span>
          <h2 className="h2">{t('Connecting Talent. Powering Opportunities. Across the World.')}</h2>

          <p className="globe-phrase" aria-live="polite">
            <span key={phraseIndex} className="slide-fade">
              {t(phrase)}
            </span>
          </p>

          <p className="globe-sub">
            {t(
              'From projects across Qatar to international workforce connections, GoldenGlow brings businesses and talent closer together.'
            )}
          </p>

          <div className="globe-ctas">
            <Link className="btn btn--gold btn--lg" to="/#contact">
              <Icon name="users" size={17} />
              {t('Hire Skilled Workers')}
            </Link>
            <Link className="btn btn--outline-light btn--lg" to="/jobs">
              <Icon name="briefcase" size={17} />
              {t('Explore Job Opportunities')}
            </Link>
          </div>

          <div className="globe-legend">
            <span>
              <span className="legend-dot" /> {t('Doha, Qatar')}
            </span>
            <span>
              <span className="legend-dot legend-dot--blue" /> {t('Talent sourcing')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
