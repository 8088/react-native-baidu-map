/**
 * 投票模块
 * TODO:
 *    1、外部更新投票数据(如果用户投过得到的数据应该有当前投票结果)
 *    2、根据数据量遍历渲染投票项(如果有结果直接显示结果动画,单条颜色透明度为总量的百分比)
 *    3、当用户选中某项,提交按钮解禁
 *    4、点提交后,按钮禁用并显示loading
 *    5、拿到数据结果后, 提交按钮消失, 各条投票项根据数据量做动画。
 *    6、提交失败(超时或者返回错误), 解禁提交按钮可再次提交。
 *
 * @flow
 */
'use strict';
import React, { PureComponent, PropTypes} from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react/native';
import Icon from 'react-native-vector-icons/Ionicons';

import Colors from '../assets/Colors';
import RadioGroup from '../components/RadioGroup';
import RadioButton from '../components/RadioButton';


class ItemData {

    image='';
    title = '';
    info = '';
    price = 0;
    key= '';

    @observable
    count = 0;

    constructor(item) {
        this.image = item.image;
        this.title = item.title;
        this.info = item.info;
        this.price = item.price;
        this.key = item.key;
    }

    @action
    inc = () => {
        ++this.count;
    }

    @action
    dec = () => {
        if (this.count > 0) {
            --this.count;
        }
    }
};

class VoteData {

    @observable
    items = [];

    constructor() {
        for (let i = 0; i < 10; i++) {
            var temp = {
                image: '',
                title: `商品名称${i}`,
                info: `商品简介${i}商品简介商品简介商品简介${i}`,
                price: Math.floor(Math.random() * 10000)/100,
                key: String(i),
            }
            this.items.push(new ItemData(temp));
        }
    }

    @computed
    get count() {
        return this.items.reduce((a, b) => a + b.count, 0);
    }

    @computed
    get price() {
        return this.items.reduce((a, b) => a + (b.price * b.count), 0);
    }
}

@observer
export default class Vote extends PureComponent {
    render() {
        return (
            <RadioGroup name={'vote'} style={styles.container} onChanged={this._onRadioChanged}>

                <RadioButton
                    style={styles.vote_item}
                    renderChecked={()=>{
                        return (
                            <View style={styles.vote_item}>
                                <View style={styles.radio_btn_checked}>
                                    <Icon style={{backgroundColor:'transparent'}} name='md-checkmark' size={14} color='#FE7A93'/>
                                </View>
                                <Text numberOfLines={1} style={styles.radio_txt}>投票选项一</Text>
                            </View>
                        );
                    }}>
                    <View style={styles.radio_btn} />
                    <Text numberOfLines={1} style={styles.radio_txt}>投票选项一</Text>
                </RadioButton>
                <View style={styles.separator}/>
                <RadioButton
                    style={styles.vote_item}
                    renderChecked={()=>{
                        return (
                            <View style={styles.vote_item}>
                                <View style={styles.radio_btn_checked}>
                                    <Icon style={{backgroundColor:'transparent'}} name='md-checkmark' size={14} color='#FE7A93'/>
                                </View>
                                <Text numberOfLines={1} style={styles.radio_txt}>投票选项二投票选项二</Text>
                            </View>
                        );
                    }}>
                    <View style={styles.radio_btn} />
                    <Text numberOfLines={1} style={styles.radio_txt}>投票选项二投票选项二</Text>
                </RadioButton>

            </RadioGroup>
        );
    }

    _onPress=()=>{
        requestAnimationFrame(()=>{
            this.props.navigator.pop();
        })
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#eee'
    },

    vote_item:{
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        backgroundColor:'#fff'


    },

    //radio button
    radio_btn: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.gray,
        height: 20,
        width: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radio_btn_checked: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.pink,
        height: 20,
        width: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radio_txt:{
        color: Colors.deep,
        marginLeft: 10,
        flex:1,
    },

    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#eee',
    },

});
