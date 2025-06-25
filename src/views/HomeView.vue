<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import UiPanel from "@/components/UiPanel.vue";
import KeyHelpmer from "@/components/KeyHelper.vue";
import ToolBar from "@/components/ToolBar.vue";

const waitms = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const loader = new GLTFLoader();
const jclone = (v) => JSON.parse(JSON.stringify(v));

const load = (name, singleChild = true) =>
  new Promise((resolve) => {
    loader.load(
      "/glb/" + name + ".glb",
      (gltf) => {
        const c = singleChild ? gltf.scene.children[0] : gltf.scene
        resolve(c);
      },
      undefined,
      (err) => {
        console.error("load error", name, err);
        resolve(null);
      }
    );
  });

const removeObject3D = object3D => {
  if (!(object3D instanceof THREE.Object3D)) return false;

  // for better memory management and performance
  if (object3D.geometry) object3D.geometry.dispose();

  if (object3D.material) {
    if (object3D.material instanceof Array) {
      // for better memory management and performance
      object3D.material.forEach(material => material.dispose());
    } else {
      // for better memory management and performance
      object3D.material.dispose();
    }
  }
  object3D.removeFromParent(); // the parent might be the scene or another Object3D, but it is sure to be removed this way
  return true;
}

const canvas2img = canvas => new Promise(resolve => {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    resolve(url)
  })
})

const SHIFTS = {
  foundation: 0.5,
  platform: -0.55,
  platformhole: -0.55,
  stairs: +0.5,
  wall: +0.5,
  window: +0.5,
  door: +0.5,
  rampup: +0.45,
  rampdown: -0.05,
  longroof: 0.5,
  smallroof: 0.5
}

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
  holo: null
};

export default {
  name: "HomeView",
  components: {
    UiPanel,
    KeyHelpmer,
    ToolBar,
  },
  data() {
    return {
      cursor: [0, 1, 0],
      tool: 'select',
      lock: null,
      selection: null,
      construction: {},
      hiddenFloors: [],
      holoR: 0,
      cads: {}
    };
  },
  async created() {
    await waitms(0);
    d3.scene = new THREE.Scene();
    d3.scene.background = new THREE.Color(0x666666);
    const rect = this.$refs.v3d.getBoundingClientRect();
    d3.camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 100);

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
    d3.renderer.outputColorSpace = THREE.SRGBColorSpace;

    d3.renderer.setSize(rect.width, rect.height);
    d3.renderer.setAnimationLoop(() => this.animate());

    // d3.grid = new THREE.GridHelper(20, 10)
    // d3.scene.add(d3.grid)

    d3.lgrid = new THREE.GridHelper(10, 10, 0xaaaaff, 0x9999bb);
    d3.scene.add(d3.lgrid);

    d3.controls = new OrbitControls(d3.camera, this.$refs.canvas);
    d3.controls.target.set(0, 0, 0);

    // Ambient light
    d3.lights.ambient = new THREE.AmbientLight(0xffffff, 0.6);
    d3.scene.add(d3.lights.ambient);

    // Hemisphere light
    d3.lights.hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
    d3.scene.add(d3.lights.hemi);

    // Directional light
    d3.lights.dir = new THREE.DirectionalLight(0xffffff, 2.5);
    d3.lights.dir.position.set(10, 20, 10);
    d3.lights.dir.castShadow = true;
    d3.lights.dir.shadow.bias = -0.005;

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
    d3.cursorMaterial = new THREE.MeshBasicMaterial({
      color: 0x156289,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    d3.cursor = new THREE.Mesh(cursorGeometry, d3.cursorMaterial);
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
    d3.mplane = new THREE.Mesh(mplaneGeometry, d3.cursorMaterial);
    d3.mplane.layers.set(2);
    d3.mplane.rotateX(Math.PI / 2);
    d3.scene.add(d3.mplane);

    await this.loadModels()
    await this.loadCads()

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
          if (d3.holo) {
            this.onTool('select')
          } else {
            this.onDeselect();
          }
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
          this.onTool("wall");
          break;

        case "KeyF":
          this.onTool("foundation");
          break;

        case "KeyP":
          this.onTool("platform");
          break;
        case "KeyH":
          this.onTool("platformhole");
          break;

        case "KeyO":
          this.onTool("door");
          break;

        case "KeyI":
          this.onTool("window");
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
    async loadModels() {
      const modulus = await load("modulus", false);

      if (modulus.children[0]?.material?.map) {
        modulus.children[0].material.map.anisotropy = d3.renderer.capabilities.getMaxAnisotropy();
        modulus.children[0].material.map.needsUpdate = true;
      }

      d3.models = {
        foundation: modulus.children.find(c => c.name === 'foundation'),
        door: modulus.children.find(c => c.name === 'door'),
        window: modulus.children.find(c => c.name === 'window'),
        wall: modulus.children.find(c => c.name === 'wall'),
        longroof: modulus.children.find(c => c.name === 'roof_long'),
        smallroof: modulus.children.find(c => c.name === 'roof_short'),
        platform: modulus.children.find(c => c.name === 'platform'),
        platformhole: modulus.children.find(c => c.name === 'hatch'),
        ramp: modulus.children.find(c => c.name === 'ramp'),
        stairs: modulus.children.find(c => c.name === 'stairs')
      };
    },
    async loadModel(name, code) {
      const m = await load(name);
      d3.models[code || name] = m;
    },
    async loadCads() {
      this.cads.foundation = await this.loadCad('foundation')
      this.cads.platform = await this.loadCad('platform')
      this.cads.platformhole = await this.loadCad('platformhole')
      this.cads.wall = await this.loadCad('wall')
      this.cads.door = await this.loadCad('door')
      this.cads.window = await this.loadCad('window')
      this.cads.stairs = await this.loadCad('stairs')
      this.cads.longroof = await this.loadCad('longroof')
      this.cads.smallroof = await this.loadCad('smallroof')
      this.cads.rampup = await this.loadCad('rampup')
      this.cads.rampdown = await this.loadCad('rampdown')
    },
    loadCad(part) {
      const img = document.createElement("img");
      img.width = 128;
      img.height = 128;
      return new Promise(resolve => {
        img.onload = () => {
          resolve(img)
        }
        img.src = "./svg/cad-" + part + ".svg";
      })
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
      if (d3.holo) {
        this.spMesh(d3.holo, this.tool, 0, false)
      }
    },
    addPart(part, rotation = 0, autoSelect = true) {
      const pm = ["rampup", "rampdown"].includes(part) ? "ramp" : part;
      if (!d3.models[pm]) return;
      // const m = d3.models[pm].material.clone();
      // m.transparent = true
      // const mesh = new THREE.Mesh(d3.models[pm].geometry, m);
      const mesh = this.getPart(pm);
      if (['wall', 'door', 'window'].includes(part))
        mesh.rotateY(-Math.PI)
      this.spMesh(mesh, part);
      /*
      mesh.scale.set(0.5, 0.5, 0.5);
      mesh.position.set(
        this.cursor[0] + 0.5,
        this.cursor[1] - 1.5,
        this.cursor[2] + 0.5
      );
      */

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      //mesh.layers.enable(1);
      d3.scene.add(mesh);

      /*
      if (!["foundation", "platform", "platformhole"].includes(part))
        mesh.position.y += 1;
      if (part === "rampdown") mesh.position.y -= 1;
      if (part === "rampup") mesh.position.y -= 0.5;
      if (part === "stairs") mesh.position.y -= 0.5;
      if (part === "longroof") mesh.position.y -= 0.5;
      mesh.layers.enable(1);
      d3.scene.add(mesh);
      */
      for (let i = rotation; i > 0; i--)
        mesh.rotateY(Math.PI / 2);
      this.construction[mesh.uuid] = {
        part,
        position: [...this.cursor],
        rotation,
        color: "clear",
      };
      if (!autoSelect) return mesh
      this.selection = mesh;
      d3.bbox.setFromObject(this.selection);
      d3.bbox.visible = true;
      this.lock = [...this.cursor];
      return mesh
    },
    spMesh(m, part, shiftY = 0, doScale = true) {
      if (doScale)
        m.scale.set(0.5, 0.5, 0.5);
      if (SHIFTS[part]) shiftY += SHIFTS[part]
      // if (part === 'stairs')
      // m.rotateY(-Math.PI / 2)
      // if (['wall', 'door', 'window'].includes(part))
      // m.rotateY(-Math.PI)
      m.position.set(
        this.cursor[0] + 0.5,
        this.cursor[1] - 1.5 + shiftY, // + (this.cursor[1] - 1) * 0.1,
        this.cursor[2] + 0.5
      );
      /*
      if (!["foundation", "platform", "platformhole"].includes(part))
        m.position.y += 1;
      if (part === "rampdown") m.position.y -= 1;
      if (part === "rampup") m.position.y -= 0.5;
      if (part === "stairs") m.position.y -= 0.5;
      if (part === "longroof") m.position.y -= 0.5;
      */
    },
    rotateSelection() {
      if (d3.holo) {
        d3.holo.rotateY(Math.PI / 2);
        this.holoR++
        if (this.holoR >= 4) this.holoR -= 4
        return
      }
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
    onTool(next) {
      const last = this.tool
      if (this.tool === next) {
        if (next === 'select') return
        return this.onTool('select')
      }
      this.tool = next
      this.onDeselect()
      if (this.tool === 'select') {
        if (d3.holo) {
          removeObject3D(d3.holo)
          d3.holo = null
          this.holoR = 0
        }
        d3.cursor.visible = true
        return
      }
      const mod = this.tool === 'rampup' || this.tool === 'rampdown'
        ? 'ramp'
        : this.tool
      if (!d3.models[mod]) {
        console.warn('unknown tool', mod)
        return
      }
      d3.cursor.visible = false
      if (d3.holo) removeObject3D(d3.holo)
      // console.log('clone mod', mod, d3.models[mod])
      d3.holo = this.getPart(mod, d3.cursorMaterial)
      if (['wall', 'window', 'door'].includes(mod))
        d3.holo.rotateY(-Math.PI)
      if (last === 'select')
        this.holoR = 0
      else
        for (let i = this.holoR; i > 0; i--)
          d3.holo.rotateY(Math.PI / 2)
      this.spMesh(d3.holo, this.tool, -1)
      d3.scene.add(d3.holo)
    },
    getPart(part, mat = null) {
      let ret = null
      if (part === 'smallroof' || part === 'longroof') {
        const holoG0 = d3.models[part].children[0].geometry.clone()
        const holoG1 = d3.models[part].children[1].geometry.clone()
        ret = new THREE.Group()
        const mat1 = mat ? mat.clone() : d3.models[part].children[0].material.clone()
        const mat2 = mat ? mat.clone() : d3.models[part].children[1].material.clone()
        if (!mat) {
          mat1.transparent = true
          mat2.transparent = true
        }
        const m1 = new THREE.Mesh(holoG0, mat1)
        const m2 = new THREE.Mesh(holoG1, mat2)
        if (!mat) {
          m1.layers.enable(1)
          m2.layers.enable(1)
        }
        ret.add(m1)
        ret.add(m2)
      } else {
        const holoG = d3.models[part].geometry.clone()
        const material = mat ? mat.clone() : d3.models[part].material.clone()
        if (!mat) material.transparent = true
        ret = new THREE.Mesh(holoG, material)
        if (!mat) ret.layers.enable(1)
      }
      return ret
    },
    onClick(event) {
      if (d3.holo) {
        this.addPart(this.tool, this.holoR, false)
        return;
      }
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
          const p = intersects[0].object.parent;
          if (p.isScene) {
            this.selection = intersects[0].object;
          }
          if (p.isGroup) {
            this.selection = intersects[0].object.parent;
          }
          d3.bbox.setFromObject(this.selection);
          d3.bbox.visible = true;
          // this.lock = [...this.cursor];
        }
        // } else {
        // if (!this.lock) this.lock = [...this.cursor];
        // else this.lock = null;
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
    _setColor(obj, color) {
      const m = obj.material
      if (!m) return
      if (color === "clear") m.emissiveIntensity = 0
      else m.emissiveIntensity = 0.1
      if (color === 'green') m.emissive = new THREE.Color(0x00ff00)
      if (color === 'red') m.emissive = new THREE.Color(0xff0000)
    },
    setColor(color) {
      if (!this.selection) return;
      if (this.selection.material) {
        this._setColor(this.selection, color)
        // const m = this.selection.material
        // // console.log(m, this.selection)
        // if (color === "clear") m.emissiveIntensity = 0
        // else m.emissiveIntensity = 0.1
        // if (color === 'green') m.emissive = new THREE.Color(0x00ff00)
        // if (color === 'red') m.emissive = new THREE.Color(0xff0000)
        if (!this.construction[this.selection.uuid])
          this.construction[this.selection.uuid] = {}
        this.construction[this.selection.uuid].color = color;
      } else {
        if (this.selection.isGroup) {
          // console.log('setColor', 'isGroup', this.selection.uuid, this.construction[this.selection.uuid])
          this.selection.children.forEach((c) => {
            this._setColor(c, color)
          })
        }
      }
      /*
      let m = d3.materials.wood;
      if (color === "clear") m = d3.materials.wood;
      if (color === "red") m = d3.materials.red;
      if (color === "green") m = d3.materials.green;
      this.selection.material = m.clone();
      this.construction[this.selection.uuid].color = color;
      */
      // this.construction[this.selection.uuid].color = color;
    },
    toggleFloor(l) {
      if (!this.hiddenFloors.includes(l)) this.hiddenFloors.push(l);
      else this.hiddenFloors = this.hiddenFloors.filter((v) => v !== l);
      this.setFloors();
    },
    _setOpacity(obj, val) {
      if (!obj) return
      if (obj.isGroup) {
        obj.children.forEach((c) => {
          this._setOpacity(c, val)
        })
      } else {
        if (val) {
          obj.layers.disable(1)
          obj.material.opacity = 0.05
        } else {
          obj.layers.enable(1)
          obj.material.opacity = 1
        }
      }
    },
    setFloors() {
      Object.keys(this.construction).forEach((id) => {
        const p = this.construction[id];
        const f = p.position[1];
        const part = d3.scene.getObjectByProperty("uuid", id);
        if (!part) return;
        this._setOpacity(part, this.hiddenFloors.includes(f))
        /*
        if (this.hiddenFloors.includes(f)) {
          part.layers.disable(1);
          part.material.opacity = 0.05;
        } else {
          part.layers.enable(1);
          part.material.opacity = 1;
        }
        */
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
        this.addPart(p.part, p.rotation);
        this.setColor(p.color);
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
    async cad() {
      const dimensions = {
        x: null, y: null, z: null,
        layers: {}
      }
      Object.values(this.construction).forEach((p) => {
        if (!dimensions.x) dimensions.x = { min: p.position[0], max: p.position[0] }
        if (!dimensions.y) dimensions.y = { min: p.position[1], max: p.position[1] }
        if (!dimensions.z) dimensions.z = { min: p.position[2], max: p.position[2] }
        dimensions.x.min = Math.min(dimensions.x.min, p.position[0])
        dimensions.x.max = Math.max(dimensions.x.max, p.position[0])
        dimensions.y.min = Math.min(dimensions.y.min, p.position[1])
        dimensions.y.max = Math.max(dimensions.y.max, p.position[1])
        dimensions.z.min = Math.min(dimensions.z.min, p.position[2])
        dimensions.z.max = Math.max(dimensions.z.max, p.position[2])
        if (!dimensions.layers[`l${p.position[1]}`])
          dimensions.layers[`l${p.position[1]}`] = []
        dimensions.layers[`l${p.position[1]}`].push(p)
      })
      // console.log('CAD', dimensions)
      const ROT = {
        door: 3,
        wall: 3,
        window: 3
      }
      const imgW = dimensions.x.max - dimensions.x.min + 3
      const imgH = dimensions.z.max - dimensions.z.min + 3
      const floors = []
      for (let f = dimensions.y.min; f <= dimensions.y.max; f++) {
        const floor = document.createElement('canvas')
        floor.width = imgW * 128
        floor.height = imgH * 128
        const ctx = floor.getContext('2d')
        Object.values(this.construction).forEach(p => {
          if (p.position[1] !== f) return
          if (!this.cads[p.part]) return
          const dx = (p.position[0] - dimensions.x.min + 1) * 128
          const dy = (p.position[2] - dimensions.z.min + 1) * 128
          ctx.translate(dx + 64, dy + 64)
          const pr = ROT[p.part] || 0
          for (let r = 0; r <= p.rotation + pr; r++)
            ctx.rotate(-Math.PI / 2)
          // console.log('draw at', p.part, p.color, dx, dy)
          ctx.drawImage(this.cads[p.part], -64, -64)
          if (p.color === 'green') {
            ctx.fillStyle = '#00FF0033'
            ctx.fillRect(-64, -64, 128, 128)
          }
          if (p.color === 'red') {
            ctx.fillStyle = '#FF000033'
            ctx.fillRect(-64, -64, 128, 128)
          }
          ctx.fillStyle = '#FFFFFF'
          ctx.setTransform(1, 0, 0, 1, 0, 0)
        })
        // document.body.appendChild(floor)
        // const img = floor.toDataURL('image/png')
        // const url = URL.createObjectURL(new Blob([img], { type: 'image/png' }))
        // window.open(url, '_blank')
        ctx.fillStyle = '#000000'
        ctx.font = '32px monospace'
        ctx.fillText(this.$t('ui.floor', { num: f }), 64, 64)
        floors.push(floor)
      }
      const urls = await Promise.all(floors.map(f => canvas2img(f)))
      urls.forEach(url => window.open(url, '_blank'))
      // console.log('floors', floors, urls)
    }
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
      <UiPanel :floors="hiddenFloors" :construction="construction" :selected="selection ? selection.uuid : null"
        @remove="removeSelection" @rotate="rotateSelection" @deselect="onDeselect" @add-part="addPart" :cursor="cursor"
        @color="setColor" @cad="cad" @save="save" @load-file="loadFile" @toggle-floor="toggleFloor"
        @update-pos="updateCursor" ref="uiPanel" @reset="reset" @up="moveCursor(0, 1, 0)"
        @down="moveCursor(0, -1, 0)" />
      <KeyHelpmer />
      <ToolBar :selection="selection" :tool="tool" @tool="onTool" @color="setColor" />
      <div class="about">abrakadobr 2025 for FREEDOM DayZ. 3D models and lights by Vlad Kobranov</div>
    </div>
  </div>
</template>

<style>
.about {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  font-size: 11px;
  font-family: 'monospace';
  font-weight: bold;
  color: #156289;
}
</style>
