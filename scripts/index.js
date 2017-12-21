'use strict';

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Spider = require('../lib/Spider');

var _Spider2 = _interopRequireDefault(_Spider);

var _Utils = require('./Utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FIRST_ENTANCE = 'https://imququ.com/'; /**
                                              * Created by zxchong on 2017/11/14.
                                              */


_Spider2.default.prototype.asyncAnalyzeSite(FIRST_ENTANCE, 10).then(({ queue, inSiteUrl, outSiteUrl, inSiteRelation }) => {
  const relationArray = [];
  inSiteRelation.forEach(val => {
    val.url.forEach(v => {
      relationArray.push([FIRST_ENTANCE, val.origin, v]);
    });
  });
  _Utils.Utils.saveUrlRelations(relationArray);

  const inSiteUrlArray = [...inSiteUrl];
  const outSiteUrlArray = [...outSiteUrl];
  console.log(inSiteRelation);

  // const inSiteUrlParams = inSiteUrlArray.map((val) => [FIRST_ENTANCE, val]);
  // const re1 = Utils.saveUrl(inSiteUrlParams);
  // re1.then((result) => {
  //   console.log(result);
  // });

  _fs2.default.writeFile('./inSiteUrl.json', JSON.stringify([...inSiteUrl]), err => {
    if (err) {
      console.log(err);
    }
  });

  // const outSiteUrlParams = outSiteUrlArray.map((val) => [val]);
  // const re = Utils.saveSite(outSiteUrlParams);
  // re.then((result) => {
  //   console.log(result);
  // });

  _fs2.default.writeFile('./outSiteUrl.json', JSON.stringify(outSiteUrlArray), err => {
    if (err) {
      console.log(err);
    }
  });
  const inSiteUrlArr = [...inSiteUrl];
  const amount = inSiteUrlArr.length;
  // console.log(inSiteUrlArr.length)
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
            next: {}
          };
        }
        _hash[val].count++;
        _hash = _hash[val].next;
      });
    }
  });
  let flag = false;
  let obj = hash;
  do {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const item = obj[key];
        if (item.count > amount / 2) {}
      }
    }
  } while (flag);
  for (const key in hash) {
    if (hash.hasOwnProperty(key)) {
      const obj = hash[key];
    }
  }
  // console.log(hash);  
  // fs.writeFile('./hash.json', JSON.stringify(hash), (err) => {
  //   if(err) {
  //     console.log(err);
  //   }
  // });
}, err => {
  console.log('发生错误' + err);
});