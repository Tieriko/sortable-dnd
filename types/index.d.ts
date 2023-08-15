export type DOMOffset = {
  height: Number;
  width: Number;
  top: Number;
  left: Number;
};

export type DOMRect = DOMOffset & {
  bottom: Number;
  right: Number;
};

export type Group = {
  name: String;
  put: Boolean;
  pull: Boolean;
};

export type Range = {
  start: Number;
  end: Number;
  padFront: Number;
  padBehind: Number;
}

export type ScrollState = {
  offset: Number;
  top: Boolean;
  bottom: Boolean;
}

type SortableState = {
  sortable: Sortable;
  group: HTMLElement;
  node: HTMLElement;
  offset: DOMOffset;
  rect: DOMRect;
};

type MultiNode = {
  node: HTMLElement;
  offset: DOMOffset;
  rect: DOMRect;
};

export type EventType = Event & (TouchEvent | MouseEvent);

export type FromTo = SortableState & { nodes?: MultiNode[] };

export type Select = SortableState & { event: EventType };

export type Direction = 'vertical' | 'horizontal';

export type Options = {
  /**
   * Specifies which items inside the element should be draggable.
   * @example
   * - (e) => e.target.tagName === 'LI' ? true : false // use function
   * - (e) => e.target // use function to set the drag element if retrun an HTMLElement
   * - 'div'   // use tag name
   * - '.item' // use class name
   * - '#item' // use id
   */
  draggable?: Function | String;

  /**
   * Drag handle selector within list items.
   * @example
   * - (e) => e.target.tagName === 'I' ? true : false
   * - 'i' // use tag name
   * - '.handle' // use class
   * - '#handle' // use id
   */
  handle?: Function | String;

  /**
   * Set value to allow drag between different lists.
   * @example
   * String: '...'
   * Object: { name: '...', put: true | false, pull: true | false }
   * @defaults `' '`
   */
  group?: String | Group;

  /**
   * Enable multi-drag
   * @defaults `false`
   */
  multiple?: Boolean;

  /**
   * Support for virtual lists if set to `true`.
   * @defaults `false`
   */
  virtual?: Boolean;

  /**
   * Virtual list scrolling element.
   * @defaults `null`
   */
  scroller?: HTMLElement;

  /**
   * The unique key values of all items in the list.
   * @defaults `[]`
   */
  dataKeys?: any[];

  /**
   * The number of lines rendered by the virtual scroll.
   * @defaults `30`
   */
  keeps?: Number;

  /**
   * The estimated height of each piece of data.
   * @defaults `null`
   */
  size?: Number;

  /**
   * Top height value to be ignored.
   * @defaults `0`
   */
  headerSize?: Number;

  /**
   * `vertical/horizontal`, scroll direction.
   * @defaults `vertical`
   */
  direction?: Direction;

  /**
   * Speed of the animation (in ms) while moving the items.
   * @defaults `150`
   */
  animation?: Number;

  /**
   * Disables the sortable if set to `true`.
   * @defaults `false`
   */
  disabled?: Boolean;

  /**
   * Automatic scrolling when moving to the edge of the container.
   * @defaults `true`
   */
  autoScroll?: Boolean;

  /**
   * Threshold to trigger autoscroll.
   * @defaults `25`
   */
  scrollThreshold?: Number;

  /**
   * Time in milliseconds to define when the sorting should start.
   * @defaults `0`
   */
  delay?: Number;

  /**
   * Only delay if user is using touch.
   * @defaults `false`
   */
  dealyOnTouchOnly?: Boolean;

  /**
   * Appends the cloned DOM Element into the Document's Body.
   * @defaults `false`
   */
  fallbackOnBody?: Boolean;

  /**
   * The `stopPropagation()` method of the Event interface prevents further propagation of the current event in the capturing and bubbling phases.
   * @defualts `false`
   */
  stopPropagation?: Boolean;

  /**
   * When the value is false, the dragged element will return to the starting position of the drag.
   * @defaults `true`
   */
  swapOnDrop?: Boolean;

  /**
   * This class will be added to the item while dragging.
   * @defaults `' '`
   */
  chosenClass?: String;

  /**
   * Class name for selected item.
   * @defaults `' '`
   */
  selectedClass?: String;

  /**
   * This styles will be applied to the mask of the dragging element.
   * @defaults `{ }`
   */
  ghostStyle?: CSSStyleDeclaration;

  /**
   * This class will be applied to the mask of the dragging element.
   * @defaults `' '`
   */
  ghostClass?: String;

  /**
   * The callback function when the drag is started.
   */
  onDrag?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when the dragged element is moving.
   */
  onMove?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when the drag is completed.
   */
  onDrop?: (params: { from: FromTo; to: FromTo; event: EventType; changed: Boolean }) => void;

  /**
   * The callback function when element is dropped into the current list from another list.
   */
  onAdd?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when element is removed from the current list into another list.
   */
  onRemove?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when the dragged element changes position in the current list.
   */
  onChange?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when element is selected.
   */
  onSelect?: (params: Select) => void;

  /**
   * The callback function when element is unselected.
   */
  onDeselect?: (params: Select) => void;

  /**
   * The callback function when the virtual list is scrolled.
   */
  onScroll?: (params: ScrollState) => void;

  /**
   * The callback function when the rendering parameters of the virtual list change.
   */
  onUpdate?: (params: Range) => void;
};

declare class Sortable {
  /**
   * @param element The Parent which holds the draggable element(s).
   * @param options Options to customise the behavior of the drag animations.
   */
  constructor(element: HTMLElement, options?: Options);

  /**
   * Manually clear all the state of the component, using this method the component will not be draggable.
   */
  destroy(): void;

  /**
   * Get or set the option value, depending on whether the `value` is passed in
   * @param key option name
   * @param value option value
   */
  option(key: string, value: any): any;

  /**
   * Get the selected elements in the list.
   */
  getSelects(): HTMLElement[];

  /**
   * Get the Sortable instance of an element
   * @param el
   */
  get(el: HTMLElement): Sortable | undefined;

  /**
   * Create sortable instance
   * @param el
   * @param options
   */
  create(el: HTMLElement, options: Options): void;
}

export = Sortable;
