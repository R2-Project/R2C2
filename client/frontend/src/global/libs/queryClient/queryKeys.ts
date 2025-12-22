function createEntityKeys(entity: string) {
  return {
    all: [entity],
    list: [entity, 'list'],
    detail: (id: string | number) => [entity, 'detail', id],
  };
}

export const agentKeys = createEntityKeys('agents');
export const listenerKeys = createEntityKeys('listeners');
export const taskKeys = createEntityKeys('tasks');
export const sessionKeys = createEntityKeys('sessions');
export const operatorKeys = createEntityKeys('operators');
