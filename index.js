/**
 * Created by zxchong on 2017/11/14.
 */
"use strict"
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const Spider = require('./lib/Spider');

const FIRST_ENTANCE = 'http://www.ruanyifeng.com/';

Spider.prototype.asyncAnalyzeSite(FIRST_ENTANCE, 10).then(({queue, inSiteUrl, outSiteUrl}) => {
  fs.writeFile('./inSiteUrl.json', JSON.stringify([...inSiteUrl]), (err) => {
    if(err) {
      console.log(err);
    }
  });
  fs.writeFile('./outSiteUrl.json', JSON.stringify([...outSiteUrl]), (err) => {
    if(err) {
      console.log(err);
    }
  });
  const inSiteUrlArr = [...inSiteUrl];
  console.log(inSiteUrlArr.length)
  const hash = {};
  inSiteUrlArr.forEach(val => {
    const str = val.replace(/(^\/)+|(\/$)+/g, '');
    if (str) {
      const arr = str.split('/');
      let _hash = hash;
      arr.forEach((val, index, array) => {
        if (!_hash[val]) {
          _hash[val] = {
            count: 0,
            next: {},
          }
        }
        _hash[val].count ++;
        _hash = _hash[val].next;
      });
    }
  });
  console.log(hash);  
  // fs.writeFile('./hash.json', JSON.stringify(hash), (err) => {
  //   if(err) {
  //     console.log(err);
  //   }
  // });

}, (err) => {
  console.log('发生错误' + err);
})
