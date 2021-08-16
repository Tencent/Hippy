export function add(arr: string[], id: string) {
  const index = arr.findIndex((v) => v === id);
  if (index === -1) {
    arr.push(id);
  }
}

export function remove(arr, id: string) {
  const index = arr.findIndex((v) => v === id);
  if (index > -1) arr.splice(index, 1);
}
