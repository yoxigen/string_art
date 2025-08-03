export function withoutAttribute(controlConfig, attributeName) {
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

export function copyConfig(controlsConfig) {
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
 * @param {*} root
 * @param {*} controlKey
 * @returns
 */
function getControlPath(controlsConfig, controlKey) {
  const foundIndex = controlsConfig.findIndex(({ key }) => key === controlKey);
  if (foundIndex !== -1) {
    return [foundIndex];
  }

  for (let i = 0; i < controlsConfig.length; i++) {
    const control = controlsConfig[i];
    if (control.children) {
      const pathToControl = getControlPath(control.children, controlKey);
      if (pathToControl) {
        return [i, ...pathToControl];
      }
    }
  }

  return null;
}

// If the key to add after is found, returns a copy of the controls config (all the tree) with the added config
export function insertAfter(
  controlsConfig,
  insertAfterKey,
  controlsConfigToInsert
) {
  const pathToControl = getControlPath(controlsConfig, insertAfterKey);
  if (pathToControl) {
    const controlIndex = pathToControl.pop();
    const configCopy = copyConfig(controlsConfig);
    let list = configCopy;

    if (pathToControl.length) {
      while (pathToControl.length) {
        list = list[pathToControl.shift()].children;
      }
    }

    list.splice(controlIndex + 1, 0, ...controlsConfigToInsert);
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
export function mapControls(controlsConfig, controlPropMapper) {
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
