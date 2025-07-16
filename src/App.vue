<template>
  <div id="app">
    <transition name="slide-in">
      <Notification v-if="visible" :message="message" @close="visible = false" key="notification"
        class="notification-wrapper" />
    </transition>
    <Home />
  </div>
  <div class="background" :style="{
    backgroundImage: `
      radial-gradient(circle at 20% 30%, ${gradientColors.color1}, transparent 70%),
      radial-gradient(circle at 80% 70%, ${gradientColors.color2}, transparent 70%),
      radial-gradient(circle at 50% 50%, ${gradientColors.color3}, transparent 70%)
    `
  }"></div>
  <div class="blur-background">
    <canvas id="blob-canvas" class="blur-background-canvas"></canvas>
  </div>
</template>

<script>
import '../node_modules/bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../src/styles/variables.css'
import Home from '../src/views/Home.vue'
import { eventBus } from '../utils/eventBus.js';
import Notification from './components/NotificationComponent.vue';
import { interpolateColor } from '../utils/colorProcessing.js';
import { loadSetting } from '../utils/settings';

export default {
  name: 'App',
  data() {
    return {
      message: '',
      visible: false,
      gradientColors: {
        color1: '#1d0a89',
        color2: '#6a0373',
        color3: '#24c6dc',
        color4: '#231126',
      },
      blobs: [], 
      blobAnimationId: null,   // store last requestAnimationFrame id
      hue: 0,
      performanceMode: "1",
      animationFps: 10,
    };
  },
  computed: {
    cssVars() {
      return {
        '--background-color': this.gradientColors.color1,
        '--background-color-2': this.gradientColors.color2,
        '--background-color-3': this.gradientColors.color3,
        '--background-color-4': this.gradientColors.color4,
      };
    },
  },
  components: {
    Home,
    Notification,
  },
  async created() {
    eventBus.on('notify', this.showNotification);
    eventBus.on('set-colors', this.updateColors);
  },
  async mounted() {
    this.initBlobCanvas();
    this.animateHue();
  },
  methods: {
    stopBlobCanvas() {
      if (this.blobAnimationId != null) {
        cancelAnimationFrame(this.blobAnimationId);
        this.blobAnimationId = null;
      }
      const canvas = document.getElementById("blob-canvas");
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      this.blobs = [];
    },

    async initBlobCanvas() {
      // 1) tear down any existing loop + blobs
      this.stopBlobCanvas();

      // 2) grab canvas + sizing
      const canvas = document.getElementById("blob-canvas");
      const ctx = canvas.getContext("2d");
      let width = canvas.width = window.innerWidth;
      let height = canvas.height = window.innerHeight;

      // 3) helper to convert hex→rgba
      const hexToRgba = (hex, a) => {
        const n = parseInt(hex.slice(1), 16);
        const r = (n >> 16) & 255;
        const g = (n >> 8) & 255;
        const b = n & 255;
        return `rgba(${r},${g},${b},${a})`;
      };

      // 4) blob factory
      const createBlob = (outside = false) => {
        const r = 200 + Math.random() * 150;
        let x, y, dx, dy;
        if (outside) {
          const side = Math.floor(Math.random() * 4);
          switch (side) {
            case 0: x = -r; y = Math.random() * height; dx = 1 + Math.random(); dy = (Math.random() - 0.5) * 2.8; break;
            case 1: x = width + r; y = Math.random() * height; dx = -1 - Math.random(); dy = (Math.random() - 0.5) * 2.8; break;
            case 2: x = Math.random() * width; y = -r; dx = (Math.random() - 0.5) * 2.8; dy = 1 + Math.random(); break;
            default: x = Math.random() * width; y = height + r; dx = (Math.random() - 0.5) * 2.8; dy = -1 - Math.random(); break;
          }
        } else {
          x = Math.random() * width;
          y = Math.random() * height;
          dx = (Math.random() - 0.5) * 6.8; // This is the speed of the blob
          dy = (Math.random() - 0.5) * 6.8; // This is the speed of the blob
        }
        return { x, y, r, dx, dy, color: this.randomColor() };
      };

      // 5) alter settings based on performance mode
      this.performanceMode = await loadSetting('PerformanceMode');
      console.log(`Setting up animation with performance mode: ${this.performanceMode}`);
      if (this.performanceMode === null) {
        console.warn('PerformanceMode setting not found, defaulting to 5fps');
        // If no setting is found, default to 5fps
        this.performanceMode = "1";
      }
      console.log(`Performance mode is ${this.performanceMode}`);
      if (this.performanceMode === "1") {
        // If performance mode is enabled, reduce the number of blobs and fps
        this.blobs = Array.from({ length: 20 }, () => createBlob());
        this.animationFps = 5;
      } else if (this.performanceMode === "2") {
        // If ultra performance mode is enabled, further reduce the number of blobs and fps
        this.blobs = Array.from({ length: 10 }, () => createBlob());
        this.animationFps = 0;
      } else {
        // Otherwise, use the default number of blobs and increase fps
        this.blobs = Array.from({ length: 30 }, () => createBlob());
        this.animationFps = 60;
      }

      // 6) FPS limiter
      let ranOnce = false; // to track if the animation has played at least once
      if (!ranOnce) {
        this.animationFps = 10; // ignore the fps limit on first run
      } else if (this.performanceMode == "2" && ranOnce && this.animationFps !== 0) { // Sets the FPS to 0 for ultra performance mode
        this.animationFps = 0;
        return;
      }
      const interval = 1000 / this.animationFps; // 1000ms / desired FPS
      let lastTime = 0;

      // 7) the single RAF loop
      const animate = (time) => {
        if (this.animationFps === 0 && ranOnce) return; // for zero FPS, stop after first run

        // throttle to `fps`
        if (time - lastTime < interval) {
          this.blobAnimationId = requestAnimationFrame(animate);
          return;
        }
        lastTime = time;

        // clear + draw
        ctx.clearRect(0, 0, width, height);
        this.blobs.forEach((b, i) => {
          // move + bounce/respawn
          b.x += b.dx; b.y += b.dy;
          if (
            b.x < -b.r || b.x > width + b.r ||
            b.y < -b.r || b.y > height + b.r
          ) {
            this.blobs[i] = createBlob(true);
            return;
          }

          // draw gradient
          const grad = ctx.createRadialGradient(
            b.x, b.y, 0,
            b.x, b.y, b.r * 1.2
          );
          grad.addColorStop(0, hexToRgba(b.color, 0.9));
          grad.addColorStop(0.5, hexToRgba(b.color, 0.4));
          grad.addColorStop(1, 'transparent');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // schedule next frame
        this.blobAnimationId = requestAnimationFrame(animate);
        ranOnce = true;
      };

      // 8) kick it off
      this.blobAnimationId = requestAnimationFrame(animate);

      // 9) handle resizes too
      window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });
    },
    randomColor() {
      if (!this.gradientColors) {
        this.gradientColors = '#000000'; // Fallback color if gradientColors is not defined
      }
      const colors = Object.values(this.gradientColors);
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      const colorVariation = (color, amount) => {
        let usePound = false;
        if (color[0] === "#") {
          color = color.slice(1);
          usePound = true;
        }
        let num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        return (
          (usePound ? "#" : "") +
          ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")
        );
      };
      return colorVariation(baseColor, Math.floor(Math.random() * 20 - 10));
    },
    showNotification(msg) {
      this.message = msg;
      this.visible = true;
      setTimeout(() => this.visible = false, 8000); // auto-hide
    },
    async updateColors(newColors) {
      // 1) Recompute performance mode and FPS cap (if the user changed it)
      const perf = await loadSetting('PerformanceMode');
      if (perf == 0) {
        this.animationFps = 60; // default FPS for non-performance mode
      } else if (perf == 1) {
        this.animationFps = 5; // lower FPS for performance mode
      } else if (perf == 2) {
        this.animationFps = 0; // lower FPS for ultra performance mode
      } else {
        console.warn('PerformanceMode setting not found, defaulting to 5fps');
        this.animationFps = 5; // lower FPS for performance mode
      }
      console.log(`Updating colors with performance mode: ${perf} and FPS: ${this.animationFps}`);

      // 2) Setup tween parameters
      const duration = 1000; // ms
      const startTime = performance.now();
      const fromBg = { ...this.gradientColors };
      const toBg = { ...newColors };
      const palette = Object.values(toBg);

      // 3) Prepare each blob’s color tween
      this.blobs.forEach(b => {
        b.startColor = b.color;
        b.endColor = this.randomColorFromPalette(palette);
      });

      // 4) Throttle interval calculation
      const interval = 1000 / this.animationFps;
      let lastTime = startTime;

      // 5) Fixed-step RAF loop
      const step = now => {
        // throttle to your FPS cap
        if (now - lastTime < interval) {
          return requestAnimationFrame(step);
        }
        // advance lastTime by whole intervals only
        lastTime += interval * Math.floor((now - lastTime) / interval);

        // normalized progress [0…1]
        const t = Math.min(1, (now - startTime) / duration);

        // A) Update inline backgroundGradient
        const interpBg = {};
        for (let key of Object.keys(toBg)) {
          interpBg[key] = interpolateColor(fromBg[key], toBg[key], t);
        }
        this.gradientColors = interpBg;

        // B) Update each blob’s color
        this.blobs.forEach(b => {
          b.color = interpolateColor(b.startColor, b.endColor, t);
        });

        // continue or finish
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          // cleanup temporary props
          this.blobs.forEach(b => {
            delete b.startColor;
            delete b.endColor;
          });
        }
      };

      requestAnimationFrame(step);
    },
    animateHue() {
      let last = 0;
      const fps = 5;
      const interval = 1000 / fps;
      const loop = (t) => {
        if (t - last >= interval) {
          this.hue = (this.hue + 1) % 360;
          last = t;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },
    randomColorFromPalette(palette) {
      // palette = array of hex strings
      const base = palette[Math.floor(Math.random() * palette.length)]
      const variation = (hex, amt) => {
        let usePound = false;
        if (hex[0] === "#") { hex = hex.slice(1); usePound = true }
        let num = parseInt(hex, 16),
          r = (num >> 16) + amt,
          g = ((num >> 8) & 0xFF) + amt,
          b = (num & 0xFF) + amt;
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        const newHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
        return usePound ? `#${newHex}` : newHex;
      }
      // ±10 variation
      return variation(base, Math.floor(Math.random() * 21 - 10))
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.background {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  z-index: -1;
  background-size: 300% 300%;
  background-position: 0% 0%;
}

@keyframes moveColors {
  0% {
    background-position: 0% 0%;
  }

  50% {
    background-position: 100% 100%;
  }

  100% {
    background-position: 0% 0%;
  }
}

.blur-background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
  filter: blur(100px);
}

.blob {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.6;
  animation: floatBlobLowFPS 20s steps(100) infinite;
}

@keyframes floatBlobLowFPS {
  0% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(-100px, 150px) scale(1.1);
  }

  50% {
    transform: translate(200px, -100px) scale(0.9);
  }

  75% {
    transform: translate(-150px, -200px) scale(1.2);
  }

  100% {
    transform: translate(0, 0) scale(1);
  }
}

:root {
  height: 100%;
}

html {
  overflow-y: hidden;
  color: var(--background-color);
}

img {
  margin: 5px;
}

.notification-wrapper {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 30%;
}

.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateY(-100%) translateX(-50%);
  opacity: 0;
}

.slide-in-enter-to,
.slide-in-leave-from {
  transform: translateY(0) translateX(-50%);
  opacity: 1;
}

@keyframes spinClockwise {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinCounterclockwise {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(-360deg);
  }
}

.folderButton:hover i {
  animation: spinClockwise 0.6s ease forwards;
}

.folderButton i {
  animation: spinCounterclockwise 0.6s ease forwards;
}
</style>
