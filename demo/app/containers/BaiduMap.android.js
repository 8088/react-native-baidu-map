/**
 * 百度地图定位
 *
 * @flow
 */
'use strict';
import React, {PropTypes,Component} from 'react'
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    TextInput,
    FlatList,
    Keyboard,
    InteractionManager,
    ActivityIndicator,
    UIManager,
    CameraRoll,
} from 'react-native'

import {
    MapView,
    MapTypes,
    Geolocation,
    MapModule,
    PoiSearch
} from 'react-native-baidu-map';

import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/Colors';

const VIEWABILITY_CONFIG = {
    minimumViewTime: 3000,
    viewAreaCoveragePercentThreshold: 100,
    waitForInteraction: true,
};

class Item extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        address: PropTypes.string,
        latitude: PropTypes.string,
        longitude: PropTypes.string,
        index: PropTypes.number,
        pressed: PropTypes.bool,
        onPress: PropTypes.func,
    };
    static defaultProps = {
        name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        index: -1,
        pressed: false,
        onPress: (key: string) => {}
    };

    constructor(props) {
        super(props)

        this.state = {
            pressed: props.pressed,
        }
    }

    componentDidMount(){
        if(!this.unmounting&&this.props.index===0) this.props.onPress(this);
    }

    shouldComponentUpdate(nextPorps, nextState){
        return !this.unmounting && nextState.pressed !== this.state.pressed;
    }

    componentWillUnmount(){
        this.unmounting = true;
    }
    render() {
        var { name, address }=this.props;
        var { pressed }=this.state;
        return (
            <TouchableOpacity style={styles.item} onPress={this._onPress}>
                <View style={{flex:1}}>
                    <Text numberOfLines={1} style={styles.item_ttl}>{name}</Text>
                    <Text numberOfLines={1} style={styles.item_txt}>{address}</Text>
                </View>
                {pressed?<Icon name='md-checkmark' size={18} color={Colors.pink}/>:null}
            </TouchableOpacity>
        );
    }

    _onPress = () => {
        if(!this.state.pressed){
            this.setState({pressed:true});
            this.props.onPress(this);
        }
    };
}

export default class BaiduMap extends Component {
    constructor(props) {
        super(props)
        this._page=1;
        this.last_pressed_item=null;
        this.state = {
            currentCity: '',
            currentDistrict: '',
            currentAddress: '',
            zoom: 17,
            center: null,
            marker: null,
            info: '',
            cover: false,
            searchText: '',
            searchData: [],
        }
        this._first=true;
    }

    componentDidMount() {

        //延时处理，让页面跳转更流畅
        /*InteractionManager.runAfterInteractions(() => {
            Geolocation.getCurrentPosition()
                .then(data => {
                    this._updateMarker(data.latitude, data.longitude);
                })
                .catch(evt =>{
                    console.warn(evt, 'error');
                });
        });*/

        Geolocation.getCurrentPosition()
            .then(data => {
                console.log('getCurrentPosition.data===', data)
                this.setState({
                    shopAddress: data.address,
                    currentCity: data.city,
                    currentDistrict: data.district,
                    center: {
                        latitude: data.latitude,
                        longitude: data.longitude,
                    },
                });
            })
            .catch(e =>{
                console.warn(e, 'error')
            })
    }

    render() {
        const {
            zoom,
            center,
            marker,
            info,
            cover,
            currentCity,
            currentDistrict,
            currentAddress,
            searchText,
            searchData,
        }=this.state;
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor='rgba(255,255,255,0.1)' hidden={false} animated={true} translucent={true} barStyle='default'/>
                <View style={[styles.topbar, this.props.style]}>
                    <View style={styles.left}>
                        {this.props.navigator?<TouchableOpacity
                            onPress={this._onBack}
                            style={styles.button}>
                            <Icon name='ios-arrow-back-outline' size={24} color={'black'}/>
                        </TouchableOpacity>:null}
                    </View>
                    <View style={styles.middle}>
                        <View style={styles.search_area}>
                            <Icon name='ios-search' size={18} color={Colors.gray}/>
                            <TextInput
                                placeholder={'搜索地点'}
                                placeholderTextColor={Colors.gray}
                                autoCapitalize="none"
                                value={searchText}
                                returnKeyType={'search'}
                                maxLength={20}
                                onChangeText={this._searchTextChange}
                                style={styles.search_text_input}
                                underlineColorAndroid='white'
                                selectionColor={'pink'}
                                onFocus={this._showCover}
                                onSubmitEditing={this._clearCover}
                            />
                            {searchText.length?<TouchableOpacity
                                onPress={()=>this.setState({searchText:''})}
                                style={styles.clear_btn_area}>
                                <View style={styles.clear_btn}><Icon name='md-close' style={{backgroundColor:'transparent',}} size={10} color={'white'}/></View>
                            </TouchableOpacity>:null}
                        </View>
                    </View>
                    <View style={styles.right}>
                        <TouchableOpacity
                            onPress={this._onConfirm}
                            style={styles.button}>
                            <Text style={styles.button_lable}>发送</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <MapView
                    ref={ map => this.map = map }
                    mapType={MapTypes.NORMAL}
                    zoom={zoom}
                    center={center}
                    marker={marker}
                    style={styles.map}
                    onMapStatusChangeFinish={(evt)=>{
                        this._updateMarker(evt.target.latitude, evt.target.longitude);
                    }}/>
                <FlatList
                    keyExtractor={(item: object, index: number) => String(index)}
                    ItemSeparatorComponent={this._ItemSeparatorComponent}
                    ListFooterComponent={this._ListFooterComponent}
                    data={searchData}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="on-drag"
                    numColumns={1}
                    onEndReached={this._loadMore}
                    refreshing={false}
                    renderItem={this._renderItem}
                    style={styles.list}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                />
                {cover?<TouchableOpacity onPress={this._clearCover} style={styles.map_cover} />:null}
            </View>
        )
    }

    _onMapStatusChange=(evt)=>{
        this.setState({info:JSON.stringify(evt)});
    }

    _showCover=()=>{
        this.setState({cover:true});
    }

    _clearCover=()=>{
        // console.warn(JSON.stringify(evt));
        Keyboard.dismiss();
        this.setState({cover:false});
    }


    _onBack=()=>{
        requestAnimationFrame(()=>{
            this.props.navigator.pop();
        })
    }

    _onConfirm=()=>{
        //alert('确定截图并回退');
        const {
            zoom,
            center,
            marker,
            info,
            cover,
            currentCity,
            currentDistrict,
            currentAddress,
            searchText,
            searchData,
        }=this.state;

        var map_info={
            city: currentCity,
            district: currentDistrict,
            address: currentAddress,
            latitude: center.latitude,
            longitude: center.longitude,
        }

        UIManager
            .takeSnapshot(this.map, {format: 'png', width: 200, height: 160, quality: 3}) // See UIManager.js for options
            .then((uri) => {
                if(this.props.passProps.callback) {
                    map_info.uri = uri;
                    this.props.passProps.callback(map_info);
                }
                this._onBack();
                // return uri;
            })
            .catch((error) => alert(error));
        // .then(uri => {
        // CameraRoll.saveToCameraRoll(uri, 'photo');
        // })

    }


    _ItemSeparatorComponent=()=>{
        return <View style={styles.item_separator}/>;
    }

    _ListFooterComponent=()=>{
        return (
            <View style={styles.list_footer}>
                <Text style={{color:Colors.gray}}>{'----- loading... ------'}</Text>
            </View>
        );
    }

    _renderItem = ({item}) => {
        return <Item {...item} onPress={this._pressItem} />;
    }

    _searchTextChange=(text)=>{
        this.setState({searchText:text});
        this._updateListDate(text);
    }

    _updateListDate=(text)=>{
        this._page=1;
        if(this.last_pressed_item) this.last_pressed_item.setState({pressed:false});
        this.setState({ searchData: [] }); //makr：不置空列表数据不知为什么不更新，控制台输出是新的。实际使用中换mobx数据
        PoiSearch.searchInCityProcess(this.state.currentCity, text, this._page)
            .then(data => {
                let temp = data.poiResult?data.poiResult.poiInfos:[];
                let _data = temp.map((item, index)=>{
                    return {
                        ...item,
                        index,
                        pressed:index?false:true,
                    }
                });

                this.setState({ searchData: _data });
                // console.log('search.data===', _data)

                if(_data[0]){
                    this._updateMarker(Number(_data[0].latitude), Number(_data[0].longitude));
                }

            })
            .catch(e =>{
                console.warn(e, 'error');
            })
    }


    _loadMore=()=>{
        this._page++;
        PoiSearch.searchInCityProcess(this.state.currentCity, this.state.searchText, this._page)
            .then(data => {
                let temp = data.poiResult?data.poiResult.poiInfos:[];
                let _data = temp.map((item, index)=>{
                    return {
                        ...item,
                        index:index+this.state.searchData.length,
                        pressed:false,
                    }
                });
                let list_data = this.state.searchData.concat(_data);
                // console.log('loadmore.data===', list_data);
                this.setState({ searchData: list_data });
            })
            .catch(e =>{
                console.warn(e, 'error')
            })
    }


    _updateMarker=(latitude, longitude)=>{
        Geolocation.reverseGeoCode(latitude, longitude)
            .then(data => {
                // console.log('updadate.data===', data)
                if(data.address) {
                    this.setState({
                        currentAddress: data.address,
                        currentCity: data.city,
                        currentDistrict: data.district,
                        center: {
                            latitude: latitude,
                            longitude: longitude,
                        },
                    })
                }else {
                    this.setState({
                        currentAddress: data.province + data.city + data.district + data.streetName + data.streetNumber,
                        currentCity: data.city,
                        currentDistrict: data.district,
                        center: {
                            latitude: latitude,
                            longitude: longitude,
                        },
                    })
                }
            })
            .catch(e =>{
                console.warn(e, 'error')
            });
    }


    _pressItem = (item) => {
        // alert(this.last_pressed_item, item)
        if(this.last_pressed_item===item) return;

        if(this.last_pressed_item){
            let temp = this.state.searchData;
            if(this.last_pressed_item.state.pressed) this.last_pressed_item.setState({pressed:false});
            temp[this.last_pressed_item.props.index].pressed=false;
            temp[item.props.index].pressed = true;
            this.setState({searchData:temp});
            this._updateMarker(Number(temp[item.props.index].latitude), Number(temp[item.props.index].longitude));
        }


        this.last_pressed_item = item;

        // console.log('点击后的数据',this.state.searchData)
        // let index = Number(item.props.index);
        // let curPoint = this.state.searchData[index];
        // if(curPoint){
        //     this._updateMarker(Number(curPoint.latitude), Number(curPoint.longitude));
        // }

    };

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    topbar: {
        paddingTop: 15,
        height: 60,
        borderBottomWidth: 1,
        borderColor: '#EEE',
        backgroundColor: '#fff',
        flexDirection: "row",
    },
    left: {
        width: 40,
    },
    middle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    right: {
        width: 50,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button_lable: {
        fontSize: 16,
        color: 'black',
    },
    title: {
        color: 'black',
        fontSize: 18,
    },
    search_area: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
        flexDirection: 'row',
        paddingLeft: 5,
        paddingRight: 3,
        height: 32,
    },
    search_text_input: {
        height: 30,
        fontSize: 13,
        padding: 4,
        flex:1,
    },
    clear_btn_area: {
        width:24,
        height:24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clear_btn:{
        borderRadius:7,
        backgroundColor:'#ddd',
        width:14,
        height:14,
        justifyContent: 'center',
        alignItems: 'center',
    },



    map: {
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list:{
        flex: 1,
        borderTopColor: '#ccc',
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    marker: {
        width: 24,
        height: 24,
        marginBottom: 20,
    },
    map_cover:{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,.4)',
        marginTop:60,
    },


    item:{
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    item_ttl:{
        color: Colors.dark,
        fontSize: 14,
    },
    item_txt:{
        color: Colors.grey,
        fontSize: 12,
        marginTop: 5,
    },
    item_separator:{
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgb(200, 199, 204)',
        marginLeft: 15,
    },
    list_footer:{
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },



})