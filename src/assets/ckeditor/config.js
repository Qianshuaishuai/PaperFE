CKEDITOR.editorConfig = function (config) {

  config.enterMode = CKEDITOR.ENTER_BR; // 按下 enter 键, 插入一个 br 标签

  config.shiftEnterMode = CKEDITOR.ENTER_BR;  // 按下 shift-enter 键, 插入一个 br 标签

  config.allowedContent = true; // 关闭标签过滤

  config.AutoDetectPasteFromWord = true;

  config.startupMode = 'source';

  // config.startupFocus = 'end';  // 光标放置在段末

  config.language = 'zh-cn';  // 编辑器语言

  config.width = 360; // 编辑器宽度设置

  config.skin = 'moono';   // 编辑器皮肤,需要下载并解压到 ckeditor 的 skins 文件夹下

  config.toolbar = 'Full';  // 工具条类型

  // config.extraPlugins = 'ckeditor_wiris'; //  添加扩展插件 ckeditor_wiris

  config.toolbar_Full = [
    ['Bold', 'Italic', 'Underline', '-', 'Subscript', 'Superscript', 'RemoveFormat'], // 配置工具条
    ['SpecialChar'],
    // ['Image', 'Table', 'SpecialChar'],
    // ['ckeditor_wiris_formulaEditor']
  ]

  config.keystrokes = [   //设置快捷键

    [CKEDITOR.ALT + 121 /*F10*/ , 'toolbarFocus'],  //获取焦点

    // [CKEDITOR.CTRL + 86 /*V*/ , 'pastetext'],  //获取焦点

    [CKEDITOR.ALT + 122 /*F11*/ , 'elementsPathFocus'], //元素焦点

    [CKEDITOR.SHIFT + 121 /*F10*/ , 'contextMenu'],  //文本菜单

    [CKEDITOR.CTRL + 90 /*Z*/ , 'undo'],  //撤销

    [CKEDITOR.CTRL + 89 /*Y*/ , 'redo'],  //重做
    [CKEDITOR.CTRL + CKEDITOR.SHIFT + 90 /*Z*/ , 'redo'], //

    [CKEDITOR.CTRL + 76 /*L*/ , 'link'],  //链接

    [CKEDITOR.CTRL + 66 /*B*/ , 'bold'],  //粗体

    [CKEDITOR.CTRL + 73 /*I*/ , 'italic'],  //斜体

    [CKEDITOR.CTRL + 85 /*U*/ , 'underline'],  //下划线

    [CKEDITOR.ALT + 109 /*-*/ , 'toolbarCollapse']
  ];

  config.title = '';  // 去掉点击提示

  config.pasteFilter = 'plain-text';  // 过滤粘贴样式

  config.removePlugins = 'magicline'; // 去除ckediotr默认的换行

  config.forcePasteAsPlainText = true;  // 强制去除粘贴样式
};

// 扩展编辑器引用
// CKEDITOR.plugins.addExternal('ckeditor_wiris', 'https://www.wiris.net/demo/plugins/ckeditor/', 'plugin.js');
// CKEDITOR.plugins.addExternal('ckeditor_wiris', './plugins/ckeditor_wiris/')

CKEDITOR.dtd.$removeEmpty['span'] = false;  // 不允许过滤空的 span 标签

CKEDITOR.dtd.$removeEmpty['p'] = true;  // 过滤掉空的 p 标签
