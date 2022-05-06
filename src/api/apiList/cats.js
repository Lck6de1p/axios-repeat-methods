import Request from '../request.js';

const getList = (data) => Request.get('/cats/12', data);

export default {
  getList
}
