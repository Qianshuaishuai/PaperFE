/* SystemJS module definition */
declare var module: NodeModule;
declare var CKEDITOR: CKEDITOR;
interface NodeModule {
  id: string;
}
interface CKEDITOR {
  inline: any;
  inlineAll: any; // Calls inline for all page elements with the contenteditable attribute set to true.
  disableAutoInline: boolean;
  destroy: any;
  instances: any;
}
