var VERSION = "v9";

// 实际开发中需要缓存的文件应该是类似vue，jquery这些不会改变的库文件
var temp = ["/vue.js", "/static/mm1.jpg"]; // "/", "/index.html",
// 缓存
self.addEventListener("install", function(event) {
  // self.skipWaiting(); // 开发环境使用这个方法跳过waiting状态直接接管service work
  event.waitUntil(
    caches.open(VERSION).then(function(cache) {
      return cache.addAll(temp);
    })
  );
});

// 缓存更新
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // 如果当前版本和缓存版本不一致
          if (cacheName !== VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 捕获请求并返回缓存数据  https://developer.mozilla.org/zh-CN/docs/Web/API/Cache/match
self.addEventListener("fetch", function(event) {
  // var path = event.request.url.replace("http://localhost", "");
  console.log("捕获请求：" + event.request.url);

  // if (temp.indexOf(path) > -1) {
  // 如果在缓存列表中就走以下流程,没有在缓存列表中的资源就会走正常的网络请求
  event.respondWith(
    // caches.match(request) 返回匹配到的第一个请求的缓存数据
    caches
      .match(event.request)
      .then(function(response) {
        return response.clone();
      })
      .catch(function() {
        // 在缓存中没有找到需要的资源，则进行网络请求

        console.log("开始请求资源：" + event.request.url);

        return fetch(event.request).then(response => {
          // 请求成功后进行缓存
          return caches.open(VERSION).then(function(cache) {
            console.log("开始缓存资源：" + event.request.url);

            return cache.put(event.request, response.clone()).then(function() {
              console.log("缓存资源成功");
              return response.clone();
            });
          });
        });
      })
  );
  // } else {

  // }
});
