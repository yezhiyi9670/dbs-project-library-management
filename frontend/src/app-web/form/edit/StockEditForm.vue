<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';
import { StockValidation } from '@library-management/common/entity/stock/validation';
import Stock from '@library-management/common/entity/stock';

const props = defineProps<{
  entry: Stock | null
}>()
const appContext = useAppContext()
const emit = defineEmits<{
  close: []
}>()

const valid = ref(false)

const notes = ref(props.entry?.stock_notes ?? '')

const loading = ref(false)

const firstField = useTemplateRef('first-field')

async function handleSubmit() {
  if(!props.entry || !valid.value) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('stock/manage/set-notes', {
    barcode: props.entry.barcode,
    stock_notes: notes.value
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
  
  <v-card title="修改藏书注记">
    <div
      @keydown.enter="handleSubmit"
    >
      <v-divider></v-divider>
      <v-card-text class="mt-2">
        <v-form v-model="valid">
          <v-text-field
            ref="first-field"
            v-model="notes"
            label="注记"
            :rules="Api.validationRules([StockValidation.validateNotes_])"
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
