<script>
export default {
  name: "KeyHelper",
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>
<template>
  <div class="key-helper">
    <button @click="toggle" class="helper-toggle">
      {{ isOpen ? "Hide" : "Keys" }}
    </button>
    <transition name="slide">
      <div v-if="isOpen" class="helper-content">
        <div class="keys-vertical">
          <div class="key-section">
            <h4>Save/Load</h4>
            <div class="key-group">
              <span class="key">Ctrl+C</span>
              <span class="desc">save</span>
            </div>
            <div class="key-group">
              <span class="key">Ctrl+L</span>
              <span class="desc">load</span>
            </div>
          </div>

          <div class="key-section">
            <h4>Navigation</h4>
            <div class="key-group">
              <span class="key">↑↓←→</span>
              <span class="desc">move X/Z</span>
            </div>
            <div class="key-group">
              <span class="key">Q/E</span>
              <span class="desc">up/down Y</span>
            </div>
            <div class="key-group">
              <span class="key">R</span>
              <span class="desc">rotate</span>
            </div>
            <div class="key-group">
              <span class="key">Esc</span>
              <span class="desc">deselect</span>
            </div>
            <div class="key-group">
              <span class="key">Del/D</span>
              <span class="desc">delete</span>
            </div>
          </div>

          <div class="key-section">
            <h4>Colors</h4>
            <div class="key-group">
              <span class="key">1/2/3</span>
              <span class="desc">clear/red/green</span>
            </div>
          </div>

          <div class="key-section">
            <h4>Creation</h4>
            <div class="key-group">
              <span class="key">W</span>
              <span class="desc">wall</span>
            </div>
            <div class="key-group">
              <span class="key">F</span>
              <span class="desc">foundation</span>
            </div>
            <div class="key-group">
              <span class="key">P</span>
              <span class="desc">platform</span>
            </div>
            <div class="key-group">
              <span class="key">H</span>
              <span class="desc">hatch platform</span>
            </div>
            <div class="key-group">
              <span class="key">O</span>
              <span class="desc">door</span>
            </div>
            <div class="key-group">
              <span class="key">I</span>
              <span class="desc">window</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<style scoped>
.key-helper {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  font-family: monospace;
  font-size: 11px;
}
.helper-toggle {
  padding: 4px 8px;
  border: none;
  background: #156289;
  color: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}
.helper-content {
  margin-top: 4px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.keys-vertical {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
}
.key-section {
  border-bottom: 1px solid #444;
  padding-bottom: 4px;
}
.key-section:last-child {
  border-bottom: none;
}
.key-section h4 {
  margin: 0 0 3px 0;
  font-size: 10px;
  color: #ffb74d;
  text-transform: uppercase;
  font-weight: bold;
}
.key-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1px 0;
}
.key {
  color: #4fc3f7;
  font-weight: bold;
  white-space: nowrap;
}
.desc {
  color: #e0e0e0;
  font-size: 10px;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 200px;
  opacity: 1;
}
</style>
