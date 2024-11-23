<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAppContext } from '../../../context/AppContext';
import { stocks__filter_barcode } from '../../intent/intents';

const props = defineProps<{
  barcode: string
}>()

const appContext = useAppContext()
const router = useRouter()

function handleClick(isNewTab: boolean) {
  appContext.value.putIntent([ stocks__filter_barcode, props.barcode ])
  if(isNewTab) {
    window.open('#/manage/stocks')
  } else {
    router.push('/manage/stocks')
  }
}
</script>

<template>
  <a style="text-decoration: underline;" @click="handleClick(false)" @contextmenu.prevent="handleClick(true)" href="javascript:;">
    {{ barcode }}
  </a>
</template>
