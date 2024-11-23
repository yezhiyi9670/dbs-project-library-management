<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';
import { StockValidation } from '@library-management/common/entity/stock/validation';

const props = defineProps<{
  book_number: string | null | undefined
}>()
const appContext = useAppContext()
const emit = defineEmits<{
  close: [next: boolean]
}>()

const valid = ref(false)

const book_number = ref(props.book_number ?? '')
const barcode = ref('')
const decrease_to_purchase = defineModel<boolean>('decrease_to_purchase', { default: false })

const loading = ref(false)

const bookNumberField = useTemplateRef('book-number-field')
const barcodeField = useTemplateRef('barcode-field')

async function handleSubmit(next: boolean) {
  if(!barcode.value) {
    barcodeField.value?.focus()
    return
  }
  if(!valid.value) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('stock/manage/enroll', {
    book_number: book_number.value,
    barcode: barcode.value,
    decrease_to_purchase: decrease_to_purchase.value
  })
  loading.value = false
  if(result.success) {
    appContext.value.showToast('添加藏书成功')
    emit('close', next)
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

async function handleGenerateBarcodeRequest(evt: KeyboardEvent) {
  if(barcode.value != '') {
    return
  }
  const result = await appContext.value.post('stock/manage/generate-barcode')
  if(barcode.value != '') {
    return
  }
  if(result.success) {
    barcode.value = result.data
    appContext.value.showToast('生成条码成功，打印功能暂未实现')
  } else {
    appContext.value.showToast('生成条码失败：' + Api.errorMessage(result.data))
  }
}

function initFocus() {
  if(props.book_number) {
    barcodeField.value?.focus()
  } else {
    bookNumberField.value?.focus()
  }
}

watch([barcodeField, bookNumberField], () => {
  initFocus()
})

</script>
<template>
  
  <v-card title="添加藏书">
    <div
      @keydown.enter.shift.prevent="() => handleSubmit(true)"
      @keydown.enter.exact.prevent="() => handleSubmit(false)"
    >
      <v-divider></v-divider>
      <v-card-text class="mt-2">
        <v-form v-model="valid">
          <v-text-field
            ref="book-number-field"
            v-model="book_number"
            label="书号（可扫描封底条形码）"
            :rules="Api.validationRules([StockValidation.validateBookNumber_])"
            required
          />
          <v-text-field
            ref="barcode-field"
            v-model="barcode"
            label="藏书条码"
            @keydown.right.exact="handleGenerateBarcodeRequest"
            :rules="Api.validationRules([StockValidation.validateBarcode_])"
            required
          />
          <v-checkbox
            v-model="decrease_to_purchase"
            label="减少待采购数量"
          />
        </v-form>
        <v-btn
          :loading="loading"
          :disabled="!valid || loading"
          color="primary"
          text="入库"
          @click="() => handleSubmit(false)"
          class="mr-4"
        ></v-btn>
        <v-btn
          :loading="loading"
          :disabled="!valid || loading"
          color="primary"
          text="入库并继续添加"
          @click="() => handleSubmit(true)"
          class="mr-4"
        ></v-btn>
        <v-btn
          :disabled="loading"
          color="secondary"
          text="取消"
          @click="emit('close', false)"
        ></v-btn>
      </v-card-text>
    </div>
  </v-card>
</template>
