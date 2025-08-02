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

// If the key to add after is found, returns a copy of the controls config (all the tree) with the added config
export function insertAfter(
  controlsConfig,
  insertAfterKey,
  controlsConfigToInsert
) {
  function getControlPath(root) {
    const foundIndex = root.findIndex(({ key }) => key === insertAfterKey);
    if (foundIndex !== -1) {
      return [foundIndex];
    }

    for (let i = 0; i < root.length; i++) {
      const control = root[i];
      if (control.children) {
        const pathToControl = findContainingList(control.children);
        if (pathToControl) {
          return [i, ...pathToControl];
        }
      }
    }

    return null;
  }

  const pathToControl = getControlPath(controlsConfig);
  if (pathToControl) {
    const controlIndex = pathToControl.pop();
    const configCopy = structuredClone(controlsConfig);
    let list = configCopy[pathToControl.shift()].reduce(
      (control, position) => control.children[position]
    );
    const list = pathToControl.reduce(position);
    const { list, index } = containingList;
    list.splice(index + 1, 0, ...controlsConfigToInsert);
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
