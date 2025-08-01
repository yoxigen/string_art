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

// Inserts the control configs after the specified control.
export function insertAfter(
  controlsConfig,
  insertAfterKey,
  controlsConfigToInsert
) {
  function findContainingList(root) {
    const foundIndex = root.findIndex(({ key }) => key === insertAfterKey);
    if (foundIndex !== -1) {
      return { list: root, index: foundIndex };
    }

    for (control of controlsConfig) {
      if (control.children) {
        const childContainingList = findContainingList(control.children);
        if (childContainingList) {
          return childContainingList;
        }
      }
    }

    return null;
  }

  const containingList = findContainingList(controlsConfig);
  if (containingList) {
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
