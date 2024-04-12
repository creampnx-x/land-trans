import React from 'react'
import { Cascader } from 'antd';
import { cityArray } from '../data/city';

const AntCascader = (props: {onChange: (value: any) => void}) => {
    const { onChange } = props

    return <Cascader options={cityArray} onChange={onChange} placeholder="请选择位置"/>
}

export default AntCascader