<template>
  <div class="shop-home">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input">
        <i class="search-icon">🔍</i>
        <input type="text" placeholder="搜索商品" v-model="searchText">
      </div>
    </div>

    <!-- 轮播图 -->
    <div class="banner-swiper">
      <div class="swiper-wrapper">
        <div v-for="banner in banners" :key="banner.id" class="swiper-slide">
          <img :src="banner.image" :alt="banner.title">
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <div v-for="category in categories" :key="category.id" class="category-item" @click="selectCategory(category)">
        <img :src="category.icon" :alt="category.name">
        <span>{{ category.name }}</span>
      </div>
    </div>

    <!-- 推荐商品 -->
    <div class="recommend-section">
      <div class="section-header">
        <h3>推荐商品</h3>
        <span class="more">查看更多 ></span>
      </div>
      <div class="product-grid">
        <div v-for="product in recommendProducts" :key="product.id" class="product-card" @click="viewProduct(product)">
          <div class="product-image">
            <img :src="product.image" :alt="product.name">
            <div v-if="product.discount" class="discount-tag">{{ product.discount }}折</div>
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">
              <span class="current-price">¥{{ product.price }}</span>
              <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
            </div>
            <div class="product-stats">
              <span class="sales">已售{{ product.sales }}件</span>
              <span class="rating">⭐{{ product.rating }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 直播带货 -->
    <div class="live-shopping">
      <div class="section-header">
        <h3>直播带货</h3>
        <span class="more">查看更多 ></span>
      </div>
      <div class="live-list">
        <div v-for="live in liveShows" :key="live.id" class="live-card" @click="enterLive(live)">
          <div class="live-cover">
            <img :src="live.cover" :alt="live.title">
            <div class="live-status">
              <span class="status-tag">直播中</span>
              <span class="viewer-count">{{ live.viewerCount }}观看</span>
            </div>
          </div>
          <div class="live-info">
            <div class="live-title">{{ live.title }}</div>
            <div class="live-products">
              <img v-for="product in live.products" :key="product.id" :src="product.image" :alt="product.name">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 搜索
const searchText = ref('')

// 轮播图数据
const banners = ref([
  {
    id: 1,
    image: 'https://picsum.photos/800/400',
    title: '促销活动1'
  },
  {
    id: 2,
    image: 'https://picsum.photos/800/400',
    title: '促销活动2'
  }
])

// 分类数据
const categories = ref([
  {
    id: 1,
    name: '服装',
    icon: 'https://picsum.photos/50/50'
  },
  {
    id: 2,
    name: '美妆',
    icon: 'https://picsum.photos/50/50'
  },
  {
    id: 3,
    name: '数码',
    icon: 'https://picsum.photos/50/50'
  },
  {
    id: 4,
    name: '食品',
    icon: 'https://picsum.photos/50/50'
  },
  {
    id: 5,
    name: '家居',
    icon: 'https://picsum.photos/50/50'
  }
])

// 推荐商品
const recommendProducts = ref([
  {
    id: 1,
    name: '商品名称1',
    price: 99.99,
    originalPrice: 199.99,
    discount: 5,
    image: 'https://picsum.photos/200/200',
    sales: 1000,
    rating: 4.8
  },
  {
    id: 2,
    name: '商品名称2',
    price: 199.99,
    image: 'https://picsum.photos/200/200',
    sales: 500,
    rating: 4.5
  }
])

// 直播带货
const liveShows = ref([
  {
    id: 1,
    title: '直播标题1',
    cover: 'https://picsum.photos/300/200',
    viewerCount: 1234,
    products: [
      {
        id: 1,
        image: 'https://picsum.photos/50/50'
      },
      {
        id: 2,
        image: 'https://picsum.photos/50/50'
      }
    ]
  }
])

// 方法
const selectCategory = (category: any) => {
  console.log('选择分类:', category)
}

const viewProduct = (product: any) => {
  console.log('查看商品:', product)
}

const enterLive = (live: any) => {
  console.log('进入直播:', live)
}
</script>

<style scoped>
.shop-home {
  padding-bottom: 50px;
}

/* 搜索栏 */
.search-bar {
  padding: 10px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-input {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 15px;
}

.search-icon {
  margin-right: 8px;
}

.search-input input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
}

/* 轮播图 */
.banner-swiper {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.swiper-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 分类导航 */
.category-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 15px;
  background: white;
  gap: 10px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.category-item img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* 推荐商品 */
.recommend-section {
  margin-top: 10px;
  background: white;
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.more {
  color: #999;
  font-size: 14px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-image {
  position: relative;
}

.product-image img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.discount-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #FE2C55;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 8px;
}

.product-name {
  font-size: 14px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 5px;
}

.current-price {
  color: #FE2C55;
  font-size: 16px;
  font-weight: bold;
}

.original-price {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

/* 直播带货 */
.live-shopping {
  margin-top: 10px;
  background: white;
  padding: 15px;
}

.live-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 5px 0;
}

.live-card {
  flex: 0 0 280px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.live-cover {
  position: relative;
}

.live-cover img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.live-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-tag {
  background: #FE2C55;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.live-info {
  padding: 8px;
}

.live-title {
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live-products {
  display: flex;
  gap: 5px;
}

.live-products img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

/* 自定义滚动条 */
.live-list::-webkit-scrollbar {
  height: 4px;
}

.live-list::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.live-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}
</style> 