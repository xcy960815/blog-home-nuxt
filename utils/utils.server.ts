/**
 * @desc 用于服务端的工具函数
 */

/**
 * @desc 设置process.env的属性
 * @param { keyof UtilsModule.ProcessEnvProperties } propertieKey
 * @param { UtilsModule.ProcessEnvProperties[keyof keyof UtilsModule.ProcessEnvProperties]} propertieValue
 * @returns {void}
 */
export const setProcessEnvProperties = <T extends keyof UtilsModule.ProcessEnvProperties>(
  propertieKey: T,
  propertieValue: UtilsModule.ProcessEnvProperties[T],
): void => {
  const env: UtilsModule.ProcessEnvProperties = process.env || {};
  env[propertieKey] = propertieValue;
  process.env = env;
};

/**
 * @desc 获取process.env的属性
 * @param { keyof UtilsModule.ProcessEnvProperties } propertieKey
 * @returns { UtilsModule.ProcessEnvProperties[keyof keyof UtilsModule.ProcessEnvProperties] }
 */
export const getProcessEnvProperties = <T extends keyof UtilsModule.ProcessEnvProperties>(
  propertieKey?: T,
): UtilsModule.GetProcessEnvPropertiesReturnType<T> => {
  const env: UtilsModule.ProcessEnvProperties = process.env || {};
  if (propertieKey) {
    return env[propertieKey] as UtilsModule.GetProcessEnvPropertiesReturnType<T>;
  }
  return env as UtilsModule.GetProcessEnvPropertiesReturnType<T>;
};

/**
 * @desc 将对象中的key转换为下划线格式 用于数据库新建、更新的时候使用
 * @param inputRecord { Record<string, any> }
 * @returns { keys: string[], values: any[] }
 */
export function transformObjectIntoSet(inputRecord: Record<string, any>) {
  const entries = Object.entries(inputRecord)
    .filter(([, value]) => typeof value !== 'undefined')
    .map(([key, value]) => {
      const transformedKey = key.replace(/([A-Z])/g, (_, c) => `_${c.toLowerCase()}`);
      return {
        key: `${transformedKey} = ?`,
        value,
      };
    });

  return {
    keys: entries.map((entry) => entry.key),
    values: entries.map((entry) => entry.value),
  };
}

/**
 * @desc 休眠函数
 * @param {number} timer
 * @returns Promise<void>
 */
export function serverSleep(timer: number): Promise<void> {
  return new Promise<void>((resolved) => {
    setTimeout(() => {
      resolved();
    }, timer);
  });
}

/**
 * @desc 防抖装饰器
 * @param delay {number}
 * @param immediate {boolean}
 * @returns {MethodDecorator}
 */
export function Debounce(delay: number, immediate = false) {
  return function <A extends any[]>(
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: A) => unknown>,
  ): TypedPropertyDescriptor<(...args: A) => void> | undefined {
    let timeoutId: ReturnType<typeof setTimeout> | null;
    const originalMethod = descriptor.value;

    if (originalMethod) {
      descriptor.value = function (this: ThisParameterType<(...args: A) => unknown>, ...args: A) {
        const context = this;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (immediate && !timeoutId) {
          return originalMethod.apply(context, args);
        }

        const later = () => {
          timeoutId = null;
          if (!immediate) {
            return originalMethod.apply(context, args);
          }
        };

        timeoutId && clearTimeout(timeoutId);
        timeoutId = setTimeout(later, delay);

        if (immediate && !timeoutId) {
          return originalMethod.apply(context, args);
        }
      };
      return descriptor;
    }
  };
}

/**
 * @desc 节流装饰器
 * @param delay {number}
 * @param leading {boolean}
 * @returns {MethodDecorator}
 */
export function Throttle(delay: number, leading: boolean = true) {
  return function <A extends any[], R>(
    _target: any,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: A) => Promise<R>>,
  ) {
    let previous = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null;
    const originalMethod = descriptor.value!;

    descriptor.value = function (
      this: ThisParameterType<(...args: A) => Promise<R>>,
      ...args: A
    ): Promise<R> {
      const now = Date.now();
      if (leading && !previous) {
        const result = originalMethod.apply(this, args);
        previous = now;
        return result;
      } else if (now - previous > delay) {
        timeoutId && clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const result = originalMethod.apply(this, args);
          previous = Date.now();
          return result;
        }, delay);
      }

      return new Promise((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            const result = await originalMethod.apply(this, args);
            resolve(result);
            previous = Date.now();
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };

    return descriptor;
  };
}




/**
 * @desc 防抖函数
 * @param func {Function} 需要防抖的函数
 * @param delay {number} 延迟时间
 * @returns {Function}
 */
export function debounce<F extends (...args: any[]) => any>(func: F, delay: number): (...args: Parameters<F>) => ReturnType<F> {
  let timeoutId: ReturnType<typeof setTimeout> | null;

  const debouncedFunction = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<ReturnType<F>>(resolve => {
      // 延迟执行传入的函数
      timeoutId = setTimeout(() => {
        resolve(func.apply(context, args));
      }, delay);
    });
  };

  return debouncedFunction as (...args: Parameters<F>) => ReturnType<F>;
}

/**
 * @desc 节流函数
 * @param func {Function} 需要节流的函数
 * @param delay {number} 延迟时间
 * @returns {Function}
 */
export function throttle<F extends (...args: any[]) => any>(func: F, delay: number): (...args: Parameters<F>) => ReturnType<F> {
  let previous = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null;

  const throttledFunction = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;
    const now = Date.now();

    if (now - previous > delay) {
      timeoutId && clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(context, args);
        previous = Date.now();
      }, delay);
    }
  };

  return throttledFunction as (...args: Parameters<F>) => ReturnType<F>;
}









