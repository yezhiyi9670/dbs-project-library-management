<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';
import Title from '@library-management/common/entity/title';
import { TitleValidation } from '@library-management/common/entity/title/validation';

const props = defineProps<{
  original: Title | null
}>()
const appContext = useAppContext()
const emit = defineEmits<{
  close: [next: boolean]
}>()

const valid = ref(false)

const old_book_number = computed(() => {
  if(props.original == null) {
    return null
  }
  return props.original.book_number
})
const book_number = ref(props.original?.book_number ?? '')
const title = ref(props.original?.title ?? '')
const author = ref(props.original?.author ?? '')
const publisher = ref(props.original?.publisher ?? '')
const year = ref('' + (props.original?.year ?? 0))
const place = ref(props.original?.place ?? '')
const url = ref(props.original?.url ?? '')
const price = ref(((props.original?.price_milliunit ?? 0) / 1000).toFixed(2))
const description = ref(props.original?.description ?? '')
const to_purchase_amount = ref('' + (props.original?.to_purchase_amount ?? 0))

const loading = ref(false)

async function handleSubmit(next: boolean) {
  if(!valid.value) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('title/manage/update', {
    old_book_number: old_book_number.value,
    book_number: book_number.value,
    title: title.value,
    author: author.value,
    publisher: publisher.value,
    year: +year.value,
    place: place.value,
    url: url.value,
    price_milliunit: (+price.value) * 1000,
    description: description.value,
    to_purchase_amount: +to_purchase_amount.value
  })
  loading.value = false
  if(result.success) {
    appContext.value.showToast('更新成功')
    emit('close', next)
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

const colSpec = { cols: 12, sm: 6, md: 4 }

const firstField = useTemplateRef('first-field')
watch(firstField, () => {
  firstField.value?.focus()
})

</script>
<template>
  
  <v-card :title="old_book_number == null ? '新建书目' : '更新书目'">
    <div
      @keydown.enter.shift.prevent="() => handleSubmit(true)"
      @keydown.enter.exact.prevent="() => handleSubmit(false)"
    >
      <v-divider></v-divider>
      <v-card-text class="mt-2">
        <v-form v-model="valid">
          <v-row dense>
            <v-col :="colSpec">
              <v-text-field
                ref="first-field"
                v-model="book_number"
                label="书号"
                :rules="Api.validationRules([TitleValidation.validateBookNumber_], true)"
                required
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                v-model="title"
                label="书名"
                :rules="Api.validationRules([TitleValidation.validateTitle_])"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                v-model="author"
                label="作者"
                :rules="Api.validationRules([TitleValidation.validateAuthor_])"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                v-model="publisher"
                label="出版社"
                :rules="Api.validationRules([TitleValidation.validatePublisher_])"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                type="number"
                v-model="year"
                label="年份"
                :rules="Api.validationRules([v => TitleValidation.validateYear_(1 * v)])"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                v-model="place"
                label="线下藏书位置"
                :rules="Api.validationRules([TitleValidation.validatePlace_])"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                v-model="url"
                label="在线阅读网址"
                :rules="Api.validationRules([TitleValidation.validateUrl_])"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                v-model="price"
                label="价格"
                :rules="Api.validationRules([v => TitleValidation.validatePrice_(v * 1000)])"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                type="number"
                v-model="to_purchase_amount"
                label="待采购数量"
                :rules="Api.validationRules([v => TitleValidation.validateToPurchaseAmount_(1 * v)])"
              />
            </v-col>
          </v-row>
          <v-textarea
            @keydown.enter.exact.stop=""
            class="mt-4"
            v-model="description"
            label="描述文本"
            :rules="Api.validationRules([TitleValidation.validateDescription_])"
          />
        </v-form>
        <v-btn
          :loading="loading"
          :disabled="!valid || loading"
          color="primary"
          text="更新"
          @click="() => handleSubmit(false)"
          class="mr-4"
        ></v-btn>
        <v-btn
          :loading="loading"
          :disabled="!valid || loading"
          color="primary"
          text="更新并继续添加"
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
