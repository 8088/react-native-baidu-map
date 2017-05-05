/**
 * Sample React Native Test Baidu Map
 * https://github.com/8088
 * @flow
 */
import { AppRegistry } from 'react-native';

import App from './app/';

global.__ANDROID__ = false;
global.__IOS__ = true;

AppRegistry.registerComponent('TestBaiduMap', () => App);
