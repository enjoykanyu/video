<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <div class="top-tab-bar">
      <div class="top-tabs">
        <div class="top-tab" :class="{ active: currentTopTab === 'live' }" @click="switchTopTab('live')">直播</div>
        <div class="top-tab" :class="{ active: currentTopTab === 'city' }" @click="switchTopTab('city')">同城</div>
        <div class="top-tab" :class="{ active: currentTopTab === 'follow' }" @click="switchTopTab('follow')">关注</div>
        <div class="top-tab" :class="{ active: currentTopTab === 'shop' }" @click="switchTopTab('shop')">商城</div>
        <div class="top-tab" :class="{ active: currentTopTab === 'music' }" @click="switchTopTab('music')">音乐</div>
        <div class="top-tab" :class="{ active: currentTopTab === 'recommend' }" @click="switchTopTab('recommend')">推荐<div class="tab-underline" v-if="currentTopTab === 'recommend'"></div></div>
      </div>
      <div class="top-search">
        <svg class="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="#fff" stroke-width="2" fill="none"/><line x1="18" y1="18" x2="15.5" y2="15.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
    </div>

    <div class="video-container" @touchstart="handleTouchStart" @touchend="handleTouchEnd" ref="videoContainer">
      <!-- 视频容器 -->
      <div class="video-wrapper" :class="currentVideo.isLandscape ? 'landscape' : 'portrait'">
        <video
            ref="videoElement"
            :src="currentVideo.url"
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
          <!-- 在video-info上方添加弹幕按钮 -->
            <button class="danmaku-btn" @click="toggleDanmakuInput">弹</button>
            <div class="video-info">
              <!-- 原有信息 -->
            </div>

            <!-- 弹幕输入框 -->
            <div v-if="showDanmakuInput" class="danmaku-input-box">
              <input
                  v-model="danmakuText"
                  placeholder="输入弹幕内容"
                  @keyup.enter="sendDanmaku"
              >
              <button @click="sendDanmaku">发送</button>
            </div>

          <div class="video-info">
            <h3>@{{ currentVideo.author }}</h3>
            <p>{{ currentVideo.title }}</p>
            <div class="tags">
              <span v-for="tag in currentVideo.tags" :key="tag">#{{ tag }}</span>
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
                :src="currentVideo.authorAvatar"
                class="avatar"
                @click="navigateToProfile"
            >
            <button
                class="follow-btn"
                @click="toggleFollow"
                :class="{ followed: currentVideo.isFollowing }"
            >
              <svg class="follow-icon" viewBox="0 0 24 24">
                <path v-if="!currentVideo.isFollowing" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                <path v-else d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="action-buttons">
          <div class="action-item" @click="handleLike">
            <div class="icon-wrapper">
              <transition name="scale">
                <div v-if="currentVideo.isLiked" class="icon">❤️</div>
                <div v-else class="icon">🤍</div>
              </transition>
            </div>
            <div class="count">{{ currentVideo.likes }}</div>
          </div>

          <div class="action-item" @click="handleCollect">
            <div class="icon-wrapper">
              <transition name="scale">
                <div v-if="currentVideo.isCollected" class="icon">⭐</div>
                <div v-else class="icon">☆</div>
              </transition>
            </div>
            <div class="count">{{ currentVideo.collects }}</div>
          </div>

          <div class="action-item" @click="toggleComments">
            <div class="icon-wrapper">
              <div class="icon">💬</div>
            </div>
            <div class="count">{{ currentVideo.comments.length }}</div>
          </div>

          <!-- 新增分享按钮 -->
          <div class="action-item" @click="handleShare">
            <div class="icon-wrapper">
              <div class="icon">🔗</div>
            </div>
            <div class="count">分享</div>
          </div>

          <!-- 新增音乐碟片和音乐名 -->
          <div class="music-disc-block">
            <div class="music-disc">
              <img :src="currentVideo.musicCover || '/default-music.png'" alt="music" />
            </div>
            <div class="music-name">{{ currentVideo.musicName || '背景音乐' }}</div>
          </div>

          <!-- 带过渡效果的遮罩层 -->
          <transition name="fade">
            <div
                v-if="showComments"
                class="comments-overlay"
                @click.self="closeComments"
            >
              <transition name="slide">
                <div
                    v-if="showComments"
                    class="comments-drawer"
                >
                  <div class="drawer-header">
                    <h3>视频评论（{{ currentVideo.comments?.length || 0 }}）</h3>
                    <button class="close-btn" @click="closeComments">
                      <svg class="icon" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                  <!-- 评论列表 -->
                  <div class="comments-container">
                    <transition-group
                        name="comment-fade"
                        tag="div"
                    >
                      <div
                          v-for="(comment, index) in currentVideo.comments"
                          :key="comment.id || index"
                          class="comment-item"
                      >
                        <div class="user-avatar">
                          <img
                              :src="comment.user.avatar"
                              :alt="comment.user.name"
                              class="avatar-img"
                          >
                        </div>
                        <div class="comment-content">
                          <div class="username">{{ comment.user.name }}</div>
                          <div class="text">{{ comment.content }}</div>
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </div>
              </transition>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <div class="bottom-tab-bar">
      <div class="bottom-tabs">
        <div class="bottom-tab" :class="{ active: currentBottomTab === 'home' }" @click="switchBottomTab('home')">
          <svg class="tab-icon" viewBox="0 0 24 24"><path d="M3 12L12 3l9 9v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4H9v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor"/></svg>
          <span>首页</span>
        </div>
        <div class="bottom-tab" :class="{ active: currentBottomTab === 'friends' }" @click="switchBottomTab('friends')">
          <svg class="tab-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>
          <span>朋友</span>
        </div>
        <div class="bottom-tab plus" @click="switchBottomTab('publish')">
          <div class="plus-btn">
            <svg viewBox="0 0 48 48" width="36" height="36"><circle cx="24" cy="24" r="24" fill="#fff"/><rect x="22" y="12" width="4" height="24" rx="2" fill="#FE2C55"/><rect x="12" y="22" width="24" height="4" rx="2" fill="#FE2C55"/></svg>
          </div>
        </div>
        <div class="bottom-tab" :class="{ active: currentBottomTab === 'message' }" @click="switchBottomTab('message')">
          <svg class="tab-icon" viewBox="0 0 24 24"><path d="M21 6.5a2.5 2.5 0 0 0-2.5-2.5h-13A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5v-11zm-2.5 0l-6.5 4.5-6.5-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>消息</span>
        </div>
        <div class="bottom-tab" :class="{ active: currentBottomTab === 'profile' }" @click="switchBottomTab('profile')">
          <svg class="tab-icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          <span>我</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import request from '../utils/request.ts'

interface Video {
  id: number
  url: string
  isLandscape: boolean
  author: string
  authorAvatar: string
  title: string
  tags: string[]
  likes: number
  collects: number
  comments: number
  isLiked: boolean
  isCollected: boolean
  isFollowing: boolean
  musicCover?: string
  musicName?: string
}

interface Danmaku {
  id: number
  text: string
  position: number
  duration: number
  time: number
}
const currentTopTab = ref('recommend') // 默认选中推荐tab
const currentBottomTab = ref('home')   // 默认选中首页

const videos = reactive<Video[]>([
  {
    id: 1,
    url: 'https://www.runoob.com/try/demo_source/movie.mp4',
    isLandscape: true,
    author: 'user1',
    authorAvatar: 'https://picsum.photos/50',
    title: '第一个测试视频',
    tags: ['测试', '演示'],
    likes: 100,
    collects: 50,
    comments: [
      {
        id: 1,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          name: '数码达人王'
        },
        content: '这个特效太炸了！求教程！',
        likes: 142,
        timestamp: 1630454400
      },
      {
        id: 2,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
          name: '美妆小仙女💄'
        },
        content: '背景音乐是什么呀？跪求歌名！',
        likes: 89,
        timestamp: 1630447200
      },
      {
        id: 3,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          name: '科技宅小明'
        },
        content: '拍摄设备是用的哪款相机？画质太棒了👏👏',
        likes: 256,
        timestamp: 1630368000
      },
      {
        id: 4,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
          name: '旅行家Lily'
        },
        content: '这个地方我去过！实际景色比视频里还美～',
        likes: 302,
        timestamp: 1630281600
      },
      {
        id: 5,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
          name: '健身教练Mike'
        },
        content: '动作指导很专业！但新手要注意保护关节哦💪',
        likes: 178,
        timestamp: 1630195200
      },
      {
        id: 6,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
          name: '美食探店王'
        },
        content: '看饿了...求餐馆定位！',
        likes: 421,
        timestamp: 1630108800
      }],
    isLiked: false,
    isCollected: false,
    isFollowing: false
  },
  {
    id: 2,
    url: 'http://vjs.zencdn.net/v/oceans.mp4',
    isLandscape: true,
    author: 'user2',
    authorAvatar: 'https://picsum.photos/60',
    title: '第个测试视频',
    tags: ['新', '来'],
    likes: 301,
    collects: 33,
    comments: [
      {
        id: 1,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          name: '数码达人王'
        },
        content: '这个特效太炸了！求教程！',
        likes: 142,
        timestamp: 1630454400
      },
      {
        id: 2,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
          name: '美妆小仙女💄'
        },
        content: '背景音乐是什么呀？跪求歌名！',
        likes: 89,
        timestamp: 1630447200
      },
      {
        id: 3,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          name: '科技宅小明'
        },
        content: '拍摄设备是用的哪款相机？画质太棒了👏👏',
        likes: 256,
        timestamp: 1630368000
      },
      {
        id: 4,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
          name: '旅行家Lily'
        },
        content: '这个地方我去过！实际景色比视频里还美～',
        likes: 302,
        timestamp: 1630281600
      },
      {
        id: 5,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
          name: '健身教练Mike'
        },
        content: '动作指导很专业！但新手要注意保护关节哦💪',
        likes: 178,
        timestamp: 1630195200
      },
      {
        id: 6,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
          name: '美食探店王'
        },
        content: '看饿了...求餐馆定位！',
        likes: 421,
        timestamp: 1630108800
      }],
    isLiked: false,
    isCollected: false,
    isFollowing: false
  },
  // 添加更多虚拟视频...
])
// 控制抽屉显示的状态
const showComments = ref(false)

// 切换评论抽屉
// const toggleComments = () => {
//   showComments.value = !showComments.value
// }
// 在script中确保状态声明正确
// const showComments = ref(false)
const toggleComments = () => {
  console.log('触发toggle，当前状态:', showComments.value) // 调试日志
  showComments.value = !showComments.value
}

// 关闭抽屉（支持两种触发方式）
const closeComments = () => {
  showComments.value = false
}
const currentIndex = ref(0)
const videoElement = ref<HTMLVideoElement>()
const isPlaying = ref(true)
const progress = ref(0)
const showDanmakuInput = ref(false)
const newDanmaku = ref('')
const danmakuList = reactive<Danmaku[]>([])
const touchStartY = ref(0)

const currentVideo = computed(() => videos[currentIndex.value])

// 视频控制逻辑
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

// 交互逻辑
const handleLike = () => {
  request.post("api/video/like").then(res => {

  })
  currentVideo.value.isLiked = !currentVideo.value.isLiked
  currentVideo.value.likes += currentVideo.value.isLiked ? 1 : -1
}

const handleCollect = () => {
  request.post("api/video/collect").then(res => {

  })
  currentVideo.value.isCollected = !currentVideo.value.isCollected
  currentVideo.value.collects += currentVideo.value.isCollected ? 1 : -1
}

const toggleFollow = () => {
  request.post("api/video/follow").then(res => {

  })
  currentVideo.value.isFollowing = !currentVideo.value.isFollowing
}

// 弹幕逻辑
// const visibleDanmus = computed(() => {
//   const currentTime = videoElement.value?.currentTime || 0
//   return danmakuList.filter(d =>
//       d.time <= currentTime &&
//       d.time + d.duration > currentTime
//   )
// })

// const sendDanmaku = () => {
//   if (newDanmaku.value.trim()) {
//     danmakuList.push({
//       id: Date.now(),
//       text: newDanmaku.value,
//       position: Math.random() * 80 + 10,
//       duration: 5,
//       time: videoElement.value?.currentTime || 0
//     })
//     newDanmaku.value = ''
//     showDanmakuInput.value = false
//   }
// }

// 视频容器Ref
const videoContainer = ref<HTMLElement>()
// 动画是否进行中
const isAnimating = ref(false)
// 当前滑动距离
const currentTranslateY = ref(0)
// 触摸起始坐标
// const touchStartY = ref(0)
// 触摸时间戳
const touchStartTime = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  if (isAnimating.value) return
  if (e.touches.length === 0) return

  touchStartY.value = e.touches[0].clientY
  console.log('touchStartY', touchStartY.value)
  touchStartTime.value = Date.now()
  videoContainer.value!.style.transition = 'none' // 禁用过渡
}

const handleTouchMove = (e: TouchEvent) => {
  if (isAnimating.value) return

  const currentY = e.touches.clientY
  const deltaY = currentY - touchStartY.value

  // 限制最大滑动距离
  currentTranslateY.value = Math.abs(deltaY) > 200
      ? 200 * (deltaY > 0 ? 1 : -1)
      : deltaY

  applyTransform()
}

const handleTouchEnd = (e: TouchEvent) => {
  if (isAnimating.value) return

  const endY = e.changedTouches[0].clientY
  const deltaY = endY - touchStartY.value
  const deltaTime = Date.now() - touchStartTime.value
  const velocity = deltaY / deltaTime // 计算滑动速度
  console.log(deltaY)
  // 启用过渡动画
  videoContainer.value!.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'

  // 根据速度和距离判断切换方向
  if (Math.abs(deltaY) > 120 || Math.abs(velocity) > 0.3) {
    currentTranslateY.value = deltaY > 0 ? window.innerHeight : -window.innerHeight
    applyTransform()

    setTimeout(() => {
      isAnimating.value = true
      // 切换视频逻辑
      currentIndex.value += deltaY > 0 ? -1 : 1
      // 重置位置
      currentTranslateY.value = 0
      applyTransform()
      // 等待布局更新
      requestAnimationFrame(() => {
        videoContainer.value!.style.transition = 'none'
        isAnimating.value = false
      })
    }, 400)
  } else {
    // 回弹动画
    currentTranslateY.value = 0
    applyTransform()
  }
}

// 应用变换
const applyTransform = () => {
  if (videoContainer.value) {
    videoContainer.value.style.transform = `translateY(${currentTranslateY.value}px)`
  }
}
// const handleTouchEnd = (e: TouchEvent) => {
//   // 确保存在有效触摸点
//   if (e.changedTouches.length === 0) return
//
//   // 正确获取起始和结束坐标
//   const startY = touchStartY.value
//   console.log(startY)
//   const endY = e.changedTouches.clientY
//   const deltaY = endY - startY
//   console.log(deltaY)
//   // 添加滑动方向阈值验证
//   const SWIPE_THRESHOLD = 50
//   const isValidSwipe = Math.abs(deltaY) > SWIPE_THRESHOLD
//
//   if (isValidSwipe) {
//     if (deltaY > 0) {
//       // 上滑加载前一个
//       currentIndex.value = Math.max(0, currentIndex.value - 1)
//     } else {
//       // 下滑加载下一个
//       currentIndex.value = Math.min(videos.length - 1, currentIndex.value + 1)
//     }
//     resetVideoState()
//   }
// }
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

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.loop = true
  }
})
// 增加
// 弹幕数据
// const showDanmakuInput = ref(false)
const danmakuText = ref('')
const visibleDanmus = ref([
  // 虚拟数据示例
  { id: 1, text: '前方高能！', position: 15, duration: 8 },
  { id: 2, text: '经典名场面', position: 30, duration: 6 }
])

// 获取视频实例
// const videoElement = ref(null)

// 切换输入框显示
const toggleDanmakuInput = () => {
  showDanmakuInput.value = !showDanmakuInput.value
}

// 发送弹幕逻辑
const sendDanmaku = () => {
  if (!danmakuText.value.trim()) return

  visibleDanmus.value.push({
    id: Date.now(),
    text: danmakuText.value,
    position: getCurrentVideoPosition(),
    duration: calculateDuration(danmakuText.value)
  })

  danmakuText.value = ''
  showDanmakuInput.value = false
}

// 计算弹幕出现位置（基于当前播放进度）
const getCurrentVideoPosition = () => {
  if (!videoElement.value) return 10 // 默认顶部10%位置
  const progress = (videoElement.value.currentTime / videoElement.value.duration) * 100
  return Math.min(Math.max(progress, 5), 95) // 限制在5%-95%区间
}

// // 根据文本长度计算动画时长
// const calculateDuration = (text) => {
//   const baseSpeed = 100 // 像素/秒
//   const textWidth = text.length * 14 // 估算字符宽度
//   return (window.innerWidth + textWidth) / baseSpeed
// }
// 修改后的持续时间计算
const calculateDuration = (text) => {
  const baseSpeed = 150 // 提高移动速度（像素/秒）
  const textWidth = text.length * 14 // 保持字符宽度估算
  return (window.innerWidth + textWidth) / baseSpeed
}

const switchTopTab = (tab: string) => {
  currentTopTab.value = tab
}
const switchBottomTab = (tab: string) => {
  currentBottomTab.value = tab
}

// 2倍速播放相关
let speedTimer: number | null = null
const handleVideoPress = () => {
  if (videoElement.value) {
    videoElement.value.playbackRate = 2
  }
}
const handleVideoRelease = () => {
  if (videoElement.value) {
    videoElement.value.playbackRate = 1
  }
}

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.loop = true
    videoElement.value.addEventListener('touchstart', handleVideoPress)
    videoElement.value.addEventListener('touchend', handleVideoRelease)
  }
})
onUnmounted(() => {
  if (videoElement.value) {
    videoElement.value.removeEventListener('touchstart', handleVideoPress)
    videoElement.value.removeEventListener('touchend', handleVideoRelease)
  }
})
</script>

<style scoped>
/* 优化后的样式 */
.container {
  position: relative;
  width: 100vw;
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
/* 竖版视频样式 */
.video-wrapper.portrait video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 横版视频样式（类似抖音效果） */
.video-wrapper.landscape video {
  width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
}

/* 横版视频时的背景处理 */
.video-wrapper.landscape::before,
.video-wrapper.landscape::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: calc((100% - 100vw * 9/16) / 2);
  background-color: #000;
  z-index: -1;
}

.video-wrapper.landscape::before {
  top: 0;
}

.video-wrapper.landscape::after {
  bottom: 0;
}
/* 横屏视频适配 */
.landscape video {
  width: 100%;
  object-fit: contain;
}

/* 竖屏视频适配 */
.portrait video {
  height: 100%;
  object-fit: cover;
}
video {
  position: absolute;
  max-width: 100%;
  max-height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持视频比例填充 */

}

/* 进度条容器 */
.progress-container {
  z-index: 100;
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  padding: 0 0 0 16px;
  display: flex;
  align-items: center;
  background: none;
}

.progress-bar {
  flex: 1;
  height: 2.5px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  appearance: none;
  outline: none;
}

.progress-bar::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: #FE2C55;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(254,44,85,0.2);
}

.progress-bar:active::-webkit-slider-thumb {
  transform: scale(1.2);
}

.progress-music {
  margin-left: 10px;
}

/* 视频底部信息区 */
.video-info {
  position: absolute;
  left: 16px;
  bottom: 80px;
  color: #fff;
  z-index: 10;
  text-align: left;
  width: 70vw;
  max-width: 420px;
}
.video-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #fff;
}
.video-info .desc {
  font-size: 15px;
  margin-bottom: 4px;
  color: #fff;
  line-height: 1.5;
  word-break: break-all;
}
.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}
.tag {
  background: rgba(255,255,255,0.12);
  color: #fff;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 13px;
}
.music-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #fff;
  margin-top: 2px;
}
.music-bar .music-icon {
  font-size: 18px;
}

/* 底部导航栏（纯文字） */
.bottom-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
  height: 56px;
  display: flex;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.bottom-tabs {
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
}
.bottom-tab {
  color: rgba(255,255,255,0.7);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 500;
  padding: 0 8px;
}
.bottom-tab.active {
  color: #fff;
  font-weight: 700;
  border-bottom: 2.5px solid #fff;
  padding-bottom: 2px;
}

/* 右侧操作区 - 抖音风格+动效 */
.interaction-panel {
  position: absolute;
  right: 16px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  z-index: 10;
}
.avatar-wrapper {
  position: relative;
  margin-bottom: 12px;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2.5px solid #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  object-fit: cover;
  background: #222;
}
.follow-btn {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #FE2C55;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(254,44,85,0.18);
  z-index: 1;
  animation: pop-in 0.4s cubic-bezier(.68,-0.55,.27,1.55);
  transition: background 0.2s, transform 0.2s;
}
@keyframes pop-in {
  0% { transform: translateX(-50%) scale(0.7); opacity: 0; }
  80% { transform: translateX(-50%) scale(1.15); opacity: 1; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}
.follow-btn:active {
  transform: translateX(-50%) scale(0.92);
}
.follow-btn.followed {
  display: none;
}
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  cursor: pointer;
  user-select: none;
  transition: transform 0.12s;
}
.action-item:active {
  transform: scale(0.92);
}
.icon-wrapper {
  width: 56px;
  height: 56px;
  background: rgba(0,0,0,0.32);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  position: relative;
  transition: background 0.2s;
}
/* 点赞动画 */
.icon-like {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s, filter 0.18s;
}
.action-item.liked .icon-like {
  animation: like-bounce 0.32s cubic-bezier(.68,-0.55,.27,1.55);
  filter: drop-shadow(0 0 8px #FE2C55);
}
@keyframes like-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(1.3); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.icon-like svg {
  width: 32px;
  height: 32px;
}
.icon-like .heart {
  fill: #fff;
  stroke: #fff;
  stroke-width: 2.5;
  transition: fill 0.18s;
}
.action-item.liked .icon-like .heart {
  fill: #FE2C55;
  stroke: #FE2C55;
}
/* 评论、收藏、分享图标 */
.icon-comment, .icon-collect, .icon-share {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-comment svg, .icon-collect svg, .icon-share svg {
  width: 30px;
  height: 30px;
}
.icon-collect .star {
  fill: none;
  stroke: #fff;
  stroke-width: 2.2;
  transition: fill 0.18s;
}
.action-item.collected .icon-collect .star {
  fill: #FFD700;
  stroke: #FFD700;
}
.icon-share .share {
  stroke: #fff;
  stroke-width: 2.2;
  fill: none;
}
/* 评论气泡 */
.icon-comment .bubble {
  stroke: #fff;
  stroke-width: 2.2;
  fill: none;
}
/* 数字样式 */
.count {
  font-size: 14px;
  color: #fff;
  margin-top: 2px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.32);
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.music-disc-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
  gap: 2px;
}
.music-disc {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #222;
  border: 2.5px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: disc-rotate 2.5s linear infinite;
  margin-bottom: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  position: relative;
}
.music-disc::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}
@keyframes disc-rotate {
  100% { transform: rotate(360deg); }
}
.music-disc img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  z-index: 1;
}
.music-name {
  color: #fff;
  font-size: 13px;
  max-width: 64px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.92;
}

/* 动画效果 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  position: absolute;
}

.scale-enter-from {
  transform: scale(0);
  opacity: 0;
}

.scale-leave-to {
  transform: scale(1.4);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 评论按钮样式 */
.action-item {
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s;
}

/* 遮罩层样式 */
.comments-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* 抽屉主体样式 */
.comments-drawer {
  background: white;
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 抽屉头部 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}
/* 评论抽屉数字特殊样式 */
.drawer-header h3 {
  font-size: 16px;
  color: #333;
  font-weight: 700;
}
.close-btn {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 8px;
}

/* 可滚动评论区域 */
.comments-container {
  overflow-y: auto;
  padding: 16px;
  flex-grow: 1;
}

/* 单条评论样式 */
.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-content {
  flex-grow: 1;
}

.username {
  font-weight: 500;
  margin-bottom: 4px;
}

.text {
  color: #666;
  line-height: 1.4;
}
/* 遮罩层淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 抽屉滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}

/* 核心布局 */
.comments-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.comments-drawer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh; /* 屏幕高度一半 */
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.drawer-header {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 0.7;
}

.icon {
  width: 24px;
  height: 24px;
  fill: #666;
}

.comments-container {
  height: calc(50vh - 64px); /* 计算可用高度 */
  overflow-y: auto;
  padding: 16px 24px;
}

/* 优化滚动条 */
.comments-container::-webkit-scrollbar {
  width: 6px;
}

.comments-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

.comments-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .comments-drawer {
    height: 60vh; /* 移动端显示更多内容 */
  }

  .comments-container {
    height: calc(60vh - 64px);
  }
}
.action-buttons {
  display: flex;
  gap: 20px;
  padding: 12px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  /* 移除默认点击效果 */
  background: none;
  border: none;
  outline: none;
  padding: 8px;
  /* 防止文字选中 */
  user-select: none;
}

/* 移除按钮点击轮廓 */
.action-item:focus {
  outline: none;
  box-shadow: none;
}

.icon-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 移除背景边框 */
  background: none;
  border: none;
}

.icon {
  font-size: 24px;
  /* 移除文本阴影 */
  text-shadow: none;
  transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  /* 修复emoji对齐问题 */
  line-height: 1;
  transform: translateY(2px);
}

/* 点击动画 */
.action-item:active .icon {
  transform: scale(0.9);
}

/* 数字计数样式优化 */
.count {
  font-size: 14px;  /* 增大字号 */
  font-weight: 600; /* 加粗字体 */
  color: white;
  margin-top: 2px;
  text-shadow:
      0 1px 3px rgba(0,0,0,0.5),
      0 0 6px rgba(255,255,255,0.3); /* 双层阴影增强对比 */
  letter-spacing: 0.5px; /* 增加字间距 */
  transition: all 0.3s ease;
}

/* 互动按钮悬停效果 */
.action-item:hover .count {
  transform: scale(1.1);
  text-shadow:
      0 2px 4px rgba(0,0,0,0.6),
      0 0 8px rgba(255,255,255,0.4);
}

/* 过渡效果优化 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(4px);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.2) translateY(-4px);
}

/* 悬停效果 */
.action-item:hover {
  transform: translateY(-2px);
}

.action-item:hover .icon {
  filter: brightness(1.1);
}

/* 已点赞/收藏状态 */
.action-item[data-active="true"] .icon {
  filter: drop-shadow(0 2px 4px rgba(255, 65, 65, 0.2));
}
.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

/* 精确调整关注按钮 */
.follow-btn {
  position: absolute;
  bottom: -4px;  /* 更靠近头像 */
  left: 50%;
  transform: translateX(-50%);
  width: 20px;    /* 更小尺寸 */
  height: 20px;
  border-radius: 50%;
  background: #FE2C55;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;  /* 确保在头像上方 */
}

/* 超小尺寸图标 */
.follow-icon {
  width: 10px;  /* 缩小图标 */
  height: 10px;
  fill: #fff;
  transition: all 0.2s ease;
}

/* 已关注状态完全隐藏按钮 */
.follow-btn.followed {
  opacity: 0;
  transform: translateX(-50%) scale(0);
}

/* 悬停交互优化 */
.follow-btn:not(.followed):hover {
  background: #ff4769;
  transform: translateX(-50%) scale(1.1);
}

/* 点击动画 */
.follow-btn:active {
  transform: translateX(-50%) scale(0.9);
}

/* 头像悬停效果 */
.avatar:hover {
  transform: scale(1.05);
}
/* 基础样式 */
html, body, .app-container {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 禁用全局滚动 */
}
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 视口高度 */
}

.video-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;


  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  /* 滑动时显示下方视频预览 */
  &::after {
    content: '';
    position: absolute;
    bottom: -10%;
    left: 5%;
    width: 90%;
    height: 20%;
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &.swiping::after {
    opacity: 0.4;
  }
}
/* 弹幕按钮样式 */
.danmaku-btn {
  position: absolute;
  left: 12px;
  top: -36px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.5);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  opacity: 0.8;
  transition: all 0.3s;
  z-index: 1001;
}

/* 输入框样式 */
.danmaku-input-box {
  position: absolute;
  left: 60px;
  top: -40px;
  background: rgba(0,0,0,0.8);
  padding: 8px;
  border-radius: 4px;
  display: flex;
  gap: 8px;

  input {
    background: transparent;
    border: 1px solid #666;
    color: white;
    padding: 4px 8px;
    width: 200px;
  }

  button {
    background: #00aeec;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 2px;
  }
}

/* 弹幕动画 */
.danmu {
  position: absolute;
  white-space: nowrap;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  animation: danmaku-scroll linear forwards;
  font-size: 14px;
  left: 100%;       /* 从屏幕右侧外开始 */
}

@keyframes danmaku-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - 100vw)); /* 完全移出左侧 */
  }
}
/* Top Tab Bar */
.top-tab-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.top-tabs {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 18px;
}
.top-tab {
  color: rgba(255,255,255,0.6);
  font-size: 16px;
  padding: 0 6px;
  position: relative;
  cursor: pointer;
  transition: color 0.2s;
}
.top-tab.active {
  color: #fff;
  font-weight: 600;
}
.tab-underline {
  position: absolute;
  left: 50%;
  bottom: -4px;
  transform: translateX(-50%);
  width: 22px;
  height: 3px;
  background: #fff;
  border-radius: 2px;
}
.top-search {
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-icon {
  width: 22px;
  height: 22px;
  fill: #fff;
}

/* Bottom Tab Bar */
.bottom-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
  height: 60px;
  display: flex;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.bottom-tabs {
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
}
.bottom-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
  min-width: 48px;
}
.bottom-tab.active {
  color: #fff;
}
.tab-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
}
.plus {
  position: relative;
  top: -18px;
  z-index: 2;
}
.plus-btn {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #FE2C55 60%, #fff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(254,44,85,0.15);
  border: 4px solid #fff;
}
</style>
