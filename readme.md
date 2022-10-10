# Site Archive
This is a site crawler designed to track visual and content differences between crawls.

Example usage:
```javascript
import Crawler from "site-archive";
import path from "path";

const entryPointRaw = process.argv[2];
const crawler = new Crawler(entryPointRaw, path.resolve('.', 'captures'), 1, console.log);
await crawler.crawl();
```

``` shell
yarn run start https://yoursite.com
```

Still very much a work in progress
