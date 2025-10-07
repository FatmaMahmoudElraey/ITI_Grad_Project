import axios from 'axios';
import { BASE_URL } from './constants';

// Global axios defaults
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true; // send cookies with requests

export default axios;
