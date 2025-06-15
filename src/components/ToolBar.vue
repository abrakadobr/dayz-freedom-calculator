<script>
export default {
  name: 'ToolBar',
  emits: ['tool'],
  props: {
    tool: {
      type: [String, null],
      required: true,
    }
  }
}
</script>

<template>
  <div class="tool-bar">
    <button class="tool-button" :class="{ 'selected': tool === 'select' }">
    </button>
  </div>
</template>
