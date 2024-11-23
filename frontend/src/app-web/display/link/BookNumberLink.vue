<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAppContext } from '../../../context/AppContext';
import { titles__filter_book_number } from '../../intent/intents';

const props = defineProps<{
  book_number: string
}>()

const appContext = useAppContext()
const router = useRouter()

function handleClick(isNewTab: boolean) {
  appContext.value.putIntent([ titles__filter_book_number, props.book_number ])
  if(isNewTab) {
    window.open('#/manage/titles')
  } else {
    router.push('/manage/titles')
  }
}
</script>

<template>
  <a style="text-decoration: underline;" @click="handleClick(false)" @contextmenu.prevent="handleClick(true)" href="javascript:;">
    {{ book_number }}
  </a>
</template>
