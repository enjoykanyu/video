<template>
  <div class="live-stream">
    <div class="live-header">
      <div class="live-title">{{ title }}</div>
      <div class="live-stats">
        <span class="viewer-count">{{ viewerCount }}观看</span>
        <span class="like-count">{{ likeCount }}点赞</span>
      </div>
    </div>

    <div class="live-content">
      <video
          ref="liveVideo"
          :src="streamUrl"
          autoplay
          playsinline
          class="live-video"
      ></video>

      <!-- 直播互动区 -->
      <div class="interaction-area">
        <!-- 礼物面板 -->
        <div class="gift-panel">
          <div class="gift-list">
            <div
                v-for="gift in gifts"
                :key="gift.id"
                class="gift-item"
                @click="sendGift(gift)"
            >
              <img :src="gift.icon" :alt="gift.name">
              <span class="gift-name">{{ gift.name }}</span>
              <span class="gift-price">{{ gift.price }}币</span>
            </div>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
          >
            <img :src="comment.user.avatar" :alt="comment.user.name" class="user-avatar">
            <div class="comment-content">
              <span class="username">{{ comment.user.name }}</span>
              <span class="text">{{ comment.content }}</span>
            </div>
          </div>
        </div>

        <!-- 输入框 -->
        <div class="input-area">
          <input
              v-model="commentText"
              type="text"
              placeholder="说点什么..."
              @keyup.enter="sendComment"
          >
          <button @click="sendComment">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  streamUrl: string
  viewerCount: number
  likeCount: number
}

const props = defineProps<Props>()

const emit = defineEmits(['comment', 'gift'])

// 评论相关
const commentText = ref('')
const comments = ref([
  {
    id: 1,
    user: {
      name: '用户1',
      avatar: 'https://picsum.photos/50/50'
    },
    content: '主播好厉害！'
  }
])

// 礼物相关
const gifts = ref([
  {
    id: 1,
    name: '小心心',
    icon: '❤️',
    price: 1
  },
  {
    id: 2,
    name: '玫瑰花',
    icon: '🌹',
    price: 5
  },
  {
    id: 3,
    name: '火箭',
    icon: '🚀',
    price: 100
  }
])

// 发送评论
const sendComment = () => {
  if (!commentText.value.trim()) return
  emit('comment', commentText.value)
  commentText.value = ''
}

// 发送礼物
const sendGift = (gift: any) => {
  emit('gift', gift)
}
</script>

<style scoped>
.live-stream {
  width: 100%;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
}

.live-header {
  padding: 10px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
}

.live-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.live-stats {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.live-content {
  flex: 1;
  position: relative;
}

.live-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.interaction-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
}

.gift-panel {
  margin-bottom: 10px;
}

.gift-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 5px;
}

.gift-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 5px;
  border-radius: 8px;
  cursor: pointer;
}

.gift-item img {
  width: 30px;
  height: 30px;
}

.gift-name {
  font-size: 12px;
  color: white;
}

.gift-price {
  font-size: 10px;
  color: #FFD700;
}

.comment-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.comment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.comment-content {
  color: white;
  font-size: 14px;
}

.username {
  color: #FFD700;
  margin-right: 5px;
}

.input-area {
  display: flex;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 8px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.input-area button {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: #FE2C55;
  color: white;
  cursor: pointer;
}

/* 自定义滚动条 */
.comment-list::-webkit-scrollbar {
  width: 4px;
}

.comment-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.comment-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style> 