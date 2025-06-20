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
    <button :title="$t('tools.select')" @click="$emit('tool', 'select')" class="tool-button"
      :class="{ 'selected': tool === 'select' }">
      <CursorIcon />
    </button>
    <div class="tool-group">
      <button :title="$t('tools.foundation')" @click="$emit('tool', 'foundation')" class="tool-button"
        :class="{ 'selected': tool === 'foundation' }">
        <FoundationIcon />
      </button>
      <button :title="$t('tools.platform')" @click="$emit('tool', 'platform')" class="tool-button"
        :class="{ 'selected': tool === 'platform' }">
        <PlatformIcon />
      </button>
      <button :title="$t('tools.platformhole')" @click="$emit('tool', 'platformhole')" class="tool-button"
        :class="{ 'selected': tool === 'platformhole' }">
        <PlatformHoleIcon />
      </button>
      <button :title="$t('tools.stairs')" @click="$emit('tool', 'stairs')" class="tool-button"
        :class="{ 'selected': tool === 'stairs' }">
        <StairsIcon />
      </button>
    </div>
    <div class="tool-group">
      <button :title="$t('tools.wall')" @click="$emit('tool', 'wall')" class="tool-button"
        :class="{ 'selected': tool === 'wall' }">
        <WallIcon />
      </button>
      <button :title="$t('tools.window')" @click="$emit('tool', 'window')" class="tool-button"
        :class="{ 'selected': tool === 'window' }">
        <WindowIcon />
      </button>
      <button :title="$t('tools.door')" @click="$emit('tool', 'door')" class="tool-button"
        :class="{ 'selected': tool === 'door' }">
        <DoorIcon />
      </button>
    </div>
    <div class="tool-group">
      <button :title="$t('tools.rampup')" @click="$emit('tool', 'rampup')" class="tool-button rampup"
        :class="{ 'selected': tool === 'rampup' }">
        <RampIcon />
      </button>
      <button :title="$t('tools.rampdown')" @click="$emit('tool', 'rampdown')" class="tool-button"
        :class="{ 'selected': tool === 'rampdown' }">
        <RampIcon />
      </button>
      <button :title="$t('tools.smallroof')" @click="$emit('tool', 'smallroof')" class="tool-button"
        :class="{ 'selected': tool === 'smallroof' }">
        <SmallRoofIcon />
      </button>
      <button :title="$t('tools.longroof')" @click="$emit('tool', 'longroof')" class="tool-button"
        :class="{ 'selected': tool === 'longroof' }">
        <LongRoofIcon />
      </button>
    </div>
    <div class="tool-group">
      <button :title="$t('tools.clear')" @click="$emit('color', 'clear')" :disabled="!selection"
        class="tool-button button-clear" />
      <button :title="$t('tools.green')" @click="$emit('color', 'green')" :disabled="!selection"
        class="tool-button button-green" />
      <button :title="$t('tools.red')" @click="$emit('color', 'red')" :disabled="!selection"
        class="tool-button button-red" />
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
