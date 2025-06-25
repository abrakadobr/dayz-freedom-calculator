<script>
import CursorIcon from '@/assets/icons/cursor.svg'
import FloorsIcon from '@/assets/icons/floors.svg'
import NailsIcon from '@/assets/icons/nails.svg'
import PlanksIcon from '@/assets/icons/planks.svg'
import CodelockIcon from '@/assets/icons/codelock.svg'
import CadIcon from '@/assets/icons/cad.svg'

import SaveIcon from '@/assets/icons/save.svg'
import LoadIcon from '@/assets/icons/load.svg'
import NewIcon from '@/assets/icons/new.svg'

import UpIcon from '@/assets/icons/up.svg'
import DownIcon from '@/assets/icons/down.svg'


export default {
  name: "UiPanel",
  emits: [
    "addPart",
    "updatePos",
    "remove",
    "rotate",
    "deselect",
    "color",
    "toggleFloor",
    "save",
    "loadFile",
    "reset",
    "up",
    "down",
    "cad"
  ],
  components: {
    UpIcon,
    DownIcon,
    SaveIcon,
    LoadIcon,
    NewIcon,
    CursorIcon,
    NailsIcon,
    PlanksIcon,
    CodelockIcon,
    FloorsIcon,
    CadIcon
  },
  props: {
    cursor: {
      type: Array,
      required: true,
      default: () => [0, 1, 0],
    },
    selected: {
      type: [String, null, undefined],
      required: false,
    },
    construction: {
      type: [Object, null],
      required: false,
      default: () => ({}),
    },
    floors: {
      type: [Array, null, undefined],
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      cpos: {
        x: this.cursor[0],
        y: this.cursor[1],
        z: this.cursor[2],
      },
    };
  },
  watch: {
    cursor: {
      deep: true,
      handler(next) {
        if (next[0] !== this.cpos.x) this.cpos.x = next[0];
        if (next[1] !== this.cpos.y) this.cpos.y = next[1];
        if (next[2] !== this.cpos.z) this.cpos.z = next[2];
      },
    },
    cpos: {
      deep: true,
      handler(next) {
        if (
          next.x !== this.cursor[0] ||
          next.y !== this.cursor[1] ||
          next.z !== this.cursor[2]
        )
          this.$emit("updatePos", [next.x, next.y, next.z]);
      },
    },
  },
  computed: {
    parts() {
      return Object.values(this.construction).filter(p => !this.floors.includes(p.position[1]));
    },
    resources() {
      const res = {
        nails: 0,
        planks: 0,
        codelocks: 0,
      };
      this.parts.forEach((p) => {
        if (p.part === "door") {
          res.nails += 28;
          res.planks += 8;
          res.codelocks += 1;
        } else {
          res.nails += 20;
          res.planks += 10;
        }
      });
      return res;
    },
    layers() {
      const ret = [];
      Object.values(this.construction).forEach((p) => {
        if (!p.position) {
          console.error('p.!position', p)
          return
        }
        const l = p.position[1];
        if (!ret.includes(l)) ret.push(l);
      });
      return ret.sort();
    }
  },
  methods: {
    ceil(num, b) {
      return Math.ceil(num / b);
    },
    toggleFloor(l) {
      this.$emit("toggleFloor", l);
    },
    toggleLocale() {
      const list = this.$i18n.availableLocales;
      const current = list.findIndex((l) => l === this.$i18n.locale);
      const next = current === list.length - 1 ? 0 : current + 1;
      this.$i18n.locale = list[next]
      localStorage.setItem('locale', this.$i18n.locale)
    }
  },
};
</script>

<template>
  <div class="ui-panel">
    <div class="tool-group">
      <div :title="$t('ui.floors')" class="tool-button">
        <FloorsIcon />
      </div>
      <template v-for="l of layers" :key="l">
        <button @click="$emit('toggleFloor', l)" class="tool-button" :class="{ 'selected': !floors.includes(l) }">
          {{ l }}
        </button>
      </template>
      <button :title="$t('ui.cad')" @click="$emit('cad')" class="tool-button" :class="{ 'selected': layers.length }"
        :disabled="!layers.length">
        <CadIcon />
      </button>
    </div>
    <div class="tool-group">
      <div :title="$t('ui.planks')" class="tool-button">
        <PlanksIcon />
      </div>
      <div :title="$t('ui.planks')" class="tool-button selected tool-button-w2">
        {{ resources.planks }}
      </div>
      <div :title="$t('ui.nails')" class="tool-button">
        <NailsIcon />
      </div>
      <div :title="$t('ui.nails')" class="tool-button selected tool-button-w2">
        {{ resources.nails }}
      </div>
      <div :title="$t('ui.codelocks')" class="tool-button">
        <CodelockIcon />
      </div>
      <div :title="$t('ui.codelocks')" class="tool-button selected tool-button-w2">
        {{ resources.codelocks }}
      </div>
    </div>
  </div>
  <div class="bottom-panel">
    <div class="tool-group">
      <button :title="$t('ui.wpup')" @click="$emit('up')" class="tool-button">
        <UpIcon />
      </button>
      <button :title="$t('ui.wpdown')" @click="$emit('down')" class="tool-button">
        <DownIcon />
      </button>
    </div>
    <div :title="$t('ui.position')" class="tool-group">
      <div class="tool-button">
        <CursorIcon />
      </div>
      <div class="tool-button">
        {{ cursor[0] }}
      </div>
      <div class="tool-button">
        {{ cursor[1] }}
      </div>
      <div class="tool-button">
        {{ cursor[2] }}
      </div>
    </div>
    <div class="tool-group">
      <button :title="$t('ui.save')" @click="$emit('save')" class="tool-button">
        <SaveIcon />
      </button>
      <label :title="$t('ui.load')" for="load-file" class="tool-button">
        <LoadIcon />
        <input type="file" id="load-file" class="d-none" accept=".json" ref="fileInput"
          @change="$emit('loadFile', $event.target.files[0])" />
      </label>
      <button :title="$t('ui.reset')" @click="$emit('reset')" class="tool-button">
        <NewIcon />
      </button>
    </div>
    <div class="tool-group">
      <button :title="$t('ui.lang')" @click="toggleLocale" class="tool-button">
        {{ $t('lang.' + $i18n.locale) }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tool-button-w2 {
  width: 64px;
}

.bottom-panel {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: row;
  z-index: 100;

  .tool-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.ui-panel {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: row;
  z-index: 100;

  .tool-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
<!--
<template>
  <div class="ui-panel card col-auto m-2 position-absolute end-0 top-0">
    <div class="card-body">
      <h5 class="card-title">Position</h5>
      <div class="mb-2 input-group">
        <label class="input-group-text">Floor</label>
        <button
          @click="cpos.y--"
          :disabled="cpos.y <= -5"
          class="btn btn-outline-secondary"
        >
          -
        </button>
        <input
          v-model="cpos.y"
          type="number"
          min="-5"
          max="5"
          step="1"
          class="form-control"
        />
        <button
          @click="cpos.y++"
          :disabled="cpos.y >= 5"
          class="btn btn-outline-secondary"
        >
          +
        </button>
      </div>
      <div class="d-flex flex-row">
        <div class="mb-2 me-1 input-group">
          <label class="input-group-text">X</label>
          <button
            @click="cpos.x--"
            :disabled="cpos.x <= -5"
            class="btn btn-outline-secondary"
          >
            -
          </button>
          <input
            v-model="cpos.x"
            type="number"
            min="-5"
            max="10"
            step="1"
            class="form-control"
          />
          <button
            @click="cpos.x++"
            :disabled="cpos.x >= 5"
            class="btn btn-outline-secondary"
          >
            +
          </button>
        </div>
        <div class="mb-2 input-group">
          <label class="input-group-text">Y</label>
          <button
            @click="cpos.z--"
            :disabled="cpos.z <= -5"
            class="btn btn-outline-secondary"
          >
            -
          </button>
          <input
            v-model="cpos.z"
            type="number"
            min="-5"
            max="5"
            step="1"
            class="form-control"
          />
          <button
            @click="cpos.z++"
            :disabled="cpos.z >= 5"
            class="btn btn-outline-secondary"
          >
            +
          </button>
        </div>
      </div>
      <h5 class="card-title">Spawn</h5>
      <div class="btn-group-vertical w-100" role="group">
        <div class="btn-group w-100">
          <button
            @click="$emit('addPart', 'foundation')"
            class="w-50 btn btn-outline-secondary"
          >
            Foundation
          </button>
          <button
            @click="$emit('addPart', 'wall')"
            class="w-50 btn btn-outline-secondary"
          >
            Wall
          </button>
        </div>
        <div class="btn-group w-100">
          <button
            @click="$emit('addPart', 'door')"
            class="w-50 btn btn-outline-secondary"
          >
            Door wall
          </button>
          <button
            @click="$emit('addPart', 'window')"
            class="w-50 btn btn-outline-secondary"
          >
            Window wall
          </button>
        </div>
        <div class="btn-group w-100">
          <button
            @click="$emit('addPart', 'platform')"
            class="w-50 btn btn-outline-secondary"
          >
            Platform
          </button>
          <button
            @click="$emit('addPart', 'platformhole')"
            class="w-50 btn btn-outline-secondary"
          >
            Hatch platform
          </button>
        </div>
        <div class="btn-group w-100">
          <button
            @click="$emit('addPart', 'stairs')"
            class="col-4 btn btn-outline-secondary"
          >
            Stairs
          </button>
          <button
            @click="$emit('addPart', 'rampup')"
            class="col-4 btn btn-outline-secondary"
          >
            Car ramp up
          </button>
          <button
            @click="$emit('addPart', 'rampdown')"
            class="col-4 btn btn-outline-secondary"
          >
            Car ramp down
          </button>
        </div>
        <div class="btn-group w-100">
          <button
            @click="$emit('addPart', 'loongroof')"
            class="w-50 btn btn-outline-secondary"
          >
            Long roof
          </button>
          <button
            @click="$emit('addPart', 'smallroof')"
            class="w-50 btn btn-outline-secondary"
          >
            Small roof
          </button>
        </div>
      </div>
      <h5 class="card-title mt-2">Control</h5>
      <div class="btn-group-vertical w-100" role="group">
        <div class="btn-group">
          <button
            :disabled="!selected"
            class="col-4 btn btn-outline-secondary"
            @click="$emit('color', 'clear')"
          >
            Clear
          </button>
          <button
            :disabled="!selected"
            class="col-4 btn btn-outline-secondary"
            @click="$emit('color', 'green')"
          >
            Green
          </button>
          <button
            :disabled="!selected"
            class="col-4 btn btn-outline-secondary"
            @click="$emit('color', 'red')"
          >
            Red
          </button>
        </div>
        <div class="btn-group">
          <button
            :disabled="!selected"
            class="col-4 btn btn-outline-secondary mb-2"
            @click="$emit('rotate')"
          >
            Rotate
          </button>
          <button
            :disabled="!selected"
            class="col-4 btn btn-outline-secondary mb-2"
            @click="$emit('deselect')"
          >
            Deselect
          </button>
          <button
            :disabled="!selected"
            class="col-4 btn btn-outline-secondary mb-2"
            @click="$emit('remove')"
          >
            Remove
          </button>
        </div>
      </div>
      <h5 class="card-title mt-2">Floors</h5>
      <div class="mb-2" v-for="l of layers" :key="l">
        <input
          type="checkbox"
          :checked="!floors.includes(l)"
          @click="$emit('toggleFloor', l)"
        />
        {{ l }}
      </div>
      <h5 class="card-title mt-2">Construction</h5>
      <div class="mb-2">
        Total: {{ parts }}<br />
        woods: {{ resources.woods }}<br />
        planks: {{ resources.planks }} ({{ ceil(resources.planks, 252) }})<br />
        nails: {{ resources.nails }} ({{ ceil(resources.nails, 70) }})<br />
        metal: {{ resources.metal }}<br />
        wires: {{ resources.wires }}<br />
        codelocks:{{ resources.codelocks }}<br />
      </div>
      <div class="btn-group">
        <button @click="$emit('save')" class="btn btn-outline-secondary">
          Save
        </button>
        <label for="load-file" class="btn btn-outline-secondary">
          Load
          <input
            type="file"
            id="load-file"
            class="d-none"
            accept=".json"
            ref="fileInput"
            @change="$emit('loadFile', $event.target.files[0])"
          />
        </label>
      </div>
    </div>
    <div class="text-muted">
      <small> abrakadobr 2025 for FREEDOM DayZ </small>
    </div>
  </div>
</template>
-->
