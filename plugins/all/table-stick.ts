import { nextTick } from 'vue';

export class TableStickyPlugin {
  private stickyConfigs: TableStickyModule.StickyConfigs = new Map();
  /**
   * @desc 判断tableheader 节点是否 已经 fixed
   * @param { TableStickyModule.Option } option
   * @returns {boolean}
   */
  private checkHeaderElementFixed(option: TableStickyModule.Option): boolean {
    const tableHeaderElement = this.getElementByClassName(
      '.el-table__header-wrapper',
      true,
      option,
    );
    return tableHeaderElement.classList.contains('fixed');
  }

  /**
   * @description 通过className获取指定的节点
   * @param { string } className
   * @param { boolean } inTable
   * @param { TableStickyModule.Option } option
   * @returns { HTMLElement }
   */
  private getElementByClassName(
    className: string,
    inTable?: boolean,
    option?: TableStickyModule.Option,
  ): HTMLElement {
    if (inTable) {
      const { tableElement } = option!;
      return tableElement.querySelector<HTMLElement>(className)!;
    } else {
      return document.querySelector<HTMLElement>(className)!;
    }
  }

  /**
   * @desc 获取当前组件在父组件中的uid
   * @param {TableStickyModule.Option} option
   * @returns {string}
   */
  private getUid(option: TableStickyModule.Option): string {
    const { vnode } = option;
    return String((vnode?.ref as TableStickyModule.VNodeNormalizedRefAtom).i.uid);
  }

  /**
   * @desc 获取当前uid的所对应的 StickyConfig
   * @param {TableStickyModule.Option} option
   * @returns {StickyConfig | undefined}
   */
  private getStickyConfig(option: TableStickyModule.Option): TableStickyModule.StickyConfig {
    const uid = this.getUid(option);
    return this.stickyConfigs.get(uid)!;
  }

  /**
   * @desc 获取当前tableHeader节点距离body的top值
   * @param {TableStickyModule.Option} option
   * @returns Number
   */
  private getTableHeaderCurrentTop(option: TableStickyModule.Option): number {
    const tableHeaderElement = this.getElementByClassName(
      '.el-table__header-wrapper',
      true,
      option,
    );
    const tableHeaderElementTop = tableHeaderElement.getBoundingClientRect().top;
    return tableHeaderElementTop;
  }

  /**
   * @desc 获取dom节点的样式
   * @param {HTMLElement} element
   * @param {keyof CSSStyleDeclaration} styleKey
   * @returns {CSSStyleDeclaration[keyof CSSStyleDeclaration]}
   */
  private getElementStyle<P extends keyof CSSStyleDeclaration>(
    element: HTMLElement,
    styleKey: P,
  ): CSSStyleDeclaration[P] {
    return window.getComputedStyle(element)[styleKey];
  }

  /**
   * @desc 获取tableHeader节点距离body的top值
   * @desc 只有在初始化的时候 才会采用 用户传递进来的值
   * @param {TableStickyModule.Option} option
   * @returns {Number}
   */
  private getFixedTopValue(option: TableStickyModule.Option): number {
    const { binding } = option;
    if (binding.value && typeof binding.value.top === 'number') return binding.value.top;
    else {
      // 如果用户没有设置的话 就采用当前tableHeader节点距离body的top值
      return this.getTableHeaderCurrentTop(option);
    }
  }

  /**
   * @desc 给当前tableHeader节点固定头设置Fixed样式
   * @param {TableStickyModule.Option} option
   * @returns {void}
   */
  private setTableHeaderFixed(option: TableStickyModule.Option): void {
    const { tableElement } = option;
    const { tableHeaderElement, tableInnerWapperElement, tableBodyElement, fixedTopValue } =
      this.getStickyConfig(option);

    const maxZIndex: number = Array.from(tableElement.querySelectorAll('*')).reduce(
      (maxZIndex: number, element: Element) =>
        Math.max(maxZIndex, +this.getElementStyle(element as HTMLElement, 'zIndex') || 0),
      0,
    );

    tableHeaderElement.style.position = 'fixed';
    tableHeaderElement.style.zIndex = `${maxZIndex}`;
    tableHeaderElement.style.top = fixedTopValue + 'px';
    tableHeaderElement.style.transition = 'top .3s';
    tableHeaderElement.style.width = this.getElementStyle(tableBodyElement, 'width');
    tableInnerWapperElement.style.marginTop = tableHeaderElement.offsetHeight + 'px';
    tableHeaderElement.classList.add('fixed');
  }

  /**
   * @desc 移除tableHeader fixed 样式
   * @param {TableStickyModule.Option} option
   * @returns { void }
   */
  private removeTableHeaderFixed(option: TableStickyModule.Option): void {
    const {
      tableHeaderElement,
      tableInnerWapperElement,
      tableInnerWapperElementOriginalStyle,
      tableHeaderElementOriginalStyle,
    } = this.getStickyConfig(option);
    Object.keys(tableHeaderElementOriginalStyle).forEach((styleKey) => {
      // @ts-ignore
      const styleValue = tableHeaderElementOriginalStyle[styleKey as keyof CSSStyleDeclaration];
      // @ts-ignore
      tableHeaderElement.style[styleKey as keyof CSSStyleDeclaration] = styleValue;
    });
    Object.keys(tableInnerWapperElementOriginalStyle).forEach((styleKey) => {
      const styleValue =
        // @ts-ignore
        tableInnerWapperElementOriginalStyle[styleKey as keyof CSSStyleDeclaration];
      // @ts-ignore
      tableInnerWapperElement.style[styleKey as keyof CSSStyleDeclaration] = styleValue;
    });
    tableHeaderElement.classList.remove('fixed');
  }

  /**
   * @desc 处理滚动条滚动的时候
   * @param {TableStickyModule.Option} option
   * @returns { void }
   */
  // @Throttle(4, true)
  private handleScrollElementOnScroll(option: TableStickyModule.Option): void {
    const { scrollElement, fixedTopValue, tableHeaderElementOriginalTop } =
      this.getStickyConfig(option);
    // 滚动条距离body顶部的距离
    const scrollElementTop = scrollElement.scrollTop;

    // 滚动条可以滚动的最大距离 也就是tableHeaderElement的原始top值减去用户设置的fixedTop
    const scrollElementMaxAllowTop =
      // 如果用户设置的fixedTop大于tableHeaderElement的原始top值 那么直接让tableHeader在原来的位置fixed
      tableHeaderElementOriginalTop - fixedTopValue <= 0
        ? 0
        : // 获取滚动条可以滚动的最大距离
          tableHeaderElementOriginalTop - fixedTopValue;
    // 判断当前tableHeader是否已经被fixed
    const isFixed = this.checkHeaderElementFixed(option);
    if (scrollElementMaxAllowTop - scrollElementTop >= 0) {
      isFixed && this.removeTableHeaderFixed(option);
    } else {
      !isFixed && this.setTableHeaderFixed(option);
    }
  }

  /**
   * @desc 当页面宽度发生变更的时候 重新设置表头宽度 使其表头宽度和表body宽度保持一直
   * @desc 不能将表头宽度设置成 table 宽度 有时候表头宽度会小于表宽度
   * @param {TableStickyModule.Option} option
   * @returns { void }
   */
  // @Debounce(300)
  private setTableHeaderWidth(option: TableStickyModule.Option): void {
    const { tableBodyElement, tableHeaderElement } = this.getStickyConfig(option);
    tableHeaderElement.style.width = this.getElementStyle(tableBodyElement, 'width');
  }
  /**
   * @desc 更新 stickyConfig 配置
   * @param {Option} option
   * @returns { void }
   */
  // @Debounce(300, true)
  private updateStickyConfig(
    option: TableStickyModule.Option,
    stickyConfig: Partial<TableStickyModule.StickyConfig>,
  ): void {
    const uid = this.getUid(option);
    const originalStickyConfig = this.getStickyConfig(option) || undefined;
    const newStickyConfig = Object.assign({}, originalStickyConfig, stickyConfig);
    this.stickyConfigs.set(uid, newStickyConfig);
  }
  /**
   * @desc 监听 el-table 节点的宽度变化 也可以监听页面宽度变化
   * @param {TableStickyModule.Option} option
   * @returns { ResizeObserver }
   */
  private getTableElementResizeObserver(option: TableStickyModule.Option): ResizeObserver {
    const { tableElement } = option;
    const tableElementResizeObserver = new ResizeObserver((entries) => {
      // 获取现在tableWidth
      let currentTableWidth: string = '';
      for (const entry of entries) {
        const tableElement = entry.target as HTMLDivElement;
        currentTableWidth = this.getElementStyle(tableElement, 'width');
      }
      const { tableElementOriginalWidth } = this.getStickyConfig(option);
      const isFixed = this.checkHeaderElementFixed(option);

      // 如果tableWidth发生变化 则重新设置表头宽度
      if (tableElementOriginalWidth !== currentTableWidth) {
        const stickyConfig: Partial<TableStickyModule.StickyConfig> = {
          tableElementOriginalWidth: this.getElementStyle(tableElement, 'width'),
        };
        this.updateStickyConfig(option, stickyConfig);
        this.setTableHeaderWidth(option);
        isFixed && this.setTableHeaderFixed(option);
      }
    });
    tableElementResizeObserver.observe(tableElement);
    return tableElementResizeObserver;
  }
  /**
   * @description 获取所有会发生变更的节点的原始高度
   * @param { TableStickyModule.Option } option
   * @returns { Array<HTMLElement>}
   */
  private getWillChangeElementsOriginalHeight(option: TableStickyModule.Option): Array<string> {
    const { willBeChangeElementClasses } = option.binding.value;
    if (!willBeChangeElementClasses) return [];
    return willBeChangeElementClasses.map((willBeChangeNodeclass: string) => {
      const height = this.getElementStyle(document.querySelector(willBeChangeNodeclass)!, 'height');
      return height;
    });
  }
  /**
   * @description 给会发生变更的节点添加resizeObserver
   * @param { TableStickyModule.Option } option
   * @returns { Array<ResizeObserver>}
   */
  private getWillChangeElementsResizeObserver(
    option: TableStickyModule.Option,
  ): Array<ResizeObserver> {
    const { willBeChangeElementClasses } = option.binding.value;
    if (!willBeChangeElementClasses) return [];
    return willBeChangeElementClasses.map((willBeChangeElementclass: string, index: number) => {
      // 获取当前节点
      const willChangeElement = document.querySelector(willBeChangeElementclass)!;
      const willChangeElementResizeObserver = new ResizeObserver((entries) => {
        let currentHeight: string = '';
        for (const entry of entries) {
          const targetElement = entry.target as HTMLElement;
          currentHeight = this.getElementStyle(targetElement, 'height');
        }
        const { willChangeElementsOriginalHeight, tableHeaderElementOriginalTop } =
          this.getStickyConfig(option);
        const originalHeight = willChangeElementsOriginalHeight[index];
        // 更新当前节点的原始高度
        willChangeElementsOriginalHeight[index] = currentHeight;
        if (originalHeight !== currentHeight) {
          const heightDifference =
            Number(currentHeight.replace('px', '')) - Number(originalHeight.replace('px', ''));
          // 获取当前表头是否被fixed
          const isFixed = this.checkHeaderElementFixed(option);
          // 重新计算  tableHeaderElementOriginalTop
          const stickyConfig: Partial<TableStickyModule.StickyConfig> = {
            willChangeElementsOriginalHeight,
            tableHeaderElementOriginalTop: tableHeaderElementOriginalTop + heightDifference,
          };
          this.updateStickyConfig(option, stickyConfig);
          isFixed && this.setTableHeaderFixed(option);
        }
      });

      willChangeElementResizeObserver.observe(willChangeElement);

      return willChangeElementResizeObserver;
    });
  }
  /**
   * @desc 初始化table表头吸顶的数据
   * @param {TableStickyModule.Option} option
   * @returns {void}
   */
  private initStickyConfig(option: TableStickyModule.Option): TableStickyModule.StickyConfig {
    const tableInnerWapperElement = this.getElementByClassName(
      '.el-table__inner-wrapper',
      true,
      option,
    );
    const tableHeaderElement = this.getElementByClassName(
      '.el-table__header-wrapper',
      true,
      option,
    );
    const tableBodyElement = this.getElementByClassName('.el-table__body-wrapper', true, option);
    const tableHeaderElementOriginalTop = this.getTableHeaderCurrentTop(option);
    const fixedTopValue = this.getFixedTopValue(option);
    const { binding } = option;
    const scrollElementClassName =
      binding.value && binding.value.parent ? binding.value.parent : 'body';
    // 获取滚动的节点
    const scrollElement = this.getElementByClassName(scrollElementClassName);

    const willChangeElementsOriginalHeight = this.getWillChangeElementsOriginalHeight(option);

    const tableHeaderElementOriginalStyle = {
      position: this.getElementStyle(tableHeaderElement, 'position'),
      top: this.getElementStyle(tableHeaderElement, 'top'),
      transition: this.getElementStyle(tableHeaderElement, 'transition'),
      zIndex: this.getElementStyle(tableHeaderElement, 'zIndex'),
    };
    const tableInnerWapperElementOriginalStyle = {
      marginTop: this.getElementStyle(tableInnerWapperElement, 'marginTop'),
    };
    const tableElementOriginalWidth = this.getElementStyle(option.tableElement, 'width');
    const handleScrollElementOnScroll = this.handleScrollElementOnScroll.bind(this, option);
    const tableElementResizeObserver = this.getTableElementResizeObserver(option);

    const willChangeElementsResizeObserver = this.getWillChangeElementsResizeObserver(option);
    /**
     * @desc 关闭滚动锚定 值有两个 auto 是开启 none 是关闭
     * @link https://www.cnblogs.com/ziyunfei/p/6668101.html
     */
    scrollElement.style.overflowAnchor = 'none';
    return {
      fixedTopValue,
      tableHeaderElement,
      tableHeaderElementOriginalTop,
      tableHeaderElementOriginalStyle,
      tableBodyElement,
      tableInnerWapperElement,
      tableInnerWapperElementOriginalStyle,
      tableElementOriginalWidth,
      scrollElement,
      handleScrollElementOnScroll,
      tableElementResizeObserver,
      willChangeElementsOriginalHeight,
      willChangeElementsResizeObserver,
    };
  }
  /**
   * @desc 当table mounted 的时候
   * @param {TableStickyModule.Option} option
   * @returns { void }
   */
  public mounted(option: TableStickyModule.Option): void {
    nextTick(() => {
      // 初始化配置
      const stickyConfig = this.initStickyConfig(option);
      this.updateStickyConfig(option, stickyConfig);
      // 获取当前的配置，监听parent节点滚动事件
      const { scrollElement, handleScrollElementOnScroll } = this.getStickyConfig(option);
      scrollElement.addEventListener('scroll', handleScrollElementOnScroll);
    });
  }
  /**
   * @desc 当指令数据的时候
   * @param {TableStickyModule.Option} option
   * @returns { void }
   */
  @Debounce(300, false)
  updated(option: TableStickyModule.Option): void {
    nextTick(() => {
      // 判断当前表头是否已经被fixed
      const isFixed = this.checkHeaderElementFixed(option);
      // updated 的时候 更新数据、更新配置、重新给表头定位
      const stickyConfig: Partial<TableStickyModule.StickyConfig> = {
        fixedTopValue: this.getFixedTopValue(option),
        willChangeElementsResizeObserver: this.getWillChangeElementsResizeObserver(option),
      };
      this.updateStickyConfig(option, stickyConfig);
      isFixed && this.setTableHeaderFixed(option);
    });
  }
  /**
   * @desc 当table unmounted 的时候
   * @param {TableStickyModule.Option} option
   * @returns { void }
   */
  unmounted(option: TableStickyModule.Option): void {
    const {
      handleScrollElementOnScroll,
      scrollElement,
      tableElementResizeObserver,
      willChangeElementsResizeObserver,
    } = this.getStickyConfig(option);
    scrollElement.removeEventListener('scroll', handleScrollElementOnScroll);
    tableElementResizeObserver.disconnect();
    willChangeElementsResizeObserver.forEach((willChangeElementsResizeObserver) => {
      willChangeElementsResizeObserver.disconnect();
    });
  }
}

/**
 * @file table-sticky-directive.ts
 * @desc table-sticky 指令
 */
export default defineNuxtPlugin((nuxtApp) => {
  const tableStickyPlugin = new TableStickyPlugin();
  nuxtApp.vueApp.directive('sticky', {
    mounted(
      tableElement: HTMLElement,
      binding: TableStickyModule.TableStickyBinding,
      vnode: VNode,
    ) {
      tableStickyPlugin.mounted({ tableElement, binding, vnode });
    },
    updated(
      tableElement: HTMLElement,
      binding: TableStickyModule.TableStickyBinding,
      vnode: VNode,
    ) {
      tableStickyPlugin.updated({ tableElement, binding, vnode });
    },
    unmounted(
      tableElement: HTMLElement,
      binding: TableStickyModule.TableStickyBinding,
      vnode: VNode,
    ) {
      tableStickyPlugin.unmounted({ tableElement, binding, vnode });
    },
  });
});
