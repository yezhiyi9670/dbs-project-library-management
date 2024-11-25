<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';
import Borrow from '@library-management/common/entity/borrow';
import { BorrowValidation } from '@library-management/common/entity/borrow/validation';

const props = defineProps<{
  entry: Borrow | null
}>()
const appContext = useAppContext()
const emit = defineEmits<{
  close: []
}>()

const valid = ref(false)

const notes = ref(props.entry?.borrow_notes ?? '')

const loading = ref(false)

const firstField = useTemplateRef('first-field')

async function handleSubmit() {
  if(!props.entry || !valid.value) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('/borrow/manage/set-notes', {
    uuid: props.entry.uuid,
    borrow_notes: notes.value
  })
  loading.value = false
  if(result.success) {
    appContext.value.showToast('修改注记成功')
    emit('close')
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

function initFocus() {
  firstField.value?.focus()
}

watch(firstField, () => {
  initFocus()
})

</script>
<template>
  
  <v-card title="修改借阅注记">
    <div
      @keydown.enter.prevent="handleSubmit"
    >
      <v-divider></v-divider>
      <v-card-text class="mt-2">
        <v-form v-model="valid">
          <v-text-field
            ref="first-field"
            v-model="notes"
            label="注记"
            :rules="Api.validationRules([BorrowValidation.validateNotes_])"
            required
          />
        </v-form>
        <v-btn
          :loading="loading"
          :disabled="!valid || loading"
          color="primary"
          text="更新"
          @click="handleSubmit"
          class="mr-4"
        ></v-btn>
        <v-btn
          :disabled="loading"
          color="secondary"
          text="取消"
          @click="emit('close')"
        ></v-btn>
      </v-card-text>
    </div>
  </v-card>
</template>
