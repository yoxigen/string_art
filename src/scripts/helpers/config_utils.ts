import type {
  Config,
  ControlConfig,
  ControlsConfig,
} from '../types/config.types';

interface ControlConfigNode<T> {
  control: ControlConfig<T>;
  parent: ControlConfigNode<T> | null;
  index: number;
}

export function* traverseConfig<T>(
  controlsConfig: ControlsConfig<T>,
  parent?: ControlConfigNode<T>
): Generator<{
  control: ControlConfig<T>;
  parent: ControlConfigNode<T> | null;
  index: number;
}> {
  let index = 0;

  for (const control of controlsConfig) {
    yield { control, index, parent };
    if (control.children) {
      yield* traverseConfig(control.children, { control, parent, index });
    }
    index++;
  }
}

function findControlConfigNode<T>(
  controlsConfig: ControlsConfig<T>,
  findFn: (control: ControlConfig<T>) => any
): ControlConfigNode<T> | null {
  for (const node of traverseConfig(controlsConfig)) {
    if (findFn(node.control)) {
      return node;
    }
  }

  return null;
}

function getControlConfigNodeByKey<T>(
  controlsConfig: ControlsConfig<T>,
  controlKey: string
): ControlConfigNode<T> | null {
  return findControlConfigNode(controlsConfig, ({ key }) => key === controlKey);
}

export function withoutAttribute<T>(
  controlConfig: ControlConfig<T>,
  attributeName: string
): ControlConfig<T> {
  const attr = controlConfig.attr;
  if (!attr) {
    return controlConfig;
  }

  const attrCopy = { ...attr };
  delete attrCopy[attributeName];
  return {
    ...controlConfig,
    attr: attrCopy,
  };
}

/**
 * Deep copy of a ControlsConfig
 * @param controlsConfig
 * @returns
 */
export function copyConfig<T>(
  controlsConfig: ControlsConfig<T>
): ControlsConfig<T> {
  return controlsConfig.map(control => {
    const copy = { ...control };
    if (control.children) {
      copy.children = copyConfig(control.children);
    }
    if (control.attr) {
      copy.attr = { ...control.attr };
    }

    return copy;
  });
}

/**
 * Gets the index path to a node with the given key. The path includes the index of controls in the 'children' prop of a group.
 * @returns
 */
export function getControlPath(
  controlsConfig: ControlsConfig,
  controlKey: string
): Array<number> {
  const controlNode = getControlConfigNodeByKey(controlsConfig, controlKey);
  if (controlNode) {
    const path = [controlNode.index];
    let parentNode = controlNode.parent;
    while (parentNode) {
      path.unshift(parentNode.index);
      parentNode = parentNode.parent;
    }
    return path;
  }

  return null;
}

// If the key to add after is found, returns a copy of the controls config (all the tree) with the added config
export function insertAfter<T>(
  controlsConfig: ControlsConfig<T>,
  insertAfterKey: string,
  controlsConfigToInsert: ControlsConfig<T>
) {
  const configCopy = copyConfig(controlsConfig);
  const nodeToAddAfter = getControlConfigNodeByKey(configCopy, insertAfterKey);

  if (nodeToAddAfter) {
    const { index, parent } = nodeToAddAfter;
    let list = parent?.control.children ?? configCopy;
    list.splice(index + 1, 0, ...controlsConfigToInsert);
    return configCopy;
  }

  return controlsConfig;
}

/**
 * Maps the array of control configs to change properties using the mapper
 * @param {*} controlsConfig
 * @param {*} controlPropMapper
 * @returns
 */
export function mapControls<T>(
  controlsConfig: ControlsConfig<T>,
  controlPropMapper: (control: ControlConfig<T>) => Partial<ControlConfig<T>>
): ControlsConfig<T> {
  return controlPropMapper
    ? controlsConfig.map(control => {
        if (control.children) {
          control = {
            ...control,
            children: mapControls(control.children, controlPropMapper),
          };
        }

        return {
          ...control,
          ...controlPropMapper(control),
        };
      })
    : controlsConfig;
}

/**
 * Returns config values for all controls
 * @param configControls
 * @returns
 */
export function getConfigDefaultValues<T>(
  configControls: ControlsConfig<T>
): Config<T> {
  const defaultValues = {} as Config<T>;
  for (const {
    control: { key, defaultValue },
  } of traverseConfig(configControls)) {
    if (!(defaultValue instanceof Function)) {
      // @ts-ignore
      defaultValues[key] = defaultValue;
    }
  }

  return defaultValues;
}

/**
 * Returns an object whose properties are the keys of all controls in the config, with corresponding controls as values.
 * @param configControls
 * @returns
 */
export function getControlsIndex<T>(
  configControls: ControlsConfig<T>
): Record<keyof T, ControlConfig<T>> {
  const configIndex = {} as Record<keyof T, ControlConfig<T>>;
  for (const { control } of traverseConfig(configControls)) {
    configIndex[control.key] = control;
  }

  return configIndex;
}
