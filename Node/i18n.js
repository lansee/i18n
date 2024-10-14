// //多语言内容
// var TEXT = {};

var i18n = {
  Language: 'zh',
  TEXT: {}, //多语言内容
  initDetail(str) {
      i18n.TEXT = str;
      //获取语言参数
      var Language = M && M.isServer ? window.request.query['i18n'] : M.getParam('i18n') || 'zh';
      if (typeof Language == 'object') {
          Language = Language[1];
      }
      i18n.Language = Language;
      return i18n;
  },
  isChinese(str) {
      if (escape(str).indexOf('%u') < 0) return false;
      return true;
  },
  i18nRender(string, type) {
      return type == 0 ? string : (i18n.TEXT && i18n.TEXT[i18n.Language] && i18n.TEXT[i18n.Language][string]) || string;
  },
  autoI18nRender() {
      console.log('---autoI18nRender---');
      let beforeTime, allTime = 0;
      var parseRender = nodes => {
          var attrs = nodes.attributes;
          var child = nodes.children;
          if (child && child.length) {
            //if(!beforeTime || new Date().getTime() - beforeTime > 1000) 
            beforeTime = new Date().getTime();
              for (var i in child) {
                  if (typeof child[i] == 'string' && attrs && attrs['data-isTranslate'] != 1 && i18n.isChinese(child[i])) {
                      console.log('===', child[i]);
                      child[i] = i18n.i18nRender(child[i], 1);
                      attrs['data-isTranslate'] = 1;
                  } else if (typeof child[i] == 'object') {
                      child[i] && child[i].children && parseRender(child[i].children);
                  }
              }
              var afterTime = new Date().getTime();
              allTime += parseInt(afterTime - beforeTime);
          console.log('---MutationObserver time---', afterTime - beforeTime, '---allTime---', allTime);
          }
      };
      var { options } = preact;
      var oldHook = options.vnode;
      options.vnode = vnode => {
          if(vnode.children && i18n.isChinese(vnode.children[0])) {
            parseRender(vnode);
          }
          if (oldHook) {
              oldHook(vnode);
          }
      };
  }
};

export default i18n;
