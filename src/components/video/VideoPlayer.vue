<template>
  <div class="video-player" @touchstart="handleTouchStart" @touchend="handleTouchEnd" ref="videoContainer">
    <div class="video-wrapper" :class="isLandscape ? 'landscape' : 'portrait'">
      <video
          ref="videoElement"
          :src="videoUrl"
          :style="videoStyle"
          autoplay
          loop
          @timeupdate="updateProgress"
          @click="handleVideoClick"
          @dblclick="handleLike"
      ></video>

      <!-- 暂停图标 -->
      <transition name="fade">
        <div v-if="!isPlaying" class="pause-icon">⏸</div>
      </transition>

      <!-- 进度条 -->
      <div class="progress-container">
        <button class="danmaku-btn" @click="toggleDanmakuInput">弹</button>
        <div class="video-info">
          <h3>@{{ author }}</h3>
          <p>{{ title }}</p>
          <div class="tags">
            <span v-for="tag in tags" :key="tag">#{{ tag }}</span>
          </div>
        </div>
        <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            v-model="progress"
            @input="handleSeek"
            class="progress-bar"
        >
      </div>

      <!-- 弹幕容器 -->
      <div class="danmaku-container">
        <div
            v-for="danmu in visibleDanmus"
            :key="danmu.id"
            class="danmu"
            :style="{
            top: `${danmu.position}%`,
            animationDuration: `${danmu.duration}s`
          }"
        >{{ danmu.text }}</div>
      </div>
    </div>

    <!-- 右侧交互区 -->
    <div class="interaction-panel">
      <div class="user-section">
        <div class="avatar-wrapper">
          <img
              :src="authorAvatar"
              class="avatar"
              @click="navigateToProfile"
          >
          <button
              class="follow-btn"
              @click="toggleFollow"
              :class="{ followed: isFollowing }"
          >
            <svg class="follow-icon" viewBox="0 0 24 24">
              <path v-if="!isFollowing" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              <path v-else d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <div class="action-item" @click="handleLike">
          <div class="icon-wrapper">
            <transition name="scale">
              <div v-if="isLiked" class="icon">❤️</div>
              <div v-else class="icon">🤍</div>
            </transition>
          </div>
          <div class="count">{{ likes }}</div>
        </div>

        <div class="action-item" @click="handleCollect">
          <div class="icon-wrapper">
            <transition name="scale">
              <div v-if="isCollected" class="icon">⭐</div>
              <div v-else class="icon">☆</div>
            </transition>
          </div>
          <div class="count">{{ collects }}</div>
        </div>

        <div class="action-item" @click="toggleComments">
          <div class="icon-wrapper">
            <div class="icon">💬</div>
          </div>
          <div class="count">{{ comments.length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  videoUrl: string
  isLandscape: boolean
  author: string
  authorAvatar: string
  title: string
  tags: string[]
  likes: number
  collects: number
  comments: any[]
  isLiked: boolean
  isCollected: boolean
  isFollowing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits([
  'like',
  'collect',
  'follow',
  'comment',
  'profile',
  'danmaku'
])

// 视频控制
const videoElement = ref<HTMLVideoElement>()
const isPlaying = ref(true)
const progress = ref(0)
const videoStyle = computed(() => ({
  width: props.isLandscape ? '100%' : 'auto',
  height: props.isLandscape ? 'auto' : '100%'
}))

// 弹幕控制
const showDanmakuInput = ref(false)
const danmakuText = ref('')
const visibleDanmus = ref([
  { id: 1, text: '前方高能！', position: 15, duration: 8 },
  { id: 2, text: '经典名场面', position: 30, duration: 6 }
])

// 视频控制方法
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (videoElement.value) {
    isPlaying.value ? videoElement.value.play() : videoElement.value.pause()
  }
}

const updateProgress = () => {
  if (videoElement.value) {
    progress.value = (videoElement.value.currentTime / videoElement.value.duration) * 100
  }
}

const handleSeek = (e: Event) => {
  if (videoElement.value) {
    const target = e.target as HTMLInputElement
    const time = (Number(target.value) / 100) * videoElement.value.duration
    videoElement.value.currentTime = time
  }
}

// 交互方法
const handleLike = () => {
  emit('like')
}

const handleCollect = () => {
  emit('collect')
}

const toggleFollow = () => {
  emit('follow')
}

const toggleComments = () => {
  emit('comment')
}

const navigateToProfile = () => {
  emit('profile')
}

// 弹幕方法
const toggleDanmakuInput = () => {
  showDanmakuInput.value = !showDanmakuInput.value
}

const sendDanmaku = () => {
  if (!danmakuText.value.trim()) return
  emit('danmaku', danmakuText.value)
  danmakuText.value = ''
  showDanmakuInput.value = false
}

// 双击检测
let lastClick = 0
const handleVideoClick = () => {
  const now = Date.now()
  if (now - lastClick < 300) {
    handleLike()
  } else {
    togglePlay()
  }
  lastClick = now
}
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-wrapper.portrait video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-wrapper.landscape video {
  width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
}

/* 其他样式保持不变... */
</style> 