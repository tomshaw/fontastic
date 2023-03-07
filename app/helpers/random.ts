
export function randString(len: number = 7) {
  const list = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  let res = "";
  for (let i = 0; i < len; i++) {
    let rnd = Math.floor(Math.random() * list.length);
    res = res + list.charAt(rnd);
  }
  return res;
}

export const randNumber = (n: number) => [...Array(n)].map(_ => Math.random() * 10 | 0).join('');
