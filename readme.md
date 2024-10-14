
# Q音国际化解决方案

# 安装依赖
`tnpm i @tencent/qmfe-i18n`

# 两种业务模式 
  常见H5页面，node直出页面

## 常见H5页面接入说明

### 1. 目录结构参考
```
├── components
│   ├── banner.jsx
│   ├── focus.jsx
│   ├── tab.jsx
│   └── topic
│       ├── articleList.jsx
│       ├── topic.jsx
│       ├── topicItem.jsx
│       └── topicList.jsx
├── i18n  本地转换方式
│   ├── i18n.js 本地转换逻辑
│   └── i18n_detail.js  多语言文件
├── i18n_tnpm tnpm转换方式
│   ├── i18n_detail.js  多语言文件
│   └── index_tnpm.js tnpm转换逻辑
├── index.jsx
└── lib
    ├── common.js
    ├── data.js
    └── head.js
```
### 2.index.jsx
```javascript 
//支持的两种翻译方式：本地转换方式与tnpm转换方式，请按实际需要选择
//本地转换方式，支持手动翻译与自动全局翻译方法
import { i18nRender, autoI18nRender } from './i18n/i18n'; 
//tnpm转换方式，支持手动翻译与自动全局翻译方法
import { i18nRender, autoI18nRender } from './i18n_tnpm/index_tnpm'; 

class App extends Component {
    constructor() {
        autoI18nRender(); 
        super();
    },
    render() {
        let { focus = [], tabs = [], banners = [], content = [] } = this.state;
        let pos_index = 0;
        return (
            <div id="ssh_container">
                <div class="wrap dist">
                    <div data-view="recommend">
                        <div class="status_bar">
                            <span class="status_bar__bg js_status_bar__bg c_bg3"></span>
                            <div class="status_bar__tab">
                                <a href="javascript:;" class="status_bar__tab_item c_txt1 js_tab" data-type="1">
                                    <span class="status_bar__tab_txt">{i18nRender('数字专辑')}</span>
                                </a>
                                <a href="javascript:;" class="status_bar__tab_item c_txt2 js_tab" data-type="2" style="display:none">
                                    <span class="status_bar__tab_txt">票务</span>
                                </a>
                            </div>
                            <a href="javascript:;" class="status_bar__link c_txt1 js_go_album">
                                专辑库
                            </a>
                        </div>

                        <div class="js_slider slider" style="visibility: visible;"></div>

                        <div class="js_modules">
                            <Focus list={focus} />
                            <Tab list={tabs} />
                            <Banner list={banners} />
                            {content.map(item => {
                                item.pos_index = item.type == 'zhuanti' ? pos_index++ : 0;
                                return <Topic data={item} />;
                            })}
                        </div>

                        <div class="js_morealbum">
                            <div class="js_list"></div>
                            <a href="javascript:;" class="js_morealbum_btn more_link c_txt2" style="display:none">
                                查看更多
                            </a>
                        </div>

                        {!!this.state.loading && (
                            <div class="js_recommend_more qui_loading qui_loading--full">
                                <div class="qui_loading__bd">
                                    <div class="qui_loading__box">
                                        <i class="qui_loading__icon c_txt2"></i>
                                        <span class="qui_loading__text c_txt2">正在载入...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

render(<App />, document.body);

```

### 3.本地转换逻辑 i18n.js
```javascript 

//本地
import __i18n__ from './i18n_detail.js';

//支持手Q 语言参数
let Language = M.getParam('i18n') || (navigator.userAgent.match(/\bI18N\/([a-zA-Z_]*)/i) || 'zh');
if (typeof Language == 'object') {
    Language = Language[1];
}
//对业务侵入多
export function i18nRender(string, type) {
    //type 1 强制走翻译
    if (!M.getParam('autoi18n') && Language == 'zh') {
        type = 0;
    }
    return type == 0 ? string : (__i18n__ && __i18n__[Language] && __i18n__[Language][string]) || string;
}
//对业务侵入少
export function autoI18nRender() {
    var targetNode = document.body;

    // Options for the observer (which mutations to observe)
    var config = { characterData: true, childList: true, subtree: true };

    let checkNodeType = nodes => {
        for (let j = 0; j < nodes.length; j++) {
            if (nodes[j].nodeType == 3) {
                nodes[j].nodeValue = i18nRender(nodes[j].nodeValue, 1);
            } else if (nodes[j].childNodes && nodes[j].childNodes.length) {
                checkNodeType(nodes[j].childNodes);
            }
        }
    };

    // Callback function to execute when mutations are observed
    var callback = function(mutationsList) {
        let t1 = new Date().getTime();
        for (var mutation of mutationsList) {
            if (mutation.type == 'childList') {
                console.log('A child node has been added or removed.');
                if (mutation.addedNodes) {
                    for (let i in mutation.addedNodes) {
                        if (mutation.addedNodes[i].childNodes && mutation.addedNodes[i].childNodes.length) {
                            checkNodeType(mutation.addedNodes[i].childNodes);
                        } else if (mutation.addedNodes[i].nodeType == 3) {
                            mutation.addedNodes[i].nodeValue = i18nRender(mutation.addedNodes[i].nodeValue, 1);
                        }
                    }
                }
            }
        }
        let t2 = new Date().getTime();
        console.log('autoI18nRender time: ', t2 - t1, t1);
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // window.addEventListener('load', function () {
    //   observer.disconnect();
    // });
}

```

### 4.tnpm转换逻辑 i18n_tnpm.js
```javascript

import i18n_h5 from '@tencent/qmfe-i18n/H5/i18n.js';
import detail from './i18n_detail';

let i18nModule = i18n_h5.initDetail(detail);

//对业务侵入多
export function i18nRender(string) {
    return i18nModule.i18nRender(string);
}
//对业务侵入少
export function autoI18nRender() {
    i18nModule.autoI18nRender();
}


```

### 5.多语言文件 i18n_detail.js
```javascript

const TEXT = {
    en: {
        数字专辑: 'Digital album',
        畅销榜: 'Bestseller list',
        兑换中心: 'Exchange',
        分类: 'Classification',
        已购: 'Buy',
        最新上架: 'New arrival',
        本周热销: 'Hot-sale',
        专栏资讯: 'Column information',
        音乐人专区: 'Musician',
        明星博物馆: 'Star',
        测试: 'Test'
    }
};

export default TEXT;

```

## node直出页面接入说明

### 1. 目录结构参考
```
├── app.jsx 
├── comment.jsx
├── common
│   ├── ad_plugin.jsx
│   ├── descItem.jsx
│   └── utils.js
├── i18n  本地转换方式
│   ├── i18n.js 本地转换逻辑
│   └── i18n_detail.js  多语言文件
├── i18n_tnpm tnpm转换方式
│   ├── i18n_detail.js  多语言文件
│   └── index_tnpm.js tnpm转换逻辑
├── main.jsx
├── mvList.jsx
├── mv_utils.js
├── nav.jsx
└── player.jsx
```
### 2.入口app.jsx
```javascript

//支持的两种翻译方式：本地转换方式与tnpm转换方式，请按实际需要选择
//本地转换方式，支持手动翻译与自动全局翻译方法
import i18n from './i18n/i18n.js';
const {autoI18nRender, i18nRender} = i18n;
//tnpm转换方式，支持手动翻译与自动全局翻译方法
import { autoI18nRender, i18nRender } from './i18n_tnpm/index_tnpm';

const app = M.createComponent({
    getInitialState() {
        autoI18nRender(); //调用方式
        return {
            mvInfo: {},
            recomMvData: {},
            vidList: [],
            showType: 'main', 
            praiseNum: 0, 
            hasPraised: false 
        };
    },
    render(props, state) {
        let data = M.isServer ? props : state;
        return (
            <div id="js_app" class="wrap">
                <AdPlugin opts={state.adPluginOpt} />
                <Player vidList={data.vidList} recomMvData={state.recomMvData} updateData={this.getData.bind(this)} updateState={this.updateState.bind(this)} />
                <Nav showType={state.showType} updateState={this.updateState.bind(this)} cmtTotal={state.cmtTotal} />
                <a href="javascript:;" class="status_bar__tab_item c_txt1 js_tab" data-type="1">
                    <span class="status_bar__tab_txt">{i18nRender('数字专辑')}</span> 
                </a>
                <div style={`display:${state.showType === 'main' ? ';' : 'none'}`}>
                    <Main mvInfo={data.mvInfo} recomMvData={data.recomMvData} praiseNum={state.praiseNum} hasPraised={state.hasPraised} />
                </div>
                <div style={`display:${state.showType === 'cmt' ? ';' : 'none'}`}>
                    <Comment g_vid={state.vidList[0]} mvInfo={data.mvInfo} updateState={this.updateState.bind(this)} shouldLoad={state.showType === 'cmt'} />
                </div>
            </div>
        );
    }
});
export default app;

```
### 3.本地转换逻辑 i18n.js
```javascript
//本地
import __i18n__ from './i18n_detail.js';

let lan = M && M.isServer ? window.request.query['i18n'] : M.getParam('i18n') || 'zh';
if (typeof lan == 'object') {
    lan = lan[1];
}

const i18n = {
    Language: lan,
    isChinese(str) {
        if (escape(str).indexOf('%u') < 0) return false;
        return true;
    },
    i18nRender(string, type) {
        return type == 0 ? string : (__i18n__ && __i18n__[this.Language] && __i18n__[this.Language][string]) || string;
    },
    autoI18nRender() {
        let parseRender = nodes => {
            let attrs = nodes.attributes;
            let child = nodes.children;
            if (child && child.length) {
                for (let i in child) {
                    if (typeof child[i] == 'string' && attrs && attrs['data-isTranslate'] != 1 && this.isChinese(child[i])) {
                        console.log('===', child[i]);
                        child[i] = i18n.i18nRender(child[i], 1);
                        attrs['data-isTranslate'] = 1;
                    } else if (typeof child[i] == 'object') {
                        child[i] && child[i].children && parseRender(child[i].children);
                    }
                }
            }
        };
        let { options } = preact;
        let oldHook = options.vnode;
        options.vnode = vnode => {
            parseRender(vnode);
            if (oldHook) {
                oldHook(vnode);
            }
        };
    }
};

export default i18n;

```

### 4.tnpm转换逻辑 i18n_tnpm.js
```javascript

import i18n_h5 from '@tencent/qmfe-i18n/Node/i18n.js';
import detail from './i18n_detail';

let i18nModule = i18n_h5.initDetail(detail);

//对业务侵入多
export function i18nRender(string) {
    return i18nModule.i18nRender(string);
}
//对业务侵入少
export function autoI18nRender() {
    i18nModule.autoI18nRender();
}

```

### 5.多语言文件 i18n_detail.js
```javascript

const TEXT = {
  "en": {
    "数字专辑": "Digital album",
    "畅销榜": "Bestseller list",
    "兑换中心": "Exchange",
    "分类": "Classification",
    "已购": "Buy",
    "最新上架": "New arrival",
    "本周热销": "Hot-sale",
    "专栏资讯": "Column information",
    "音乐人专区": "Musician",
    "测试": "Test"
  }
};

export default TEXT;

```

### 6. 中文词条提取
一、 配置
执行translator init，在当前目录生成配置文件：translator.config.json
创建模版文件夹 refs ，根据需要创建模版文件，模版内容空，比如：
```
|-src/
    |-refs/
        |-en_detail.js
```
修改配置文件 translator.config.json ，正确设置字段 src 、 dest 、 refs 的值
配置示例
```
{
    "src": "./src/", //需提取中文词条的源码
    "dest": "./dest", //提取中文词条后的源码
    "refs": "./src/refs", //提取的中文词条存放目录
    "includes": "./src/inline",
    "excludes": [
      "i18n.js",
      "i18n_detail.js",
      "i18n_tnpm.js"
    ],
    "exclude":"^\\.|node_modules|express",
    "resolve":".js,.jsx"
}
```
二、 执行命令
```
translator
```
三、 支持的参数
````
未加参数，默认为 default
init: 初始化配置文件
hash: 提取中文词条，做hash转换
default:  提取中文词条，以整个词条做key 
````
四、 提取结果
```
|-desc/
    |-refs/
        |-en_detail.js
```
提取的字典格式：
```
const TEXT = {
  en: {
    "上报": "Report",
    "下次再说": "Say again",
    "到QQ音乐查看更多": "View more on QQ Music"
  }
};

export default TEXT;
```

## Changelog
````
1.1.1 支持提取后输出的词条格式：原词条、hash值
1.1.0 支持项目中文词条提取
1.0.0 项目初始化
````
