import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 15, checkperiod: 30 }); // 15 sn TTL, 30 sn kontrol

export default cache;
