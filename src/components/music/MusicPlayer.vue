<template>
  <div class="music-player">
    <!-- 顶部导航 -->
    <div class="player-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">←</button>
        <div class="song-info">
          <div class="song-name">{{ currentSong.name }}</div>
          <div class="artist-name">{{ currentSong.artist }}</div>
        </div>
      </div>
      <div class="header-right">
        <button class="more-btn">⋮</button>
      </div>
    </div>

    <!-- 封面区域 -->
    <div class="cover-section">
      <div class="cover-wrapper" :class="{ 'is-playing': isPlaying }">
        <img :src="currentSong.cover" :alt="currentSong.name">
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="time-info">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <span class="total-time">{{ formatTime(duration) }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bg"></div>
        <div class="progress-current" :style="{ width: progress + '%' }"></div>
        <div class="progress-handle" :style="{ left: progress + '%' }"></div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="control-section">
      <button class="control-btn" @click="togglePlayMode">
        <i class="mode-icon">{{ playModeIcon }}</i>
      </button>
      <button class="control-btn" @click="prevSong">
        <i class="prev-icon">⏮</i>
      </button>
      <button class="play-btn" @click="togglePlay">
        <i class="play-icon">{{ isPlaying ? '⏸' : '▶' }}</i>
      </button>
      <button class="control-btn" @click="nextSong">
        <i class="next-icon">⏭</i>
      </button>
      <button class="control-btn" @click="togglePlaylist">
        <i class="playlist-icon">≡</i>
      </button>
    </div>

    <!-- 歌词区域 -->
    <div class="lyrics-section" v-if="showLyrics">
      <div class="lyrics-wrapper">
        <div
            v-for="(line, index) in lyrics"
            :key="index"
            class="lyrics-line"
            :class="{ 'active': currentLyricIndex === index }"
        >
          {{ line.text }}
        </div>
      </div>
    </div>

    <!-- 播放列表 -->
    <div class="playlist" v-if="showPlaylist">
      <div class="playlist-header">
        <h3>播放列表</h3>
        <button class="close-btn" @click="togglePlaylist">×</button>
      </div>
      <div class="playlist-content">
        <div
            v-for="(song, index) in playlist"
            :key="song.id"
            class="playlist-item"
            :class="{ 'active': currentIndex === index }"
            @click="playSong(index)"
        >
          <div class="song-info">
            <div class="song-name">{{ song.name }}</div>
            <div class="artist-name">{{ song.artist }}</div>
          </div>
          <div class="song-duration">{{ formatTime(song.duration) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Song {
  id: number
  name: string
  artist: string
  cover: string
  duration: number
  url: string
}

// 播放状态
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const currentIndex = ref(0)
const showLyrics = ref(false)
const showPlaylist = ref(false)
const playMode = ref('sequence') // sequence, random, single

// 播放列表
const playlist = ref<Song[]>([
  {
    id: 1,
    name: '歌曲1',
    artist: '歌手1',
    cover: 'https://picsum.photos/300/300',
    duration: 180,
    url: 'https://example.com/song1.mp3'
  },
  {
    id: 2,
    name: '歌曲2',
    artist: '歌手2',
    cover: 'https://picsum.photos/300/300',
    duration: 240,
    url: 'https://example.com/song2.mp3'
  }
])

// 当前歌曲
const currentSong = computed(() => playlist.value[currentIndex.value])

// 播放模式图标
const playModeIcon = computed(() => {
  switch (playMode.value) {
    case 'sequence':
      return '🔁'
    case 'random':
      return '🔀'
    case 'single':
      return '🔂'
    default:
      return '🔁'
  }
})

// 歌词数据
const lyrics = ref([
  { time: 0, text: '歌词1' },
  { time: 10, text: '歌词2' },
  { time: 20, text: '歌词3' }
])

const currentLyricIndex = ref(0)

// 方法
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const prevSong = () => {
  if (playMode.value === 'random') {
    currentIndex.value = Math.floor(Math.random() * playlist.value.length)
  } else {
    currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
  }
}

const nextSong = () => {
  if (playMode.value === 'random') {
    currentIndex.value = Math.floor(Math.random() * playlist.value.length)
  } else {
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
  }
}

const togglePlayMode = () => {
  const modes = ['sequence', 'random', 'single']
  const currentIndex = modes.indexOf(playMode.value)
  playMode.value = modes[(currentIndex + 1) % modes.length]
}

const togglePlaylist = () => {
  showPlaylist.value = !showPlaylist.value
}

const playSong = (index: number) => {
  currentIndex.value = index
  isPlaying.value = true
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const goBack = () => {
  // 实现返回逻辑
}
</script>

<style scoped>
.music-player {
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.player-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-btn {
  font-size: 24px;
  background: none;
  border: none;
  padding: 5px;
}

.song-info {
  display: flex;
  flex-direction: column;
}

.song-name {
  font-size: 16px;
  font-weight: bold;
}

.artist-name {
  font-size: 14px;
  color: #666;
}

/* 封面区域 */
.cover-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.cover-wrapper {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.cover-wrapper.is-playing {
  animation: rotate 20s linear infinite;
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 进度条 */
.progress-section {
  padding: 0 20px;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.progress-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  position: relative;
}

.progress-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ddd;
  border-radius: 2px;
}

.progress-current {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: #FE2C55;
  border-radius: 2px;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #FE2C55;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

/* 控制按钮 */
.control-section {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-btn {
  background: none;
  border: none;
  font-size: 24px;
  padding: 10px;
}

.play-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #FE2C55;
  border: none;
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 歌词区域 */
.lyrics-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.lyrics-line {
  text-align: center;
  padding: 10px 0;
  color: #666;
  transition: all 0.3s;
}

.lyrics-line.active {
  color: #FE2C55;
  font-size: 18px;
  font-weight: bold;
}

/* 播放列表 */
.playlist {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.playlist-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.close-btn {
  font-size: 24px;
  background: none;
  border: none;
  padding: 5px;
}

.playlist-content {
  flex: 1;
  overflow-y: auto;
}

.playlist-item {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.playlist-item.active {
  color: #FE2C55;
}

.song-duration {
  color: #999;
  font-size: 14px;
}
</style> 