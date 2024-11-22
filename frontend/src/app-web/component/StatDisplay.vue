<script setup lang="ts">
import { useAppContext } from '../../context/AppContext';


const props = defineProps<{
  entry: StatEntry
}>()

const appContext = useAppContext()

export interface StatEntry {
  label: string,
  figure: string | number,
  link?: StatAction
}
interface StatAction {
  label: string,
  intent?: any,
  to: string
}
</script>

<template>
  <v-card>
    <v-card-text>
      <div class="stat-label">{{ props.entry.label }}</div>
      <div class="stat-figure">{{ props.entry.figure }}</div>
      <div class="stat-action-container">
        <v-btn @click="props.entry.link.intent && appContext.putIntent(props.entry.link.intent)" style="font-size: 1.1em" v-if="props.entry.link" variant="plain" :to="props.entry.link.to">
          {{ props.entry.link.label }} <v-icon icon="mdi-arrow-right" />
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
  .stat-label {
    font-size: 1.2em;
    text-align: center;
  }
  .stat-figure {
    margin-top: 12px;
    font-size: 3em;
    text-align: center;
    font-weight: bold;
  }
  .stat-action-container {
    height: 24px;
    text-align: right;
    margin-top: -4px;
    margin-bottom: 4px;
    margin-right: -12px;
  }
</style>
