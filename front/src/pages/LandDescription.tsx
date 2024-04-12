import { ProDescriptions } from "@ant-design/pro-components";
import { Image } from "antd";

export type LandInfo = {
    landId: string
    position: string,
    valid: 'Yes' | 'No',
    lng: string,
    inTransaction: 'true' | 'false',
    image: string,
    price: number,
    size: number
}

function TransactionInfo(props: { land: LandInfo }) {
    const { land } = props;
    if (! land.image)
        return null;
    console.log(land);

    return (

        <div>
            <ProDescriptions
                column={2}
                title="土地信息"
            >
                <ProDescriptions.Item
                    span={1}
                    valueType="text"
                    contentStyle={{
                        // maxWidth: '80%',
                    }}
                    ellipsis
                    label="Land ID"
                >
                    {land.landId}
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label="位置"
                    valueType="text"
                >
                    {land.position.replaceAll(',','-')}
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label="经纬度"
                    tooltip="以土地东北角为准"
                    valueType="text"
                >
                    {land.lng}
                </ProDescriptions.Item>

                <ProDescriptions.Item label="标价" valueType="money">
                    {land.price}
                </ProDescriptions.Item>

                <ProDescriptions.Item label="大小" valueType="text">
                    {land.size} m²
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label="验证"
                    valueEnum={{
                        Yes: { text: '已通过', status: 'Success' },
                        No: {
                            text: '未通过',
                            status: 'Error',
                        }
                    }}
                >
                    {land.valid}
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label="交易状态"
                    valueEnum={{
                        true: { text: '交易中', status: 'Processing' },
                        false: {
                            text: '未交易',
                            status: 'Default',
                        }
                    }}
                >
                    {land.inTransaction}
                </ProDescriptions.Item>

                <ProDescriptions.Item label="卫星地图" valueType="text" span={2}>
                    <Image
                        width={300}
                        src={land.image}
                    />
                </ProDescriptions.Item>

            </ProDescriptions>
        </div>
    )
}

export default TransactionInfo;