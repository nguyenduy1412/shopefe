"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

export default function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isDark = resolvedTheme === "dark";

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Particles ---
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 1500;

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const life = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = 0;
      scales[i] = 0;
      life[i] = 0;
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particlesGeometry.setAttribute(
      "scale",
      new THREE.BufferAttribute(scales, 1),
    );

    // Theme-aware colors and blending
    const particleColor = isDark ? "#38bdf8" : "#3b82f6";
    const blendingMode = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

    const particlesMaterial = new THREE.ShaderMaterial({
      depthWrite: false,
      blending: blendingMode,
      transparent: true,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(particleColor) },
        uSize: { value: 15.0 * renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float scale;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = 15.0 * scale;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(uColor, alpha * ${isDark ? "0.8" : "0.45"});
        }
      `,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // --- Logic ---
    const mouse = new THREE.Vector2(-100, -100);
    const targetMouse = new THREE.Vector2(-100, -100);
    let particleIndex = 0;

    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      const vec = new THREE.Vector3(x, y, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));

      targetMouse.set(pos.x, pos.y);
    };

    const animate = () => {
      mouse.lerp(targetMouse, 0.1);

      const positions = particles.geometry.attributes.position
        .array as Float32Array;
      const scales = particles.geometry.attributes.scale.array as Float32Array;

      const spawnRate = 12;
      for (let i = 0; i < spawnRate; i++) {
        const index = (particleIndex + i) % count;

        positions[index * 3] = mouse.x + (Math.random() - 0.5) * 0.5;
        positions[index * 3 + 1] = mouse.y + (Math.random() - 0.5) * 0.5;
        scales[index] = 1.0;
        life[index] = 1.0;
        velocities[index * 3] = (Math.random() - 0.5) * 0.2;
        velocities[index * 3 + 1] = (Math.random() - 0.5) * 0.2;
      }
      particleIndex = (particleIndex + spawnRate) % count;

      for (let i = 0; i < count; i++) {
        if (life[i] > 0) {
          life[i] -= 0.015;
          scales[i] = life[i];
          positions[i * 3] += velocities[i * 3];
          positions[i * 3 + 1] += velocities[i * 3 + 1];
        } else {
          scales[i] = 0;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    const frameId = requestAnimationFrame(animate);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      if (container) container.innerHTML = "";
      renderer.dispose();
    };
  }, [resolvedTheme]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9998,
        pointerEvents: "none",
      }}
    />
  );
}
