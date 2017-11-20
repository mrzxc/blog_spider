/**
 * Created by zxchong on 2017/11/14.
 */
"use strict"

const request = require('request');
const cheerio = require('cheerio');
const parse = require('url-parse');

const Utils = {
  removeUrlHash(url) {
    const index = url.indexOf('#');
    return index === -1 ? url: url.slice(0, index);
  },
  removeUrlParams(url) {
    const index = url.indexOf('?');
    return index === -1 ? url: url.slice(0, index);
  }
}
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
    this.inSiteUrl = new Set();       // 保证站点内的页面成环
    const { blogHash, depth } = this;
    let nowDeepQueue = [url];

    const promise = this.recursivelySearchPage(depth, nowDeepQueue); // 进行递归扫描
    promise.then(() => {
      console.log(this.inSiteUrl);
      console.log('******************************\n')
      console.log(this.blogQueue);
    });
  }
  /**
   * async request some url to analyze the site
   * @param {String} entrance site entrance url
   * @param {String} depth search depth
   */
  asyncAnalyzeSite(entrance, depth) {
    entrance = parse(entrance, true).origin;
    const inSiteUrl = new Set();
    const outSiteUrl = new Set();
    const analyziedHash = new Set();

    return new Array(depth).fill(null).reduce((promise, v, k) => {
      return promise.then(({ queue, inSiteUrl, outSiteUrl }) => {
        console.log(`当前为第${k}层`);
        console.log(`当前层队列有${queue.length}个`);
        return queue.reduce((promise, val) => {
          analyziedHash.add(val);
          return promise.then(({ inSiteUrl, outSiteUrl }) => {
            return this.asyncAnalyzePage(entrance + val, inSiteUrl, outSiteUrl);
          });
        }, new Promise((resolve, reject) => {
          resolve({ inSiteUrl, outSiteUrl });
        })).then(({ inSiteUrl, outSiteUrl }) => {
          return {
            queue: [...inSiteUrl].filter(item => ![...analyziedHash].includes(item)),
            inSiteUrl,
            outSiteUrl
          };
        })

      });
    }, new Promise((resolve, reject) => {
      resolve({ queue: ['/'], inSiteUrl, outSiteUrl });
    }));
  }

  /**
   * request page to get the urls insite and outsite
   * @param {String} url 
   * @param {Set} _inSiteUrl 
   * @param {Set} _outSiteUrl 
   */
  asyncAnalyzePage(url, _inSiteUrl, _outSiteUrl) {
    console.log(url);
    const nowUrl = url;
    const urlObj = parse(nowUrl, true);
    return new Promise((resolve) => {
      request(nowUrl, function (error, response, html) {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(html);
          const hrefList = $("a").map(function(index, ele) {
            return $(this).attr('href');
          });
          // 获取到页面内的所有 a标签 href
          // console.log(hrefList)
          resolve(hrefList);
        } else {
          resolve(_inSiteUrl, _outSiteUrl);
        }
      });
    }).then(hrefList => {
      const inSiteUrl = _inSiteUrl || new Set(),
        outSiteUrl = _outSiteUrl || new Set();
      Array.prototype.forEach.call(hrefList, href => {
        // /(^\.*\/[^\/].*)|(^#.*)|(^\/$)/
        if (!/:|(^\/\/)/.test(href)) {
          let _href = href[0] === '/' ? href : '/' + href;
          _href = Utils.removeUrlParams(_href);
          _href = Utils.removeUrlHash(_href);
          if (_href) inSiteUrl.add(_href);
        } else {
          const _urlObj = parse(href, true);
          if (_urlObj.origin === urlObj.origin) {
            inSiteUrl.add(_urlObj.toString().substring(_urlObj.origin.length));
          } else {
            outSiteUrl.add(parse(href, true).origin);
          }
        }
      });
      return { inSiteUrl, outSiteUrl };
    });
  }

}


module.exports = Spider;
