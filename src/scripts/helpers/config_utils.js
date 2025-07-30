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
