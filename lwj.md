# 配合GPT代码实践

## 1. 多线程的实现方式

### 1.1 worker_threads：开启多线程
**核心特点：**
- 线程是轻量级的，并且属于同一个进程。
- 可以共享内存，例如通过 SharedArrayBuffer 共享数据。
- 各线程之间的通信效率高，适合 CPU 密集型任务（如计算、图像处理）。
- 线程的崩溃会影响整个主进程，因为线程共享同一进程的内存空间。

**适用场景：**
- 高性能计算任务。
- 需要共享大量数据或频繁通信的任务。

### 1.2 cluster：创建子进程
**核心特点：**
- 通过 cluster 模块创建多个子进程。
- 每个子进程运行在独立的内存空间。
- 默认情况下，子进程之间使用 IPC（进程间通信）进行通信。
- 适合利用多核 CPU 的服务器来处理高并发请求。
- 子进程之间互相独立，一个崩溃不会影响其他子进程。

**适用场景：**
- 多核服务器上的负载均衡。
- 处理 I/O 密集型任务（如网络请求、文件读写）。

### 1.3 child_process：创建独立进程
**核心特点：**
- 独立的进程，完全与主进程隔离。
- 主进程和子进程之间通过 IPC 通信。
- 可以运行其他脚本语言（如 Python、Shell 等），或者执行外部命令。
- 子进程的崩溃不会影响主进程。

**适用场景：**
- 调用外部命令或脚本（如 exec, spawn）。
- 执行任务完全独立，不需要频繁与主进程通信。

### 1.4 对比总结

| 特性          | worker_threads | cluster                   | child_process   |

| 执行方式       | 多线程          | 子进程                     | 独立进程        |
| 内存空间       | 共享内存         | 独立内存                   | 独立内存        |
| 通信方式       | 共享内存或消息传递 | IPC 通信                  | IPC 通信        |
| 适用任务       | CPU 密集型       | I/O 密集型                 | 外部命令或独立任务 |
| 崩溃影响       | 线程崩溃影响主进程 | 一个子进程崩溃不影响其他子进程 | 子进程崩溃不影响主进程 |
| 性能开销       | 较低           | 较高（进程切换开销）            | 较高（独立进程启动） |

## 2. 发布/订阅模式 (Pub/Sub)

发布/订阅模式是一种多对多的模式。这里的核心思想是消息的发布者和消息的订阅者是解耦的。发布者发送消息（即事件），而订阅者接收这些消息。多个发布者可以同时广播消息，多个订阅者可以同时接收到消息。

**关键特点：**
- 多个发布者（Publishers）：可以有多个对象发送消息。
- 多个订阅者（Subscribers）：多个对象可以订阅同一消息。
- 解耦：发布者和订阅者互不直接联系，发布者不知道有多少订阅者，订阅者也不关心是哪个发布者发送消息。
- 灵活性：任何对象都可以作为发布者发送消息，不需要固定的广播者。

```javascript
class PubSub {
    constructor() {
        this.events = {};
    }

    // 发布消息
    publish(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    // 订阅消息
    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // 取消订阅
    unsubscribe(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// 示例
const pubSub = new PubSub();

// 订阅事件
pubSub.subscribe('click', (data) => { console.log('Observer1 received click with data:', data); });
pubSub.subscribe('click', (data) => { console.log('Observer2 received click with data:', data); });

// 发布事件
pubSub.publish('click', { x: 10, y: 20 });
```
## 3. 观察者模式 (Observer)
观察者模式 是一种 一对多 的模式，通常由一个 主题（Subject）（或者叫做 被观察者（Observable））和多个 观察者（Observers） 构成。

**关键特点：**
- 一个发布者（Subject）：只有一个对象会广播（或者通知）其他对象。
- 多个订阅者（Observers）：多个对象可以订阅这个单一的发布者（即观察者）。
- 固定性：在观察者模式中，通常只有一个发布者对象（主题），并且每个观察者都监听该主题的变化。
- 耦合：观察者和被观察者之间通常存在较强的依赖关系，观察者知道它监听的是什么对象。

```javascript
class PubSub {
    constructor() {
        this.events = {};
    }

    // 发布消息
    publish(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    // 订阅消息
    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // 取消订阅
    unsubscribe(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// 示例
const pubSub = new PubSub();

// 订阅事件
pubSub.subscribe('click', (data) => { console.log('Observer1 received click with data:', data); });
pubSub.subscribe('click', (data) => { console.log('Observer2 received click with data:', data); });

// 发布事件
pubSub.publish('click', { x: 10, y: 20 });

```
## 4 webpack,vite怎么实现多个入口打包

### 4.1 webpack
允许多入口打包，通过配置entry属性来指定多个入口文件。
1. 配置多个入口文件，每个入口文件对应一个输出文件。
2. 配置htmlWebpackPlugin，为每个入口文件生成对应的html文件。

### 4.2 vite
默认单一入口设置，但是也可以配置多个入口的场景。通过多个html 文件进行配置
1. 使用 build.rollupOptions.input 来指定多个入口。vite会根据这个进行打包

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 指定多个 HTML 文件作为入口
        main: 'index.html',
        about: 'about.html',
        contact: 'contact.html',
      },
    },
  },
});
```
2. 生成动态的html文件，使用vite-plugin-html
```javascript
import { defineConfig } from 'vite';
import html from '@rollup/plugin-html';

export default defineConfig({
  plugins: [
    html({
      inject: {
        // 插入不同的 JS 或配置
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        contact: 'contact.html',
      },
    },
  },
});
```

## 5. 为什么vite要在开发环境用esbuild而生产环境使用rollup
开发环境和生产环境的核心需求不同
开发环境和生产环境有截然不同的需求，工具的选择也是为了满足这些需求：
开发环境的核心需求：
- 速度：需要快速启动服务，响应频繁的代码变更。
- 热更新（HMR）：支持模块的实时热替换，减少开发等待时间。
- 实时调试：只处理修改的文件，保持浏览器与代码状态一致，省去不必要的构建。
esbuild 优势：
- 极快的构建速度（Go 编写，效率高）。
- 高效处理模块加载，支持按需重新编译和热更新。
- 内置 TypeScript、JSX 转换，省去额外的编译工具。
生产环境的核心需求：
- 体积优化：需要对代码进行深度分析，移除冗余部分，压缩输出结果。
- 按需加载：生成精细化的代码分割策略，减少加载时间。
- 多种输出格式支持：需要为不同平台（浏览器、Node.js）生成对应的模块规范（ESM、CJS、UMD 等）。
- 插件生态和扩展性：支持复杂的构建优化，比如 CSS 提取、图片压缩、多语言支持等。
Rollup 优势：
- 强大的 Tree Shaking（深入分析模块间的依赖关系，剔除未使用代码）。
- 灵活的代码分割（可手动配置分割策略）。
- 丰富的插件生态（支持生产优化如压缩、Polyfill、CSS 分离等）。
- 输出格式多样化（适配多种平台）。

## 6. 为什么开发环境不用 Rollup？
虽然 Rollup 是一个优秀的打包工具，但它并不适合开发环境，原因如下：
- 构建速度慢：
  - Rollup 在打包时会深度分析依赖关系并优化代码，适合生产环境，但在开发中不必要。
  - 每次修改代码时，Rollup 都需要重新分析和构建整个依赖图，影响开发体验。
- 热更新性能差：
  - Rollup 的 HMR 支持不如 esbuild 高效。
  - esbuild 可以快速定位和重新构建发生变更的模块，Rollup 则需要更复杂的处理。
- 不需要复杂优化：
  - 开发环境的目标是快速调试，不需要生产环境那样复杂的 Tree Shaking 和代码分割策略。
  - 使用 Rollup 反而会浪费时间在不必要的优化上。
结论：Rollup 在开发环境中性能较低，无法满足快速迭代和实时热更新的需求。

## 7. 为什么生产环境不用 esbuild？
尽管 esbuild 在性能上有显著优势，但它在生产环境中存在以下限制：
- Tree Shaking 深度不足：
  - esbuild 的 Tree Shaking 基于静态分析，只移除明确未使用的导出，无法像 Rollup 那样深度分析模块间的副作用（side effects）。
  - 例如：Rollup 能够检测 import 的模块是否实际被使用，即使代码中包含复杂逻辑，也能剔除无用部分。
- 代码分割灵活性有限：
  - esbuild 的代码分割策略自动化程度高，但缺乏定制性。
  - Rollup 支持通过 manualChunks 等配置项手动调整分割策略，这对于生产环境的大型项目非常重要。
- 插件生态较少：
  - esbuild 的插件系统轻量，适合简单扩展，但无法满足复杂的生产需求（如动态 Polyfill 插入、特定压缩逻辑等）。
  - Rollup 的插件生态更成熟，支持多种构建优化场景。
- 多格式输出：
  - Rollup 支持生成多种模块格式（CJS、ESM、UMD、IIFE 等），满足生产环境不同平台的需求。
  - esbuild 的多格式支持相对较弱，功能不够灵活。
结论：esbuild 在生产环境中的功能灵活性和优化深度不如 Rollup，无法满足复杂的生产优化需求。

## 8. watch，watchEffect,useEffect和useLayoutEffect 执行时机

## 9. windos对象与document对象有什么区别
window 对象：
- window 是浏览器的全局对象，它代表了浏览器的窗口，是所有浏览器对象的根对象。
- window 对象包含了浏览器的整体环境、设置和功能，例如浏览器窗口、定时器、事件、localStorage、sessionStorage、location、history 等。
- window 对象是全局执行上下文，在 JavaScript 中你不需要显式地引用它，它会自动在全局作用域下提供很多属性和方法。
- window 是整个浏览器的上下文，因此它有 load 事件，指的是整个页面（包括所有资源，如图片、脚本、样式表等）完全加载完成时触发的事件。
window.addEventListener('load', () => {console.log('window load')})
document 对象：
- document 是 window 对象的一个属性，代表网页的文档对象，即网页的内容。
- document 用于访问和操作网页的内容，比如 HTML 元素、DOM 树、事件监听等。
- document 对象主要用于操作页面上的 HTML 元素、获取数据或插入新内容等。它不负责浏览器窗口本身。
- document 对象有一个 DOMContentLoaded 事件，指的是 HTML 文档被完全加载和解析完成，但并不等待样式表、图像等其他资源的加载。
document.addEventListener('DOMContentLoaded', () => {console.log('document loaded')})

## 10. LRU算法
/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
    this.capacity=capacity
    this.queue=new Map()
};

/** 
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
    if(this.queue.has(key)){
        const val=this.queue.get(key)
        this.queue.delete(key)
        this.queue.set(key,val)
        return val
    }
    return -1
};

/** 
 * @param {number} key 
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
  if(this.queue.has(key)){
    this.queue.delete(key)
    this.queue.set(key,value)
  }else if(this.queue.size===this.capacity){
    const firstKey = this.queue.keys().next().value;
    this.queue.delete(firstKey)
    this.queue.set(key,value)
  }else{
    this.queue.set(key,value)
  }
};

8. 什么是 Gzip 压缩？
Gzip 压缩是一种通用的文件压缩算法，广泛应用于网络传输中，用于减少文件大小，从而加快传输速度。
在前端开发中，Gzip 常用于压缩 HTML、CSS、JavaScript 等静态资源，在服务器传输到客户端时减小文件体积。
工作原理
1. 压缩：服务器将文件进行压缩，生成一个更小的版本。
2. 传输：将压缩后的文件发送到客户端。
3. 解压缩：浏览器或客户端解压收到的内容并展示。
如何在项目中使用 Gzip？
1. 使用服务器配置启用 Gzip
服务器可以通过配置开启 Gzip 压缩，常见的服务器包括：
1.1 Nginx
在 Nginx 配置文件中启用 Gzip：
http {
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  gzip_min_length 1024;
  gzip_comp_level 6; # 压缩等级（1-9，9为最高）
}
Webpack
安装 compression-webpack-plugin：
npm install compression-webpack-plugin --save-dev

const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/, // 压缩这些文件
      threshold: 10240, // 仅处理大于 10KB 的文件
      minRatio: 0.8,    // 压缩比大于 0.8 才处理
    }),
  ],
};
Vite
安装 vite-plugin-compression：
npm install vite-plugin-compression --save-dev
import compression from 'vite-plugin-compression';

export default {
  plugins: [
    compression({
      algorithm: 'gzip',
      ext: '.gz', // 输出 .gz 文件
    }),
  ],
};
验证 Gzip 是否生效----浏览器开发者工具：
- 在 Chrome 的开发者工具中，检查网络请求头，查看 Content-Encoding: gzip
9. Vue的keep-alive 原理
keep-alive中运用了LRU(Least Recently Used)算法。
1. 获取 keep-alive 包裹着的第一个子组件对象及其组件名； 如果 keep-alive 存在多个子元素，keep-alive 要求同时只有一个子元素被渲染。所以在开头会获取插槽内的子元素，调用 getFirstComponentChild 获取到第一个子元素的 VNode。
2. 根据设定的黑白名单（如果有）进行条件匹配，决定是否缓存。不匹配，直接返回组件实例（VNode），否则开启缓存策略。
3. 根据组件ID和tag生成缓存Key，并在缓存对象中查找是否已缓存过该组件实例。如果存在，直接取出缓存值并更新该key在this.keys中的位置（更新key的位置是实现LRU置换策略的关键）。
4. 如果不存在，则在this.cache对象中存储该组件实例并保存key值，之后检查缓存的实例数量是否超过max设置值，超过则根据LRU置换策略删除最近最久未使用的实例（即是下标为0的那个key）。最后将该组件实例的keepAlive属性值设置为true。
var KeepAlive = {
  name: 'keep-alive',
  // 抽象组件
  abstract: true,

  // 接收的参数
  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  // 创建缓存表
  created: function created () {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed: function destroyed () {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted: function mounted () {
    var this$1 = this;

    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) { return matches(val, name); });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) { return !matches(val, name); });
    });
  },

  render: function render () {
    var slot = this.$slots.default;
    // 获取 `keep-alive` 包裹着的第一个子组件对象及其组件名； 
    // 如果 keep-alive 存在多个子元素，`keep-alive` 要求同时只有一个子元素被渲染。
    // 所以在开头会获取插槽内的子元素，
    // 调用 `getFirstComponentChild` 获取到第一个子元素的 `VNode`。
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;
      // 根据设定的黑白名单（如果有）进行条件匹配，决定是否缓存。   
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
      // 不匹配，直接返回组件实例（`VNode`），否则开启缓存策略。
        return vnode
      }

      var ref$1 = this;
      var cache = ref$1.cache;
      var keys = ref$1.keys;
      // 根据组件ID和tag生成缓存Key
      var key = vnode.key == null
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
      if (cache[key]) {
      // 并在缓存对象中查找是否已缓存过该组件实例。如果存在，直接取出缓存值
        vnode.componentInstance = cache[key].componentInstance;
        // 并更新该key在this.keys中的位置（更新key的位置是实现LRU置换策略的关键）。
        remove(keys, key);
        keys.push(key);
      } else {
       // 如果不存在，则在this.cache对象中存储该组件实例并保存key值，
        cache[key] = vnode;
        keys.push(key);
        // 之后检查缓存的实例数量是否超过max设置值，超过则根据LRU置换策略删除最近最久未使用的实例
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }
                // 最后将该组件实例的keepAlive属性值设置为true。
      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }
};
10. SSO 单点登录
SSO单点登录一半都是后端的操作，当用户登录成功，后端将用户的token塞入携带的cookie中，存于根域名，例如douyin.com，那那么在后续的需要登录的子页面下后可以拿单这个token进行访问数据，同时该token是不允许被篡改的。一般这个登录页也是存在于每个项目独立的认证中心，是整个平台的登录页，以免登录数据传递复杂。

用户将账号密码信息发给认证中心，认证中心有个 session 表格，里面是键值对，key 是生成的全局唯一 id，value 就是用户的身份信息，一旦用户登录成功，表格里面就会记录一条信息。

利用 cookie 把 sid 带给用户，浏览器就会保存这个 sid，后面浏览器访问子系统时就会把 sid 带过去
子系统并没有这个 session 表去判定是否有效，于是子系统会将接收到的 sid 发给认证中心，认证中心去查，查到后会告诉子系统该用户完成登录了，具有权限，把身份信息给到子系统
[图片]
这种模式下只要用户体量很大，认证中心的压力就会非常大，不同子系统不断的给认证中心发 sid 让他判断，并且表也会非常庞大，还要做 session 集群，并且认证中心不能挂，你需要给他做一个 session 容灾；再者，某个子系统的用户体量很大导致该系统要扩容，这样一来，这个子系统给认证中心发 sid 的频率也在变大，随之认证中心也要扩容；这里面所有的缺陷最终都是指向烧钱，为了降低成本，token 模式随之诞生
[图片]
用户第一次登录会收到认证中心的两个 token，假设用户过了一段时间去登录子系统，原 token 过期了，子系统告诉这个 token 失效，此时用户会将 刷新 token 发给认证中心去验证，认证中心会返回一个新的 token 给到用户，用户再去访问子系统就可以正常访问了
这个模式的意义相较于单 token 模式多了层对用户的控制，比如某个用户违规操作希望让其下线，虽然不能让该用户立即下线，但是原 token 一旦过期，用户拿着 refreshToken 向认证中心索要 token 时，认证中心不管就行，其余子系统是无感的

SSO（单点登录）通常是由后端实现的认证机制。当用户登录成功后，后端将用户的认证凭据（通常是一个 Token）通过 HTTP 响应的 Set-Cookie 头写入到客户端的 Cookie 中。
1. Token 存储在根域名：Token 通常存储在根域名（例如 douyin.com）的 Cookie 中，这样所有子域名（如 a.douyin.com、b.douyin.com）都可以共享该 Token。
2. Token 的安全性：该 Token 是经过加密签名的，确保它不能被伪造或篡改。后端验证时会检查签名的有效性，并确认 Token 是否过期或被吊销。
3. 统一登录页：为了简化登录管理和避免重复登录，SSO 平台通常提供一个统一的登录页（如 login.douyin.com），而不是每个项目独立维护登录页。这样可以集中处理认证逻辑，并便于后续扩展和维护。
在后续访问需要登录的页面时，浏览器会自动携带根域的 Cookie 中的 Token。后端读取该 Token 后验证其合法性，从而决定是否允许用户访问数据或服务。
SSO 实现的核心原理
1. 统一登录平台
SSO 的登录页通常是整个平台的一个独立模块，而不是各子系统自己维护登录页。这确保了用户只需要登录一次，即可访问所有需要登录的子系统，避免了重复登录的问题。
2. 例如：
  - 用户访问子系统 A，但尚未登录，会被重定向到统一的登录页（如 login.douyin.com）。
  - 登录成功后，用户被重定向回子系统 A，并附带一个有效的认证凭据（如 token）。
3. 跨子域共享认证凭据
登录成功后，后端会将认证凭据（如 token）写入到根域名的 Cookie 中，例如 douyin.com。
  - 这样，不同的子域名（如 a.douyin.com 和 b.douyin.com）都可以共享同一个 Cookie，因为它们的顶级域名是相同的。
4. 安全性保证
  - 防篡改：Token 通常采用加密签名技术，如 JWT（JSON Web Token），防止被篡改。签名部分由后端私钥生成，前端无法伪造。
  - HTTPS：所有请求都通过 HTTPS 传输，防止中间人攻击。
  - HttpOnly：Cookie 通常设置为 HttpOnly，防止通过 JavaScript 直接访问。
  - SameSite 属性：为防止 CSRF 攻击，Cookie 的 SameSite 属性会限制跨站点的发送行为。

---
SSO 工作流程
1. 用户登录：
  - 用户输入凭据（如用户名和密码）到统一登录页。
  - 登录页验证成功后，后端生成一个认证 token 并将其写入根域的 Cookie 中（Set-Cookie 响应头）。
2. 子系统访问：
  - 用户访问某子系统（如 a.douyin.com），浏览器会自动携带根域的 Cookie（包括 token）发送给后端。
  - 子系统后端从 Cookie 中读取 token 并验证其有效性（通常通过解密或检查签名）。
  - 如果 token 有效，则返回对应的数据，否则重定向到登录页。
3. 注销：
  - 用户点击注销时，后端会清除根域的 Cookie，或使 token 失效。
  - 这样所有子系统的访问都需要重新登录。

---
注意点和补充
1. Token 的有效期
  - Token 通常设置为短时有效，结合刷新 Token 机制。这样可以减小 Token 泄露的风险。
  - 例如，主 Token（Access Token）有效期为 10 分钟，Refresh Token 有效期为 7 天。
2. 子系统的无状态验证
  - 子系统不需要存储用户的登录状态，只需要验证 token 的合法性。通过 JWT 解析 Token 即可得知用户信息。
3. 跨域问题
  - 如果 SSO 涉及跨域登录（例如 app.douyin.com 和 api.douyin.com），需要正确设置 Cookie 的 Domain 和 SameSite 属性。
4. 第三方登录整合
  - 如果平台支持第三方登录（如微信、Google 登录），可以通过 OAuth2.0 协议对接，并将返回的凭据与本地 SSO 系统对接。

11. CDN静态资源压缩（Gzip Brotli）
将图片放上CDN后CDN会压缩还是，需要我压缩再上传到CDN上，前端使用这个图片需要进行什么配置吗，还是直接请求，浏览器会自动解析？
1. CDN 是否会自动压缩图片
大多数现代 CDN（如 Cloudflare、AWS CloudFront、Aliyun CDN）提供图片优化服务，包括：
- 自动压缩：根据客户端的请求头（如 Accept-Encoding），动态选择最优压缩格式（如 WebP、AVIF）。
- 调整分辨率：根据设备分辨率提供更合适大小的图片（如响应式图片）。
检查是否自动压缩：
1. 查看 CDN 服务的文档，确认是否支持图片优化（如 WebP 支持、按需调整图片尺寸）。
2. 确保上传到 CDN 的图片是高质量未压缩的原图（如 PNG、JPEG），以便 CDN 动态生成优化版本。

---
2. 是否需要手动压缩图片后上传到 CDN
如果 CDN 不支持图片压缩优化，你需要在上传前手动压缩图片。可以使用以下工具：
- 工具：
  - ImageOptim：GUI 工具，支持 JPEG、PNG、GIF 的无损压缩。
  - Squoosh：在线工具，支持压缩成 WebP、AVIF。
  - Sharp：Node.js 图片处理库，支持批量图片优化。
- 目标格式：
  - WebP 或 AVIF：现代格式，压缩率高，浏览器支持较广。
  - JPEG 或 PNG：传统格式，适合不支持 WebP 的旧浏览器。

---
3. 前端使用 CDN 图片的配置
前端不需要特别复杂的配置，直接通过 URL 请求图片即可，浏览器会根据 CDN 的响应解析和展示图片。
1. 图片加载：
  - HTML 标签：<img src="https://cdn.example.com/image.jpg" alt="example">
  - CSS 背景：background-image: url('https://cdn.example.com/image.jpg');
2. 响应式图片（推荐）： 使用 <picture> 或 srcset 来实现多种分辨率和格式的适配：
<picture>
  <source srcset="https://cdn.example.com/image.webp" type="image/webp">
  <source srcset="https://cdn.example.com/image.jpg" type="image/jpeg">
  <img src="https://cdn.example.com/image.jpg" alt="example">
</picture>

12. 强缓存与协商缓存
强缓存是指浏览器在缓存有效期内直接使用缓存，而不向服务器发送请求。
启用强缓存可以在相应头设置Cache-Control: max-age=3600，这里是设置3600s，以s为单位
或者设置相应头Expires: Sat, 21 Dec 2024 23:12:28 GMT，给一个过期的时间。
不发生强缓存则可以设置为Cache-Control: no-store，或者Expires设置为一个过期时间。
协商缓存是指浏览器在缓存过期后，会向服务器发送请求，验证缓存数据是否过期。
启动协商缓存则设置Last-Modefied一个文件最后的修改时间，和ETag设置资源的唯一标识符。
不发生协商缓存则可以设置Cache-Control: no-store，或者将Last-Modified， ETag这俩响应头设置为无效值或者不设置。
[图片]

13. 前端监控业务埋点
- 用户点击（渲染时长，曝光）埋点
- js错误，请求错误收集
- 请求耗时
监控页面加载时长 利用 window.performance 获取加载关键指标。
通过 PerformanceObserver 监听特定的元素渲染。
全局监听未捕获异常：window.error,拦截请求： 利用 fetch 和 XMLHttpRequest 的拦截能力，记录请求错误。
在拦截器中记录请求开始和结束时间：

14. watchEffect与watch
watchEffect
自动收集依赖： watchEffect 会自动追踪在回调中使用的响应式数据，因此不需要手动指定需要观察的响应式数据。
立即执行： watchEffect 会在创建时立即执行一次回调函数。
watchEffect 是在 响应式数据变化后立即执行，但是它的执行时机是 在 DOM 更新之前 执行的。它的执行过程不会阻塞渲染，Vue 会将副作用的执行放入 微任务队列 中，在 DOM 更新之后再执行。
没有特定的依赖源： 它没有特定的目标，它观察的是所有在回调函数中访问的响应式数据。
watch
watch 是用于观察特定响应式数据或计算属性的变化，并在数据变化时执行指定的回调。它可以指定特定的依赖项，而不仅仅是自动收集所有访问的响应式数据。
- 手动指定依赖项： watch 需要明确指定要观察的数据或计算属性，并且回调函数仅在指定的数据发生变化时执行。
- 延迟执行： watch 的回调函数在依赖项发生变化时才会执行，不会立即执行。
- 可以监听深层嵌套数据： watch 支持 deep 选项，可以深度监听对象或数组的变化。
- 可以处理异步操作： watch 允许你在回调中执行异步操作。
watch 是在指定的响应式数据或计算属性变化时执行的，它的执行时机可以控制得更细致。和 watchEffect 不同，watch 在执行时不会像 watchEffect 那样立即触发副作用，而是延迟到 DOM 更新完成之后 才会执行。
[图片]
15. 并发限制
多请求并发时，接口连接池
class ConnectionPool {
    constructor(maxConcurrent) {
      this.maxConcurrent = maxConcurrent; // 最大并发数量
      this.currentConcurrent = 0; // 当前正在执行的任务数量
      this.taskQueue = []; // 待执行任务队列
    }
  
    // 添加任务到连接池
    addTask(task) {
      return new Promise((resolve, reject) => {
        const wrappedTask = () => {
          this.currentConcurrent++;
          task()
            .then(resolve)
            .catch(reject)
            .finally(() => {
              this.currentConcurrent--;
              this.runNext(); // 任务完成后尝试执行下一个任务
            });
        };
  
        if (this.currentConcurrent < this.maxConcurrent) {
          wrappedTask(); // 如果未达到最大并发数，直接执行任务
        } else {
          this.taskQueue.push(wrappedTask); // 否则将任务加入队列
        }
      });
    }
  
    // 执行下一个任务
    runNext() {
      if (this.taskQueue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
        const nextTask = this.taskQueue.shift(); // 取出队列中的下一个任务
        nextTask();
      }
    }
  }
  
  // 示例任务：模拟异步操作
  const mockTask = (id, duration) => {
    return () =>
      new Promise((resolve) => {
        console.log(`Task ${id} started`);
        setTimeout(() => {
          console.log(`Task ${id} finished`);
          resolve(`Result of task ${id}`);
        }, duration);
      });
  };
  
  // 使用链接池
  (async () => {
    const pool = new ConnectionPool(5); // 最大并发数为 5
  
    const tasks = Array.from({ length: 20 }, (_, i) =>
      mockTask(i + 1, Math.random() * 2000 + 1000) // 创建 20 个任务，每个任务耗时随机1～3秒
    );
  
    const results = await Promise.all(tasks.map((task) => pool.addTask(task)));
    console.log('All tasks completed', results);
  })();
16. 一个网页从获取资源到最终展示在屏幕上
按照浏览器渲染的时间顺序，一个网页从获取资源到最终展示在屏幕上，通常会经历以下几个子阶段：
- 构建 DOM 树：浏览器从网络或磁盘中获取HTML文档，并将其转换为DOM树。该树表示HTML文档的层级关系。
- 样式合成：浏览器将获取到的 CSS文件经过标准化、继承和层叠之后计算出最终的形成一个styleSheets表，也有另一种说法叫做CSSOM树
- 布局阶段：根据 DOM树和样式信息计算页面中每个可见元素的位置和大小，形成布局树，包括滚动条、文字换行等。
- 分层：根据布局树将页面划分为多个图层，方便独立渲染和优化性能。
- 绘制：渲染线程将图层拆成一个个绘制指令，最后集合成一个绘制列表。
- 分块：将图层进一步划分为小块（tiles），提升渲染效率。
- 光栅化：将矢量图形的每个小块转化为像素图，生成最终的位图。
- 合成：将多个图层和小块按照正确的顺序合成，调用OpenGL（意为"开放图形库"，可以在不同操作系统、不同编程语言间适配2D，3D矢量图的渲染。）生成最终的屏幕显示内容。
17. http发展史
[图片]
HTTP/0.9
1. 客户端发送get请求，比如请求一个/index.html
2. 服务端接收请求，读取对应的html文件，以ASCII的字符流返回给客户端
只有请求行，没有请求头和请求体，因此0.9版本的http也被称之为单行协议，因此也没有响应头
HTTP/1.0
1. 相比较0.9，支持多种类型文件的传输，且不限于ASCII编码方式
2. 既然多种文件，那么就需要信息告诉浏览器如何加载这些文件，因此引入请求头，响应头来让客户端和服务端更加深入的交流，并且是key-value的形式
为什么有了请求头和响应头就能支持多种文件的数据传输
请求头
accept: text/html 告诉服务端我期望接收到一个html的文件
accept-encoding: gzip, deflate, br 告诉服务端以这种方式压缩
accept-language: zh-CN 告诉服务端以中文的格式返回
响应头
content-encoding: br 告诉浏览器压缩方式是br
content-type: text/html; charset=utf-8 告诉浏览器以这种方式，编码加载
1.0时，比如展示一个页面，用到几个js文件，css文件，用一次就会单独用http请求一次，文件不多还好，但是随着需求增加，一个页面可能会用到很多js文件，以及第三方库，或者说图片资源，展示一个页面会发很多次请求，非常影响性能
HTTP/1.1
1. 持久连接（keepalive），一个tcp连接建立，可以传输多个http请求，减少了大量的tcp连接和断开连接带来的开销
1. 持久连接带来了队头阻塞的问题，这个问题没办法解决
2. Chunk transfer机制处理动态数据包的长度
1.0时一个页面展示每用到一个js脚本，图片等都需要重新建立一次连接，做无谓的重复，因此1.1推出了持久连接或者长连接来解决这个问题
HTTP/2.0
多路复用：
- HTTP/1.x 使用一个 TCP 连接处理一个请求，或者通过管道化部分解决，但容易受阻塞问题影响。
- HTTP/2 在一个 TCP 连接中传输多个并行请求，独立分帧，解决了队头阻塞问题。
二进制分帧：
- HTTP/1.x 以文本格式传输，解析复杂且效率较低。
- HTTP/2 将数据拆分为帧，每个帧都有标识头部和负载部分，提升传输和解析效率。
首部压缩：
- HTTP 请求和响应的头部往往冗余，例如每次都包含 User-Agent、Cookie 等信息。
- HTTP/2 使用 HPACK 算法，对头部进行压缩，减少冗余数据传输。
服务器推送：
- 服务器可以主动向客户端发送数据，无需等待客户端请求。
HTTP/3.0
[图片]
18. GET与POST区别
[图片]
19. Vue中文本节点及oldNode 与newNode diff
Vue 中的 VNode 树结构
Vue 会将每个元素、文本、组件等转换为 VNode。对于普通的 HTML 元素，如 <div>，Vue 会创建一个对应的 VNode，包含该元素的标签名、属性（props）、子节点等信息。如果元素中包含文本节点，那么 Vue 会将文本节点也转换为一个单独的 VNode 对象。
<div>
  文本
</div>
VNode 树中的结构
在 Vue 的 VNode 树中，这个结构大致会转换成如下：
{
  tag: 'div',          // 对应的 HTML 标签
  props: {},           // 元素的属性，空对象代表没有属性
  children: [          // 子节点是一个数组
    {
      tag: undefined,   // 文本节点没有 tag
      content: '文本'   // 文本内容
    }
  ]
}
oldNode 与newNode diff
首先，Vue 会检查当前节点和新节点的 节点类型（即 tag 值）
如果两个节点的 tag 相同，Vue 会进一步检查 key 值。如果 key 相同且节点类型一致，那么 Vue 会认为这些节点是相同的，继续执行子节点的 diff 过程。
- 如果 key 相同，Vue 会进一步比较节点的属性和子节点。
- 如果 key 不同，Vue 会认为这两个节点完全不同，并进行删除旧节点、插入新节点的操作。
key 是帮助 Vue 快速识别节点身份的重要标识，尤其在动态列表渲染（如 v-for）中非常重要。如果没有 key，Vue 会退化为基于顺序的比较，这样可能会引入性能问题。
当 key 相同且节点类型相同的情况下，Vue 会继续比较节点的 props（属性），即组件或元素的属性和事件监听器。
- 如果 props 中的值发生了变化，Vue 会更新该节点对应的 DOM 元素或组件的状态。
- 如果没有变化，Vue 会跳过更新，从而避免不必要的渲染。
组件的 patch（组件节点的更新）
当节点是 组件 时，除了上述的 key、props、children 比较外，Vue 还会触发组件的更新过程。这是因为组件的更新不仅仅涉及渲染，还包括生命周期钩子（如 beforeUpdate、updated）以及组件状态的重新计算。
- 在组件的 diff 过程中，Vue 会检查 props 和 内部状态 的变化，并决定是否重新渲染整个组件或仅部分更新。
- 组件的 key 如果发生变化，Vue 会销毁旧的组件实例并创建新的实例。

20. 预检请求options
主要目的确实是为了防止跨域请求直接发送带有复杂资源的请求，从而避免不必要的流量浪费和减轻服务器的并发处理压力。通过预检请求，服务器可以提前告知客户端是否允许实际请求，从而优化网络资源的使用。
触发预检请求的条件
预检请求主要与以下类型的请求相关：
1. HTTP 方法不是简单的请求方法：
  - 简单的请求方法包括：GET, HEAD, 和 POST。
  - 如果使用了其他 HTTP 方法，如 PUT, DELETE, CONNECT, OPTIONS, TRACE, 或 PATCH，则需要进行预检请求。
2. 设置了自定义请求头：
  - 除了以下几种标准头部字段外，添加了任何其他的自定义头部字段也会触发预检请求：
    - Accept
    - Accept-Language
    - Content-Language
    - Content-Type（但仅限于其值为 application/x-www-form-urlencoded、multipart/form-data 或 text/plain）
3. 请求的内容类型不是简单的内容类型：
  - 当 Content-Type 的值不是上述三种之一时，例如 application/json，也会触发预检请求。
4. 使用了读取文件或访问用户数据的API，如 XMLHttpRequest 或 fetch API 发送带有凭证（credentials）的请求（即设置了 withCredentials 选项），并且目标服务器的响应中包含了 Access-Control-Allow-Credentials: true。
预检请求的工作原理
- 预检请求是一个 OPTIONS 请求，它被发送到目标资源 URL，并且包含了一些额外的头部信息来告知服务器即将发生的实际请求的细节。
- 服务器必须明确地回应这些预检请求，告诉浏览器它是否同意实际请求的发生。这通常通过返回适当的 CORS 响应头部来实现，比如 Access-Control-Allow-Methods 和 Access-Control-Allow-Headers。
如何判断是否会触发跨域
当从一个页面发起网络请求时，浏览器会根据以下规则判断该请求是否为跨域请求：
1. 协议：如果请求的目标 URL 使用了不同的协议（例如从 http:// 到 https://），则认为是跨域。
2. 域名：如果请求的目标 URL 的域名不同，则认为是跨域。
3. 端口：即使协议和域名相同，但如果端口不同（例如 http://example.com:8080 和 http://example.com:80），也认为是跨域。
21. 为什么需要引入reflect(reflect是什么)
Object 对象在 JavaScript 中扮演着核心角色，它提供了大量的属性和方法来操作对象。然而，随着语言的发展，Object 的职责变得越来越繁杂，这不仅使得它的接口变得庞大，也增加了维护和理解的成本。为了应对这些问题，并且不破坏现有的代码或引入向后兼容性问题，JavaScript 社区决定引入 Reflect 作为新的内置对象。
1. 简化 Proxy 操作
Reflect 主要是为了配合 Proxy 对象而设计的。当你使用 Proxy 来拦截对象的操作时，Reflect 提供了与原始目标对象进行交互的方法，这使得代理行为更加透明和一致。
例如，如果你想要创建一个 Proxy 来拦截对某个属性的访问，并且在某些情况下允许直接访问该属性，你可以使用 Reflect.get 方法来实现这一点：
const target = {
  name: 'Alice'
};

const handler = {
  get(target, property, receiver) {
    if (property in target) {
      return Reflect.get(target, property, receiver);
    } else {
      throw new Error(`Property ${property} does not exist.`);
    }
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name); // 输出: Alice
2. 更直观的操作
Reflect 提供的方法名称与其所执行的操作更为直观，使代码更具可读性。例如，Reflect.defineProperty 和 Object.defineProperty 都可以定义对象属性，但前者的名字更直接地反映了它的功能。
3. 增强的一致性和可靠性
Reflect 方法的行为更加一致和可靠。比如，Reflect.deleteProperty 在删除不存在的属性时不会抛出异常，而是返回 false，这与 delete 运算符的行为不同。
const obj = { foo: 1 };

// 使用 delete 运算符
console.log(delete obj.bar); // 不报错，返回 true

// 使用 Reflect.deleteProperty
console.log(Reflect.deleteProperty(obj, 'bar')); // 返回 false
4. 更好的错误处理
Reflect 方法通常会在遇到问题时返回布尔值而不是抛出异常，这使得开发者可以更容易地控制流程并处理错误情况。
5. 扩展 JavaScript 的能力
Reflect 还引入了一些新的方法，如 Reflect.construct，它可以用于调用构造函数而不必使用 new 关键字，这对于某些高级编程模式非常有用。
function MyClass() {
  this.value = 42;
}

const instance = Reflect.construct(MyClass, []);
console.log(instance.value); // 输出: 42
22. 继承
原型链继承
无法向父类构造函数传递参数，且所有子类实例共享父类的属性。
function SuperType() {
  this.name = 'SuperType';
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType() {
  this.age = 30;
}

// 子类的原型指向父类的实例
SubType.prototype = new SuperType();

const instance = new SubType();
instance.sayName();  // SuperType
借用构造函数继承
无法复用父类方法，子类无法访问父类原型链上的方法。
function SuperType(name) {
  this.name = name;
}

function SubType(name, age) {
  // 借用父类构造函数
  SuperType.call(this, name);
  this.age = age;
}

const instance = new SubType('Super', 30);
console.log(instance.name);  // Super
console.log(instance.age);   // 30
组合继承
父类构造函数被调用了两次，导致子类的原型上有不必要的属性。
function SuperType(name) {
  this.name = name;
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType(name, age) {
  // 借用构造函数继承属性
  SuperType.call(this, name);
  this.age = age;
}

// 子类原型指向父类实例，实现方法的继承
SubType.prototype = new SuperType();

const instance = new SubType('Super', 30);
instance.sayName();  // Super
console.log(instance.age);  // 30
原型式继承
无法实现函数复用，只适合对某个对象进行继承。
const superType = {
  name: 'SuperType',
  sayName: function() {
    console.log(this.name);
  }
};

// 创建一个新对象，原型指向 superType
const subType = Object.create(superType);
subType.name = 'SubType';
subType.sayName();  // SubType
寄生式继承
寄生式继承在每次创建对象时都会重新定义方法，无法实现方法的复用。每次创建新对象时都会消耗更多内存，尤其是当方法较多时。寄生式继承仅扩展对象的属性和方法，而无法继承父类的构造函数逻辑。因此，如果父类的构造函数中有特定的初始化逻辑，子类无法使用这些初始化逻辑。
// 寄生式继承实现
function createPerson(name, age) {
  const person = {
    name: name,
    age: age
  };
  
  // 添加扩展的方法
  person.greet = function() {
    console.log(`Hello, my name is ${this.name}`);
  };
  
  return person;
}

const person = createPerson('Bob', 30);
person.greet();  // 输出：Hello, my name is Bob
寄生式组合继承
如果需要继承的对象非常多，寄生式组合继承可能会带来一定的性能瓶颈，因为每次创建子类实例时都需要做原型链的拷贝和构造函数的调整。
// 寄生式组合继承实现
function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

SuperType.prototype.sayName = function() {
  console.log(`My name is ${this.name}`);
};

function SubType(name, age) {
  // 借用构造函数
  SuperType.call(this, name);
  this.age = age;
}

// 创建子类原型并继承超类的原型
SubType.prototype = Object.create(SuperType.prototype);
SubType.prototype.constructor = SubType;

// 新增子类特有的方法
SubType.prototype.sayAge = function() {
  console.log(`I am ${this.age} years old`);
};

const instance = new SubType('Charlie', 28);
instance.sayName();  // 输出：My name is Charlie
instance.sayAge();   // 输出：I am 28 years old
instance.colors.push('yellow');
console.log(instance.colors);  // 输出：['red', 'blue', 'green', 'yellow']

23. 垃圾回收与内存泄漏（可达性）
在JavaScript中，垃圾是指不再被程序所使用的对象或数据。对象不再被引用，对象之间形成循环引用，动态创建的对象没有被及时销毁，内存泄漏：当代码错误地保留了不再需要的对象引用时，就会发生内存泄漏。
引用计数法
定义：引用计数（Reference Counting）算法通过跟踪每个对象被引用的次数来确定对象是否为垃圾。
每个对象都有一个引用计数器，引用计数的过程如下： 
- 当一个对象被创建时，其引用计数器初始化为1。
- 当该对象被其他对象引用时，引用计数器加1。
- 当该对象不再被其他对象引用时，引用计数器减1。
- 当引用计数器减至0时，意味着该对象不再被引用，可以被垃圾收集器回收。
优势：
- 实时回收：引用计数可以在对象不再被引用时立即回收，不需要等待垃圾收集器的运行。这可以减少内存占用和提高程序的性能。
- 简单高效：引用计数是一种简单的垃圾收集算法，实现起来相对容易，不需要复杂的算法和数据结构。
存在的问题:
- 循环引用：当两个或多个对象相互引用时，它们的引用计数都不为零，即使它们已经不再被其他对象引用，也无法被回收。这导致内存泄漏，因为这些对象仍然占据内存空间，却无法被释放。
标记清除法
定义：标记-清除（Mark and Sweep）算法通过标记不再使用的对象，然后清除这些对象的内存空间，以便后续的内存分配使用。
它分为两个阶段：标记阶段和清除阶段。
1. 标记阶段：
 在标记阶段，垃圾回收器会对内存中的所有对象进行遍历，从根对象开始（通常是全局对象）递归地遍历对象的引用关系。对于每个被访问到的对象，垃圾回收器会给它打上标记，表示该对象是可达的，即不是垃圾。这个过程确保了所有可达对象都会被标记。
2. 清除阶段：
 在清除阶段，垃圾回收器会遍历整个内存，对于没有标记的对象，即被判定为垃圾的对象，会被立即回收，释放内存空间。这样，只有被标记的对象会被保留在内存中，而垃圾对象会被清除。
[图片]
标记整理法
- 定义：标记整理（Mark and Compact）可以看作是标记清除的增强操作，他在标记阶段的操作和标记清除一致，但是清除阶段会先执行整理，移动对象位置，对内存空间进行压缩。
- 它分为三个阶段：标记阶段、整理阶段和清除阶段。
[图片]
优势：
- 解决了标记-清除算法的碎片化问题：标记-整理算法在清除阶段会将标记的对象整理到内存的一端，从而解决了标记-清除算法产生的碎片化问题。这样可以使得内存空间得到更好的利用，减少了空间的浪费。
- 处理循环引用：标记-整理算法也能够处理循环引用的情况。
存在的问题:
- 垃圾回收过程中的停顿：标记-整理算法同样会暂停程序的执行，进行垃圾回收操作。当堆中对象较多时，可能会导致明显的停顿，影响用户体验。
24. 浏览器进程
现代浏览器为了提升性能、安全性和稳定性，通常采用多进程架构，将不同的任务分配给不同的进程。常见的浏览器进程包括：
1. 主进程（Browser/Main Process）
2. 渲染进程（Renderer Process）
3. GPU 进程（GPU Process）
4. 扩展进程（Extension Process）
5. 插件进程（Plugin Process）
6. 网络进程（Network Process）
25. React Diff
[图片]
26. 浏览器路由
1. 当浏览器地址变化时，切换页面；
2. 点击浏览器【后退】、【前进】按钮，网页内容跟随变化；
3. 刷新浏览器，网页加载当前路由对应内容；
在单页面web网页中, 单纯的浏览器地址改变, 网页不会重载，如单纯的hash网址改变网页不会变化，因此我们的路由主要是通过监听事件，并利用js实现动态改变网页内容，有两种实现方式：
1. hash模式：监听浏览器地址hash值变化，执行相应的js切换网页；
2. history模式：利用history API实现url地址改变，网页内容改变；
它们的区别最明显的就是hash会在浏览器地址后面增加#号，而history可以自定义地址
文章地址：https://juejin.cn/post/7236563012533878821?searchId=202501091752238EE2948C5D0941C6AEE4#heading-4
27. 模块懒加载
模块懒加载指的是在需要的时候才加载 JavaScript 模块，而不是在页面加载时就加载所有的模块。模块懒加载通常结合 Webpack 或 Vite 等构建工具来实现。
Webpack 的代码分割
Webpack 提供了 代码分割 的功能，可以使用 import() 动态导入模块来实现懒加载。
// 动态导入模块实现懒加载
const button = document.querySelector('button');
button.addEventListener('click', () => {
  import('./module').then(module => {
    const func = module.default;
    func();
  });
});
这里，import() 会动态加载 ./module 模块，直到按钮被点击时才会触发加载。
Vite 的懒加载
Vite 默认支持基于 ESM 的模块懒加载。在 Vite 中实现模块懒加载与 Webpack 类似。
const loadModule = async () => {
  const module = await import('./module');
  module.default();
};
懒加载的优化策略
- 合适的拆分粒度：在代码拆分时，注意拆分粒度。如果拆分的模块过于小，反而会增加请求的数量，导致额外的开销。需要根据实际情况来平衡。
- 加载提示：在懒加载资源时，可以显示加载动画或占位符，提升用户体验。
- 预加载：如果某个资源在后续操作中几乎一定会被加载，可以使用 预加载 或 预取 技术，提前加载这些资源以提升性能。
- 在 HTML 中，你可以使用 <link rel="preload"> 标签来预加载资源：
28. 原型链与原型是什么
原型可以理解为所继承的对象，也就是该对象的构造函数，而原型链可以理解为指向继承对象的指针，当调用某方法时，在对象本身身上没有找到该方法，那就回沿着原型链上去查找。
1. 原型（Prototype）
每个 JavaScript 对象都有一个内部属性 [[Prototype]]，通常我们通过 proto 或者 Object.getPrototypeOf() 来访问。这个属性指向的是该对象的“原型对象”，它是一个普通的 JavaScript 对象，包含了该对象共享的属性和方法。
原型的特点：
- 对象的原型本质上是一个对象。所有对象都会有一个原型（除 Object 的原型外）。
- 每个构造函数（类）都有一个 prototype 属性，它指向一个对象，这个对象就是通过该构造函数创建的实例对象的原型。
2. 原型链（Prototype Chain）
原型链是由多个对象通过原型指向下一个对象所形成的一条链。在 JavaScript 中，如果你访问一个对象的属性，首先会检查该对象自身是否拥有该属性。如果没有，则会通过该对象的原型查找，继续查找上一级原型，以此类推，直到找到该属性或者到达原型链的顶端。
原型链的工作原理：
1. 查找属性：当你访问一个对象的属性时，JavaScript 引擎会首先检查这个对象本身是否有该属性。
2. 查找原型：如果对象本身没有该属性，JavaScript 会查找对象的原型（通过 [[Prototype]] 指向的对象）是否有该属性。
3. 逐层查找：如果原型中也没有该属性，JavaScript 会继续查找该原型的原型，直到找到该属性或者到达原型链的末端。
4. 原型链的终点：原型链的顶端是 Object.prototype，它是所有对象的最终原型。如果在原型链中都找不到该属性，最终会返回 undefined。
29. link，script,@import阻塞问题
link本质上并没有去阻塞dom解析，只是阻塞渲染，如果在dom解析之前完成，那么页不会阻塞到渲染,而，script才会阻塞dom解析除非加上defer或者async，import是完全会阻塞style解析的，也就是dom解析
30. getComputedStyle会强制页面重排
0到500的动画效果

button.addEventListener('click',()=>{    
box.style.transform = 'translateX(1000px)';    
box.style.transition = 'transform 1s ease-in-out';    
// 使用getComputedStyle只需访问其中一个属性，这样使浏览器更早地执行样式计算    
// 这会上浏览器记下你在此之前设置的所有内容，所以就像哦，好吧    
// tranform,translateX(500px)这是该元素所做的事情    
// 但是这种做法需要小心，因为你最终可能会让浏览器在一帧图的时间内做不少多余的工作    
getComputedStyle(box).transform;    box.style.transform = 'translateX(500px)';});
1000到500的动画效果

btn6.addEventListener('click', () => {    
    div6.style.transform = 'translateX(1000px)';              
    getComputedStyle(div6).transform    
    div6.style.transition = 'transform 1s ease-in-out';    
    div6.style.transform = 'translateX(500px)';});
那么问题来了，为啥transition放在getComputedStyle前面和后面，执行的过渡动画不一样？有没懂底层事件循环和页面渲染的大哥解惑一下，谢谢🙏

访问getComputedStyle会强制页面重排，动画在前，可以打印出来X坐标是0，因为动画是计算初始位置与结束位置的坐标，然后继续执行translateX(500px)。动画在后，他计算的初始平移X坐标是1000。所以才会往外移过来

31. 线程中竞态与资源竞争的区别
竞态与资源竞争的本质区别是一个是争夺虚拟数据一个是争夺物理操作控制权的差别
[图片]
1. 线程中竞态（Race Condition）
定义：
竞态是指在多线程环境中，当多个线程并发访问共享资源且访问顺序不确定时，可能会导致不一致或错误的程序行为。这是由于多个线程以不同的顺序执行，从而干扰了彼此的操作，导致数据状态的不一致。
本质：
- 错误的行为由线程执行的顺序决定。不同的执行顺序可能会导致不同的结果，尤其是在多个线程对共享数据进行读取或写入时。
- 竞态通常发生在没有同步机制的情况下（例如，缺少锁或不当的锁使用），从而导致不同线程之间的执行次序或共享资源状态被破坏。
举个例子：
假设有两个线程同时对同一个全局变量 counter 进行加操作（例如 counter++）。如果没有适当的同步机制，两个线程可能在操作时读取到相同的初始值，然后各自将其增加1并写回。这会导致 counter 增加一次，而不是两次，从而引发竞态问题。
解决办法：
- 使用互斥锁（mutex）、**读写锁（read-write lock）**等同步机制来控制线程对共享资源的访问顺序。
- 采用原子操作来确保每次操作都能正确执行。
2. 资源竞争（Resource Contention）
定义：
资源竞争指的是多个线程试图访问有限的共享资源（如 CPU、内存、磁盘 I/O、网络带宽等）时，导致的资源的争夺。多个线程或进程需要相同资源的情况，如果资源不足，系统的性能就会下降，或者导致线程等待，造成延迟。
本质：
- 资源竞争关注的是多个线程对于物理资源的争夺，而不仅仅是对数据状态的影响。
- 资源竞争通常是由于系统资源的有限性或不合理的资源分配导致的。
举个例子：
假设有多个线程需要访问同一个磁盘文件来进行 I/O 操作。如果同时有多个线程访问该文件，由于磁盘 I/O 操作本身是有限的资源，线程需要等待，导致性能下降。
解决办法：
- 使用线程池来管理线程的数量，避免过多线程同时争夺资源。
- 采用信号量（Semaphore）、**限流（Rate Limiting）**等技术，控制资源的访问数量。
- 合理设计系统资源的调度和分配，避免过度竞争。
32. Get请求与Post请求的区别
首先get请求是在http0.9版本推出的，post请求是在http1.0版本推出的请求方式，他们的区别主要是在一下几个方面
1. 参数传输方式：
get请求是将参数拼接在url上？号之后，连续的参数用&来连接，并且一般根据浏览器限制字符长度（chrom:2048）
post请求是个将参数存于请求体之中，并且理论上是没有大小限制的
2. 安全性：
get请求的数据是明文的，容易被书签、历史记录保存
post由于是存于请求体中，数据不会显示在URL中，提供了更好的隐私保护
3. 幂等性：
get请求被认为是幂等的，同样的请求得到的应该是相同的数据，不会影起资源的变化
post请求不是幂等的，每次POST请求都可能对服务器上的资源造成影响，引起内部资源的变化
4. 重定向行为：
get请求可以被浏览器进行重复的代发操作，比如请求网络资源时，网络不佳
post请求是不会被浏览器代发的浏览器通常会警告用户，告知他们将重新提交表单数据，这可以帮助防止意外的数据重复提交。
33. Tree shaking是怎么实现的，依赖图怎么构建
实现原理
1. 依赖图构建：首先，构建工具（例如Webpack）会遍历项目的入口文件，并根据其中的import声明递归地找到所有依赖项，从而形成一个依赖关系图。每个节点代表一个模块，边表示模块之间的依赖关系。这个过程通常被称为依赖图的构建。
2. 标记未使用的代码：在依赖图的基础上，Tree Shaking通过静态分析来识别哪些导出的变量没有被使用。对于那些没有引用或无法从外部访问的导出，它们被视为“死代码”。
3. 移除未使用的代码：一旦识别出所有的未使用代码，打包工具会在生成最终输出时将其排除在外。这意味着只有实际用到的代码才会被打包进最终的bundle中。
依赖图构建细节
- 静态分析：由于ES6模块导入/导出语法的静态性，允许工具在编译时而不是运行时进行分析。这意味着无需执行任何代码即可了解模块间的依赖关系。
- 作用域分析：除了简单的导入/导出关系外，还需要对每个模块内的变量作用域进行分析，以确保正确处理局部变量、闭包等情况。
- 副作用标记：某些模块可能包含副作用（side effects），即执行该模块可能会改变全局状态或对外部环境产生影响，即使它没有显式地导出任何内容。为了安全起见，如果不能确定某个模块是否完全无副作用，则不会对其应用Tree Shaking。
34. Session是什么
session 是另一种记录服务器和客户端会话状态的机制
session 是基于 cookie 实现的，session 存储在服务器端，sessionId 会被存储到客户端的cookie 中
总之就是通过sessionId找到服务器中存储在session中与Session ID 关联的用户数据，从而识别用户并维护其状态
[图片]
- session 认证流程：
  - 用户第一次请求服务器的时候，服务器根据用户提交的相关信息，创建对应的 Session
  - 请求返回时将此 Session 的唯一标识信息 SessionID 返回给浏览器
  - 浏览器接收到服务器返回的 SessionID 信息后，会将此信息存入到 Cookie 中，同时 Cookie 记录此 SessionID 属于哪个域名
  - 当用户第二次访问服务器的时候，请求会自动判断此域名下是否存在 Cookie 信息，如果存在自动将 Cookie 信息也发送给服务端，服务端会从 Cookie 中获取 SessionID，再根据 SessionID 查找对应的 Session 信息，如果没有找到说明用户没有登录或者登录失效，如果找到 Session 证明用户已经登录可执行后面操作。
根据以上流程可知，SessionID 是连接 Cookie 和 Session 的一道桥梁，大部分系统也是根据此原理来验证用户登录状态。
35.  小程序双线程架构？为什么h5性能比小程序强？
小程序的 双线程架构 指的是，微信小程序采用了 JavaScript线程 和 渲染线程 两个独立的线程来处理界面的渲染和逻辑执行。
1. JavaScript 线程：负责运行小程序的逻辑代码，如事件处理、API调用等。
2. 渲染线程：负责处理页面的渲染和视图更新。通常，这个线程是由 WebView 或者原生渲染引擎来处理的。
通过将渲染和逻辑分开，减少了 UI 阻塞的可能性，使得小程序可以在相对较低的资源消耗下保持流畅的体验。
为什么 H5 性能比小程序强？
虽然小程序采用了双线程架构，但在某些方面，H5 的性能可能表现得更强。这里有几个关键因素：
1. 浏览器引擎的优化：
  - H5 基于浏览器的 WebView，在现代浏览器中，浏览器引擎（如 Chrome 的 V8 引擎）已经高度优化，处理 JavaScript 和渲染的能力非常强。
  - Web 标准（HTML5、CSS3、WebAssembly 等）有很多优化，浏览器能更好地进行硬件加速，特别是在图形和动画处理上。
2. 小程序的限制：
  - 小程序受到平台的限制，不能完全访问设备的底层硬件，部分功能需要通过平台的 API 来调用，而这些 API 可能没有直接访问硬件的优化。
  - 小程序的代码逻辑和渲染也要依赖于微信提供的框架和引擎，可能在某些情况下不如原生的浏览器渲染那么高效。
3. Web 的高度自由性：
  - H5 可以直接利用浏览器的功能来优化性能，比如通过 Service Worker 实现离线缓存，通过 WebAssembly 提升计算性能，或者直接进行多线程处理等。
  - 通过 HTML5 的 Canvas、WebGL 等技术，H5 可以直接操作图形，进行图像渲染等操作，而小程序可能在这些方面没有那么高的自由度。
4. 硬件和系统优化差异：
  - H5 应用在桌面端（比如 PC 端浏览器）上可以直接利用系统的资源和硬件加速，性能非常强。
  - 小程序需要运行在手机或者微信的 WebView 中，其性能和兼容性会受到手机硬件性能和微信本身 WebView 引擎的限制。
36. Webpack的启动执行过程

这个过程核心完成了 内容转换 + 资源合并 两种功能，实现上包含三个阶段：
1. 初始化阶段： 
  1. 初始化参数：从配置文件、 配置对象、Shell 参数中读取，与默认配置结合得出最终的参数
  2. 创建编译器对象：用上一步得到的参数创建 Compiler 对象
  3. 初始化编译环境：包括注入内置插件、注册各种模块工厂、初始化 RuleSet 集合、加载配置的插件等
  4. 开始编译：执行 compiler 对象的 run 方法
  5. 确定入口：根据配置中的 entry 找出所有的入口文件，调用 compilition.addEntry 将入口文件转换为 dependence 对象
2. 构建阶段： 
  1. 编译模块(make)：根据 entry 对应的 dependence 创建 module 对象，调用 loader 将模块转译为标准 JS 内容，调用 JS 解释器将内容转换为 AST 对象，从中找出该模块依赖的模块，再 递归 本步骤直到所有入口依赖的文件都经过了本步骤的处理
  2. 完成模块编译：上一步递归处理所有能触达到的模块后，得到了每个模块被翻译后的内容以及它们之间的 依赖关系图
3. 生成阶段： 
  1. 输出资源(seal)：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会
  2. 写入文件系统(emitAssets)：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

37. Vue的diff
一、Diff 算法核心差异
Vue2：双端对比算法
- 实现方式：
通过新旧节点的头尾指针同时向中间移动，依次比较以下四种情况：
  1. 旧头 vs 新头
  2. 旧尾 vs 新尾
  3. 旧头 vs 新尾
  4. 旧尾 vs 新头
若找到相同节点，则复用 DOM 并移动指针；若未找到，则通过 key 查找可复用节点。
- 适用场景：
对顺序调整较少的列表（如尾部增删）效率较高，但对乱序列表仍需较多 DOM 移动。
Vue3：预处理 + 最长递增子序列（LIS）
- 实现步骤：
  1. 预处理相同的前缀和后缀：
快速跳过头部和尾部未变化的节点，缩小对比范围。
  2. 处理剩余乱序部分：
    - 若无旧节点剩余，直接挂载新节点。
    - 若无新节点剩余，直接卸载旧节点。
    - 若有剩余，则通过 key 建立新节点的映射表，查找可复用节点。
  3. 最小化 DOM 移动：
通过最长递增子序列（LIS） 确定旧节点索引的最长稳定序列，仅移动不在该序列中的节点。
- 优势：
  - 减少不必要的 DOM 移动（尤其是乱序列表）。
  - 时间复杂度从 Vue2 的 O(n) 优化到接近 O(1)（对静态内容）或 O(n)（动态内容）。

---
二、编译优化对 Diff 的影响
Vue3 通过编译阶段的优化，大幅减少了 Diff 的工作量：
1. 静态节点提升（Hoist Static）
- 原理：
将静态节点（无动态绑定的内容）提升到渲染函数外部，生成静态常量。
- 效果：
Diff 时直接跳过静态节点对比。
2. Patch Flag 标记动态内容
- 原理：
在编译阶段为动态节点（如绑定了 class、style、props 的节点）添加标记（如 1 表示文本变化，2 表示 class 变化）。
- 效果：
Diff 时仅检查带标记的动态内容，无需全量对比。
3. 块树（Block Tree）
- 原理：
将模板按动态节点划分为“块”（Block），每个块内部动态内容通过 Fragment 管理。
- 效果：
仅追踪块内的动态节点，减少需对比的节点数量。
三、示例对比
[图片]
Vue2 的 Diff 过程（双端对比算法）
步骤分析
1. 初始双端对比：
  - 旧头 vs 新头：A vs D → 不同。
  - 旧尾 vs 新尾：D vs F → 不同。
  - 旧头 vs 新尾：A vs F → 不同。
  - 旧尾 vs 新头：D vs D → 相同！
    - 复用 D，将旧尾 D 移动到新头位置。
    - 旧指针更新：旧节点范围缩小为 [A, B, C]，新节点范围缩小为 [C, E, A, B, F]。
2. 第二轮双端对比：
  - 旧头 vs 新头：A vs C → 不同。
  - 旧尾 vs 新尾：C vs F → 不同。
  - 旧头 vs 新尾：A vs F → 不同。
  - 旧尾 vs 新头：C vs C → 相同！
    - 复用 C，将旧尾 C 移动到当前新头位置（紧接在 D 后）。
    - 旧节点范围缩小为 [A, B]，新节点范围缩小为 [E, A, B, F]。
3. 双端对比失败，遍历旧节点：
  - 新头 E 在旧节点中不存在 → 创建新节点 E 并插入到 C 后。
  - 新指针右移，新节点范围变为 [A, B, F]。
  - 继续对比旧节点 A 和新头 A → 相同，复用并保留位置。
  - 旧指针右移，新指针右移，对比 B 和 B → 相同，复用并保留位置。
  - 剩余新节点 F → 创建新节点 F 并插入末尾。
4. 最终 DOM 操作：
  - 移动 D 和 C。
  - 创建并插入 E 和 F。
  - 保留 A 和 B（但实际可能触发冗余移动）。

---
Vue3 的 Diff 过程（预处理 + 最长递增子序列）
步骤分析
1. 预处理相同的前缀和后缀：
  - 头部 A vs D → 不同，跳过前缀处理。
  - 尾部 D vs F → 不同，跳过后缀处理。
  - 直接进入核心 Diff 逻辑。
2. 建立新节点映射表：
const newIndexMap = {
    D: 0,  // key或节点标识 → 新索引
    C: 1,
    E: 2,
    A: 3,
    B: 4,
    F: 5,
};
3. 遍历旧节点，标记可复用节点：
  - A → 新位置 3，记录旧索引到新索引的映射：[3, 4, 1, 0]。
  - B → 新位置 4。
  - C → 新位置 1。
  - D → 新位置 0。
4. 计算最长递增子序列（LIS）：
  - 序列 [3, 4, 1, 0] 的 LIS 是 [3, 4]（最长递增部分）。
  - 稳定序列：A（新索引3）、B（新索引4）不需要移动。
5. 移动或创建节点：
  - 倒序遍历旧节点，对比是否在 LIS 中：
    - D（旧索引3，新索引0）→ 不在 LIS 中 → 移动 D 到新头。
    - C（旧索引2，新索引1）→ 不在 LIS 中 → 移动 C 到 D 后。
    - B（旧索引1，新索引4）→ 在 LIS 中 → 不移动。
    - A（旧索引0，新索引3）→ 在 LIS 中 → 不移动。
  - 处理新增节点：
    - E（新索引2）→ 创建并插入到 C 后。
    - F（新索引5）→ 创建并插入到末尾。
6. 最终 DOM 操作：
  - 移动 D 和 C。
  - 创建并插入 E 和 F。
  - A 和 B 保持原位，无需移动。

38. 页面白屏的原因和处理方法
1. 资源加载失败
- 表现：关键文件（JS/CSS/HTML）未加载。
- 检查点：
  - 打开浏览器开发者工具 → Network 面板，查看资源是否返回 404/403。
  - 检查控制台是否有 Failed to load resource 错误。
- 常见场景：
  - JS/CSS 路径错误（如相对路径部署后失效）。
  - CDN 资源不可用或跨域问题（如 Access-Control-Allow-Origin 未配置）。
  - 服务器未正确配置 MIME 类型（如 .js 文件返回 text/html）。
- 处理方法：
  - 修复资源路径，使用绝对路径或公共路径（如 Webpack 的 publicPath）。
  - 检查 CDN 状态，替换备用源或降级到本地资源。
  - 配置服务器正确的 MIME 类型。
2. JavaScript 执行错误
- 表现：JS 报错导致后续代码中断，框架未初始化。
- 检查点：
  - 打开 Console 面板，查看是否有未捕获的异常（如 Uncaught TypeError）。
  - 使用 Sources 面板 设置断点或通过 debugger 调试。
- 常见场景：
  - 语法错误（如 ES6 语法未转译）。
  - 未处理的异步错误（如接口请求未做异常捕获）。
  - 第三方库依赖未正确引入（如 Vue/React 未全局挂载）。
- 处理方法：
  - 使用 Babel 转译代码，确保兼容性。
  - 用 try/catch 或 Promise.catch() 捕获异步错误。
  - 检查依赖加载顺序，确保框架库优先加载。
3. 前端框架初始化失败
- 表现：Vue/React 根组件未挂载。
- 检查点：
  - 查看 Elements 面板，确认挂载 DOM 节点是否存在（如 <div id="app"></div>）。
  - 检查框架生命周期钩子（如 created、mounted）中的代码是否有报错。
- 常见场景：
  - 挂载节点被意外删除或覆盖（如后端渲染的 HTML 未包含 id="app"）。
  - 初始化时代码报错（如未正确引入 Vuex/Redux）。
- 处理方法：
  - 确保 HTML 模板中存在挂载节点。
  - 在根组件添加错误边界（React）或全局错误处理（Vue.config.errorHandler）。
4. 路由配置错误（SPA 常见）
- 表现：路由跳转后页面空白。
- 检查点：
  - 查看路由配置是否正确，动态导入组件是否成功。
  - 检查 Network 面板是否有路由对应的 JS 文件加载失败。
- 常见场景：
  - 动态路由组件未正确使用 import()（如未配置 Webpack 代码分割）。
  - 路由守卫（beforeEach）中未调用 next() 导致阻塞。
- 处理方法：
  - 使用路由懒加载并确保打包配置正确。
  - 在路由守卫中确保逻辑分支都执行 next()。
5. CSS 阻塞渲染
- 表现：页面内容被隐藏或布局错乱。
- 检查点：
  - 查看 Elements 面板，确认 DOM 是否存在但样式异常。
  - 检查是否有关键 CSS 未加载（如 display: none 误用）。
- 常见场景：
  - 全局 CSS 重置了 body 背景色为白色，覆盖了内容。
  - 关键组件样式未正确作用域化（如未使用 CSS Modules）。
- 处理方法：
  - 使用开发者工具检查元素样式，定位异常 CSS 规则。
  - 优先加载关键 CSS，避免全局样式污染。
