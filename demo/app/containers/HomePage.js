/**
 * Home Page
 *
 * @flow
 */
'use strict';
import React, { Component, PropTypes } from 'react';
import {
    View,
    Text,
    Image,
    Platform,
    TextInput,
    StatusBar,
    ScrollView,
    StyleSheet,
    ProgressViewIOS,
    ProgressBarAndroid,
} from 'react-native';
import camelcase from 'camelcase';
import Icon from 'react-native-vector-icons/EvilIcons';

import Colors from '../assets/Colors';
import Network from '../mixins/Network';
import styles from './Style.css';

import Button from '../components/Button';
import ToggleButton from '../components/ToggleButton';
import Stepper from '../components/Stepper';

import Topbar from '../modules/Topbar';
import Module from '../modules/Module';

export default class HomePage extends Component {

    static propTypes = {
        // ttl: PropTypes.instanceOf(Title),
    };

    static defaultProps = {
        // ttl: new Title('Test mobx style'),
    };

    constructor(props) {
        super(props);
        this.state = {
            map: null,
        };

    }

    componentDidMount() {
        //
    }

    componentWillUnmount(){
        this.unmounting = true;
    }


    //
    render() {
        const { ttl, } = this.props;
        const { secure, countdown, map} = this.state;
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor='rgba(255,255,255,0.1)' hidden={false} animated={true} translucent={true} barStyle='default'/>
                <Topbar title='Baidu Map Test'/>
                <ScrollView style={styles.flex_1}>

                    <Module title='map screenshot'>
                        <View style={{flex:1, backgroundColor:'#eee'}}>
                            <Button type='submit' style={styles.list_btn} onPress={()=>{
                                    this._gotoPage('BaiduMap', {callback:(info)=>{
                                        this.setState({map:info});
                                    }});
                                }}>
                                <Icon name='location' size={20} color={Colors.grey}/>
                                <Text style={[styles.flex_1, styles.color_deep,styles.font_size_14, styles.margin_left_5]}>Get Location</Text>
                                <Icon name='chevron-right' size={30} color={Colors.grey}/>
                            </Button>
                        </View>
                        {map?<Image style={styles.map_img} source={{uri: map.uri}}/>:<View style={styles.map_img}/>}
                    </Module>


                </ScrollView>
            </View>
        );
    }

    _getCode=()=>{
        //..
        this.countdown.start(60);
    }

    _onToggle=(evt)=>{
        this.setState({secure:!this.state.secure})
    }

    _submitSuccess=(info)=>{
        this.validate.clear();

        //TODO:跳转页面或处理数据
        //..
    }

    _getValidStyle=(name)=>{
        if(this.validate[name]==='')
        {
            return {borderColor: Colors.light};
        }
        else{
            if(this.validate[camelcase('validate','error',name)]){
                return {borderColor: Colors.orange};
            }
            else return {borderColor: Colors.green};
        }
    }

    _onChanged=(value)=>{
        try {
            this.counter = parseInt(value);
        } catch (err) {

        }
    }


    _onChanged2=(value)=>{
        try {
            this.counter2 = parseInt(value);
        } catch (err) {

        }
    }

    _getValue=()=>{
        alert(this.counter)
    }

    _onPress = () => {
        const { ttl } = this.props;
        ttl.done = !ttl.done;
    };

    _gotoPage=(title, passProps=null, component=null)=>{
        requestAnimationFrame(()=>{
            this.props.navigator.push({title, passProps, component});
        })
    }
}

