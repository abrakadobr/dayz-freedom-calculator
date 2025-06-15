<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import UiPanel from "@/components/UiPanel.vue";
import KeyHelpmer from "@/components/KeyHelper.vue";

const waitms = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const loader = new GLTFLoader();
const jclone = (v) => JSON.parse(JSON.stringify(v));

const load = (name) =>
  new Promise((resolve) => {
    loader.load(
      "/glb/" + name + ".glb",
      (gltf) => {
        const c = gltf.scene.children[0];
        resolve(c);
      },
      undefined,
      (err) => {
        console.error("load error", name, err);
        resolve(null);
      }
    );
  });

const d3 = {
  scene: null,
  camera: null,
  renderer: null,
  grid: null,
  lgrid: null,
  controls: null,
  ambient: null,
  lights: {},
  models: {},
  materials: {},
};

export default {
  name: "HomeView",
  components: {
    UiPanel,
    KeyHelpmer,
  },
  data() {
    return {
      cursor: [0, 1, 0],
      lock: null,
      selection: null,
      construction: {},
      hiddenFloors: [],
    };
  },
  async created() {
    await waitms(0);
    d3.scene = new THREE.Scene();
    d3.scene.background = new THREE.Color(0x666666);
    const rect = this.$refs.v3d.getBoundingClientRect();
    d3.camera = new THREE.PerspectiveCamera(
      50,
      rect.width / rect.height,
      0.1,
      1000
    );
    d3.camera.position.x = 5;
    d3.camera.position.z = 5;
    d3.camera.position.y = 5;
    d3.camera.lookAt(new THREE.Vector3(0, 0, 0));

    d3.renderer = new THREE.WebGLRenderer({
      canvas: this.$refs.canvas,
      alpha: true,
      antialias: true,
    });

    d3.renderer.shadowMap.enabled = true;
    d3.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    d3.renderer.setSize(rect.width, rect.height);
    d3.renderer.setAnimationLoop(() => this.animate());

    // d3.grid = new THREE.GridHelper(20, 10)
    // d3.scene.add(d3.grid)

    d3.lgrid = new THREE.GridHelper(10, 10, 0xaaaaff, 0x9999bb);
    d3.scene.add(d3.lgrid);

    d3.controls = new OrbitControls(d3.camera, this.$refs.canvas);
    d3.controls.target.set(0, 0, 0);

    d3.lights.ambient = new THREE.AmbientLight(0xffffff, 0.6);
    d3.scene.add(d3.lights.ambient);
    d3.lights.hemi = new THREE.HemisphereLight(0xddaaff, 0x564345, 0.8);
    d3.scene.add(d3.lights.hemi);

    // directional light
    d3.lights.dir = new THREE.DirectionalLight(0xffffff, 2);
    d3.lights.dir.position.set(10, 20, 10);
    d3.lights.dir.castShadow = true;

    // SHADOW MAP settings
    d3.lights.dir.shadow.mapSize.width = 2048;
    d3.lights.dir.shadow.mapSize.height = 2048;
    d3.lights.dir.shadow.camera.near = 0.5;
    d3.lights.dir.shadow.camera.far = 50;
    d3.lights.dir.shadow.camera.left = -20;
    d3.lights.dir.shadow.camera.right = 20;
    d3.lights.dir.shadow.camera.top = 20;
    d3.lights.dir.shadow.camera.bottom = -20;

    d3.scene.add(d3.lights.dir);

    const cursorGeometry = new THREE.PlaneGeometry(1, 1);
    const cursorMaterial = new THREE.MeshBasicMaterial({
      color: 0x156289,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    d3.cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
    d3.cursor.rotateX(Math.PI / 2);
    d3.cursor.position.set(
      this.cursor[0] + 0.5,
      this.cursor[1] - 1,
      this.cursor[2] + 0.5
    );
    d3.scene.add(d3.cursor);
    d3.bbox = new THREE.BoxHelper();
    d3.bbox.renderOrder = 1000;
    d3.scene.add(d3.bbox);

    const mplaneGeometry = new THREE.PlaneGeometry(100, 100);
    d3.mplane = new THREE.Mesh(mplaneGeometry, cursorMaterial);
    d3.mplane.layers.set(2);
    d3.mplane.rotateX(Math.PI / 2);
    d3.scene.add(d3.mplane);

    await this.loadModel("foundation");
    await this.loadModel("door");
    await this.loadModel("window");
    await this.loadModel("wall");
    await this.loadModel("loongroof");
    await this.loadModel("platform");
    await this.loadModel("platformhole");
    await this.loadModel("ramp");
    await this.loadModel("smallroof");
    await this.loadModel("stairs");

    d3.materials.wood = new THREE.MeshStandardMaterial({
      color: 0x9e8163,
      transparent: true,
    });
    d3.materials.gray = new THREE.MeshStandardMaterial({
      color: 0x4e4e4e,
      transparent: true,
    });
    d3.materials.red = new THREE.MeshStandardMaterial({
      color: 0x9e4e4e,
      transparent: true,
    });
    d3.materials.green = new THREE.MeshStandardMaterial({
      color: 0x4e9e4e,
      transparent: true,
    });

    d3.raycaster = new THREE.Raycaster();
  },
  mounted() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", this.onWindowResize);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.onWindowResize);
  },
  methods: {
    onWindowResize() {
      const rect = this.$refs.v3d.getBoundingClientRect();
      d3.renderer.setSize(rect.width, rect.height);
      d3.camera.aspect = rect.width / rect.height;
      d3.camera.updateProjectionMatrix();
    },
    onKeyDown(event) {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }
      const preventDefaultKeys = [
        "Delete",
        "Backspace",
        // "KeyR",
        // "KeyW",
        // "KeyA",
        // "KeyS",
        // "KeyD",
      ];
      if (preventDefaultKeys.includes(event.code)) {
        event.preventDefault();
      }
      switch (event.code) {
        case "Delete":
        case "Backspace":
        case "KeyD":
          this.removeSelection();
          break;

        case "KeyR":
          this.rotateSelection();
          break;

        case "Escape":
          this.onDeselect();
          break;

        // tile moving
        case "ArrowUp":
          this.moveCursor(0, 0, -1);
          break;

        case "ArrowDown":
          this.moveCursor(0, 0, 1);
          break;

        case "ArrowLeft":
          this.moveCursor(-1, 0, 0);
          break;

        case "ArrowRight":
          this.moveCursor(1, 0, 0);
          break;

        // elevation / floors
        case "KeyQ":
          this.moveCursor(0, 1, 0);
          break;

        case "KeyE":
          this.moveCursor(0, -1, 0);
          break;

        // colors
        case "Digit1":
          this.setColor("clear");
          break;

        case "Digit2":
          this.setColor("red");
          break;

        case "Digit3":
          this.setColor("green");
          break;

        // element creation
        case "KeyW":
          this.addPart("wall");
          break;

        case "KeyF":
          this.addPart("foundation");
          break;

        case "KeyP":
          this.addPart("platform");
          break;
        case "KeyH":
          this.addPart("platformhole");
          break;

        case "KeyO":
          this.addPart("door");
          break;

        case "KeyI":
          this.addPart("window");
          break;

        // add more

        // save
        case "KeyC":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.save();
          }
          break;
        // load
        case "KeyL":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.$refs.uiPanel.$refs.fileInput.click();

            // this.loadFile();
          }
          break;
      }
    },
    moveCursor(dx, dy, dz) {
      // if (this.lock) return;
      const newCursor = [
        this.cursor[0] + dx,
        this.cursor[1] + dy,
        this.cursor[2] + dz,
      ];
      this.updateCursor(newCursor);
    },
    animate() {
      d3.controls.update(); // redundant
      d3.renderer.render(d3.scene, d3.camera);
    },
    async loadModel(name) {
      const m = await load(name);
      d3.models[name] = m;
    },
    updateCursor(pos) {
      this.cursor = pos;
      d3.cursor.position.set(
        this.cursor[0] + 0.5,
        this.cursor[1] - 0.999, // a bit upper than grid\geometry
        this.cursor[2] + 0.5
      );
      d3.lgrid.position.y = this.cursor[1] - 1;
      d3.mplane.position.y = this.cursor[1] - 1;
    },
    addPart(part) {
      const pm = ["rampup", "rampdown"].includes(part) ? "ramp" : part;
      if (!d3.models[pm]) return;
      const m = d3.materials.wood.clone();
      const mesh = new THREE.Mesh(d3.models[pm].geometry, m);
      mesh.scale.set(0.5, 0.5, 0.5);
      mesh.position.set(
        this.cursor[0] + 0.5,
        this.cursor[1] - 1.5,
        this.cursor[2] + 0.5
      );

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      mesh.layers.enable(1);
      d3.scene.add(mesh);

      if (!["foundation", "platform", "platformhole"].includes(part))
        mesh.position.y += 1;
      if (part === "rampdown") mesh.position.y -= 1;
      if (part === "rampup") mesh.position.y -= 0.5;
      if (part === "stairs") mesh.position.y -= 0.5;
      if (part === "loongroof") mesh.position.y -= 0.5;
      mesh.layers.enable(1);
      d3.scene.add(mesh);
      this.construction[mesh.uuid] = {
        part,
        position: [...this.cursor],
        rotation: 0,
        color: "clear",
      };
      this.selection = mesh;
      d3.bbox.setFromObject(this.selection);
      d3.bbox.visible = true;
      this.lock = [...this.cursor];
    },
    rotateSelection() {
      if (!this.selection) {
        return;
      }
      this.selection.rotateY(Math.PI / 2);
      this.construction[this.selection.uuid].rotation++;
      if (this.construction[this.selection.uuid].rotation >= 4)
        this.construction[this.selection.uuid].rotation -= 4;
      d3.bbox.update();
    },
    removeSelection() {
      if (!this.selection) return;
      delete this.construction[this.selection.uuid];
      this.selection.removeFromParent();
      this.selection = null;
      d3.bbox.visible = false;
    },
    onDeselect() {
      this.selection = null;
      d3.bbox.visible = false;
      this.lock = null;
    },
    onClick(event) {
      // const raycaster = new THREE.Raycaster();
      d3.raycaster.layers.set(1);
      const pointer = new THREE.Vector2();
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      d3.raycaster.setFromCamera(pointer, d3.camera);

      // calculate objects intersecting the picking ray
      const intersects = d3.raycaster.intersectObjects(d3.scene.children);
      if (intersects[0] && intersects[0].object) {
        if (
          this.selection &&
          intersects[0].object.uuid === this.selection.uuid
        ) {
          this.onDeselect();
        } else {
          this.selection = intersects[0].object;
          d3.bbox.setFromObject(this.selection);
          d3.bbox.visible = true;
          this.lock = [...this.cursor];
        }
      } else {
        if (!this.lock) this.lock = [...this.cursor];
        else this.lock = null;
      }
    },
    onMove(event) {
      if (this.lock || !d3.raycaster) return;
      d3.raycaster.layers.set(2);
      const pointer = new THREE.Vector2();
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      d3.raycaster.setFromCamera(pointer, d3.camera);

      // calculate objects intersecting the picking ray
      const intersects = d3.raycaster.intersectObjects(d3.scene.children);
      if (intersects[0]) {
        const p = intersects[0].point;
        const cur = [...this.cursor];
        this.updateCursor([Math.floor(p.x), cur[1], Math.floor(p.z)]);
      }
    },
    setColor(color) {
      if (!this.selection) return;
      let m = d3.materials.wood;
      if (color === "clear") m = d3.materials.wood;
      if (color === "red") m = d3.materials.red;
      if (color === "green") m = d3.materials.green;
      this.selection.material = m.clone();
      this.construction[this.selection.uuid].color = color;
    },
    toggleFloor(l) {
      if (!this.hiddenFloors.includes(l)) this.hiddenFloors.push(l);
      else this.hiddenFloors = this.hiddenFloors.filter((v) => v !== l);
      this.setFloors();
    },
    setFloors() {
      Object.keys(this.construction).forEach((id) => {
        const p = this.construction[id];
        const f = p.position[1];
        const part = d3.scene.getObjectByProperty("uuid", id);
        if (!part) return;
        if (this.hiddenFloors.includes(f)) {
          part.layers.disable(1);
          part.material.opacity = 0.1;
        } else {
          part.layers.enable(1);
          part.material.opacity = 1;
        }
      });
    },
    save() {
      const data = {
        type: "construction/freedom",
        version: 1,
        construction: jclone(this.construction),
        floors: jclone(this.hiddenFloors),
      };
      const str = JSON.stringify(data);
      const blob = new Blob([str], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "construction.json";
      link.click();
    },
    async loadFile(f) {
      const txt = await f.text();
      let json = null;
      try {
        json = JSON.parse(txt);
      } catch (err) {
        console.error("read file", err);
        json = null;
      }
      if (!json) return;
      if (json.type !== "construction/freedom" || json.version !== 1) {
        console.error("format not supported");
        return;
      }
      this.reset();
      Object.values(json.construction).forEach((p) => {
        this.updateCursor(p.position);
        this.addPart(p.part);
        this.setColor(p.color);
        for (let i = p.rotation; i > 0; i--) this.rotateSelection();
      });
      this.hiddenFloors = [...json.floors];
      this.setFloors();
    },
    reset() {
      this.onDeselect();
      this.selection = null;
      Object.keys(this.construction).forEach((k) => {
        const p = d3.scene.getObjectByProperty("uuid", k);
        if (!p) return;
        p.removeFromParent();
      });
      this.updateCursor([0, 1, 0]);
    },
  },
  watch: {
    layer(next) {
      d3.lgrid.position.y = next - 1;
    },
  },
};
</script>

<template>
  <div class="home wh-100">
    <div class="view-3d wh-100 position-relative" ref="v3d">
      <canvas @click="onClick" ref="canvas" @mousemove="onMove" />
      <UiPanel
        :construction="construction"
        :selected="selection ? selection.uuid : null"
        @remove="removeSelection"
        @rotate="rotateSelection"
        @deselect="onDeselect"
        @add-part="addPart"
        :cursor="cursor"
        @color="setColor"
        @save="save"
        @load-file="loadFile"
        @toggle-floor="toggleFloor"
        @update-pos="updateCursor"
        ref="uiPanel"
      />
      <KeyHelpmer />
    </div>
  </div>
</template>
