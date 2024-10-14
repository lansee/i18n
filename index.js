import i18n_h5 from './H5/i18n.js';
import i18n_node from './Node/i18n.js';

const I18N = {
    config: {
        type: 'h5',
        techStack: 'preact'
    },
    i18nModule: {},
    init: function(options) {
        if (options && options.type) {
            Object.assign(this.config, options.type);
        }
        switch (Option.type) {
            case 'h5':
                this.i18nModule = i18n_h5;
                break;
            case 'node':
                this.i18nModule = i18n_node;
                break;
        }

        this.i18nModule.initDetail(options.detail);
    },
    i18nRender: function(args) {
        this.i18nModule.i18nRender(args);
    },
    autoI18nRender: function() {
        this.i18nModule.autoI18nRender();
    }
};

export default I18N;
