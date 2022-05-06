import qs from "qs";
const pending = [];
const task = {};

export const pushPending = (e) => {
  pending.push(e);
};

export const removePending = (e) => {
  const key =
    e.baseURL + "?" + (e.method == "post" ? e.data : qs.stringify(e.params));
  for (const p in pending) {
    if (pending[p].key === key) {
      pending.splice(p, 1);
    }
  }
};

export const existInPending = (key) => {
  return pending.some((e) => e.key === key);
};

export const createTask = (key, resolve) => {
  const cb = (response) => {
    if (response.data.status === -1) {
      // 登录失效
    } else if (response.data.status) {
      // todo
    }
    resolve(response.data);
  }
  if (!task[key]) {
    task[key] = [];
  } 
  task[key].push(cb);
}

export const handleTask = (key, response) => {
  for (let i = 0; task[key] && i < task[key].length; i++) {
    task[key][i](response);
  }
  task[key] = undefined;
}
