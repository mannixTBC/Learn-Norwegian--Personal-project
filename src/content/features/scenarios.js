import {getContent} from '../activeContent';
export default new Proxy({},{get:(_,key)=>getContent('scenarios')[key]});
