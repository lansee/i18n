// //多语言内容
// var TEXT = {};

var i18n = {
  Language: 'zh',
  TEXT: {}, //多语言内容
  initDetail(str) {
      i18n.TEXT = str;
      //获取语言参数
      var Language = M.getParam('i18n') || (navigator.userAgent.match(/\bI18N\/([a-zA-Z_]*)/i) || 'zh');
      if (typeof Language == 'object') {
          Language = Language[1];
      }
      i18n.Language = Language;
      return i18n;
  },
  i18nRender(string, type) {
      console.log('=== ', string);
      return type == 0 ? string : (i18n.TEXT && i18n.TEXT[this.Language] && i18n.TEXT[this.Language][string]) || string;
  },
  autoI18nRender() {
      var targetNode = document.body;

      // Options for the observer (which mutations to observe)
      var config = { characterData: true, childList: true, subtree: true };

      var checkNodeType = nodes => {
          for (var j = 0; j < nodes.length; j++) {
            let translateNum = nodes[j].parentElement.getAttribute('data-isTranslate') || 0;

            if (nodes[j].nodeType == 3 && nodes[j].nodeValue.length && nodes[j].nodeValue.trim().length && !translateNum) {
                nodes[j].parentElement.setAttribute('data-isTranslate', ++translateNum);
                  nodes[j].nodeValue = this.i18nRender(nodes[j].nodeValue, 1);
              } else if (nodes[j].childNodes && nodes[j].childNodes.length) {
                  checkNodeType(nodes[j].childNodes);
              }
          }
      };

      // Callback function to execute when mutations are observed
      var beforeTime, allTime = 0;
      var callback = function(mutationsList) {
          for (var mutation of mutationsList) {
            beforeTime = new Date().getTime();
              if (mutation.type == 'childList') {
                  if (mutation.addedNodes) {
                    console.log('A child node has been added or removed.');
                    // if(!beforeTime || new Date().getTime() - beforeTime > 1000) 
                    
                      for (var i in mutation.addedNodes) {
                          if (mutation.addedNodes[i].childNodes && mutation.addedNodes[i].childNodes.length) {
                              checkNodeType(mutation.addedNodes[i].childNodes);
                          } else if (mutation.addedNodes[i].nodeType == 3 && mutation.addedNodes[i].nodeValue.length && mutation.addedNodes[i].nodeValue.trim().length) { 
                              mutation.addedNodes[i].parentElement.setAttribute('data-isTranslate', 1);
                              mutation.addedNodes[i].nodeValue = i18n.i18nRender(mutation.addedNodes[i].nodeValue, 1);
                          }
                      }
                      var afterTime = new Date().getTime();
                      allTime += parseInt(afterTime - beforeTime);
                      console.log('---MutationObserver time---', (afterTime - beforeTime), '---allTime---' , allTime);
                  }
              }
          }
      };

      // Create an observer instance linked to the callback function
      var observer = new MutationObserver(callback);

      // Start observing the target node for configured mutations
      observer.observe(targetNode, config);

      // window.addEventListener('load', function () {
      //   observer.disconnect();
      // });
  }
};

export default i18n;
