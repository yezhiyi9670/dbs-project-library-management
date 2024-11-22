<script setup lang="ts">
import ToCenter from '../../component/ToCenter.vue';
import { useAppContext } from '../../context/AppContext';
import ButtonsContainer from '../component/ButtonsContainer.vue';
import PermissionGuard from '../component/PermissionGuard.vue';
import ReturnButton from '../component/ReturnButton.vue';
import SmallerMainTitle from '../component/SmallerMainTitle.vue';
import TileButton from '../component/TileButton.vue';

const appContext = useAppContext()
</script>

<template>
  <PermissionGuard>
    <ReturnButton icon="mdi-exit-run" to="/device/terminal/logout">退出登录</ReturnButton>
    <ToCenter>
      <SmallerMainTitle>&nbsp;&nbsp;你好，{{ appContext.getUserDisplayName() }}！</SmallerMainTitle>
      <ButtonsContainer>
        <TileButton to="/device/terminal/check" icon="mdi-book-search-outline">
          检查图书状态
        </TileButton>
        <TileButton to="/device/terminal/borrow" icon="mdi-book-arrow-right-outline">
          借书 / 续借
        </TileButton>
        <TileButton to="/device/terminal/return" icon="mdi-book-check-outline">
          还书
        </TileButton>
      </ButtonsContainer>
      <p style="position: absolute; width: 100%; padding-top: 32px">为了你的账号安全，操作完成后请退出登录</p>
    </ToCenter>
  </PermissionGuard>
</template>
