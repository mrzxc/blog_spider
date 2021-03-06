'use strict';

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const log4js = require('log4js');

// const logger = require('../logger');


const Utils = {
  removeUrlHash(url) {
    const index = url.indexOf('#');
    return index === -1 ? url : url.slice(0, index);
  },
  removeUrlParams(url) {
    const index = url.indexOf('?');
    return index === -1 ? url : url.slice(0, index);
  }
}; /**
   * Created by zxchong on 2017/11/14.
   */

class Spider {
  /**
   * the entrance url
   * @param {String} entrance 
   */
  constructor(entrance) {
    this.entrance = entrance;
    this.depth = 3;
    this.blogHash = new Set([entrance]);
    this.blogQueue = [entrance];
    this.init();
  }

  init() {
    let blogUrl = this.blogQueue[0];
    this.blogQueue.shift();
    this.analyzeOneBlog(blogUrl);
  }
  analyzeOneBlog(url) {
    this.inSiteUrl = new Set(); // 保证站点内的页面成环
    const { blogHash, depth } = this;
    let nowDeepQueue = [url];

    const promise = this.recursivelySearchPage(depth, nowDeepQueue); // 进行递归扫描
    promise.then(() => {
      console.log(this.inSiteUrl);
      console.log('******************************\n');
      console.log(this.blogQueue);
    });
  }
  /**
   * async request some url to analyze the site
   * @param {String} entrance site entrance url
   * @param {String} depth search depth
   */
  asyncAnalyzeSite(entrance, depth) {
    entrance = (0, _urlParse2.default)(entrance, true).origin;
    const inSiteUrl = new Set();
    const outSiteUrl = new Set();
    const analyziedHash = new Set();
    const inSiteRelation = [];
    // 通过Array.reduce解决遍历的层数问题
    const reducePromise = new Array(depth).fill(null).reduce((promise, v, k) => {
      return promise.then(({ queue, inSiteUrl, outSiteUrl }) => {
        console.log(`当前为第${k}层`);
        console.log(`当前层队列有${queue.length}个`);
        console.log('________________________');
        // const _inSiteUrl = new Set(),
        //   _outSiteUrl = new Set();
        const promises = queue.map(val => {
          analyziedHash.add(val);
          return this.asyncAnalyzePage(entrance + val).then(({ inSiteUrl, outSiteUrl }) => {
            inSiteRelation.push({ origin: val, url: [...inSiteUrl] });
            return { inSiteUrl, outSiteUrl };
          });
        });
        return Promise.all(promises).then(vals => {
          const _queue = new Set();
          vals.forEach(({ inSiteUrl: _inSiteUrl, outSiteUrl: _outSiteUrl }) => {
            [..._inSiteUrl].forEach(val => {
              inSiteUrl.add(val);
            });
            [..._outSiteUrl].forEach(val => {
              outSiteUrl.add(val);
            });
          });
          return {
            queue: [...inSiteUrl].filter(item => ![...analyziedHash].includes(item)),
            inSiteUrl,
            outSiteUrl
          };
        });
      });
    }, new Promise((resolve, reject) => {
      resolve({ queue: ['/'], inSiteUrl, outSiteUrl });
    }));
    // 把 inSiteRelation 放入promise 参数中
    return reducePromise.then(({ queue, inSiteUrl, outSiteUrl }) => {
      return { queue, inSiteUrl, outSiteUrl, inSiteRelation };
    });
  }

  /**
   * request page to get the urls insite and outsite
   * @param {String} url 
   * @param {Set} _inSiteUrl 
   * @param {Set} _outSiteUrl 
   */
  asyncAnalyzePage(url) {
    const nowUrl = encodeURI(url);
    const urlObj = (0, _urlParse2.default)(nowUrl, true);
    return new Promise(resolve => {
      (0, _request2.default)(nowUrl, (error, response, html) => {
        if (!error && response.statusCode == 200) {
          const $ = _cheerio2.default.load(html);
          const hrefList = $("a").map(function (index, ele) {
            return $(this).attr('href');
          });
          // 获取到页面内的所有 a标签 href
          resolve(hrefList);
        } else {
          console.log('\x1B[31merror! url: ' + url + '\x1B[0m');
          resolve(new Set(), new Set());
        }
      });
    }).then(hrefList => {
      const inSiteUrl = new Set(),
            outSiteUrl = new Set();
      Array.prototype.forEach.call(hrefList, href => {
        if (!/:|(^\/\/)/.test(href)) {
          let _href = href[0] === '/' ? href : '/' + href;
          _href = Utils.removeUrlParams(_href);
          _href = Utils.removeUrlHash(_href);
          if (_href) inSiteUrl.add(_href);
        } else {
          const _urlObj = (0, _urlParse2.default)(href, true);
          if (_urlObj.origin === urlObj.origin) {
            let _href = _urlObj.toString().substring(_urlObj.origin.length);
            _href = Utils.removeUrlParams(_href);
            _href = Utils.removeUrlHash(_href);
            inSiteUrl.add(_href);
          } else {
            outSiteUrl.add((0, _urlParse2.default)(href, true).origin);
          }
        }
      });
      return { inSiteUrl, outSiteUrl };
    });
  }

}

module.exports = Spider;