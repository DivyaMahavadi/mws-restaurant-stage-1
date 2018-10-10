let restaurantCache = 'cache1';

let filesToCache = [
    './index.html',
    './restaurant.html',
    './css/styles.css',
    './data/restaurants.json',
    './img/1.jpg',
    './img/2.jpg',
    './img/3.jpg',
    './img/4.jpg',
    './img/5.jpg',
    './img/6.jpg',
    './img/7.jpg',
    './img/8.jpg',
    './img/9.jpg',
    './img/10.jpg',
    './js/dbhelper.js',
    './js/main.js',
    './js/restaurant_info.js',
    'https://fonts.googleapis.com/css?family=Roboto'
];

self.addEventListener('install', function(e) {
    console.log("[ServiceWorker] Installed")
    //Below code holds the service worker until following tasks are completed
    e.waitUntil( 
            caches.open(restaurantCache).then(function(cache) {
            console.log("[ServiceWorker] Caching CacheFiles");
            return cache.addAll(filesToCache);
        })
        .catch(function(err) {
            console.log('[ServiceWorker] failed to open Cache ', err);
        })
    )
});

self.addEventListener('activate', function(e) { 
    console.log("[ServiceWorker] Activated")
    e.waitUntil( 
        //In below line .keys() gives all cache names with a promise
        caches.keys().then(function(cacheNames){ 
            // Below code wraps all promises in Promise.all() and waits for completion
            return Promise.all(cacheNames.filter(function(cacheName) { 
                // Below code updates the database
                return cacheName.startsWith('restaurant-') && cacheName != restaurantCache;}) 
                //Below code maps and deletes outdated caches
                .map(function(cacheName){ 
                    return caches.delete(cacheName); 
                })
            );
        })
    );
});

// Below code does normal browser fetch which means the results come from cache
self.addEventListener('fetch', function (event) { 
    console.log('[ServiceWorker] Fetch', event.request.url);
    // Below code searches for match in cache for this request
    event.respondWith( 
      caches.match(event.request)
      .then(function (resp) { 
        return resp || fetch(event.request) 
      .then(function (response) {
        //This opens cache object 'cache1'
        return caches.open('cache1').then(function (cache) { 
          // event.request and response are put in the opened cache
          cache.put(event.request, response.clone()); 
          console.log('[ServiceWorker] New Data Cached', event.request.url);
          return response;
          });
        });
      })
      .catch(function(err) {
        console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
        })
    );
});