<script>
import CursorIcon from '@/assets/icons/cursor.svg'
import FoundationIcon from '@/assets/icons/foundation.svg'
import PlatformIcon from '@/assets/icons/plarform.svg'
import PlatformHoleIcon from '@/assets/icons/plarformhole.svg'
import StairsIcon from '@/assets/icons/stairs.svg'
import WallIcon from '@/assets/icons/wall.svg'
import WindowIcon from '@/assets/icons/window.svg'
import DoorIcon from '@/assets/icons/door.svg'
import RampIcon from '@/assets/icons/ramp.svg'
import SmallRoofIcon from '@/assets/icons/smallroof.svg'
import LongRoofIcon from '@/assets/icons/longroof.svg'

export default {
  name: 'ToolBar',
  emits: ['tool', 'color'],
  components: {
    FoundationIcon,
    PlatformIcon,
    StairsIcon,
    PlatformHoleIcon,
    WallIcon,
    DoorIcon,
    RampIcon,
    SmallRoofIcon,
    LongRoofIcon,
    WindowIcon,
    CursorIcon
  },
  props: {
    tool: {
      type: [String, null],
      required: true,
    },
    selection: {
      type: [Object, null],
      required: true,
    }
  }
}
</script>

<template>
  <div class="tool-bar">
    <button @click="$emit('tool', 'select')" class="tool-button" :class="{ 'selected': tool === 'select' }">
      <CursorIcon />
    </button>
    <div class="tool-group">
      <button @click="$emit('tool', 'foundation')" class="tool-button" :class="{ 'selected': tool === 'foundation' }">
        <FoundationIcon />
      </button>
      <button @click="$emit('tool', 'platform')" class="tool-button" :class="{ 'selected': tool === 'platform' }">
        <PlatformIcon />
      </button>
      <button @click="$emit('tool', 'platformhole')" class="tool-button"
        :class="{ 'selected': tool === 'platformhole' }">
        <PlatformHoleIcon />
      </button>
      <button @click="$emit('tool', 'stairs')" class="tool-button" :class="{ 'selected': tool === 'stairs' }">
        <StairsIcon />
      </button>
    </div>
    <div class="tool-group">
      <button @click="$emit('tool', 'wall')" class="tool-button" :class="{ 'selected': tool === 'wall' }">
        <WallIcon />
      </button>
      <button @click="$emit('tool', 'window')" class="tool-button" :class="{ 'selected': tool === 'window' }">
        <WindowIcon />
      </button>
      <button @click="$emit('tool', 'door')" class="tool-button" :class="{ 'selected': tool === 'door' }">
        <DoorIcon />
      </button>
    </div>
    <div class="tool-group">
      <button @click="$emit('tool', 'rampup')" class="tool-button rampup" :class="{ 'selected': tool === 'ramp' }">
        <RampIcon />
      </button>
      <button @click="$emit('tool', 'rampdown')" class="tool-button" :class="{ 'selected': tool === 'ramp' }">
        <RampIcon />
      </button>
      <button @click="$emit('tool', 'smallroof')" class="tool-button" :class="{ 'selected': tool === 'smallroof' }">
        <SmallRoofIcon />
      </button>
      <button @click="$emit('tool', 'longroof')" class="tool-button" :class="{ 'selected': tool === 'longroof' }">
        <LongRoofIcon />
      </button>
    </div>
    <div class="tool-group">
      <button @click="$emit('color', 'clear')" :disabled="!selection" class="tool-button button-clear" />
      <button @click="$emit('color', 'green')" :disabled="!selection" class="tool-button button-green" />
      <button @click="$emit('color', 'red')" :disabled="!selection" class="tool-button button-red" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tool-bar {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  font-family: monospace;
  font-size: 11px;
  display: flex;
  flex-direction: row;

}
</style>
