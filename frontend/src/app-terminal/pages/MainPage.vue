<script setup lang="ts">
import ToCenter from '../../component/ToCenter.vue';
import { useAppContext } from '../../context/AppContext';
import ButtonsContainer from '../component/ButtonsContainer.vue';
import MainTitle from '../component/MainTitle.vue';
import TileButton from '../component/TileButton.vue';

const appContext = useAppContext()
</script>

<template>
  <ToCenter>
    
    <MainTitle>自助借阅终端</MainTitle>

    <ButtonsContainer>
      <TileButton to="/device/terminal/check" icon="mdi-book-search-outline">
        检查图书状态
      </TileButton>
      <template v-if="!appContext.isLoggedIn()">
        <TileButton disabled icon="mdi-smart-card-outline">
          刷卡登录<br /><span style="font-size: 0.8em">Coming s∞n™</span>
        </TileButton>
        <TileButton to="/device/terminal/login" icon="mdi-key-outline">
          密码登录
        </TileButton>
      </template>
      <template v-else>
        <TileButton to="/device/terminal/logout" icon="mdi-exit-run">
          退出登录
        </TileButton>
        <TileButton to="/device/terminal/dashboard" icon="mdi-arrow-right">
          开始借阅
        </TileButton>
      </template>
    </ButtonsContainer>

  </ToCenter>
</template>
