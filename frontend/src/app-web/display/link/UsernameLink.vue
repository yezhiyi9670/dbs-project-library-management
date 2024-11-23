<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAppContext } from '../../../context/AppContext';
import { users__filter_username } from '../../intent/intents';

const props = defineProps<{
  username: string
}>()

const appContext = useAppContext()
const router = useRouter()

function handleClick(isNewTab: boolean) {
  appContext.value.putIntent([ users__filter_username, props.username ])
  if(isNewTab) {
    window.open('#/manage/users')
  } else {
    router.push('/manage/users')
  }
}
</script>

<template>
  <a style="text-decoration: underline;" @click="handleClick(false)" @contextmenu.prevent="handleClick(true)" href="javascript:;">
    {{ username }}
  </a>
</template>
