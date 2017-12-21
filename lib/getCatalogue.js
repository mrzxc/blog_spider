'use strict';

const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');

const getCatalogue = html => {
  /**
   * 对页面是否为目录页面进行评级100分为满(关键字 '归档' 'archives' '档案')
   * $("a:contains('归档')")      90分
   * 
  */
  const grade = 0;

  const $ = cheerio.load(html);
  let links;
  if (links = $('a:contains("归档")') || $('a:contains("档案")') || $('a:contains("archive")')) {
    const href = links.attr('href');
    if (!href) {
      return null;
    }
    return href;
  } else {
    console.log('没有找到归档页');
  }
};
module.exports = getCatalogue;