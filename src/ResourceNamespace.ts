// ResourceNamespace allows you to create nested resources, i.e. `Lotr.issuing.cards`.

import {LotrObject, LotrResourceObject} from './Types.js';

export type LotrResourceNamespaceObject = {
  [key: string]: LotrResourceObject | LotrResourceNamespaceObject;
};

// It also works recursively
function ResourceNamespace(
  this: LotrResourceNamespaceObject,
  Lotr: LotrObject,
  resources: Record<
    string,
    new (...args: any[]) => LotrResourceObject | LotrResourceNamespaceObject
  >
): void {
  for (const name in resources) {
    const camelCaseName = name[0].toLowerCase() + name.substring(1);

    const resource = new resources[name](Lotr);

    this[camelCaseName] = resource;
  }
}

export function resourceNamespace(
  namespace: string,
  resources: Record<
    string,
    new (...args: any[]) => LotrResourceObject | LotrResourceNamespaceObject
  >
): new (lotr: LotrObject) => LotrResourceNamespaceObject {
  return function(lotr: LotrObject): LotrResourceNamespaceObject {
    return new (ResourceNamespace as any)(lotr, resources);
  } as any;
}
